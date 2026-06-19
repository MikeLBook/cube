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

  // src/engine/helpers.ts
  var positionMap;
  var init_helpers = __esm({
    "src/engine/helpers.ts"() {
      "use strict";
      positionMap = {
        1: { X: -1, Y: 1, Z: -1 },
        2: { X: 0, Y: 1, Z: -1 },
        3: { X: 1, Y: 1, Z: -1 },
        4: { X: -1, Y: 1, Z: 0 },
        5: { X: 0, Y: 1, Z: 0 },
        6: { X: 1, Y: 1, Z: 0 },
        7: { X: -1, Y: 1, Z: 1 },
        8: { X: 0, Y: 1, Z: 1 },
        9: { X: 1, Y: 1, Z: 1 },
        10: { X: -1, Y: 0, Z: -1 },
        11: { X: 0, Y: 0, Z: -1 },
        12: { X: 1, Y: 0, Z: -1 },
        13: { X: -1, Y: 0, Z: 0 },
        14: { X: 0, Y: 0, Z: 0 },
        15: { X: 1, Y: 0, Z: 0 },
        16: { X: -1, Y: 0, Z: 1 },
        17: { X: 0, Y: 0, Z: 1 },
        18: { X: 1, Y: 0, Z: 1 },
        19: { X: -1, Y: -1, Z: -1 },
        20: { X: 0, Y: -1, Z: -1 },
        21: { X: 1, Y: -1, Z: -1 },
        22: { X: -1, Y: -1, Z: 0 },
        23: { X: 0, Y: -1, Z: 0 },
        24: { X: 1, Y: -1, Z: 0 },
        25: { X: -1, Y: -1, Z: 1 },
        26: { X: 0, Y: -1, Z: 1 },
        27: { X: 1, Y: -1, Z: 1 }
      };
    }
  });

  // src/engine/Cube.ts
  var Cube;
  var init_Cube = __esm({
    "src/engine/Cube.ts"() {
      "use strict";
      init_helpers();
      Cube = class {
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
        // isCorner, isEdge
        rotateXCW() {
          const oldOrientation = { ...this.orientation };
          this.orientation = {
            top: oldOrientation.top,
            bottom: oldOrientation.bottom,
            left: oldOrientation.front,
            front: oldOrientation.right,
            right: oldOrientation.back,
            back: oldOrientation.left
          };
          let positionOffset = 0;
          if (this.isInXMidLayer) {
            positionOffset = 9;
          } else if (this.isInBottomLayer) {
            positionOffset = 18;
          }
          switch (this.position) {
            case positionMap[1 + positionOffset]:
              this.position = positionMap[3 + positionOffset];
              break;
            case positionMap[2 + positionOffset]:
              this.position = positionMap[6 + positionOffset];
              break;
            case positionMap[3 + positionOffset]:
              this.position = positionMap[9 + positionOffset];
              break;
            case positionMap[4 + positionOffset]:
              this.position = positionMap[2 + positionOffset];
              break;
            case positionMap[5 + positionOffset]:
              break;
            case positionMap[6 + positionOffset]:
              this.position = positionMap[8 + positionOffset];
              break;
            case positionMap[7 + positionOffset]:
              this.position = positionMap[1 + positionOffset];
              break;
            case positionMap[8 + positionOffset]:
              this.position = positionMap[4 + positionOffset];
              break;
            case positionMap[9 + positionOffset]:
              this.position = positionMap[7 + positionOffset];
          }
        }
        rotateXCCW() {
          const oldOrientation = { ...this.orientation };
          this.orientation = {
            top: oldOrientation.top,
            bottom: oldOrientation.bottom,
            left: oldOrientation.back,
            front: oldOrientation.left,
            right: oldOrientation.front,
            back: oldOrientation.right
          };
          let positionOffset = 0;
          if (this.isInXMidLayer) {
            positionOffset = 9;
          } else if (this.isInBottomLayer) {
            positionOffset = 18;
          }
          switch (this.position) {
            case positionMap[3 + positionOffset]:
              this.position = positionMap[1 + positionOffset];
              break;
            case positionMap[6 + positionOffset]:
              this.position = positionMap[2 + positionOffset];
              break;
            case positionMap[9 + positionOffset]:
              this.position = positionMap[3 + positionOffset];
              break;
            case positionMap[2 + positionOffset]:
              this.position = positionMap[4 + positionOffset];
              break;
            case positionMap[5 + positionOffset]:
              break;
            case positionMap[8 + positionOffset]:
              this.position = positionMap[6 + positionOffset];
              break;
            case positionMap[1 + positionOffset]:
              this.position = positionMap[7 + positionOffset];
              break;
            case positionMap[4 + positionOffset]:
              this.position = positionMap[8 + positionOffset];
              break;
            case positionMap[7 + positionOffset]:
              this.position = positionMap[9 + positionOffset];
          }
        }
        rotateYCW() {
          const oldOrientation = { ...this.orientation };
          this.orientation = {
            top: oldOrientation.front,
            back: oldOrientation.top,
            bottom: oldOrientation.back,
            front: oldOrientation.bottom,
            left: oldOrientation.left,
            right: oldOrientation.right
          };
          let positionOffset = 0;
          if (this.isInYMidLayer) {
            positionOffset = 1;
          } else if (this.isInRightLayer) {
            positionOffset = 2;
          }
          switch (this.position) {
            case positionMap[7 + positionOffset]:
              this.position = positionMap[1 + positionOffset];
              break;
            case positionMap[16 + positionOffset]:
              this.position = positionMap[4 + positionOffset];
              break;
            case positionMap[25 + positionOffset]:
              this.position = positionMap[7 + positionOffset];
              break;
            case positionMap[4 + positionOffset]:
              this.position = positionMap[10 + positionOffset];
              break;
            case positionMap[13 + positionOffset]:
              break;
            case positionMap[22 + positionOffset]:
              this.position = positionMap[16 + positionOffset];
              break;
            case positionMap[1 + positionOffset]:
              this.position = positionMap[19 + positionOffset];
              break;
            case positionMap[10 + positionOffset]:
              this.position = positionMap[22 + positionOffset];
              break;
            case positionMap[19 + positionOffset]:
              this.position = positionMap[25 + positionOffset];
              break;
          }
        }
        rotateYCCW() {
          const oldOrientation = { ...this.orientation };
          this.orientation = {
            top: oldOrientation.back,
            front: oldOrientation.top,
            bottom: oldOrientation.front,
            back: oldOrientation.bottom,
            left: oldOrientation.left,
            right: oldOrientation.right
          };
          let positionOffset = 0;
          if (this.isInYMidLayer) {
            positionOffset = 1;
          } else if (this.isInRightLayer) {
            positionOffset = 2;
          }
          switch (this.position) {
            case positionMap[1 + positionOffset]:
              this.position = positionMap[7 + positionOffset];
              break;
            case positionMap[4 + positionOffset]:
              this.position = positionMap[16 + positionOffset];
              break;
            case positionMap[7 + positionOffset]:
              this.position = positionMap[25 + positionOffset];
              break;
            case positionMap[10 + positionOffset]:
              this.position = positionMap[4 + positionOffset];
              break;
            case positionMap[13 + positionOffset]:
              break;
            case positionMap[16 + positionOffset]:
              this.position = positionMap[22 + positionOffset];
              break;
            case positionMap[19 + positionOffset]:
              this.position = positionMap[1 + positionOffset];
              break;
            case positionMap[22 + positionOffset]:
              this.position = positionMap[10 + positionOffset];
              break;
            case positionMap[25 + positionOffset]:
              this.position = positionMap[19 + positionOffset];
              break;
          }
        }
        rotateZCW() {
          const oldOrientation = { ...this.orientation };
          this.orientation = {
            top: oldOrientation.left,
            right: oldOrientation.top,
            bottom: oldOrientation.right,
            left: oldOrientation.bottom,
            front: oldOrientation.front,
            back: oldOrientation.back
          };
          let positionOffset = 0;
          if (this.isInZMidLayer) {
            positionOffset = 3;
          } else if (this.isInFrontLayer) {
            positionOffset = 6;
          }
          switch (this.position) {
            case positionMap[1 + positionOffset]:
              this.position = positionMap[3 + positionOffset];
              break;
            case positionMap[2 + positionOffset]:
              this.position = positionMap[12 + positionOffset];
              break;
            case positionMap[3 + positionOffset]:
              this.position = positionMap[21 + positionOffset];
              break;
            case positionMap[10 + positionOffset]:
              this.position = positionMap[2 + positionOffset];
              break;
            case positionMap[11 + positionOffset]:
              break;
            case positionMap[12 + positionOffset]:
              this.position = positionMap[20 + positionOffset];
              break;
            case positionMap[19 + positionOffset]:
              this.position = positionMap[1 + positionOffset];
              break;
            case positionMap[20 + positionOffset]:
              this.position = positionMap[10 + positionOffset];
              break;
            case positionMap[21 + positionOffset]:
              this.position = positionMap[19 + positionOffset];
          }
        }
        rotateZCCW() {
          const oldOrientation = { ...this.orientation };
          this.orientation = {
            top: oldOrientation.right,
            right: oldOrientation.bottom,
            bottom: oldOrientation.left,
            left: oldOrientation.top,
            front: oldOrientation.front,
            back: oldOrientation.back
          };
          let positionOffset = 0;
          if (this.isInZMidLayer) {
            positionOffset = 3;
          } else if (this.isInFrontLayer) {
            positionOffset = 6;
          }
          switch (this.position) {
            case positionMap[3 + positionOffset]:
              this.position = positionMap[1 + positionOffset];
              break;
            case positionMap[12 + positionOffset]:
              this.position = positionMap[2 + positionOffset];
              break;
            case positionMap[21 + positionOffset]:
              this.position = positionMap[3 + positionOffset];
              break;
            case positionMap[2 + positionOffset]:
              this.position = positionMap[10 + positionOffset];
              break;
            case positionMap[11 + positionOffset]:
              break;
            case positionMap[20 + positionOffset]:
              this.position = positionMap[12 + positionOffset];
              break;
            case positionMap[1 + positionOffset]:
              this.position = positionMap[19 + positionOffset];
              break;
            case positionMap[10 + positionOffset]:
              this.position = positionMap[20 + positionOffset];
              break;
            case positionMap[19 + positionOffset]:
              this.position = positionMap[21 + positionOffset];
          }
        }
      };
    }
  });

  // src/engine/RubiksCube.ts
  var RubiksCube;
  var init_RubiksCube = __esm({
    "src/engine/RubiksCube.ts"() {
      "use strict";
      init_Cube();
      init_helpers();
      RubiksCube = class _RubiksCube {
        constructor() {
          this.cubes = _RubiksCube.buildSolvedCubes();
        }
        static buildSolvedCubes() {
          return [
            // Top layer
            new Cube(positionMap[1], { top: "Y", left: "B", back: "O" }),
            new Cube(positionMap[2], { top: "Y", back: "O" }),
            new Cube(positionMap[3], { top: "Y", right: "G", back: "O" }),
            new Cube(positionMap[4], { top: "Y", left: "B" }),
            new Cube(positionMap[5], { top: "Y" }),
            new Cube(positionMap[6], { top: "Y", right: "G" }),
            new Cube(positionMap[7], { top: "Y", left: "B", front: "R" }),
            new Cube(positionMap[8], { top: "Y", front: "R" }),
            new Cube(positionMap[9], { top: "Y", right: "G", front: "R" }),
            // Middle layer
            new Cube(positionMap[10], { left: "B", back: "O" }),
            new Cube(positionMap[11], { back: "O" }),
            new Cube(positionMap[12], { right: "G", back: "O" }),
            new Cube(positionMap[13], { left: "B" }),
            new Cube(positionMap[14], {}),
            new Cube(positionMap[15], { right: "G" }),
            new Cube(positionMap[16], { left: "B", front: "R" }),
            new Cube(positionMap[17], { front: "R" }),
            new Cube(positionMap[18], { right: "G", front: "R" }),
            // Bottom layer
            new Cube(positionMap[19], { bottom: "W", left: "B", back: "O" }),
            new Cube(positionMap[20], { bottom: "W", back: "O" }),
            new Cube(positionMap[21], { bottom: "W", right: "G", back: "O" }),
            new Cube(positionMap[22], { bottom: "W", left: "B" }),
            new Cube(positionMap[23], { bottom: "W" }),
            new Cube(positionMap[24], { bottom: "W", right: "G" }),
            new Cube(positionMap[25], { bottom: "W", left: "B", front: "R" }),
            new Cube(positionMap[26], { bottom: "W", front: "R" }),
            new Cube(positionMap[27], { bottom: "W", right: "G", front: "R" })
          ];
        }
        static getInstance() {
          if (!_RubiksCube.instance) {
            _RubiksCube.instance = new _RubiksCube();
          }
          return _RubiksCube.instance;
        }
        reset() {
          this.cubes = _RubiksCube.buildSolvedCubes();
        }
        isSolved() {
          const faces = [
            "top",
            "bottom",
            "left",
            "right",
            "front",
            "back"
          ];
          return faces.every((face) => {
            const colors = this.cubes.map((cube) => cube.orientation[face]).filter((color) => color !== void 0);
            return colors.every((color) => color === colors[0]);
          });
        }
        rotateCube(rotation) {
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
        }
        rotateTopCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInTopLayer) {
              cube.rotateXCW();
            }
          });
        }
        rotateXMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInXMidLayer) {
              cube.rotateXCW();
            }
          });
        }
        rotateBottomCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBottomLayer) {
              cube.rotateXCW();
            }
          });
        }
        rotateTopCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInTopLayer) {
              cube.rotateXCCW();
            }
          });
        }
        rotateXMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInXMidLayer) {
              cube.rotateXCCW();
            }
          });
        }
        rotateBottomCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBottomLayer) {
              cube.rotateXCCW();
            }
          });
        }
        rotateLeftCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInLeftLayer) {
              cube.rotateYCW();
            }
          });
        }
        rotateYMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInYMidLayer) {
              cube.rotateYCW();
            }
          });
        }
        rotateRightCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInRightLayer) {
              cube.rotateYCW();
            }
          });
        }
        rotateLeftCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInLeftLayer) {
              cube.rotateYCCW();
            }
          });
        }
        rotateYMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInYMidLayer) {
              cube.rotateYCCW();
            }
          });
        }
        rotateRightCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInRightLayer) {
              cube.rotateYCCW();
            }
          });
        }
        rotateFrontCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInFrontLayer) {
              cube.rotateZCW();
            }
          });
        }
        rotateZMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInZMidLayer) {
              cube.rotateZCW();
            }
          });
        }
        rotateBackCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBackLayer) {
              cube.rotateZCW();
            }
          });
        }
        rotateFrontCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInFrontLayer) {
              cube.rotateZCCW();
            }
          });
        }
        rotateZMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInZMidLayer) {
              cube.rotateZCCW();
            }
          });
        }
        rotateBackCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBackLayer) {
              cube.rotateZCCW();
            }
          });
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
        constructor(sceneEl) {
          this.rubiks = RubiksCube.getInstance();
          this.entries = [];
          // queued moves / animation gating
          this.queue = [];
          this.animating = false;
          // session state (mirrored into the panel DOM)
          this.moveCount = 0;
          this.elapsed = 0;
          this.status = "ready";
          this.running = false;
          this.hasScrambled = false;
          this.scrambleLeft = 0;
          this.t0 = 0;
          // orbit
          this.yaw = DEFAULT_YAW;
          this.pitch = DEFAULT_PITCH;
          // drag bookkeeping
          this.dragging = false;
          this.dragFace = null;
          this.turnCommitted = false;
          this.px = 0;
          this.py = 0;
          this.yaw0 = 0;
          this.pitch0 = 0;
          // sticker colours (reuse the index.css palette)
          this.COLORS = {
            Y: "#ffd43b",
            R: "#d92b3c",
            B: "#2256d6",
            G: "#1eaa5b",
            O: "#ff7a18",
            W: "#f4f4f0"
          };
          this.DIRS = [
            "front",
            "back",
            "right",
            "left",
            "top",
            "bottom"
          ];
          // geometry
          this.S = 58;
          this.HALF = 29;
          this.UNIT = 63;
          // calibration signs (flip if a turn animates the wrong way)
          this.ANIM_SIGN = { X: 1, Y: -1, Z: 1 };
          this.CW_SIGN = { X: -1, Y: -1, Z: -1 };
          // notation -> engine method + animation metadata. Method names match RubiksCube exactly.
          this.MOVES = {
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
          this.NORMALS = {
            right: { X: 1, Y: 0, Z: 0 },
            left: { X: -1, Y: 0, Z: 0 },
            top: { X: 0, Y: 1, Z: 0 },
            bottom: { X: 0, Y: -1, Z: 0 },
            front: { X: 0, Y: 0, Z: 1 },
            back: { X: 0, Y: 0, Z: -1 }
          };
          // whole-cube re-orientation -> engine rotateCube + matching world animation
          this.CUBE_MOVES = {
            spinLeft: { rotation: "XCW", axis: "Y", angle: -90 },
            spinRight: { rotation: "XCCW", axis: "Y", angle: 90 },
            rollUp: { rotation: "YCW", axis: "X", angle: 90 },
            rollDown: { rotation: "YCCW", axis: "X", angle: -90 }
          };
          this.sceneEl = sceneEl;
          this.init();
          this.wireControls();
          window.addEventListener("keydown", (e) => this.onKey(e));
        }
        init() {
          this.worldEl = document.createElement("div");
          this.worldEl.style.cssText = "position:absolute; left:50%; top:50%; width:0; height:0; transform-style:preserve-3d; will-change:transform;";
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
            this.rubiks.rotateCube(c.rotation);
            this.worldEl.style.transition = "none";
            this.worldEl.style.transform = this.orbitStr();
            this.renderCube();
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
            this.rubiks[method]();
            moving.forEach((e) => this.worldEl.appendChild(e.el));
            group.remove();
            this.renderCube();
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
          this.doReset(false);
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
          this.doReset(true);
        }
        doReset(resetView) {
          if (this.timer) clearInterval(this.timer);
          this.running = false;
          this.queue = [];
          this.animating = false;
          this.rubiks.reset();
          this.entries.forEach((e, i) => {
            e.cube = this.rubiks.cubes[i];
          });
          if (this.entries && this.worldEl) {
            this.entries.forEach((e) => this.worldEl.appendChild(e.el));
            Array.prototype.slice.call(this.worldEl.children).forEach((ch) => {
              if (!this.entries.some((e) => e.el === ch))
                ch.remove();
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
        onMove(e) {
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
            u: "U",
            d: "D",
            l: "L",
            r: "R",
            f: "F",
            b: "B",
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
