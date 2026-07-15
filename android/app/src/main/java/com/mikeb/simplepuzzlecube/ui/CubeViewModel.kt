// The ViewModel — the Kotlin/MVVM counterpart of the web CubeView core
// (../src/presentations/3DWeb/3DWeb.ts). Pure presentation + interaction state; ALL cube
// state lives in and mutates through the engine (RubiksCube / Cube).
//
// Every change is driven the same way: a source calls an engine method, the engine fires
// onMove, and the View presents the change *after the fact*. So that the engine never
// runs ahead of the presentation, every source is paced: the solver and scramble are
// suspend "drivers" that mutate then await settled(); discrete manual turns only apply
// while the view is idle.
//
// Concurrency: everything here — engine mutation, solver, pacer, UI state — is confined
// to the main thread (viewModelScope / Dispatchers.Main.immediate), the faithful analog
// of the TS single-threaded event loop. No locks; every move immediately suspends on
// settled(), so per-move work is microseconds.
package com.mikeb.simplepuzzlecube.ui

import android.app.Application
import android.content.Context
import android.os.SystemClock
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.mikeb.simplepuzzlecube.engine.Move
import com.mikeb.simplepuzzlecube.engine.RubiksCube
import com.mikeb.simplepuzzlecube.interfaces.IMovePacer
import com.mikeb.simplepuzzlecube.interfaces.IRubiksCubeObserver
import com.mikeb.simplepuzzlecube.isRotation
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Job
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CubeViewModel(app: Application) : AndroidViewModel(app), IRubiksCubeObserver, IMovePacer {
    private val prefs = app.getSharedPreferences("cube", Context.MODE_PRIVATE)
    private val rubiks = RubiksCube.getInstance()
    // We are this solver's pacer (see IMovePacer): it mutates the engine directly and
    // awaits settled() after each move, so the View presents one turn at a time.
    private val solver = RubiksCubeSolver(rubiks, this)

    // A "driver" is a paced sequence of moves — the solver or a scramble. Only one runs
    // at a time and manual input is locked out while one is active; cancelling driveJob
    // is the AbortSignal analog.
    private var driving = false
    private var driveJob: Job? = null
    // Continuations awaiting settled() — completed once the view goes idle (move presented).
    private val settleWaiters = mutableListOf<CompletableDeferred<Unit>>()
    // One-shot hint consumed by the next onMove to pick its presentation (scramble = fast).
    private var movePresentationFast = false

    private var animating = false
    private var moveId = 0L
    private var pendingMove: MoveEvent? = null

    // session state (published into UiState)
    private var moveCount = 0
    private var elapsed = 0L
    private var status = Status.free
    private var running = false
    private var hasScrambled = false
    // A solve driver is running (distinct from `driving`, which is also true for a
    // scramble); `aborting` covers the window between an abort tap and the driver unwinding.
    private var solverActive = false
    private var aborting = false
    private var scrambleLeft = 0
    private var timerJob: Job? = null
    private var t0 = 0L

    private val _uiState: MutableStateFlow<UiState>
    val uiState: StateFlow<UiState> get() = _uiState

    init {
        // Load persisted state before observing — setState swaps in fresh Cube instances
        // (mirrors the web views' startup order: load, then addObserver).
        prefs.getString(CUBE_STATE_KEY, null)?.let { rubiks.setState(it) }
        _uiState = MutableStateFlow(buildState())
        rubiks.addObserver(this)
    }

    override fun onCleared() {
        rubiks.removeObserver(this)
    }

    private fun buildState() = UiState(
        cubies = rubiks.cubes.map { CubieState(it.position, it.orientation) },
        status = status,
        moveCount = moveCount,
        elapsedMs = elapsed,
        solverActive = solverActive,
        aborting = aborting,
        isSolved = rubiks.isSolved,
        pendingMove = pendingMove
    )

    private fun publish() {
        _uiState.value = buildState()
    }

    // Write engine state to persistence (the analog of the web views' localStorage key).
    private fun persist() {
        prefs.edit().putString(CUBE_STATE_KEY, rubiks.serialize()).apply()
    }

    // ---------- observer (the single presentation entry point) ----------
    // Fired by the engine after every state mutation: persist, count solver moves during a
    // timed attempt, then hand the move to the View as a pending MoveEvent. The View
    // acknowledges via moveSettled(), which is what wakes a paced driver.
    override fun onMove(move: Move?) {
        persist()
        // Count the solver's layer turns while it works a timed attempt — the counterpart
        // to afterUserMove's manual count. Whole-cube rotations never count.
        if (move != null && solverActive && status == Status.solving && !isRotation(move)) {
            moveCount++
        }
        val fast = movePresentationFast
        movePresentationFast = false
        // No move (reset) settles instantly. Sources only mutate the engine while idle, so
        // a move should never arrive mid-presentation; if one somehow does, settle rather
        // than overlap.
        if (animating || move == null) {
            publish()
            return
        }
        animating = true
        pendingMove = MoveEvent(++moveId, move, fast)
        publish()
    }

    // The View has finished presenting the identified move: go idle and wake any driver.
    fun moveSettled(id: Long) {
        if (!animating || pendingMove?.id != id) return
        animating = false
        pendingMove = null
        publish()
        flushSettled()
    }

    // ---------- IMovePacer ----------
    // A driver awaits this after each move. Resume immediately when idle, otherwise once
    // the in-flight presentation settles. The await is cancellable — that's what lets an
    // abort unwind a solver parked here.
    override suspend fun settled() {
        if (!animating) return
        val waiter = CompletableDeferred<Unit>()
        settleWaiters.add(waiter)
        waiter.await()
    }

    // Wake every driver waiting on settled(). Called when the view goes idle.
    private fun flushSettled() {
        val waiters = settleWaiters.toList()
        settleWaiters.clear()
        waiters.forEach { it.complete(Unit) }
    }

    // ---------- drivers (paced move sequences) ----------
    // Run a paced sequence of engine mutations as the sole active driver. Manual input is
    // locked out (driving) until it finishes; reset()/abort cancel it via the Job. onDone
    // runs once the driver has fully unwound (normal finish or cancellation).
    private fun runSequence(fn: suspend () -> Unit, onDone: (() -> Unit)? = null) {
        if (driving || animating) return
        driving = true
        driveJob = viewModelScope.launch {
            try {
                fn()
            } finally {
                driving = false
                driveJob = null
                onDone?.invoke()
            }
        }
    }

    // One tap runs the solver's whole sequence; it mutates the engine directly (each move
    // fires onMove → presentation) and awaits settled() between moves.
    fun startSolve() {
        if (driving || animating) return
        solverActive = true
        // A scrambled cube is a timed attempt: start the clock (flips status to 'solving').
        // Free play is untracked — a solver run there neither times nor changes the status.
        if (hasScrambled) startTimer()
        publish()
        runSequence({ solver.run() }, ::onSolveDone)
    }

    // Abort a running solve. Cancelling the Job unwinds the solver at its next suspension
    // point; that takes a moment (the in-flight move finishes presenting first), so show
    // an "aborting" state until onSolveDone hands the controls back. We don't flushSettled
    // here — cancellation already wakes the parked await, and force-settling would let the
    // engine outrun the view.
    fun abortSolve() {
        if (!solverActive || aborting) return
        aborting = true
        publish()
        driveJob?.cancel()
        // run() skips its self-reset when cancelled mid-loop; clean the solver here,
        // exactly as the web abortSolve does.
        solver.reset()
    }

    // The solve driver has fully unwound (finished or aborted). Record the result and
    // re-enable the controls.
    private fun onSolveDone() {
        solverActive = false
        aborting = false
        if (rubiks.isSolved && hasScrambled) {
            // A timed attempt completed: stop the clock, mark solved, and disarm so
            // post-solve play stays idle. A free-play solve is untracked — no 'solved'.
            stopTimer()
            hasScrambled = false
            status = Status.solved
        }
        // On abort the attempt simply continues by hand (timer + 'solving' left as-is).
        publish()
    }

    // ---------- applying moves ----------
    // Apply a layer turn to the engine; onMove presents it. `fast` is a one-shot
    // presentation hint (used by scramble) consumed by the resulting onMove.
    private fun applyMove(face: MoveKey, prime: Boolean, fast: Boolean = false) {
        val m = MOVES.getValue(face)
        movePresentationFast = fast
        rubiks.execute(if (prime) m.ccw else m.cw)
    }

    // A discrete user turn. Only fires while idle so the engine never runs ahead of the
    // presentation (input is dropped, not queued); session bookkeeping runs here, where
    // the intent is known.
    fun userMove(face: MoveKey, prime: Boolean) {
        if (animating || driving) return
        applyMove(face, prime)
        afterUserMove()
    }

    // A discrete whole-cube re-orientation. Never counts as a solve move.
    fun userCubeMove(key: CubeMoveKey) {
        if (animating || driving) return
        rubiks.execute(key.rotation)
    }

    // Timing/counting only run during a scramble-initiated solve attempt; casual play on
    // an unscrambled cube neither starts the clock nor counts moves.
    private fun afterUserMove() {
        if (!hasScrambled) return
        startTimer()
        moveCount++
        publish()
        if (rubiks.isSolved) {
            stopTimer()
            // Attempt over; disarm so post-solve play stays idle. Only a new scramble re-arms.
            hasScrambled = false
            status = Status.solved
            publish()
        }
    }

    // ---------- timer ----------
    private fun startTimer() {
        if (running || status == Status.solved) return
        running = true
        t0 = SystemClock.elapsedRealtime()
        status = Status.solving
        publish()
        timerJob = viewModelScope.launch {
            while (currentCoroutineContext().isActive) {
                elapsed = SystemClock.elapsedRealtime() - t0
                publish()
                delay(60)
            }
        }
    }

    private fun stopTimer() {
        timerJob?.cancel()
        timerJob = null
        running = false
        if (t0 != 0L) {
            elapsed = SystemClock.elapsedRealtime() - t0
        }
        publish()
    }

    // ---------- scramble / reset ----------
    fun scramble() {
        if (animating || driving) return
        timerJob?.cancel()
        timerJob = null
        running = false
        val seq = buildScramble()
        scrambleLeft = seq.size
        hasScrambled = true
        moveCount = 0
        elapsed = 0
        status = Status.scrambling
        publish()
        runSequence({ runScramble(seq) })
    }

    // A driver: apply each scramble turn (fast), then await its presentation before the next.
    private suspend fun runScramble(seq: List<ScrambleTurn>) {
        for (mv in seq) {
            if (!currentCoroutineContext().isActive) return
            applyMove(mv.f, mv.prime, fast = true)
            scrambleLeft--
            if (scrambleLeft <= 0) {
                status = Status.ready
                publish()
            }
            settled()
        }
    }

    // The one intentional exception to pacing: force-stop everything and settle instantly.
    fun reset() {
        timerJob?.cancel()
        timerJob = null
        running = false
        animating = false
        pendingMove = null
        // Stop any in-flight driver and wake anything parked on settled() so it unwinds.
        driveJob?.cancel()
        flushSettled()
        // reset() rebuilds the engine's cubes and fires onMove(null), which persists and
        // republishes the fresh state.
        rubiks.reset()
        hasScrambled = false
        status = Status.free
        solverActive = false
        aborting = false
        moveCount = 0
        elapsed = 0
        publish()
    }

    companion object {
        private const val CUBE_STATE_KEY = "cubeState"
    }
}
