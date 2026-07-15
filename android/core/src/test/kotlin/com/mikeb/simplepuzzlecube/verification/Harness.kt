// Port of ../src/solver/verification/Harness.ts — the headless verification harness,
// living in :core's JVM test sources (the Kotlin analog of `npm run verify`).
//
// It exercises the REAL engine + solver over thousands of random scrambles with a mock,
// instant IMovePacer. The independent `edgesSolved`/`cornersSolved` checkers below
// compare stickers to the *centers* and are deliberately NOT the solver's own
// solutionStatusChecks — so a bug in a completion check surfaces as a disagreement
// instead of hiding.
//
// Module-level TS state → a Kotlin `object`: one harness per JVM, sharing the engine
// singleton exactly as the TS harness shares the module-level getInstance(). Do NOT
// enable an in-JVM parallel test runner for this module — the engine is process-wide.
package com.mikeb.simplepuzzlecube.verification

import com.mikeb.simplepuzzlecube.cubesShareFace
import com.mikeb.simplepuzzlecube.engine.Face
import com.mikeb.simplepuzzlecube.engine.LayerMove
import com.mikeb.simplepuzzlecube.engine.Move
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Rotation.YCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.YCW
import com.mikeb.simplepuzzlecube.engine.Rotation.ZCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.ZCW
import com.mikeb.simplepuzzlecube.engine.RubiksCube
import com.mikeb.simplepuzzlecube.interfaces.IMovePacer
import com.mikeb.simplepuzzlecube.interfaces.IRubiksCubeObserver
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver
import com.mikeb.simplepuzzlecube.solver.hasCompletedCorners
import com.mikeb.simplepuzzlecube.solver.hasSolvedWhiteFaceCorners
import com.mikeb.simplepuzzlecube.solver.hasSolvedWhiteFaceEdges
import com.mikeb.simplepuzzlecube.solver.hasSolvedYellowCorners
import com.mikeb.simplepuzzlecube.solver.hasSolvedYellowEdges
import com.mikeb.simplepuzzlecube.solver.isMiddleLayerSolved
import com.mikeb.simplepuzzlecube.solver.subroutines.solveFinalCorners
import com.mikeb.simplepuzzlecube.solver.subroutines.solveFinalEdges
import com.mikeb.simplepuzzlecube.solver.subroutines.solveMiddleEdges
import com.mikeb.simplepuzzlecube.solver.subroutines.solveWhiteFaceCorners
import com.mikeb.simplepuzzlecube.solver.subroutines.solveWhiteFaceEdges
import com.mikeb.simplepuzzlecube.solver.subroutines.solveYellowCorners
import com.mikeb.simplepuzzlecube.solver.subroutines.solveYellowEdges
import kotlin.coroutines.cancellation.CancellationException
import kotlin.random.Random

// A budget-limited mock pacer. `settled()` returns instantly, but throws once the move
// budget is exhausted — this is how we turn an infinite loop in a subroutine into a
// catchable "budget" outcome instead of a hang. Deliberately a RuntimeException and NOT
// a CancellationException: a CE would be swallowed as cooperative coroutine cancellation
// instead of surfacing in the tally.
class BudgetExceededException : RuntimeException("BUDGET")

object Harness {
    private val rubiks: RubiksCube = RubiksCube.getInstance()

    var moveBudget = 0
    private val pacer = object : IMovePacer {
        override suspend fun settled() {
            if (--moveBudget < 0) throw BudgetExceededException()
        }
    }
    val solver = RubiksCubeSolver(rubiks, pacer)

    // ---- Move log (populated only while `logging` is true), for the trace tool. ----
    // TS monkey-patches rubiks.execute; here we register a real observer instead — the
    // engine passes each move's identity through onMove (null for reset, filtered out).
    private val moveLog = mutableListOf<Move>()
    private var logging = false

    init {
        rubiks.addObserver(
            IRubiksCubeObserver { move -> if (logging && move != null) moveLog.add(move) }
        )
    }

    private fun get(i: Int) = solver.fetchPosition(i)

    data class Centers(val back: Face?, val left: Face?, val right: Face?, val front: Face?)

    private fun centers() = Centers(
        back = get(11)?.orientation?.back,
        left = get(13)?.orientation?.left,
        right = get(15)?.orientation?.right,
        front = get(17)?.orientation?.front
    )

    // Independent ground truth: all 4 top edges are Y-on-top and match adjacent centers.
    private fun edgesSolved(): Boolean {
        val c = centers()
        val e2 = get(2)
        val e4 = get(4)
        val e6 = get(6)
        val e8 = get(8)
        return e2?.orientation?.top == Face.Y &&
            e2.orientation.back == c.back &&
            e4?.orientation?.top == Face.Y &&
            e4.orientation.left == c.left &&
            e6?.orientation?.top == Face.Y &&
            e6.orientation.right == c.right &&
            e8?.orientation?.top == Face.Y &&
            e8.orientation.front == c.front
    }

    // Independent ground truth: all 4 top corners are Y-on-top with both sides matching centers.
    private fun cornersSolved(): Boolean {
        val c = centers()
        val c1 = get(1)
        val c3 = get(3)
        val c7 = get(7)
        val c9 = get(9)
        return c1?.orientation?.top == Face.Y &&
            c1.orientation.left == c.left &&
            c1.orientation.back == c.back &&
            c3?.orientation?.top == Face.Y &&
            c3.orientation.right == c.right &&
            c3.orientation.back == c.back &&
            c7?.orientation?.top == Face.Y &&
            c7.orientation.left == c.left &&
            c7.orientation.front == c.front &&
            c9?.orientation?.top == Face.Y &&
            c9.orientation.right == c.right &&
            c9.orientation.front == c.front
    }

    // Independent ground truth: the 4 equator edges (no top/bottom sticker) each match
    // both adjacent centers. Positions 10/12/16/18 are the X-mid-layer edges.
    private fun middleEdgesSolved(): Boolean {
        val c = centers()
        val e10 = get(10)
        val e12 = get(12)
        val e16 = get(16)
        val e18 = get(18)
        return e10?.orientation?.left == c.left &&
            e10?.orientation?.back == c.back &&
            e12?.orientation?.right == c.right &&
            e12?.orientation?.back == c.back &&
            e16?.orientation?.left == c.left &&
            e16?.orientation?.front == c.front &&
            e18?.orientation?.right == c.right &&
            e18?.orientation?.front == c.front
    }

    // Independent ground truth for the white-cross phase, which runs after the cube is
    // flipped white-on-top. Its goal is orientation only — form the cross — not permutation:
    // each of the 4 top edges shows white up. (Deliberately the same condition the phase
    // targets; its value here is as the loop's exit condition, independent of the solver's
    // own hasSolvedWhiteFaceEdges, so a check that fires early still surfaces as
    // `white-edge-check-early`.)
    private fun whiteCrossSolved(): Boolean =
        listOf(2, 4, 6, 8).all { i -> get(i)?.orientation?.top == Face.W }

    // Independent ground truth for the white-corners phase: orientation only — each of
    // the 4 top corners shows white up. Mirrors the solver's own hasSolvedWhiteFaceCorners.
    private fun whiteCornersSolved(): Boolean =
        listOf(1, 3, 7, 9).all { i -> get(i)?.orientation?.top == Face.W }

    // Independent ground truth for the CompleteCorners phase: all 4 top corners white-up AND
    // the side stickers shared by adjacent corners agree — the corners are permuted into their
    // correct relative arrangement. Mirrors hasCompletedCorners but coded independently so a
    // bug in that check surfaces as a disagreement. Intentionally does NOT assert
    // center-alignment of the whole top layer; that's the CompleteEdges phase's job,
    // verified by the terminal `rubiks.isSolved`.
    private fun lastCornersPlaced(): Boolean {
        val c1 = get(1)
        val c3 = get(3)
        val c7 = get(7)
        val c9 = get(9)
        return listOf(c1, c3, c7, c9).all { it?.orientation?.top == Face.W } &&
            c1?.orientation?.back == c3?.orientation?.back &&
            c1?.orientation?.left == c7?.orientation?.left &&
            c7?.orientation?.front == c9?.orientation?.front &&
            c9?.orientation?.right == c3?.orientation?.right
    }

    // Flip the white face to the top — the reorientation the solver's
    // advancePhase(WhiteFaceEdges) performs before the last-layer phases. The harness does
    // it directly rather than calling advancePhase, because that method unconditionally
    // recurses into resume() (firing a subroutine that interleaves with, and corrupts, the
    // harness's own phase loops). The harness only needs the physical flip; it drives the
    // white phases itself. Mirror of the solver's own flip logic — keep in sync if that changes.
    private suspend fun flipWhiteToTop() {
        val whiteFace = rubiks.cubes.find { cube -> cube.isFace && cube.hasFace(Face.W) }
            ?: throw IllegalStateException("no white face cube")
        if (whiteFace.isInBottomLayer) solver.`do`(YCW, YCW)
        else if (whiteFace.isInLeftLayer) solver.`do`(ZCW)
        else if (whiteFace.isInRightLayer) solver.`do`(ZCCW)
        else if (whiteFace.isInFrontLayer) solver.`do`(YCW)
        else if (whiteFace.isInBackLayer) solver.`do`(YCCW)
    }

    // Outer-layer face turns only — the same 12-move scramble vocabulary as the TS harness.
    val MOVES = listOf(
        LayerMove.rotateTopCW,
        LayerMove.rotateTopCCW,
        LayerMove.rotateBottomCW,
        LayerMove.rotateBottomCCW,
        LayerMove.rotateLeftCW,
        LayerMove.rotateLeftCCW,
        LayerMove.rotateRightCW,
        LayerMove.rotateRightCCW,
        LayerMove.rotateFrontCW,
        LayerMove.rotateFrontCCW,
        LayerMove.rotateBackCW,
        LayerMove.rotateBackCCW
    )

    fun randSeq(n: Int, rng: Random): List<LayerMove> = List(n) { MOVES[rng.nextInt(MOVES.size)] }

    // Render a scramble as the JSON move array the TS tools accept, so a failing seed's
    // scramble can be replayed with `node src/solver/verification/run.mjs trace '<json>'`
    // or the Kotlin TraceTool.
    fun toJson(seq: List<Move>): String =
        seq.joinToString(prefix = "[", postfix = "]", separator = ",") { "\"${(it as Enum<*>).name}\"" }

    // Outcomes. "ok" is the only success. Everything else names a distinct failure mode so
    // `count` reveals the shape of the problem and `repro` can target one.
    const val OK = "ok"

    suspend fun runSeq(seq: List<Move>): String {
        rubiks.reset()
        // Isolate each run. The solver instance is reused across thousands of scrambles, and
        // its self-reset (end of run()) only fires on a normal loop exit — a runaway throws
        // BUDGET out of run() and skips it, leaking solutionPhase into the next scramble.
        // Without this, a prior runaway makes performInitialInspection dispatch a late-phase
        // subroutine onto a fresh scramble and hang, reporting a fabricated `budget`.
        solver.reset()
        moveBudget = 1_000_000_000
        for (m in seq) rubiks.execute(m)
        moveBudget = 5000 // generous per-solve cap; a healthy solve uses well under this

        try {
            solver.performInitialInspection() // orient the yellow center to the top
            var g = 0
            while (!edgesSolved()) {
                if (hasSolvedYellowEdges(solver)) return "edge-check-early"
                solveYellowEdges(solver)
                if (++g > 80) return "edges-stuck"
            }
            g = 0
            while (!cornersSolved()) {
                if (hasSolvedYellowCorners(solver)) return "corner-check-early"
                solveYellowCorners(solver)
                if (++g > 80) return "corners-stuck"
            }
            g = 0
            while (!middleEdgesSolved()) {
                if (isMiddleLayerSolved(OrientationKey.top, rubiks)) return "middle-check-early"
                solveMiddleEdges(solver)
                if (++g > 80) return "middle-stuck"
            }
            // Assert the yellow-side checks agree while yellow is still on top — the flip
            // below reorients white up, after which the yellow-oriented ground truths no
            // longer apply.
            if (!hasSolvedYellowEdges(solver) || !hasSolvedYellowCorners(solver)) return "checks-disagree"
            if (!isMiddleLayerSolved(OrientationKey.top, rubiks)) return "checks-disagree"

            // Final layer: flip the white face to the top (as run() does), then form the cross.
            flipWhiteToTop()
            g = 0
            while (!whiteCrossSolved()) {
                if (hasSolvedWhiteFaceEdges(solver)) return "white-edge-check-early"
                solveWhiteFaceEdges(solver)
                if (++g > 80) return "white-edges-stuck"
            }
            if (!hasSolvedWhiteFaceEdges(solver)) return "checks-disagree"

            // White-face corners: orient all 4 top corners white-up.
            g = 0
            while (!whiteCornersSolved()) {
                if (hasSolvedWhiteFaceCorners(solver)) return "white-corner-check-early"
                solveWhiteFaceCorners(solver)
                if (++g > 80) return "white-corners-stuck"
            }
            if (!hasSolvedWhiteFaceCorners(solver)) return "checks-disagree"

            // CompleteCorners: permute the top corners into their solved arrangement.
            g = 0
            while (!lastCornersPlaced()) {
                solveFinalCorners(solver)
                if (++g > 80) return "final-corners-stuck"
            }
            if (!hasCompletedCorners(solver)) return "checks-disagree"

            // CompleteEdges: permute the top edges — this places the last layer and finishes
            // the cube. `rubiks.isSolved` is the engine's own all-faces-uniform check: the
            // strongest, fully independent ground truth, and orientation-agnostic.
            g = 0
            while (!rubiks.isSolved) {
                solveFinalEdges(solver)
                if (++g > 80) return "final-edges-stuck"
            }
            return OK
        } catch (e: BudgetExceededException) {
            return "budget"
        }
    }

    // Drive the REAL solver exactly as production does — `solver.run()` over the mock pacer —
    // and judge it only by what the engine can see. This is the authoritative measure of the
    // solver's ability. `ok` iff the cube ends solved; `budget` iff a subroutine ran away.
    suspend fun runReal(seq: List<Move>): String {
        rubiks.reset()
        solver.reset()
        moveBudget = 1_000_000_000
        for (m in seq) rubiks.execute(m)
        moveBudget = 5000
        return try {
            solver.run()
            if (rubiks.isSolved) OK else "unsolved"
        } catch (e: BudgetExceededException) {
            "budget"
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            "threw:${e.message}"
        }
    }

    // Like runReal, but load the scramble the way the app does on startup rather than by
    // replaying moves: serialize the scrambled cube, wipe the engine back to solved, then
    // rehydrate via `setState` before driving `solver.run()`. The intervening reset is the
    // whole point — it leaves the engine's cached `cubeMap` reflecting the SOLVED cube, so
    // the solve can only succeed if `setState` refreshes that map. This is the dedicated
    // regression guard for the setState/cubeMap staleness class.
    suspend fun runRealFromState(seq: List<Move>): String {
        rubiks.reset()
        moveBudget = 1_000_000_000
        for (m in seq) rubiks.execute(m)
        val persisted = rubiks.serialize() // what the app writes to persistence
        rubiks.reset() // simulate a fresh engine, as if the app had just launched
        solver.reset()
        rubiks.setState(persisted) // ...then the load path rehydrates the scrambled state
        moveBudget = 5000
        return try {
            solver.run()
            if (rubiks.isSolved) OK else "unsolved"
        } catch (e: BudgetExceededException) {
            "budget"
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            "threw:${e.message}"
        }
    }

    // ---- Modes (tallies returned, not printed, so tests can assert on them) ----

    data class TallyResult(val tally: Map<String, Int>, val firstFailure: List<Move>?)

    suspend fun count(n: Int, rng: Random): TallyResult =
        talliedOver(n, rng) { seq ->
            try {
                runSeq(seq)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                "threw:${e.message}"
            }
        }

    suspend fun realCount(n: Int, rng: Random): TallyResult =
        talliedOver(n, rng) { seq -> runReal(seq) }

    suspend fun stateCount(n: Int, rng: Random): TallyResult =
        talliedOver(n, rng) { seq -> runRealFromState(seq) }

    private suspend fun talliedOver(
        n: Int,
        rng: Random,
        run: suspend (List<Move>) -> String
    ): TallyResult {
        val tally = mutableMapOf<String, Int>()
        var firstFailure: List<Move>? = null
        repeat(n) {
            val seq = randSeq(50, rng)
            val r = run(seq)
            tally[r] = (tally[r] ?: 0) + 1
            if (r != OK && firstFailure == null) firstFailure = seq
        }
        return TallyResult(tally, firstFailure)
    }

    // Brute-force the SHORTEST scramble producing a given outcome (TS `repro`).
    suspend fun repro(want: String, rng: Random): List<Move>? {
        for (len in 1..14) {
            repeat(6000) {
                val seq = randSeq(len, rng)
                if (runSeq(seq) == want) {
                    println("REPRO ($len moves) for \"$want\":")
                    println(toJson(seq))
                    println("\nInspect it with:  trace '${toJson(seq)}' (or the TS run.mjs trace)")
                    return seq
                }
            }
        }
        println("No repro found for \"$want\" (may be rare or already fixed).")
        return null
    }

    // Step through one scramble, printing the top/bottom cubies and every engine move each
    // subroutine call makes. This is how you localize *which* subroutine misbehaves.
    suspend fun trace(seq: List<Move>) {
        fun fmt(i: Int) = "$i:${get(i)?.orientation}"
        fun snap(): String {
            val c = centers()
            return listOf(
                "  centers $c",
                "  top corners  " + listOf(1, 3, 7, 9).joinToString("  ", transform = ::fmt),
                "  top edges    " + listOf(2, 4, 6, 8).joinToString("  ", transform = ::fmt),
                "  middle edges " + listOf(10, 12, 16, 18).joinToString("  ", transform = ::fmt),
                "  bottom corn. " + listOf(19, 21, 25, 27).joinToString("  ", transform = ::fmt),
                "  bottom edges " + listOf(20, 22, 24, 26).joinToString("  ", transform = ::fmt)
            ).joinToString("\n")
        }

        rubiks.reset()
        solver.reset() // isolate this run from any prior runaway (see runSeq)
        moveBudget = 1_000_000_000
        for (m in seq) rubiks.execute(m)
        moveBudget = 5000
        solver.performInitialInspection()
        logging = true
        try {
            // The yellow-oriented ground truths are valid only until the cube is flipped
            // white-on-top; after that, drive the white + final phases.
            var flipped = false
            for (i in 0 until 120) {
                val phase: String
                if (!flipped) {
                    if (edgesSolved() && cornersSolved() && middleEdgesSolved()) {
                        moveLog.clear()
                        flipWhiteToTop()
                        flipped = true
                        println("\n--- flip white to top ---")
                        println("  moves: " + moveLog.joinToString(" ").ifEmpty { "(none — white already on top)" })
                        println(snap())
                        continue
                    }
                    phase = if (!edgesSolved()) "edges" else if (!cornersSolved()) "corners" else "middle"
                } else {
                    if (rubiks.isSolved) break
                    phase = if (!whiteCrossSolved()) "white-edges"
                    else if (!whiteCornersSolved()) "white-corners"
                    else if (!lastCornersPlaced()) "final-corners"
                    else "final-edges"
                }
                moveLog.clear()
                println("\n--- $phase call #${i + 1} ---")
                println(snap())
                try {
                    when (phase) {
                        "edges" -> solveYellowEdges(solver)
                        "corners" -> solveYellowCorners(solver)
                        "middle" -> solveMiddleEdges(solver)
                        "white-edges" -> solveWhiteFaceEdges(solver)
                        "white-corners" -> solveWhiteFaceCorners(solver)
                        "final-corners" -> solveFinalCorners(solver)
                        else -> solveFinalEdges(solver)
                    }
                } catch (e: Exception) {
                    println("  THREW: ${e.message} (infinite loop — see the repeating tail below)")
                    println("  moves: " + moveLog.take(40).joinToString(" ") + " ...")
                    return
                }
                println("  moves: " + moveLog.joinToString(" ").ifEmpty { "(NONE — no progress; likely the bug)" })
            }
            println(
                "\nFinal: edgesSolved=${edgesSolved()} cornersSolved=${cornersSolved()} " +
                    "middleEdgesSolved=${middleEdgesSolved()} whiteCrossSolved=${whiteCrossSolved()} " +
                    "whiteCornersSolved=${whiteCornersSolved()} lastCornersPlaced=${lastCornersPlaced()} " +
                    "isSolved=${rubiks.isSolved}"
            )
        } finally {
            logging = false
        }
    }

    // Drive the real `solver.run()` on ONE scramble — cross-check a repro against production.
    suspend fun solve(seq: List<Move>) {
        val r = runReal(seq)
        println("solver.run() → $r  (isSolved=${rubiks.isSolved})")
    }
}
