import RubiksCube from '../../engine/RubiksCube'
import { LayerMove, Rotation } from '../../engine/types'
import { isRotation } from '../../utils'
import RubiksCubeSolver from '../../solver/RubiksCubeSolver'
import IRubiksCubeObserver from '../../interfaces/IRubiksCubeObserver'
import { IMovePacer } from '../../interfaces/IMovePacer'
import { CubeMoveDef, CubieEntry, MoveDef, Status } from './types'
import {
  CUBE_MOVES,
  CUBE_MOVE_BUTTONS,
  DEFAULT_PITCH,
  DEFAULT_YAW,
  KEY_CUBE_MOVES,
  KEY_FACE_MOVES,
  LAYER_ANIM,
  MOVES,
  MoveKey,
  ROTATION_ANIM
} from './config'
import { createCubie, renderCubies } from './cubieDom'
import { pickTurn } from './dragTurn'
import { buildScramble, ScrambleTurn } from './scramble'
import { updateControls, updateStats, updateStatus } from './panel'

/**
 * 3D Rubik's cube view. Pure presentation + interaction (CSS-3D transforms, drag-to-turn,
 * orbit, scramble, timer); ALL cube state lives in and mutates through our engine
 * (RubiksCube / Cube). No cube logic is duplicated here.
 *
 * Every change is driven the same way: a source calls a RubiksCube method, the engine fires
 * onMove, and we animate the change *after the fact*. So that the engine never runs ahead of
 * the animation, every source is paced: the solver and scramble are async "drivers" that
 * mutate then await settled(); discrete manual turns only apply while the view is idle.
 *
 * This file is deliberately the whole stateful core — the pacing/driver/animation invariants
 * live together here. The peripherals it composes are split out: static tables (config),
 * cubie DOM (cubieDom), drag math (dragTurn), scramble generation (scramble), and the
 * control panel (panel).
 */
class CubeView implements IRubiksCubeObserver, IMovePacer {
  private rubiks = RubiksCube.getInstance()
  // We are this solver's pacer (see IMovePacer): it mutates the engine directly and awaits
  // settled() after each move, so we present one turn at a time.
  private solver = new RubiksCubeSolver(this.rubiks, this)

  // A "driver" is a paced sequence of moves — the solver or a scramble. Only one runs at a
  // time and manual input is locked out while one is active; sequenceAbort lets reset() stop it.
  private driving = false
  private sequenceAbort: AbortController | undefined
  // Callbacks awaiting settled() — resolved once the view goes idle (animation finished).
  private settleWaiters: Array<() => void> = []
  // One-shot hint consumed by the next onMove to pick its animation (e.g. scramble = fast).
  private movePresentation: { fast?: boolean } = {}

  private sceneEl: HTMLElement
  private worldEl!: HTMLElement
  private entries: CubieEntry[] = []

  private animating = false

  // session state (mirrored into the panel DOM)
  private moveCount = 0
  private elapsed = 0
  private status: Status = 'free'
  private running = false
  private hasScrambled = false
  // A solve driver is running (distinct from `driving`, which is also true for a scramble); gates
  // the control panel. `aborting` covers the window between an abort click and the driver unwinding.
  private solverActive = false
  private aborting = false
  private scrambleLeft = 0
  private timer: number | undefined
  private t0 = 0

  // orbit
  private yaw = DEFAULT_YAW
  private pitch = DEFAULT_PITCH

  // drag bookkeeping
  private dragging = false
  private dragFace: HTMLElement | null = null
  private turnCommitted = false
  private px = 0
  private py = 0
  private yaw0 = 0
  private pitch0 = 0

  constructor(sceneEl: HTMLElement) {
    this.sceneEl = sceneEl
    this.init()
    this.wireControls()
    window.addEventListener('keydown', (e) => this.onKey(e))
  }

  private init() {
    this.worldEl = document.createElement('div')
    this.worldEl.style.cssText =
      'position:absolute; left:50%; top:50%; width:0; height:0; transform-style:preserve-3d; will-change:transform;'
    this.sceneEl.appendChild(this.worldEl)

    // Load any state persisted by the other page before building cubies — setState
    // swaps in fresh Cube instances, so entries must reference the post-load array.
    const saved = localStorage.getItem('cubeState')
    if (saved) this.rubiks.setState(saved)

    this.entries = this.rubiks.cubes.map((c) => createCubie(c))
    this.entries.forEach((e) => this.worldEl.appendChild(e.el))

    // Every change flows through onMove: a source calls an engine method, the engine notifies
    // us, and we persist + animate.
    this.rubiks.addObserver(this)

    this.applyView(false)
    this.renderCube()
    this.updatePanel()

    const sc = this.sceneEl
    sc.addEventListener('pointerdown', (e) => this.onDown(e))
    sc.addEventListener('pointermove', (e) => this.onPointerMove(e))
    sc.addEventListener('pointerup', (e) => this.onUp(e))
    sc.addEventListener('pointercancel', (e) => this.onUp(e))
  }

  // ---------- rendering / panel ----------
  private renderCube() {
    renderCubies(this.entries)
  }

  private updateStats() {
    updateStats(this.elapsed, this.moveCount)
  }

  private updateStatus() {
    updateStatus(this.status)
  }

  private updateControls() {
    updateControls(this.solverActive, this.aborting)
  }

  private updatePanel() {
    this.updateStats()
    this.updateStatus()
    this.updateControls()
  }

  // Write engine state to the localStorage key shared with the 2D page.
  private persist() {
    localStorage.setItem('cubeState', JSON.stringify(this.rubiks.cubes))
  }

  // ---------- observer (the single animation entry point) ----------
  // Fired by the engine after every state mutation. reset() rebuilds the cubes array, so
  // re-point each rendered cubie at the current engine Cube (a no-op for in-place layer/
  // whole-cube turns), then persist and present.
  public onMove(move?: LayerMove | Rotation) {
    this.entries.forEach((e, i) => (e.cube = this.rubiks.cubes[i]))
    this.persist()
    // Count the solver's layer turns while it works a timed attempt — the counterpart to
    // afterUserMove's manual count. `solverActive` excludes manual turns (counted there) and
    // scramble moves; the 'solving' status excludes untracked free-play solves; whole-cube
    // rotations never count, just like userCubeMove.
    if (move && this.solverActive && this.status === 'solving' && !isRotation(move)) {
      this.moveCount++
      this.updateStats()
    }
    const fast = this.movePresentation.fast === true
    this.movePresentation = {}
    // No move (reset) settles instantly. Sources only mutate the engine while idle, so a move
    // should never arrive mid-animation; if one somehow does, settle rather than overlap.
    if (this.animating || !move) {
      this.renderCube()
      return
    }
    // Animate the move the engine has *already* applied. The DOM still shows the pre-move
    // state, so spinning the affected layer (or the whole world) by 90° lands exactly where
    // the settling renderCube repaints it.
    if (isRotation(move)) {
      const def = ROTATION_ANIM.get(move)
      if (def) this.animateWholeCube(def)
      else this.renderCube() // unmappable change — settle without a spin
    } else {
      const anim = LAYER_ANIM.get(move)
      if (anim) this.animateLayer(anim.def, anim.angle, fast)
      else this.renderCube()
    }
  }

  // ---------- drivers (paced move sequences) ----------
  // One click runs the solver's whole sequence. The solver mutates the engine directly (each
  // move fires onMove → animation) and awaits settled() between moves, so we present one turn
  // at a time.
  private startSolve() {
    if (this.driving || this.animating) return
    this.solverActive = true
    // A scrambled cube is a timed attempt: start the clock (which flips the status to 'solving').
    // The person needn't make the first move — afterUserMove covers the manual path. Free play is
    // untracked, so a solver run there neither times nor changes the status, exactly like manually
    // solving during free play.
    if (this.hasScrambled) this.startTimer()
    this.updateControls()
    this.runSequence(
      (signal) => this.solver.run(signal),
      () => this.onSolveDone()
    )
  }

  // Abort a running solve. Aborting the signal is enough: the driver's loop checks signal.aborted
  // after the in-flight move (and the rest of its current subroutine) settles, then unwinds — that
  // takes a moment, so we show an "aborting" state until onSolveDone hands the controls back. We
  // don't flushSettled here — that would wake the waiter mid-animation and let the engine outrun
  // the view.
  private abortSolve() {
    if (!this.solverActive || this.aborting) return
    this.aborting = true
    this.updateControls()
    this.sequenceAbort?.abort()
    this.solver.reset()
  }

  // The solve driver has fully unwound (finished or aborted). Record the result and re-enable the
  // controls.
  private onSolveDone() {
    this.solverActive = false
    this.aborting = false
    if (this.rubiks.isSolved && this.hasScrambled) {
      // A timed attempt completed: stop the clock, mark solved, and disarm so post-solve play
      // stays idle (mirrors afterUserMove). A free-play solve is untracked — no 'solved'.
      this.stopTimer()
      this.hasScrambled = false
      this.status = 'solved'
      this.updateStatus()
      this.updateStats()
    }
    // On abort the attempt simply continues by hand (timer + 'solving' left as-is); a free-play
    // solve leaves the status untouched. Either way, hand the controls back.
    this.updateControls()
  }

  // Run a paced sequence of engine mutations as the sole active driver. Manual input is locked
  // out (driving) until it finishes; reset() aborts it via the signal. onDone runs once the
  // driver has fully unwound (normal finish or abort).
  private runSequence(fn: (signal: AbortSignal) => Promise<void>, onDone?: () => void) {
    if (this.driving || this.animating) return
    this.driving = true
    this.sequenceAbort = new AbortController()
    fn(this.sequenceAbort.signal).finally(() => {
      this.driving = false
      this.sequenceAbort = undefined
      onDone?.()
    })
  }

  // IMovePacer: a driver awaits this after each move. Resolve immediately when idle, otherwise
  // once the in-flight animation settles (see flushSettled). This is how the "reporter" tells
  // the "solver" it may proceed — a robot would resolve it when the physical turn completes.
  public settled(): Promise<void> {
    if (!this.animating) return Promise.resolve()
    return new Promise((resolve) => this.settleWaiters.push(resolve))
  }

  // Wake every driver waiting on settled(). Called when the view goes idle.
  private flushSettled() {
    const waiters = this.settleWaiters
    this.settleWaiters = []
    waiters.forEach((resolve) => resolve())
  }

  // ---------- applying moves ----------
  // Apply a layer turn to the engine; onMove animates it. `fast` is a one-shot presentation
  // hint (used by scramble) consumed by the resulting onMove.
  private applyMove(face: MoveKey, prime: boolean, fast = false) {
    const m = MOVES[face]
    this.movePresentation = { fast }
    this.rubiks[prime ? m.ccw : m.cw]()
  }

  // A discrete user turn (drag / keyboard / button). Only fires while idle so the engine never
  // runs ahead of the animation; session bookkeeping runs here, where the intent is known.
  private userMove(face: MoveKey, prime: boolean) {
    if (this.animating || this.driving) return
    this.applyMove(face, prime)
    this.afterUserMove()
  }

  // A discrete whole-cube re-orientation (keyboard / button). Re-orientations don't count as
  // solve moves, so there's no bookkeeping.
  private userCubeMove(key: string) {
    if (this.animating || this.driving) return
    const c = CUBE_MOVES[key]
    if (!c) return
    this.rubiks.rotateRubiksCube(c.rotation)
  }

  // Timing/counting only run during a scramble-initiated solve attempt; casual play on an
  // unscrambled cube neither starts the clock nor counts moves.
  private afterUserMove() {
    if (!this.hasScrambled) return
    this.startTimer()
    this.moveCount++
    this.updateStats()
    if (this.rubiks.isSolved) {
      this.stopTimer()
      // Attempt is over; disarm so post-solve play stays idle. Only a new scramble re-arms timing.
      this.hasScrambled = false
      this.status = 'solved'
      this.updateStatus()
    }
  }

  // ---------- animation ----------
  private orbitStr() {
    return `rotateX(${this.pitch}deg) rotateY(${this.yaw}deg)`
  }

  // Wait for `el`'s own transform transition to end (with a timeout fallback — transitionend
  // can be swallowed), then tear down the animation DOM and settle: repaint from the model,
  // clear `animating`, and wake any driver awaiting settled().
  private settleAfterTransform(el: HTMLElement, timeoutMs: number, teardown: () => void) {
    let finished = false
    const done = () => {
      if (finished) return
      finished = true
      el.removeEventListener('transitionend', onEnd)
      teardown()
      this.renderCube()
      this.animating = false
      this.flushSettled()
    }
    // Only react to el's own transform transition (transitionend bubbles from children).
    const onEnd = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === 'transform') done()
    }
    el.addEventListener('transitionend', onEnd)
    setTimeout(done, timeoutMs)
  }

  private animateLayer(def: MoveDef, angle: number, fast: boolean) {
    this.animating = true
    const group = document.createElement('div')
    group.style.cssText =
      'position:absolute; left:0; top:0; width:0; height:0; transform-style:preserve-3d;'
    this.worldEl.appendChild(group)
    // The engine already turned this layer, but a face turn keeps its cubies in the layer, so
    // selecting by current position still gathers the right ones; their on-screen transforms
    // still show the pre-move state.
    this.entries
      .filter((e) => e.cube.position[def.axis] === def.layer)
      .forEach((e) => group.appendChild(e.el))
    group.getBoundingClientRect() // reflow
    const dur = fast ? 135 : 290
    group.style.transition = `transform ${dur}ms cubic-bezier(.34,.66,.24,1)`
    group.style.transform = `rotate${def.axis}(${angle}deg)`
    this.settleAfterTransform(group, dur + 140, () => {
      // Tear down the turn-group wrapper before the settling repaint. Re-append *every* cubie
      // in canonical (entries) order — not just the moving ones — so the worldEl child order
      // stays the stable, known-good order init() built. Appending only the moving cubies
      // would shove them to the end of the list; since CSS-3D face hit-testing follows DOM
      // order, that lets a just-turned layer steal pointerdowns from cubies it overlaps on
      // screen, making them undraggable until they're themselves moved.
      this.entries.forEach((e) => this.worldEl.appendChild(e.el))
      group.remove()
    })
  }

  private animateWholeCube(c: CubeMoveDef) {
    this.animating = true
    // Commit a clean resting orientation as the animation's starting point. Without the forced
    // reflow, the reset (transition:none) and the spin (transition+transform) collapse into one
    // style pass with no baseline to animate from, so the turn would jump instantly.
    const world = this.worldEl
    world.style.transition = 'none'
    world.style.transform = this.orbitStr()
    world.getBoundingClientRect() // reflow
    world.style.transition = 'transform 320ms cubic-bezier(.34,.66,.24,1)'
    world.style.transform = `${this.orbitStr()} rotate${c.axis}(${c.angle}deg)`
    this.settleAfterTransform(world, 470, () => {
      // The engine already re-keyed every cubie; reset the world to its resting orbit before
      // the settling repaint so the spun look becomes the new resting state.
      world.style.transition = 'none'
      world.style.transform = this.orbitStr()
    })
  }

  private applyView(animate: boolean) {
    if (this.animating || !this.worldEl) return
    this.worldEl.style.transition = animate ? 'transform .4s cubic-bezier(.2,.6,.2,1)' : 'none'
    this.worldEl.style.transform = this.orbitStr()
  }

  // ---------- timer ----------
  private startTimer() {
    if (this.running || this.status === 'solved') return
    this.running = true
    this.t0 = performance.now()
    this.status = 'solving'
    this.updateStatus()
    this.timer = window.setInterval(() => {
      this.elapsed = performance.now() - this.t0
      this.updateStats()
    }, 60)
  }

  private stopTimer() {
    if (this.timer) clearInterval(this.timer)
    this.running = false
    if (this.t0) {
      this.elapsed = performance.now() - this.t0
      this.updateStats()
    }
  }

  // ---------- scramble / reset ----------
  private scramble() {
    if (this.animating || this.driving) return
    if (this.timer) clearInterval(this.timer)
    this.running = false
    const seq = buildScramble()
    this.scrambleLeft = seq.length
    this.hasScrambled = true
    this.moveCount = 0
    this.elapsed = 0
    this.status = 'scrambling'
    this.updateStatus()
    this.updateStats()
    this.runSequence((signal) => this.runScramble(seq, signal))
  }

  // A driver: apply each scramble turn (fast), then await its presentation before the next.
  private async runScramble(seq: ScrambleTurn[], signal: AbortSignal) {
    for (const mv of seq) {
      if (signal.aborted) return
      this.applyMove(mv.f, mv.prime, true)
      this.scrambleLeft--
      if (this.scrambleLeft <= 0) {
        this.status = 'ready'
        this.updateStatus()
      }
      await this.settled()
    }
  }

  // The one intentional exception to pacing: force-stop everything and settle instantly.
  private reset() {
    if (this.timer) clearInterval(this.timer)
    this.running = false
    this.animating = false
    // Stop any in-flight driver and wake it so its loop sees the abort and unwinds.
    this.sequenceAbort?.abort()
    this.flushSettled()
    // Clean up any in-flight animation DOM first so the repaint below lands in a settled
    // world: re-parent every cubie and drop any leftover turn-group wrappers.
    if (this.entries && this.worldEl) {
      this.entries.forEach((e) => this.worldEl.appendChild(e.el))
      Array.prototype.slice.call(this.worldEl.children).forEach((ch) => {
        if (!this.entries.some((e) => e.el === ch)) (ch as HTMLElement).remove()
      })
    }
    // reset() rebuilds the engine's cubes array and fires onMove, which re-points our entries at
    // the fresh Cube instances, persists, and repaints.
    this.rubiks.reset()
    this.hasScrambled = false
    this.yaw = DEFAULT_YAW
    this.pitch = DEFAULT_PITCH
    this.applyView(true)
    this.status = 'free'
    this.solverActive = false
    this.aborting = false
    this.moveCount = 0
    this.elapsed = 0
    this.updatePanel()
  }

  // ---------- view ----------
  private resetView() {
    this.yaw = DEFAULT_YAW
    this.pitch = DEFAULT_PITCH
    this.applyView(true)
  }

  // ---------- pointer ----------
  private onDown(e: PointerEvent) {
    this.sceneEl.setPointerCapture && this.sceneEl.setPointerCapture(e.pointerId)
    this.px = e.clientX
    this.py = e.clientY
    this.yaw0 = this.yaw
    this.pitch0 = this.pitch
    this.dragging = true
    this.turnCommitted = false
    const target = e.target as HTMLElement
    const faceEl = target.closest && (target.closest('.face') as HTMLElement | null)
    this.dragFace = faceEl && !this.animating ? faceEl : null
    this.sceneEl.style.cursor = 'grabbing'
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.dragging) return
    const dx = e.clientX - this.px,
      dy = e.clientY - this.py
    if (this.dragFace) {
      if (!this.turnCommitted && Math.hypot(dx, dy) > 14) {
        this.turnCommitted = true
        const mv = pickTurn(this.dragFace, dx, dy, this.pitch, this.yaw)
        if (mv) this.userMove(mv.face, mv.prime)
      }
    } else {
      this.yaw = this.yaw0 + dx * 0.42
      this.pitch = Math.max(-86, Math.min(86, this.pitch0 - dy * 0.42))
      this.applyView(false)
    }
  }

  private onUp(_e: PointerEvent) {
    this.dragging = false
    this.dragFace = null
    this.sceneEl.style.cursor = 'grab'
  }

  // ---------- keyboard ----------
  private onKey(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement | null)?.tagName || ''
    if (/input|textarea|select/i.test(tag)) return
    if (this.dragging) return // ignore keypresses while the pointer is held down
    if (e.key === ' ') {
      this.resetView()
      e.preventDefault()
      return
    }
    const cubeMove = KEY_CUBE_MOVES[e.key]
    if (cubeMove) {
      this.userCubeMove(cubeMove)
      e.preventDefault()
      return
    }
    const face = KEY_FACE_MOVES[e.key.toLowerCase()]
    if (face) {
      this.userMove(face, e.shiftKey)
      e.preventDefault()
    }
  }

  // ---------- panel wiring ----------
  private wireControls() {
    const bind = (id: string, fn: () => void) =>
      document.getElementById(id)?.addEventListener('click', fn)
    bind('btn-scramble', () => this.scramble())
    bind('btn-reset', () => this.reset())
    bind('solve', () => this.startSolve())
    bind('abort-solve', () => this.abortSolve())
    bind('btn-recenter', () => this.resetView())
    for (const [id, move] of Object.entries(CUBE_MOVE_BUTTONS)) {
      bind(id, () => this.userCubeMove(move))
    }
  }
}

function start() {
  const scene = document.getElementById('scene')
  if (scene) new CubeView(scene)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}
