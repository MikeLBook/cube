import RubiksCube from "./engine/RubiksCube";
import Cube from "./engine/Cube";
import { Face, Orientation, Rotation } from "./engine/models";

// The no-argument layer-rotation methods on RubiksCube that a single face turn maps to.
type LayerMethod =
  | "rotateTopCW"
  | "rotateTopCCW"
  | "rotateXMidCW"
  | "rotateXMidCCW"
  | "rotateBottomCW"
  | "rotateBottomCCW"
  | "rotateLeftCW"
  | "rotateLeftCCW"
  | "rotateYMidCW"
  | "rotateYMidCCW"
  | "rotateRightCW"
  | "rotateRightCCW"
  | "rotateFrontCW"
  | "rotateFrontCCW"
  | "rotateZMidCW"
  | "rotateZMidCCW"
  | "rotateBackCW"
  | "rotateBackCCW";

type Axis = "X" | "Y" | "Z";
type Status = "ready" | "scrambling" | "solving" | "solved";

// Singmaster-style face notation keys handled by this view.
type MoveKey = "U" | "E" | "D" | "L" | "M" | "R" | "B" | "S" | "F";

const DEFAULT_YAW = -45;
const DEFAULT_PITCH = -19.5;

interface MoveDef {
  posAxis: Axis;
  layer: number;
  cw: LayerMethod;
  ccw: LayerMethod;
  cssAxis: Axis;
}

interface CubeMoveDef {
  rotation: Rotation;
  axis: Axis;
  angle: number;
}

interface Vec3 {
  X: number;
  Y: number;
  Z: number;
}

// One rendered cubie: the engine Cube it mirrors, its DOM element, and its six sticker elements.
interface CubieEntry {
  cube: Cube;
  el: HTMLElement;
  stickers: Record<keyof Orientation, HTMLElement>;
}

interface TurnItem {
  kind: "turn";
  face: keyof CubeView["MOVES"];
  prime: boolean;
  opts: MoveOpts;
}

interface CubeItem {
  kind: "cube";
  c: CubeMoveDef;
}

interface MoveOpts {
  count?: boolean;
  fast?: boolean;
  scramble?: boolean;
}

/**
 * 3D Rubik's cube view. Pure presentation + interaction (CSS-3D transforms, drag-to-turn,
 * orbit, scramble, timer); ALL cube state lives in and mutates through our engine
 * (RubiksCube / Cube). No cube logic is duplicated here.
 */
class CubeView {
  private rubiks = RubiksCube.getInstance();

  private sceneEl: HTMLElement;
  private worldEl!: HTMLElement;
  private entries: CubieEntry[] = [];

  // queued moves / animation gating
  private queue: Array<TurnItem | CubeItem> = [];
  private animating = false;

  // session state (mirrored into the panel DOM)
  private moveCount = 0;
  private elapsed = 0;
  private status: Status = "ready";
  private running = false;
  private hasScrambled = false;
  private scrambleLeft = 0;
  private timer: number | undefined;
  private t0 = 0;

  // orbit
  private yaw = DEFAULT_YAW;
  private pitch = DEFAULT_PITCH;

  // drag bookkeeping
  private dragging = false;
  private dragFace: HTMLElement | null = null;
  private turnCommitted = false;
  private px = 0;
  private py = 0;
  private yaw0 = 0;
  private pitch0 = 0;

  // sticker colours (reuse the index.css palette)
  private readonly COLORS: Record<Face, string> = {
    Y: "#ffd43b",
    R: "#d92b3c",
    B: "#2256d6",
    G: "#1eaa5b",
    O: "#ff7a18",
    W: "#f4f4f0",
  };
  private readonly DIRS: (keyof Orientation)[] = [
    "front",
    "back",
    "right",
    "left",
    "top",
    "bottom",
  ];

  // geometry
  private readonly S = 58;
  private readonly HALF = 29;
  private readonly UNIT = 63;

  // calibration signs (flip if a turn animates the wrong way)
  private readonly ANIM_SIGN: Record<Axis, number> = { X: 1, Y: -1, Z: 1 };
  private readonly CW_SIGN: Record<Axis, number> = { X: -1, Y: -1, Z: -1 };

  // notation -> engine method + animation metadata. Method names match RubiksCube exactly.
  private readonly MOVES = {
    U: {
      posAxis: "Y",
      layer: 1,
      cw: "rotateTopCW",
      ccw: "rotateTopCCW",
      cssAxis: "Y",
    },
    E: {
      posAxis: "Y",
      layer: 0,
      cw: "rotateXMidCW",
      ccw: "rotateXMidCCW",
      cssAxis: "Y",
    },
    D: {
      posAxis: "Y",
      layer: -1,
      cw: "rotateBottomCW",
      ccw: "rotateBottomCCW",
      cssAxis: "Y",
    },
    L: {
      posAxis: "X",
      layer: -1,
      cw: "rotateLeftCW",
      ccw: "rotateLeftCCW",
      cssAxis: "X",
    },
    M: {
      posAxis: "X",
      layer: 0,
      cw: "rotateYMidCW",
      ccw: "rotateYMidCCW",
      cssAxis: "X",
    },
    R: {
      posAxis: "X",
      layer: 1,
      cw: "rotateRightCW",
      ccw: "rotateRightCCW",
      cssAxis: "X",
    },
    B: {
      posAxis: "Z",
      layer: -1,
      cw: "rotateBackCW",
      ccw: "rotateBackCCW",
      cssAxis: "Z",
    },
    S: {
      posAxis: "Z",
      layer: 0,
      cw: "rotateZMidCW",
      ccw: "rotateZMidCCW",
      cssAxis: "Z",
    },
    F: {
      posAxis: "Z",
      layer: 1,
      cw: "rotateFrontCW",
      ccw: "rotateFrontCCW",
      cssAxis: "Z",
    },
  } as const satisfies Record<string, MoveDef>;

  private readonly NORMALS: Record<keyof Orientation, Vec3> = {
    right: { X: 1, Y: 0, Z: 0 },
    left: { X: -1, Y: 0, Z: 0 },
    top: { X: 0, Y: 1, Z: 0 },
    bottom: { X: 0, Y: -1, Z: 0 },
    front: { X: 0, Y: 0, Z: 1 },
    back: { X: 0, Y: 0, Z: -1 },
  };

  // whole-cube re-orientation -> engine rotateCube + matching world animation
  private readonly CUBE_MOVES: Record<string, CubeMoveDef> = {
    spinLeft: { rotation: "XCW", axis: "Y", angle: -90 },
    spinRight: { rotation: "XCCW", axis: "Y", angle: 90 },
    rollUp: { rotation: "YCW", axis: "X", angle: 90 },
    rollDown: { rotation: "YCCW", axis: "X", angle: -90 },
  };

  constructor(sceneEl: HTMLElement) {
    this.sceneEl = sceneEl;
    this.init();
    this.wireControls();
    window.addEventListener("keydown", (e) => this.onKey(e));
  }

  private init() {
    this.worldEl = document.createElement("div");
    this.worldEl.style.cssText =
      "position:absolute; left:50%; top:50%; width:0; height:0; transform-style:preserve-3d; will-change:transform;";
    this.sceneEl.appendChild(this.worldEl);

    this.entries = this.rubiks.cubes.map((c) => this.createCubie(c));
    this.entries.forEach((e) => this.worldEl.appendChild(e.el));

    this.applyView(false);
    this.renderCube();
    this.updateStats();
    this.updateStatus();

    const sc = this.sceneEl;
    sc.addEventListener("pointerdown", (e) => this.onDown(e));
    sc.addEventListener("pointermove", (e) => this.onMove(e));
    sc.addEventListener("pointerup", (e) => this.onUp(e));
    sc.addEventListener("pointercancel", (e) => this.onUp(e));
  }

  // ---------- rendering ----------
  private createCubie(cube: Cube): CubieEntry {
    const S = this.S,
      H = this.HALF;
    const el = document.createElement("div");
    el.style.cssText =
      "position:absolute; left:0; top:0; width:" +
      S +
      "px; height:" +
      S +
      "px; transform-style:preserve-3d;";
    const faceTf: Record<keyof Orientation, string> = {
      front: "translateZ(" + H + "px)",
      back: "rotateY(180deg) translateZ(" + H + "px)",
      right: "rotateY(90deg) translateZ(" + H + "px)",
      left: "rotateY(-90deg) translateZ(" + H + "px)",
      top: "rotateX(90deg) translateZ(" + H + "px)",
      bottom: "rotateX(-90deg) translateZ(" + H + "px)",
    };
    const stickers = {} as Record<keyof Orientation, HTMLElement>;
    const entry: CubieEntry = { cube, el, stickers };
    this.DIRS.forEach((dir) => {
      const face = document.createElement("div");
      face.className = "face";
      face.dataset.dir = dir;
      (face as any).__entry = entry;
      face.style.cssText =
        "position:absolute; left:0; top:0; width:" +
        S +
        "px; height:" +
        S +
        "px; background:#14141b; border-radius:9px; transform:" +
        faceTf[dir] +
        "; -webkit-backface-visibility:hidden; backface-visibility:hidden;";
      const st = document.createElement("div");
      st.style.cssText =
        "position:absolute; inset:5px; border-radius:7px; box-shadow: inset 0 2px 5px rgba(255,255,255,.18), inset 0 -3px 6px rgba(0,0,0,.4);";
      face.appendChild(st);
      el.appendChild(face);
      stickers[dir] = st;
    });
    return entry;
  }

  private renderCube() {
    const U = this.UNIT,
      H = this.HALF;
    this.entries.forEach((e) => {
      const p = e.cube.position;
      // engine pos -> CSS: X = right(+), Y = up(+) so screen-down is -Y, Z = front(+) toward viewer
      e.el.style.transform =
        "translate3d(" +
        (p.X * U - H) +
        "px," +
        (-p.Y * U - H) +
        "px," +
        p.Z * U +
        "px)";
      this.DIRS.forEach((dir) => {
        const col = e.cube.orientation[dir];
        const st = e.stickers[dir];
        if (col) {
          st.style.display = "block";
          st.style.background = this.COLORS[col];
        } else {
          st.style.display = "none";
        }
      });
    });
  }

  private applyView(animate: boolean) {
    if (this.animating) return;
    if (!this.worldEl) return;
    this.worldEl.style.transition = animate
      ? "transform .4s cubic-bezier(.2,.6,.2,1)"
      : "none";
    this.worldEl.style.transform =
      "rotateX(" + this.pitch + "deg) rotateY(" + this.yaw + "deg)";
  }

  // ---------- moves / animation ----------
  private move(face: MoveKey, prime: boolean, opts?: MoveOpts) {
    if (!this.MOVES[face]) return;
    this.queue.push({ kind: "turn", face, prime: !!prime, opts: opts || {} });
    this.processQueue();
  }

  private cubeMove(key: string) {
    const c = this.CUBE_MOVES[key];
    if (!c) return;
    this.queue.push({ kind: "cube", c });
    this.processQueue();
  }

  private orbitStr() {
    return "rotateX(" + this.pitch + "deg) rotateY(" + this.yaw + "deg)";
  }

  private processQueue() {
    if (this.animating || !this.queue.length || !this.worldEl) return;
    const it = this.queue.shift()!;
    if (it.kind === "cube") {
      this.animateCube(it.c);
      return;
    }
    const m = this.MOVES[it.face];
    const base = this.ANIM_SIGN[m.cssAxis] * 90;
    const angle = it.prime ? -base : base;
    const method = it.prime ? m.ccw : m.cw;
    this.animateLayer(m, angle, method, it.opts);
  }

  private animateCube(c: CubeMoveDef) {
    this.animating = true;
    // Commit a clean resting orientation as the animation's starting point. Without the
    // forced reflow, a queued rotation's reset (transition:none) and the next rotation's
    // transition+transform collapse into one style pass with no baseline to animate from,
    // so every turn after the first would jump instantly instead of animating.
    this.worldEl.style.transition = "none";
    this.worldEl.style.transform = this.orbitStr();
    this.worldEl.getBoundingClientRect(); // reflow
    this.worldEl.style.transition =
      "transform 320ms cubic-bezier(.34,.66,.24,1)";
    this.worldEl.style.transform =
      this.orbitStr() + " rotate" + c.axis + "(" + c.angle + "deg)";
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      this.worldEl.removeEventListener("transitionend", onEnd);
      this.rubiks.rotateCube(c.rotation); // re-key model so the spun look becomes the new resting state
      this.worldEl.style.transition = "none";
      this.worldEl.style.transform = this.orbitStr();
      this.renderCube();
      this.animating = false;
      this.processQueue();
    };
    // Only react to worldEl's own transform transition. transitionend bubbles, so a layer
    // turn's group event (which finishes just before this animation starts) would otherwise
    // fire this handler instantly and skip the animation.
    const onEnd = (e: TransitionEvent) => {
      if (e.target === this.worldEl && e.propertyName === "transform") done();
    };
    this.worldEl.addEventListener("transitionend", onEnd);
    setTimeout(done, 470);
  }

  private animateLayer(
    m: MoveDef,
    angle: number,
    method: LayerMethod,
    opts: MoveOpts,
  ) {
    this.animating = true;
    const group = document.createElement("div");
    group.style.cssText =
      "position:absolute; left:0; top:0; width:0; height:0; transform-style:preserve-3d;";
    this.worldEl.appendChild(group);
    const moving = this.entries.filter(
      (e) => e.cube.position[m.posAxis] === m.layer,
    );
    moving.forEach((e) => group.appendChild(e.el));
    group.getBoundingClientRect(); // reflow
    const dur = opts.fast ? 135 : 290;
    group.style.transition =
      "transform " + dur + "ms cubic-bezier(.34,.66,.24,1)";
    group.style.transform = "rotate" + m.cssAxis + "(" + angle + "deg)";

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      group.removeEventListener("transitionend", onEnd);
      this.rubiks[method]();
      moving.forEach((e) => this.worldEl.appendChild(e.el));
      group.remove();
      this.renderCube();
      this.afterMove(opts);
      this.animating = false;
      this.processQueue();
    };
    // Only react to this group's own transform transition (ignore any bubbled child events).
    const onEnd = (e: TransitionEvent) => {
      if (e.target === group && e.propertyName === "transform") done();
    };
    group.addEventListener("transitionend", onEnd);
    setTimeout(done, dur + 140);
  }

  private afterMove(opts: MoveOpts) {
    if (opts.scramble) {
      this.scrambleLeft--;
      if (this.scrambleLeft <= 0) {
        this.status = "ready";
        this.updateStatus();
      }
      return;
    }
    if (opts.count !== false) {
      this.startTimer();
      this.moveCount++;
      this.updateStats();
    }
    if (this.hasScrambled && this.rubiks.isSolved()) {
      this.stopTimer();
      this.status = "solved";
      this.updateStatus();
    }
  }

  // ---------- timer ----------
  private startTimer() {
    if (this.running || this.status === "solved") return;
    this.running = true;
    this.t0 = performance.now();
    this.status = "solving";
    this.updateStatus();
    this.timer = window.setInterval(() => {
      this.elapsed = performance.now() - this.t0;
      this.updateStats();
    }, 60);
  }

  private stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.running = false;
    if (this.t0) {
      this.elapsed = performance.now() - this.t0;
      this.updateStats();
    }
  }

  // ---------- scramble / reset ----------
  private scramble() {
    this.doReset(false);
    this.hasScrambled = true;
    this.status = "scrambling";
    this.moveCount = 0;
    this.elapsed = 0;
    this.updateStatus();
    this.updateStats();
    const faces: MoveKey[] = ["U", "D", "L", "R", "F", "B"];
    const seq: Array<{ f: MoveKey; prime: boolean }> = [];
    let lastAxis: Axis | "" = "";
    for (let i = 0; i < 24; i++) {
      let f: MoveKey;
      let guard = 0;
      do {
        f = faces[Math.floor(Math.random() * faces.length)];
        guard++;
      } while (this.MOVES[f].posAxis === lastAxis && guard < 8);
      lastAxis = this.MOVES[f].posAxis;
      seq.push({ f, prime: Math.random() < 0.5 });
    }
    this.scrambleLeft = seq.length;
    seq.forEach((mv) =>
      this.move(mv.f, mv.prime, { count: false, fast: true, scramble: true }),
    );
  }

  private reset() {
    this.doReset(true);
  }

  private doReset(resetView: boolean) {
    if (this.timer) clearInterval(this.timer);
    this.running = false;
    this.queue = [];
    this.animating = false;
    this.rubiks.reset();
    // our engine rebuilds its cubes array on reset, so re-point each rendered entry at the fresh Cube
    this.entries.forEach((e, i) => {
      e.cube = this.rubiks.cubes[i];
    });
    if (this.entries && this.worldEl) {
      // re-parent every cubie to world and drop any leftover turn-group wrappers
      this.entries.forEach((e) => this.worldEl.appendChild(e.el));
      Array.prototype.slice.call(this.worldEl.children).forEach((ch) => {
        if (!this.entries.some((e) => e.el === ch))
          (ch as HTMLElement).remove();
      });
      this.renderCube();
    }
    if (resetView) {
      this.hasScrambled = false;
      this.yaw = DEFAULT_YAW;
      this.pitch = DEFAULT_PITCH;
      this.applyView(true);
    }
    this.status = "ready";
    this.moveCount = 0;
    this.elapsed = 0;
    this.updateStatus();
    this.updateStats();
  }

  // ---------- view ----------
  private resetView() {
    this.yaw = DEFAULT_YAW;
    this.pitch = DEFAULT_PITCH;
    this.applyView(true);
  }

  // ---------- pointer ----------
  private onDown(e: PointerEvent) {
    this.sceneEl.setPointerCapture &&
      this.sceneEl.setPointerCapture(e.pointerId);
    this.px = e.clientX;
    this.py = e.clientY;
    this.yaw0 = this.yaw;
    this.pitch0 = this.pitch;
    this.dragging = true;
    this.turnCommitted = false;
    const target = e.target as HTMLElement;
    const faceEl =
      target.closest && (target.closest(".face") as HTMLElement | null);
    this.dragFace = faceEl && !this.animating ? faceEl : null;
    this.sceneEl.style.cursor = "grabbing";
  }

  private onMove(e: PointerEvent) {
    if (!this.dragging) return;
    const dx = e.clientX - this.px,
      dy = e.clientY - this.py;
    if (this.dragFace) {
      if (!this.turnCommitted && Math.hypot(dx, dy) > 14) {
        this.turnCommitted = true;
        const mv = this.pickTurn(this.dragFace, dx, dy);
        if (mv) this.move(mv.face, mv.prime);
      }
    } else {
      this.yaw = this.yaw0 + dx * 0.42;
      this.pitch = Math.max(-86, Math.min(86, this.pitch0 - dy * 0.42));
      this.applyView(false);
    }
  }

  private onUp(_e: PointerEvent) {
    this.dragging = false;
    this.dragFace = null;
    this.sceneEl.style.cursor = "grab";
  }

  private projectAxis(v: Vec3) {
    // position-space vector -> css-space (cssX=X, cssY=-Y, cssZ=Z) -> screen via Rx(pitch)Ry(yaw)
    const a = (this.pitch * Math.PI) / 180,
      b = (this.yaw * Math.PI) / 180;
    const x = v.X,
      y = -v.Y,
      z = v.Z;
    const x1 = x * Math.cos(b) + z * Math.sin(b);
    const z1 = -x * Math.sin(b) + z * Math.cos(b);
    const y1 = y;
    const y2 = y1 * Math.cos(a) - z1 * Math.sin(a);
    return { x: x1, y: y2 };
  }

  private pickTurn(
    faceEl: HTMLElement,
    dx: number,
    dy: number,
  ): { face: MoveKey; prime: boolean } | null {
    const dir = faceEl.dataset.dir as keyof Orientation;
    const entry = (faceEl as any).__entry as CubieEntry | undefined;
    if (!entry) return null;
    const cube = entry.cube;
    const normal = this.NORMALS[dir];
    const normalAxis: Axis = normal.X ? "X" : normal.Y ? "Y" : "Z";
    const axes = (["X", "Y", "Z"] as Axis[]).filter((a) => a !== normalAxis);
    let best: { axis: Axis; dot: number; sign: number } | null = null;
    axes.forEach((axis) => {
      const vec: Vec3 = { X: 0, Y: 0, Z: 0 };
      vec[axis] = 1;
      const proj = this.projectAxis(vec);
      const dot = dx * proj.x + dy * proj.y;
      if (!best || Math.abs(dot) > Math.abs(best.dot))
        best = { axis, dot, sign: dot >= 0 ? 1 : -1 };
    });
    if (!best) return null;
    const chosen = best as { axis: Axis; dot: number; sign: number };
    const m: Vec3 = { X: 0, Y: 0, Z: 0 };
    m[chosen.axis] = chosen.sign;
    // r = normal x m
    const r: Vec3 = {
      X: normal.Y * m.Z - normal.Z * m.Y,
      Y: normal.Z * m.X - normal.X * m.Z,
      Z: normal.X * m.Y - normal.Y * m.X,
    };
    const rAxis: Axis =
      Math.abs(r.X) > 0.5 ? "X" : Math.abs(r.Y) > 0.5 ? "Y" : "Z";
    const rSign = r[rAxis] >= 0 ? 1 : -1;
    const layer = cube.position[rAxis];
    let face: MoveKey | null = null;
    (Object.keys(this.MOVES) as MoveKey[]).forEach((k) => {
      const mv = this.MOVES[k];
      if (mv.posAxis === rAxis && mv.layer === layer) face = k;
    });
    if (!face) return null;
    const prime = rSign === this.CW_SIGN[rAxis] ? false : true;
    return { face, prime };
  }

  private onKey(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement | null)?.tagName || "";
    if (/input|textarea|select/i.test(tag)) return;
    if (this.dragging) return; // ignore keypresses while the pointer is held down
    const k = e.key;
    if (k === "a") {
      this.cubeMove("spinLeft");
      e.preventDefault();
      return;
    }
    if (k === "d") {
      this.cubeMove("spinRight");
      e.preventDefault();
      return;
    }
    if (k === "w") {
      this.cubeMove("rollUp");
      e.preventDefault();
      return;
    }
    if (k === "s") {
      this.cubeMove("rollDown");
      e.preventDefault();
      return;
    }
    if (k === " ") {
      this.resetView();
      e.preventDefault();
      return;
    }
    const map: Record<string, MoveKey> = {
      u: "U",
      d: "D",
      l: "L",
      r: "R",
      f: "F",
      b: "B",
      y: "M",
      x: "E",
      z: "S",
    };
    const face = map[k.toLowerCase()];
    if (face) {
      this.move(face, e.shiftKey);
      e.preventDefault();
    }
  }

  // ---------- panel DOM ----------
  private timeText(): string {
    const ms = this.elapsed || 0;
    const total = ms / 1000;
    const mm = Math.floor(total / 60);
    const ss = Math.floor(total % 60);
    const t = Math.floor((ms % 1000) / 100);
    const ssStr = (mm > 0 && ss < 10 ? "0" : "") + ss;
    return (mm > 0 ? mm + ":" : "") + ssStr + "." + t;
  }

  private updateStats() {
    const time = document.getElementById("stat-time");
    const moves = document.getElementById("stat-moves");
    if (time) time.textContent = this.timeText();
    if (moves) moves.textContent = String(this.moveCount);
  }

  private updateStatus() {
    const statusMap: Record<Status, { label: string; color: string }> = {
      ready: { label: "Ready", color: "var(--text)" },
      scrambling: { label: "Scrambling…", color: "var(--accent-x)" },
      solving: { label: "Solving…", color: "var(--accent-z)" },
      solved: { label: "Solved!", color: "var(--accent-y)" },
    };
    const st = statusMap[this.status];
    const pill = document.getElementById("status-pill");
    const dot = document.getElementById("status-dot");
    const label = document.getElementById("status-label");
    if (dot) {
      dot.style.background = st.color;
      dot.style.boxShadow = "0 0 10px " + st.color;
    }
    if (label) {
      label.textContent = st.label;
      label.style.color = st.color;
    }
    if (pill) pill.style.borderColor = st.color;
  }

  private wireControls() {
    const bind = (id: string, fn: () => void) =>
      document.getElementById(id)?.addEventListener("click", fn);
    bind("btn-scramble", () => this.scramble());
    bind("btn-reset", () => this.reset());
    bind("btn-recenter", () => this.resetView());
    bind("btn-roll-up", () => this.cubeMove("rollUp"));
    bind("btn-roll-down", () => this.cubeMove("rollDown"));
    bind("btn-spin-left", () => this.cubeMove("spinLeft"));
    bind("btn-spin-right", () => this.cubeMove("spinRight"));
  }
}

function start() {
  const scene = document.getElementById("scene");
  if (scene) new CubeView(scene);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
