import RubiksCube from '../../engine/RubiksCube'
import Cube from '../../engine/Cube'
import { Face, LayerMove, Orientation, Rotation } from '../../engine/types'
import RubiksCubeSolver from '../../solver/RubiksCubeSolver'
import IRubiksCubeObserver from '../../interfaces/IRubiksCubeObserver'
import { IPacer } from '../../interfaces/IPacer'

type Axis = 'X' | 'Y' | 'Z'
type Status = 'free' | 'ready' | 'scrambling' | 'solving' | 'solved'

// Singmaster-style face notation keys handled by this view.
type MoveKey = 'U' | 'E' | 'D' | 'L' | 'M' | 'R' | 'B' | 'S' | 'F'

const DEFAULT_YAW = -45
const DEFAULT_PITCH = -19.5

interface MoveDef {
  posAxis: Axis
  layer: number
  cw: LayerMove
  ccw: LayerMove
  cssAxis: Axis
}

interface CubeMoveDef {
  rotation: Rotation
  axis: Axis
  angle: number
}

interface Vec3 {
  X: number
  Y: number
  Z: number
}

// One rendered cubie: the engine Cube it mirrors, its DOM element, and its six sticker elements.
interface CubieEntry {
  cube: Cube
  el: HTMLElement
  stickers: Record<keyof Orientation, HTMLElement>
}

/**
 * 3D Rubik's cube view. Pure presentation + interaction (CSS-3D transforms, drag-to-turn,
 * orbit, scramble, timer); ALL cube state lives in and mutates through our engine
 * (RubiksCube / Cube). No cube logic is duplicated here.
 *
 * Every change is driven the same way: a source calls a RubiksCube method, the engine fires
 * onMove, and we animate the change *after the fact*. So that the engine never runs ahead of
 * the animation, every source is paced: the solver and scramble are async "drivers" that
 * mutate then await settled(); discrete manual turns only apply while the view is idle.
 */
class CubeView implements IRubiksCubeObserver, IPacer {
  private rubiks = RubiksCube.getInstance()
  // We are this solver's pacer (see MovePacer): it mutates the engine directly and awaits
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

  // sticker colours (reuse the index.css palette)
  private readonly COLORS: Record<Face, string> = {
    Y: '#ffd43b',
    R: '#d92b3c',
    B: '#2256d6',
    G: '#1eaa5b',
    O: '#ff7a18',
    W: '#f4f4f0'
  }
  private readonly DIRS: (keyof Orientation)[] = ['front', 'back', 'right', 'left', 'top', 'bottom']

  // geometry
  private readonly S = 58
  private readonly HALF = 29
  private readonly UNIT = 63

  // calibration signs (flip if a turn animates the wrong way)
  private readonly ANIM_SIGN: Record<Axis, number> = { X: 1, Y: -1, Z: 1 }
  private readonly CW_SIGN: Record<Axis, number> = { X: -1, Y: -1, Z: -1 }

  // notation -> engine method + animation metadata. Method names match RubiksCube exactly.
  private readonly MOVES = {
    U: {
      posAxis: 'Y',
      layer: 1,
      cw: 'rotateTopCW',
      ccw: 'rotateTopCCW',
      cssAxis: 'Y'
    },
    E: {
      posAxis: 'Y',
      layer: 0,
      cw: 'rotateXMidCW',
      ccw: 'rotateXMidCCW',
      cssAxis: 'Y'
    },
    D: {
      posAxis: 'Y',
      layer: -1,
      cw: 'rotateBottomCW',
      ccw: 'rotateBottomCCW',
      cssAxis: 'Y'
    },
    L: {
      posAxis: 'X',
      layer: -1,
      cw: 'rotateLeftCW',
      ccw: 'rotateLeftCCW',
      cssAxis: 'X'
    },
    M: {
      posAxis: 'X',
      layer: 0,
      cw: 'rotateYMidCW',
      ccw: 'rotateYMidCCW',
      cssAxis: 'X'
    },
    R: {
      posAxis: 'X',
      layer: 1,
      cw: 'rotateRightCW',
      ccw: 'rotateRightCCW',
      cssAxis: 'X'
    },
    B: {
      posAxis: 'Z',
      layer: -1,
      cw: 'rotateBackCW',
      ccw: 'rotateBackCCW',
      cssAxis: 'Z'
    },
    S: {
      posAxis: 'Z',
      layer: 0,
      cw: 'rotateZMidCW',
      ccw: 'rotateZMidCCW',
      cssAxis: 'Z'
    },
    F: {
      posAxis: 'Z',
      layer: 1,
      cw: 'rotateFrontCW',
      ccw: 'rotateFrontCCW',
      cssAxis: 'Z'
    }
  } as const satisfies Record<string, MoveDef>

  private readonly NORMALS: Record<keyof Orientation, Vec3> = {
    right: { X: 1, Y: 0, Z: 0 },
    left: { X: -1, Y: 0, Z: 0 },
    top: { X: 0, Y: 1, Z: 0 },
    bottom: { X: 0, Y: -1, Z: 0 },
    front: { X: 0, Y: 0, Z: 1 },
    back: { X: 0, Y: 0, Z: -1 }
  }

  // whole-cube re-orientation -> engine rotateCube + matching world animation
  private readonly CUBE_MOVES: Record<string, CubeMoveDef> = {
    spinLeft: { rotation: 'XCW', axis: 'Y', angle: -90 },
    spinRight: { rotation: 'XCCW', axis: 'Y', angle: 90 },
    rollUp: { rotation: 'YCW', axis: 'X', angle: 90 },
    rollDown: { rotation: 'YCCW', axis: 'X', angle: -90 },
    tiltRight: { rotation: 'ZCW', axis: 'Z', angle: 90 },
    tiltLeft: { rotation: 'ZCCW', axis: 'Z', angle: -90 }
  }

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

    this.entries = this.rubiks.cubes.map((c) => this.createCubie(c))
    this.entries.forEach((e) => this.worldEl.appendChild(e.el))

    // Every change flows through onMove: a source calls an engine method, the engine notifies
    // us, and we persist + animate.
    this.rubiks.addObserver(this)

    this.applyView(false)
    this.renderCube()
    this.updateStats()
    this.updateStatus()

    const sc = this.sceneEl
    sc.addEventListener('pointerdown', (e) => this.onDown(e))
    sc.addEventListener('pointermove', (e) => this.onPointerMove(e))
    sc.addEventListener('pointerup', (e) => this.onUp(e))
    sc.addEventListener('pointercancel', (e) => this.onUp(e))
  }

  // ---------- rendering ----------
  private createCubie(cube: Cube): CubieEntry {
    const S = this.S,
      H = this.HALF
    const el = document.createElement('div')
    el.style.cssText =
      'position:absolute; left:0; top:0; width:' +
      S +
      'px; height:' +
      S +
      'px; transform-style:preserve-3d;'
    const faceTf: Record<keyof Orientation, string> = {
      front: 'translateZ(' + H + 'px)',
      back: 'rotateY(180deg) translateZ(' + H + 'px)',
      right: 'rotateY(90deg) translateZ(' + H + 'px)',
      left: 'rotateY(-90deg) translateZ(' + H + 'px)',
      top: 'rotateX(90deg) translateZ(' + H + 'px)',
      bottom: 'rotateX(-90deg) translateZ(' + H + 'px)'
    }
    const stickers = {} as Record<keyof Orientation, HTMLElement>
    const entry: CubieEntry = { cube, el, stickers }
    this.DIRS.forEach((dir) => {
      const face = document.createElement('div')
      face.className = 'face'
      face.dataset.dir = dir
      ;(face as any).__entry = entry
      face.style.cssText =
        'position:absolute; left:0; top:0; width:' +
        S +
        'px; height:' +
        S +
        'px; background:#14141b; border-radius:9px; transform:' +
        faceTf[dir] +
        '; -webkit-backface-visibility:hidden; backface-visibility:hidden;'
      const st = document.createElement('div')
      st.style.cssText =
        'position:absolute; inset:5px; border-radius:7px; box-shadow: inset 0 2px 5px rgba(255,255,255,.18), inset 0 -3px 6px rgba(0,0,0,.4);'
      face.appendChild(st)
      el.appendChild(face)
      stickers[dir] = st
    })
    return entry
  }

  // Write engine state to the localStorage key shared with the 2D page.
  private persist() {
    localStorage.setItem('cubeState', JSON.stringify(this.rubiks.cubes))
  }

  // Observer hook fired by the engine after every state mutation — the single animation entry
  // point. reset() rebuilds the cubes array, so re-point each rendered cubie at the current
  // engine Cube (a no-op for in-place layer/whole-cube turns), then persist and present.
  public onMove(move?: LayerMove | Rotation) {
    this.entries.forEach((e, i) => (e.cube = this.rubiks.cubes[i]))
    this.persist()
    const fast = this.movePresentation.fast === true
    this.movePresentation = {}
    // No move (reset) settles instantly. Sources only mutate the engine while idle, so a move
    // should never arrive mid-animation; if one somehow does, settle rather than overlap.
    if (this.animating || !move) {
      this.renderCube()
      return
    }
    this.animateMove(move, fast)
  }

  // Animate a move the engine has *already* applied. The DOM still shows the pre-move state, so
  // spinning the affected layer (or the whole world) by 90° lands exactly where the settling
  // renderCube repaints it.
  private animateMove(move: LayerMove | Rotation, fast: boolean) {
    const key = (Object.keys(this.MOVES) as MoveKey[]).find(
      (k) => this.MOVES[k].cw === move || this.MOVES[k].ccw === move
    )
    if (key) {
      const m = this.MOVES[key]
      const prime = m.ccw === move
      const base = this.ANIM_SIGN[m.cssAxis] * 90
      this.animateLayer(m, prime ? -base : base, fast)
      return
    }
    const cubeDef = Object.values(this.CUBE_MOVES).find((c) => c.rotation === move)
    if (cubeDef) {
      this.animateWholeCube(cubeDef)
      return
    }
    // Unmappable change — settle without a spin.
    this.renderCube()
  }

  // ---------- drivers (paced move sequences) ----------
  // One click runs the solver's whole sequence. The solver mutates the engine directly (each
  // move fires onMove → animateMove) and awaits settled() between moves, so we present one turn
  // at a time.
  private startSolve() {
    this.runSequence((signal) => this.solver.run(signal))
  }

  // Abort a running solve (or scramble). Aborting the signal is enough: the driver's loop
  // checks signal.aborted after the in-flight move settles and unwinds. We don't flushSettled
  // here — that would wake the waiter mid-animation and let the engine outrun the view.
  private abortSolve() {
    this.sequenceAbort?.abort()
    this.solver.reset()
  }

  // Run a paced sequence of engine mutations as the sole active driver. Manual input is locked
  // out (driving) until it finishes; reset() aborts it via the signal.
  private runSequence(fn: (signal: AbortSignal) => Promise<void>) {
    if (this.driving || this.animating) return
    this.driving = true
    this.sequenceAbort = new AbortController()
    fn(this.sequenceAbort.signal).finally(() => {
      this.driving = false
      this.sequenceAbort = undefined
    })
  }

  // MovePacer: a driver awaits this after each move. Resolve immediately when idle, otherwise
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
    const m = this.MOVES[face]
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
    const c = this.CUBE_MOVES[key]
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
    return 'rotateX(' + this.pitch + 'deg) rotateY(' + this.yaw + 'deg)'
  }

  private animateLayer(m: MoveDef, angle: number, fast: boolean) {
    this.animating = true
    const group = document.createElement('div')
    group.style.cssText =
      'position:absolute; left:0; top:0; width:0; height:0; transform-style:preserve-3d;'
    this.worldEl.appendChild(group)
    // The engine already turned this layer, but a face turn keeps its cubies in the layer, so
    // selecting by current position still gathers the right ones; their on-screen transforms
    // still show the pre-move state.
    const moving = this.entries.filter((e) => e.cube.position[m.posAxis] === m.layer)
    moving.forEach((e) => group.appendChild(e.el))
    group.getBoundingClientRect() // reflow
    const dur = fast ? 135 : 290
    group.style.transition = 'transform ' + dur + 'ms cubic-bezier(.34,.66,.24,1)'
    group.style.transform = 'rotate' + m.cssAxis + '(' + angle + 'deg)'

    let finished = false
    const done = () => {
      if (finished) return
      finished = true
      group.removeEventListener('transitionend', onEnd)
      // Tear down the turn-group wrapper, then settle the cubies onto the (already-applied) model.
      // Re-append *every* cubie in canonical (entries) order — not just the moving ones — so the
      // worldEl child order stays the stable, known-good order init() built. Appending only the
      // moving cubies would shove them to the end of the list; since CSS-3D face hit-testing
      // follows DOM order, that lets a just-turned layer steal pointerdowns from cubies it
      // overlaps on screen, making them undraggable until they're themselves moved.
      this.entries.forEach((e) => this.worldEl.appendChild(e.el))
      group.remove()
      this.renderCube()
      this.animating = false
      this.flushSettled()
    }
    // Only react to this group's own transform transition (ignore any bubbled child events).
    const onEnd = (e: TransitionEvent) => {
      if (e.target === group && e.propertyName === 'transform') done()
    }
    group.addEventListener('transitionend', onEnd)
    setTimeout(done, dur + 140)
  }

  private animateWholeCube(c: CubeMoveDef) {
    this.animating = true
    // Commit a clean resting orientation as the animation's starting point. Without the forced
    // reflow, the reset (transition:none) and the spin (transition+transform) collapse into one
    // style pass with no baseline to animate from, so the turn would jump instantly.
    this.worldEl.style.transition = 'none'
    this.worldEl.style.transform = this.orbitStr()
    this.worldEl.getBoundingClientRect() // reflow
    this.worldEl.style.transition = 'transform 320ms cubic-bezier(.34,.66,.24,1)'
    this.worldEl.style.transform = this.orbitStr() + ' rotate' + c.axis + '(' + c.angle + 'deg)'
    let finished = false
    const done = () => {
      if (finished) return
      finished = true
      this.worldEl.removeEventListener('transitionend', onEnd)
      // The engine already re-keyed every cubie; reset the world to its resting orbit and
      // repaint so the spun look becomes the new resting state.
      this.worldEl.style.transition = 'none'
      this.worldEl.style.transform = this.orbitStr()
      this.renderCube()
      this.animating = false
      this.flushSettled()
    }
    // Only react to worldEl's own transform transition (transitionend bubbles).
    const onEnd = (e: TransitionEvent) => {
      if (e.target === this.worldEl && e.propertyName === 'transform') done()
    }
    this.worldEl.addEventListener('transitionend', onEnd)
    setTimeout(done, 470)
  }

  private renderCube() {
    const U = this.UNIT,
      H = this.HALF
    this.entries.forEach((e) => {
      const p = e.cube.position
      // engine pos -> CSS: X = right(+), Y = up(+) so screen-down is -Y, Z = front(+) toward viewer
      e.el.style.transform =
        'translate3d(' + (p.X * U - H) + 'px,' + (-p.Y * U - H) + 'px,' + p.Z * U + 'px)'
      this.DIRS.forEach((dir) => {
        const col = e.cube.orientation[dir]
        const st = e.stickers[dir]
        if (col) {
          st.style.display = 'block'
          st.style.background = this.COLORS[col]
        } else {
          st.style.display = 'none'
        }
      })
    })
  }

  private applyView(animate: boolean) {
    if (this.animating) return
    if (!this.worldEl) return
    this.worldEl.style.transition = animate ? 'transform .4s cubic-bezier(.2,.6,.2,1)' : 'none'
    this.worldEl.style.transform = 'rotateX(' + this.pitch + 'deg) rotateY(' + this.yaw + 'deg)'
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
    const seq = this.buildScramble()
    this.scrambleLeft = seq.length
    this.hasScrambled = true
    this.moveCount = 0
    this.elapsed = 0
    this.status = 'scrambling'
    this.updateStatus()
    this.updateStats()
    this.runSequence((signal) => this.runScramble(seq, signal))
  }

  // A non-trivial random sequence: no two consecutive turns on the same axis.
  private buildScramble(): Array<{ f: MoveKey; prime: boolean }> {
    const faces: MoveKey[] = ['U', 'D', 'L', 'R', 'F', 'B']
    const seq: Array<{ f: MoveKey; prime: boolean }> = []
    let lastAxis: Axis | '' = ''
    for (let i = 0; i < 24; i++) {
      let f: MoveKey
      let guard = 0
      do {
        f = faces[Math.floor(Math.random() * faces.length)]
        guard++
      } while (this.MOVES[f].posAxis === lastAxis && guard < 8)
      lastAxis = this.MOVES[f].posAxis
      seq.push({ f, prime: Math.random() < 0.5 })
    }
    return seq
  }

  // A driver: apply each scramble turn (fast), then await its presentation before the next.
  private async runScramble(seq: Array<{ f: MoveKey; prime: boolean }>, signal: AbortSignal) {
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
    this.moveCount = 0
    this.elapsed = 0
    this.updateStatus()
    this.updateStats()
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
        const mv = this.pickTurn(this.dragFace, dx, dy)
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

  private projectAxis(v: Vec3) {
    // position-space vector -> css-space (cssX=X, cssY=-Y, cssZ=Z) -> screen via Rx(pitch)Ry(yaw)
    const a = (this.pitch * Math.PI) / 180,
      b = (this.yaw * Math.PI) / 180
    const x = v.X,
      y = -v.Y,
      z = v.Z
    const x1 = x * Math.cos(b) + z * Math.sin(b)
    const z1 = -x * Math.sin(b) + z * Math.cos(b)
    const y1 = y
    const y2 = y1 * Math.cos(a) - z1 * Math.sin(a)
    return { x: x1, y: y2 }
  }

  private pickTurn(
    faceEl: HTMLElement,
    dx: number,
    dy: number
  ): { face: MoveKey; prime: boolean } | null {
    const dir = faceEl.dataset.dir as keyof Orientation
    const entry = (faceEl as any).__entry as CubieEntry | undefined
    if (!entry) return null
    const cube = entry.cube
    const normal = this.NORMALS[dir]
    const normalAxis: Axis = normal.X ? 'X' : normal.Y ? 'Y' : 'Z'
    const axes = (['X', 'Y', 'Z'] as Axis[]).filter((a) => a !== normalAxis)
    let best: { axis: Axis; dot: number; sign: number } | null = null
    axes.forEach((axis) => {
      const vec: Vec3 = { X: 0, Y: 0, Z: 0 }
      vec[axis] = 1
      const proj = this.projectAxis(vec)
      const dot = dx * proj.x + dy * proj.y
      if (!best || Math.abs(dot) > Math.abs(best.dot)) best = { axis, dot, sign: dot >= 0 ? 1 : -1 }
    })
    if (!best) return null
    const chosen = best as { axis: Axis; dot: number; sign: number }
    const m: Vec3 = { X: 0, Y: 0, Z: 0 }
    m[chosen.axis] = chosen.sign
    // r = normal x m
    const r: Vec3 = {
      X: normal.Y * m.Z - normal.Z * m.Y,
      Y: normal.Z * m.X - normal.X * m.Z,
      Z: normal.X * m.Y - normal.Y * m.X
    }
    const rAxis: Axis = Math.abs(r.X) > 0.5 ? 'X' : Math.abs(r.Y) > 0.5 ? 'Y' : 'Z'
    const rSign = r[rAxis] >= 0 ? 1 : -1
    const layer = cube.position[rAxis]
    let face: MoveKey | null = null
    ;(Object.keys(this.MOVES) as MoveKey[]).forEach((k) => {
      const mv = this.MOVES[k]
      if (mv.posAxis === rAxis && mv.layer === layer) face = k
    })
    if (!face) return null
    const prime = rSign === this.CW_SIGN[rAxis] ? false : true
    return { face, prime }
  }

  private onKey(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement | null)?.tagName || ''
    if (/input|textarea|select/i.test(tag)) return
    if (this.dragging) return // ignore keypresses while the pointer is held down
    const k = e.key
    if (k === 'a') {
      this.userCubeMove('spinLeft')
      e.preventDefault()
      return
    }
    if (k === 'd') {
      this.userCubeMove('spinRight')
      e.preventDefault()
      return
    }
    if (k === 'w') {
      this.userCubeMove('rollUp')
      e.preventDefault()
      return
    }
    if (k === 's') {
      this.userCubeMove('rollDown')
      e.preventDefault()
      return
    }
    if (k === ' ') {
      this.resetView()
      e.preventDefault()
      return
    }
    const map: Record<string, MoveKey> = {
      t: 'U',
      b: 'D',
      l: 'L',
      r: 'R',
      f: 'F',
      q: 'B',
      y: 'M',
      x: 'E',
      z: 'S'
    }
    const face = map[k.toLowerCase()]
    if (face) {
      this.userMove(face, e.shiftKey)
      e.preventDefault()
    }
  }

  // ---------- panel DOM ----------
  private timeText(): string {
    const ms = this.elapsed || 0
    const total = ms / 1000
    const mm = Math.floor(total / 60)
    const ss = Math.floor(total % 60)
    const t = Math.floor((ms % 1000) / 100)
    const ssStr = (mm > 0 && ss < 10 ? '0' : '') + ss
    return (mm > 0 ? mm + ':' : '') + ssStr + '.' + t
  }

  private updateStats() {
    const time = document.getElementById('stat-time')
    const moves = document.getElementById('stat-moves')
    if (time) time.textContent = this.timeText()
    if (moves) moves.textContent = String(this.moveCount)
  }

  private updateStatus() {
    const statusMap: Record<Status, { label: string; color: string }> = {
      free: { label: 'Free Play', color: 'var(--text)' },
      ready: { label: 'Ready', color: 'var(--text)' },
      scrambling: { label: 'Scrambling…', color: 'var(--accent-x)' },
      solving: { label: 'Solving…', color: 'var(--accent-z)' },
      solved: { label: 'Solved!', color: 'var(--accent-y)' }
    }
    const st = statusMap[this.status]
    const pill = document.getElementById('status-pill')
    const dot = document.getElementById('status-dot')
    const label = document.getElementById('status-label')
    if (dot) {
      dot.style.background = st.color
      dot.style.boxShadow = '0 0 10px ' + st.color
    }
    if (label) {
      label.textContent = st.label
      label.style.color = st.color
    }
    if (pill) pill.style.borderColor = st.color
  }

  private wireControls() {
    const bind = (id: string, fn: () => void) =>
      document.getElementById(id)?.addEventListener('click', fn)
    bind('btn-scramble', () => this.scramble())
    bind('btn-reset', () => this.reset())
    bind('solve', () => this.startSolve())
    bind('abort-solve', () => this.abortSolve())
    bind('btn-recenter', () => this.resetView())
    bind('btn-roll-up', () => this.userCubeMove('rollUp'))
    bind('btn-roll-down', () => this.userCubeMove('rollDown'))
    bind('btn-spin-left', () => this.userCubeMove('spinLeft'))
    bind('btn-spin-right', () => this.userCubeMove('spinRight'))
    bind('btn-tilt-left', () => this.userCubeMove('tiltLeft'))
    bind('btn-tilt-right', () => this.userCubeMove('tiltRight'))
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
