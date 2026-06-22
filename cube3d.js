"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/engine/Cube.ts
  var Cube;
  var init_Cube = __esm({
    "src/engine/Cube.ts"() {
      "use strict";
      Cube = class {
        position;
        orientation;
        constructor(position, orientation) {
          this.position = position;
          this.orientation = orientation;
        }
        get isInTopLayer() {
          return this.orientation.top !== void 0;
        }
        get isInXMidLayer() {
          return this.orientation.top === void 0 && this.orientation.bottom === void 0;
        }
        get isInBottomLayer() {
          return this.orientation.bottom !== void 0;
        }
        get isInLeftLayer() {
          return this.orientation.left !== void 0;
        }
        get isInYMidLayer() {
          return this.orientation.left === void 0 && this.orientation.right === void 0;
        }
        get isInRightLayer() {
          return this.orientation.right !== void 0;
        }
        get isInFrontLayer() {
          return this.orientation.front !== void 0;
        }
        get isInZMidLayer() {
          return this.orientation.front === void 0 && this.orientation.back === void 0;
        }
        get isInBackLayer() {
          return this.orientation.back !== void 0;
        }
        get isCorner() {
          return Object.values(this.orientation).filter((o) => o !== void 0).length === 3;
        }
        get isEdge() {
          return Object.values(this.orientation).filter((o) => o !== void 0).length === 2;
        }
        rotate(newOrientation) {
          this.position = {
            X: newOrientation.left ? -1 : newOrientation.right ? 1 : 0,
            Y: newOrientation.top ? 1 : newOrientation.bottom ? -1 : 0,
            Z: newOrientation.front ? 1 : newOrientation.back ? -1 : 0
          };
          this.orientation = newOrientation;
        }
        rotateXCW() {
          this.rotate({
            top: this.orientation.top,
            bottom: this.orientation.bottom,
            left: this.orientation.front,
            front: this.orientation.right,
            right: this.orientation.back,
            back: this.orientation.left
          });
        }
        rotateXCCW() {
          this.rotate({
            top: this.orientation.top,
            bottom: this.orientation.bottom,
            left: this.orientation.back,
            front: this.orientation.left,
            right: this.orientation.front,
            back: this.orientation.right
          });
        }
        rotateYCW() {
          this.rotate({
            top: this.orientation.front,
            back: this.orientation.top,
            bottom: this.orientation.back,
            front: this.orientation.bottom,
            left: this.orientation.left,
            right: this.orientation.right
          });
        }
        rotateYCCW() {
          this.rotate({
            top: this.orientation.back,
            front: this.orientation.top,
            bottom: this.orientation.front,
            back: this.orientation.bottom,
            left: this.orientation.left,
            right: this.orientation.right
          });
        }
        rotateZCW() {
          this.rotate({
            top: this.orientation.left,
            right: this.orientation.top,
            bottom: this.orientation.right,
            left: this.orientation.bottom,
            front: this.orientation.front,
            back: this.orientation.back
          });
        }
        rotateZCCW() {
          this.rotate({
            top: this.orientation.right,
            right: this.orientation.bottom,
            bottom: this.orientation.left,
            left: this.orientation.top,
            front: this.orientation.front,
            back: this.orientation.back
          });
        }
      };
    }
  });

  // src/engine/models.ts
  var AXES, FACES, ORIENTATION_KEYS;
  var init_models = __esm({
    "src/engine/models.ts"() {
      "use strict";
      AXES = ["X", "Y", "Z"];
      FACES = ["Y", "B", "R", "G", "O", "W"];
      ORIENTATION_KEYS = [
        "top",
        "bottom",
        "left",
        "right",
        "front",
        "back"
      ];
    }
  });

  // src/engine/helpers.ts
  function isFace(value) {
    return FACES.includes(value);
  }
  function isPosition(value) {
    if (!value || typeof value !== "object") return false;
    return AXES.every((axis) => typeof value[axis] === "number");
  }
  function isOrientation(value) {
    if (!value || typeof value !== "object") return false;
    return ORIENTATION_KEYS.every((key) => {
      const face = value[key];
      return face === void 0 || isFace(face);
    });
  }
  function isCubeArray(value) {
    return Array.isArray(value) && value.length === 27 && value.every(
      (cube) => cube && typeof cube === "object" && isPosition(cube.position) && isOrientation(cube.orientation)
    );
  }
  var init_helpers = __esm({
    "src/engine/helpers.ts"() {
      "use strict";
      init_models();
    }
  });

  // src/engine/RubiksCube.ts
  var RubiksCube;
  var init_RubiksCube = __esm({
    "src/engine/RubiksCube.ts"() {
      "use strict";
      init_Cube();
      init_helpers();
      init_models();
      RubiksCube = class _RubiksCube {
        cubes;
        observers;
        static instance;
        constructor() {
          this.cubes = _RubiksCube.initCubes();
          this.observers = [];
        }
        static initCubes() {
          return [
            // Top layer
            new Cube({ X: -1, Y: 1, Z: -1 }, { top: "Y", left: "B", back: "O" }),
            new Cube({ X: 0, Y: 1, Z: -1 }, { top: "Y", back: "O" }),
            new Cube({ X: 1, Y: 1, Z: -1 }, { top: "Y", right: "G", back: "O" }),
            new Cube({ X: -1, Y: 1, Z: 0 }, { top: "Y", left: "B" }),
            new Cube({ X: 0, Y: 1, Z: 0 }, { top: "Y" }),
            new Cube({ X: 1, Y: 1, Z: 0 }, { top: "Y", right: "G" }),
            new Cube({ X: -1, Y: 1, Z: 1 }, { top: "Y", left: "B", front: "R" }),
            new Cube({ X: 0, Y: 1, Z: 1 }, { top: "Y", front: "R" }),
            new Cube({ X: 1, Y: 1, Z: 1 }, { top: "Y", right: "G", front: "R" }),
            // Middle layer
            new Cube({ X: -1, Y: 0, Z: -1 }, { left: "B", back: "O" }),
            new Cube({ X: 0, Y: 0, Z: -1 }, { back: "O" }),
            new Cube({ X: 1, Y: 0, Z: -1 }, { right: "G", back: "O" }),
            new Cube({ X: -1, Y: 0, Z: 0 }, { left: "B" }),
            new Cube({ X: 0, Y: 0, Z: 0 }, {}),
            new Cube({ X: 1, Y: 0, Z: 0 }, { right: "G" }),
            new Cube({ X: -1, Y: 0, Z: 1 }, { left: "B", front: "R" }),
            new Cube({ X: 0, Y: 0, Z: 1 }, { front: "R" }),
            new Cube({ X: 1, Y: 0, Z: 1 }, { right: "G", front: "R" }),
            // Bottom layer
            new Cube({ X: -1, Y: -1, Z: -1 }, { bottom: "W", left: "B", back: "O" }),
            new Cube({ X: 0, Y: -1, Z: -1 }, { bottom: "W", back: "O" }),
            new Cube({ X: 1, Y: -1, Z: -1 }, { bottom: "W", right: "G", back: "O" }),
            new Cube({ X: -1, Y: -1, Z: 0 }, { bottom: "W", left: "B" }),
            new Cube({ X: 0, Y: -1, Z: 0 }, { bottom: "W" }),
            new Cube({ X: 1, Y: -1, Z: 0 }, { bottom: "W", right: "G" }),
            new Cube({ X: -1, Y: -1, Z: 1 }, { bottom: "W", left: "B", front: "R" }),
            new Cube({ X: 0, Y: -1, Z: 1 }, { bottom: "W", front: "R" }),
            new Cube({ X: 1, Y: -1, Z: 1 }, { bottom: "W", right: "G", front: "R" })
          ];
        }
        onMove() {
          this.observers.forEach((observer) => observer.onMove());
        }
        static getInstance() {
          if (!_RubiksCube.instance) {
            _RubiksCube.instance = new _RubiksCube();
          }
          return _RubiksCube.instance;
        }
        setState(cubeState) {
          let parsed;
          try {
            parsed = JSON.parse(cubeState);
          } catch (e) {
            console.error("error", e);
            return;
          }
          if (!isCubeArray(parsed)) return;
          this.cubes = parsed.map((c) => new Cube(c.position, c.orientation));
        }
        addObserver(observer) {
          this.observers.push(observer);
        }
        removeObserver(observer) {
          return this.observers = [...this.observers].filter((o) => o !== observer);
        }
        isSolved() {
          return ORIENTATION_KEYS.every((orientation) => {
            const faces = this.cubes.map((cube) => cube.orientation[orientation]).filter((face) => face !== void 0);
            return new Set(faces).size === 1;
          });
        }
        reset() {
          this.cubes = _RubiksCube.initCubes();
          this.onMove();
        }
        rotateRubiksCube(rotation) {
          switch (rotation) {
            case "XCW":
              this.cubes.forEach((cube) => cube.rotateXCW());
              break;
            case "XCCW":
              this.cubes.forEach((cube) => cube.rotateXCCW());
              break;
            case "YCW":
              this.cubes.forEach((cube) => cube.rotateYCW());
              break;
            case "YCCW":
              this.cubes.forEach((cube) => cube.rotateYCCW());
              break;
          }
          this.onMove();
        }
        rotateTopCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInTopLayer) {
              cube.rotateXCW();
            }
          });
          this.onMove();
        }
        rotateXMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInXMidLayer) {
              cube.rotateXCW();
            }
          });
          this.onMove();
        }
        rotateBottomCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBottomLayer) {
              cube.rotateXCW();
            }
          });
          this.onMove();
        }
        rotateTopCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInTopLayer) {
              cube.rotateXCCW();
            }
          });
          this.onMove();
        }
        rotateXMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInXMidLayer) {
              cube.rotateXCCW();
            }
          });
          this.onMove();
        }
        rotateBottomCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBottomLayer) {
              cube.rotateXCCW();
            }
          });
          this.onMove();
        }
        rotateLeftCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInLeftLayer) {
              cube.rotateYCW();
            }
          });
          this.onMove();
        }
        rotateYMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInYMidLayer) {
              cube.rotateYCW();
            }
          });
          this.onMove();
        }
        rotateRightCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInRightLayer) {
              cube.rotateYCW();
            }
          });
          this.onMove();
        }
        rotateLeftCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInLeftLayer) {
              cube.rotateYCCW();
            }
          });
          this.onMove();
        }
        rotateYMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInYMidLayer) {
              cube.rotateYCCW();
            }
          });
          this.onMove();
        }
        rotateRightCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInRightLayer) {
              cube.rotateYCCW();
            }
          });
          this.onMove();
        }
        rotateFrontCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInFrontLayer) {
              cube.rotateZCW();
            }
          });
          this.onMove();
        }
        rotateZMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInZMidLayer) {
              cube.rotateZCW();
            }
          });
          this.onMove();
        }
        rotateBackCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBackLayer) {
              cube.rotateZCW();
            }
          });
          this.onMove();
        }
        rotateFrontCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInFrontLayer) {
              cube.rotateZCCW();
            }
          });
          this.onMove();
        }
        rotateZMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInZMidLayer) {
              cube.rotateZCCW();
            }
          });
          this.onMove();
        }
        rotateBackCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBackLayer) {
              cube.rotateZCCW();
            }
          });
          this.onMove();
        }
      };
    }
  });

  // src/cube3d.ts
  var require_cube3d = __commonJS({
    "src/cube3d.ts"() {
      init_RubiksCube();
      var DEFAULT_YAW = -45;
      var DEFAULT_PITCH = -19.5;
      var CubeView = class {
        rubiks = RubiksCube.getInstance();
        sceneEl;
        worldEl;
        entries = [];
        // queued moves / animation gating
        queue = [];
        animating = false;
        // session state (mirrored into the panel DOM)
        moveCount = 0;
        elapsed = 0;
        status = "free";
        running = false;
        hasScrambled = false;
        scrambleLeft = 0;
        timer;
        t0 = 0;
        // orbit
        yaw = DEFAULT_YAW;
        pitch = DEFAULT_PITCH;
        // drag bookkeeping
        dragging = false;
        dragFace = null;
        turnCommitted = false;
        px = 0;
        py = 0;
        yaw0 = 0;
        pitch0 = 0;
        // sticker colours (reuse the index.css palette)
        COLORS = {
          Y: "#ffd43b",
          R: "#d92b3c",
          B: "#2256d6",
          G: "#1eaa5b",
          O: "#ff7a18",
          W: "#f4f4f0"
        };
        DIRS = [
          "front",
          "back",
          "right",
          "left",
          "top",
          "bottom"
        ];
        // geometry
        S = 58;
        HALF = 29;
        UNIT = 63;
        // calibration signs (flip if a turn animates the wrong way)
        ANIM_SIGN = { X: 1, Y: -1, Z: 1 };
        CW_SIGN = { X: -1, Y: -1, Z: -1 };
        // notation -> engine method + animation metadata. Method names match RubiksCube exactly.
        MOVES = {
          U: {
            posAxis: "Y",
            layer: 1,
            cw: "rotateTopCW",
            ccw: "rotateTopCCW",
            cssAxis: "Y"
          },
          E: {
            posAxis: "Y",
            layer: 0,
            cw: "rotateXMidCW",
            ccw: "rotateXMidCCW",
            cssAxis: "Y"
          },
          D: {
            posAxis: "Y",
            layer: -1,
            cw: "rotateBottomCW",
            ccw: "rotateBottomCCW",
            cssAxis: "Y"
          },
          L: {
            posAxis: "X",
            layer: -1,
            cw: "rotateLeftCW",
            ccw: "rotateLeftCCW",
            cssAxis: "X"
          },
          M: {
            posAxis: "X",
            layer: 0,
            cw: "rotateYMidCW",
            ccw: "rotateYMidCCW",
            cssAxis: "X"
          },
          R: {
            posAxis: "X",
            layer: 1,
            cw: "rotateRightCW",
            ccw: "rotateRightCCW",
            cssAxis: "X"
          },
          B: {
            posAxis: "Z",
            layer: -1,
            cw: "rotateBackCW",
            ccw: "rotateBackCCW",
            cssAxis: "Z"
          },
          S: {
            posAxis: "Z",
            layer: 0,
            cw: "rotateZMidCW",
            ccw: "rotateZMidCCW",
            cssAxis: "Z"
          },
          F: {
            posAxis: "Z",
            layer: 1,
            cw: "rotateFrontCW",
            ccw: "rotateFrontCCW",
            cssAxis: "Z"
          }
        };
        NORMALS = {
          right: { X: 1, Y: 0, Z: 0 },
          left: { X: -1, Y: 0, Z: 0 },
          top: { X: 0, Y: 1, Z: 0 },
          bottom: { X: 0, Y: -1, Z: 0 },
          front: { X: 0, Y: 0, Z: 1 },
          back: { X: 0, Y: 0, Z: -1 }
        };
        // whole-cube re-orientation -> engine rotateCube + matching world animation
        CUBE_MOVES = {
          spinLeft: { rotation: "XCW", axis: "Y", angle: -90 },
          spinRight: { rotation: "XCCW", axis: "Y", angle: 90 },
          rollUp: { rotation: "YCW", axis: "X", angle: 90 },
          rollDown: { rotation: "YCCW", axis: "X", angle: -90 }
        };
        constructor(sceneEl) {
          this.sceneEl = sceneEl;
          this.init();
          this.wireControls();
          window.addEventListener("keydown", (e) => this.onKey(e));
        }
        init() {
          this.worldEl = document.createElement("div");
          this.worldEl.style.cssText = "position:absolute; left:50%; top:50%; width:0; height:0; transform-style:preserve-3d; will-change:transform;";
          this.sceneEl.appendChild(this.worldEl);
          const saved = localStorage.getItem("cubeState");
          if (saved) this.rubiks.setState(saved);
          this.entries = this.rubiks.cubes.map((c) => this.createCubie(c));
          this.entries.forEach((e) => this.worldEl.appendChild(e.el));
          this.rubiks.addObserver(this);
          this.applyView(false);
          this.renderCube();
          this.updateStats();
          this.updateStatus();
          const sc = this.sceneEl;
          sc.addEventListener("pointerdown", (e) => this.onDown(e));
          sc.addEventListener("pointermove", (e) => this.onPointerMove(e));
          sc.addEventListener("pointerup", (e) => this.onUp(e));
          sc.addEventListener("pointercancel", (e) => this.onUp(e));
        }
        // ---------- rendering ----------
        createCubie(cube) {
          const S = this.S, H = this.HALF;
          const el = document.createElement("div");
          el.style.cssText = "position:absolute; left:0; top:0; width:" + S + "px; height:" + S + "px; transform-style:preserve-3d;";
          const faceTf = {
            front: "translateZ(" + H + "px)",
            back: "rotateY(180deg) translateZ(" + H + "px)",
            right: "rotateY(90deg) translateZ(" + H + "px)",
            left: "rotateY(-90deg) translateZ(" + H + "px)",
            top: "rotateX(90deg) translateZ(" + H + "px)",
            bottom: "rotateX(-90deg) translateZ(" + H + "px)"
          };
          const stickers = {};
          const entry = { cube, el, stickers };
          this.DIRS.forEach((dir) => {
            const face = document.createElement("div");
            face.className = "face";
            face.dataset.dir = dir;
            face.__entry = entry;
            face.style.cssText = "position:absolute; left:0; top:0; width:" + S + "px; height:" + S + "px; background:#14141b; border-radius:9px; transform:" + faceTf[dir] + "; -webkit-backface-visibility:hidden; backface-visibility:hidden;";
            const st = document.createElement("div");
            st.style.cssText = "position:absolute; inset:5px; border-radius:7px; box-shadow: inset 0 2px 5px rgba(255,255,255,.18), inset 0 -3px 6px rgba(0,0,0,.4);";
            face.appendChild(st);
            el.appendChild(face);
            stickers[dir] = st;
          });
          return entry;
        }
        // Write engine state to the localStorage key shared with the 2D page.
        persist() {
          localStorage.setItem("cubeState", JSON.stringify(this.rubiks.cubes));
        }
        // Observer hook fired by the engine after every state mutation. reset() rebuilds the
        // cubes array, so re-point each rendered cubie at the current engine Cube (a no-op for
        // in-place layer/whole-cube turns), then persist and repaint.
        onMove() {
          this.entries.forEach((e, i) => e.cube = this.rubiks.cubes[i]);
          this.persist();
          this.renderCube();
        }
        renderCube() {
          const U = this.UNIT, H = this.HALF;
          this.entries.forEach((e) => {
            const p = e.cube.position;
            e.el.style.transform = "translate3d(" + (p.X * U - H) + "px," + (-p.Y * U - H) + "px," + p.Z * U + "px)";
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
        applyView(animate) {
          if (this.animating) return;
          if (!this.worldEl) return;
          this.worldEl.style.transition = animate ? "transform .4s cubic-bezier(.2,.6,.2,1)" : "none";
          this.worldEl.style.transform = "rotateX(" + this.pitch + "deg) rotateY(" + this.yaw + "deg)";
        }
        // ---------- moves / animation ----------
        move(face, prime, opts) {
          if (!this.MOVES[face]) return;
          this.queue.push({ kind: "turn", face, prime: !!prime, opts: opts || {} });
          this.processQueue();
        }
        cubeMove(key) {
          const c = this.CUBE_MOVES[key];
          if (!c) return;
          this.queue.push({ kind: "cube", c });
          this.processQueue();
        }
        orbitStr() {
          return "rotateX(" + this.pitch + "deg) rotateY(" + this.yaw + "deg)";
        }
        processQueue() {
          if (this.animating || !this.queue.length || !this.worldEl) return;
          const it = this.queue.shift();
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
        animateCube(c) {
          this.animating = true;
          this.worldEl.style.transition = "none";
          this.worldEl.style.transform = this.orbitStr();
          this.worldEl.getBoundingClientRect();
          this.worldEl.style.transition = "transform 320ms cubic-bezier(.34,.66,.24,1)";
          this.worldEl.style.transform = this.orbitStr() + " rotate" + c.axis + "(" + c.angle + "deg)";
          let finished = false;
          const done = () => {
            if (finished) return;
            finished = true;
            this.worldEl.removeEventListener("transitionend", onEnd);
            this.worldEl.style.transition = "none";
            this.worldEl.style.transform = this.orbitStr();
            this.rubiks.rotateRubiksCube(c.rotation);
            this.animating = false;
            this.processQueue();
          };
          const onEnd = (e) => {
            if (e.target === this.worldEl && e.propertyName === "transform") done();
          };
          this.worldEl.addEventListener("transitionend", onEnd);
          setTimeout(done, 470);
        }
        animateLayer(m, angle, method, opts) {
          this.animating = true;
          const group = document.createElement("div");
          group.style.cssText = "position:absolute; left:0; top:0; width:0; height:0; transform-style:preserve-3d;";
          this.worldEl.appendChild(group);
          const moving = this.entries.filter(
            (e) => e.cube.position[m.posAxis] === m.layer
          );
          moving.forEach((e) => group.appendChild(e.el));
          group.getBoundingClientRect();
          const dur = opts.fast ? 135 : 290;
          group.style.transition = "transform " + dur + "ms cubic-bezier(.34,.66,.24,1)";
          group.style.transform = "rotate" + m.cssAxis + "(" + angle + "deg)";
          let finished = false;
          const done = () => {
            if (finished) return;
            finished = true;
            group.removeEventListener("transitionend", onEnd);
            moving.forEach((e) => this.worldEl.appendChild(e.el));
            group.remove();
            this.rubiks[method]();
            this.afterMove(opts);
            this.animating = false;
            this.processQueue();
          };
          const onEnd = (e) => {
            if (e.target === group && e.propertyName === "transform") done();
          };
          group.addEventListener("transitionend", onEnd);
          setTimeout(done, dur + 140);
        }
        afterMove(opts) {
          if (opts.scramble) {
            this.scrambleLeft--;
            if (this.scrambleLeft <= 0) {
              this.status = "ready";
              this.updateStatus();
            }
            return;
          }
          if (opts.count !== false && this.hasScrambled) {
            this.startTimer();
            this.moveCount++;
            this.updateStats();
          }
          if (this.hasScrambled && this.rubiks.isSolved()) {
            this.stopTimer();
            this.hasScrambled = false;
            this.status = "solved";
            this.updateStatus();
          }
        }
        // ---------- timer ----------
        startTimer() {
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
        stopTimer() {
          if (this.timer) clearInterval(this.timer);
          this.running = false;
          if (this.t0) {
            this.elapsed = performance.now() - this.t0;
            this.updateStats();
          }
        }
        // ---------- scramble / reset ----------
        scramble() {
          this.doReset(false, false);
          this.hasScrambled = true;
          this.status = "scrambling";
          this.moveCount = 0;
          this.elapsed = 0;
          this.updateStatus();
          this.updateStats();
          const faces = ["U", "D", "L", "R", "F", "B"];
          const seq = [];
          let lastAxis = "";
          for (let i = 0; i < 24; i++) {
            let f;
            let guard = 0;
            do {
              f = faces[Math.floor(Math.random() * faces.length)];
              guard++;
            } while (this.MOVES[f].posAxis === lastAxis && guard < 8);
            lastAxis = this.MOVES[f].posAxis;
            seq.push({ f, prime: Math.random() < 0.5 });
          }
          this.scrambleLeft = seq.length;
          seq.forEach(
            (mv) => this.move(mv.f, mv.prime, { count: false, fast: true, scramble: true })
          );
        }
        reset() {
          this.doReset(true, true);
        }
        doReset(resetView, resetCubes) {
          if (this.timer) clearInterval(this.timer);
          this.running = false;
          this.queue = [];
          this.animating = false;
          if (this.entries && this.worldEl) {
            this.entries.forEach((e) => this.worldEl.appendChild(e.el));
            Array.prototype.slice.call(this.worldEl.children).forEach((ch) => {
              if (!this.entries.some((e) => e.el === ch))
                ch.remove();
            });
          }
          if (resetCubes) {
            this.rubiks.reset();
          } else {
            this.renderCube();
          }
          if (resetView) {
            this.hasScrambled = false;
            this.yaw = DEFAULT_YAW;
            this.pitch = DEFAULT_PITCH;
            this.applyView(true);
          }
          this.status = "free";
          this.moveCount = 0;
          this.elapsed = 0;
          this.updateStatus();
          this.updateStats();
        }
        // ---------- view ----------
        resetView() {
          this.yaw = DEFAULT_YAW;
          this.pitch = DEFAULT_PITCH;
          this.applyView(true);
        }
        // ---------- pointer ----------
        onDown(e) {
          this.sceneEl.setPointerCapture && this.sceneEl.setPointerCapture(e.pointerId);
          this.px = e.clientX;
          this.py = e.clientY;
          this.yaw0 = this.yaw;
          this.pitch0 = this.pitch;
          this.dragging = true;
          this.turnCommitted = false;
          const target = e.target;
          const faceEl = target.closest && target.closest(".face");
          this.dragFace = faceEl && !this.animating ? faceEl : null;
          this.sceneEl.style.cursor = "grabbing";
        }
        onPointerMove(e) {
          if (!this.dragging) return;
          const dx = e.clientX - this.px, dy = e.clientY - this.py;
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
        onUp(_e) {
          this.dragging = false;
          this.dragFace = null;
          this.sceneEl.style.cursor = "grab";
        }
        projectAxis(v) {
          const a = this.pitch * Math.PI / 180, b = this.yaw * Math.PI / 180;
          const x = v.X, y = -v.Y, z = v.Z;
          const x1 = x * Math.cos(b) + z * Math.sin(b);
          const z1 = -x * Math.sin(b) + z * Math.cos(b);
          const y1 = y;
          const y2 = y1 * Math.cos(a) - z1 * Math.sin(a);
          return { x: x1, y: y2 };
        }
        pickTurn(faceEl, dx, dy) {
          const dir = faceEl.dataset.dir;
          const entry = faceEl.__entry;
          if (!entry) return null;
          const cube = entry.cube;
          const normal = this.NORMALS[dir];
          const normalAxis = normal.X ? "X" : normal.Y ? "Y" : "Z";
          const axes = ["X", "Y", "Z"].filter((a) => a !== normalAxis);
          let best = null;
          axes.forEach((axis) => {
            const vec = { X: 0, Y: 0, Z: 0 };
            vec[axis] = 1;
            const proj = this.projectAxis(vec);
            const dot = dx * proj.x + dy * proj.y;
            if (!best || Math.abs(dot) > Math.abs(best.dot))
              best = { axis, dot, sign: dot >= 0 ? 1 : -1 };
          });
          if (!best) return null;
          const chosen = best;
          const m = { X: 0, Y: 0, Z: 0 };
          m[chosen.axis] = chosen.sign;
          const r = {
            X: normal.Y * m.Z - normal.Z * m.Y,
            Y: normal.Z * m.X - normal.X * m.Z,
            Z: normal.X * m.Y - normal.Y * m.X
          };
          const rAxis = Math.abs(r.X) > 0.5 ? "X" : Math.abs(r.Y) > 0.5 ? "Y" : "Z";
          const rSign = r[rAxis] >= 0 ? 1 : -1;
          const layer = cube.position[rAxis];
          let face = null;
          Object.keys(this.MOVES).forEach((k) => {
            const mv = this.MOVES[k];
            if (mv.posAxis === rAxis && mv.layer === layer) face = k;
          });
          if (!face) return null;
          const prime = rSign === this.CW_SIGN[rAxis] ? false : true;
          return { face, prime };
        }
        onKey(e) {
          const tag = e.target?.tagName || "";
          if (/input|textarea|select/i.test(tag)) return;
          if (this.dragging) return;
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
          const map = {
            t: "U",
            b: "D",
            l: "L",
            r: "R",
            f: "F",
            q: "B",
            y: "M",
            x: "E",
            z: "S"
          };
          const face = map[k.toLowerCase()];
          if (face) {
            this.move(face, e.shiftKey);
            e.preventDefault();
          }
        }
        // ---------- panel DOM ----------
        timeText() {
          const ms = this.elapsed || 0;
          const total = ms / 1e3;
          const mm = Math.floor(total / 60);
          const ss = Math.floor(total % 60);
          const t = Math.floor(ms % 1e3 / 100);
          const ssStr = (mm > 0 && ss < 10 ? "0" : "") + ss;
          return (mm > 0 ? mm + ":" : "") + ssStr + "." + t;
        }
        updateStats() {
          const time = document.getElementById("stat-time");
          const moves = document.getElementById("stat-moves");
          if (time) time.textContent = this.timeText();
          if (moves) moves.textContent = String(this.moveCount);
        }
        updateStatus() {
          const statusMap = {
            free: { label: "Free Play", color: "var(--text)" },
            ready: { label: "Ready", color: "var(--text)" },
            scrambling: { label: "Scrambling\u2026", color: "var(--accent-x)" },
            solving: { label: "Solving\u2026", color: "var(--accent-z)" },
            solved: { label: "Solved!", color: "var(--accent-y)" }
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
        wireControls() {
          const bind = (id, fn) => document.getElementById(id)?.addEventListener("click", fn);
          bind("btn-scramble", () => this.scramble());
          bind("btn-reset", () => this.reset());
          bind("btn-recenter", () => this.resetView());
          bind("btn-roll-up", () => this.cubeMove("rollUp"));
          bind("btn-roll-down", () => this.cubeMove("rollDown"));
          bind("btn-spin-left", () => this.cubeMove("spinLeft"));
          bind("btn-spin-right", () => this.cubeMove("spinRight"));
        }
      };
      function start() {
        const scene = document.getElementById("scene");
        if (scene) new CubeView(scene);
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
      } else {
        start();
      }
    }
  });
  require_cube3d();
})();
