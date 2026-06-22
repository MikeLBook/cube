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

  // src/engine/models.ts
  var AXES, FACES, ORIENTATION_KEYS, LAYER_MOVES;
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
      LAYER_MOVES = [
        "rotateTopCW",
        "rotateTopCCW",
        "rotateXMidCW",
        "rotateXMidCCW",
        "rotateBottomCW",
        "rotateBottomCCW",
        "rotateLeftCW",
        "rotateLeftCCW",
        "rotateYMidCW",
        "rotateYMidCCW",
        "rotateRightCW",
        "rotateRightCCW",
        "rotateFrontCW",
        "rotateFrontCCW",
        "rotateZMidCW",
        "rotateZMidCCW",
        "rotateBackCW",
        "rotateBackCCW"
      ];
    }
  });

  // src/engine/helpers.ts
  function JSONEquals(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
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
        onMove(move) {
          this.observers.forEach((observer) => observer.onMove(move));
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
        get isSolved() {
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
          this.onMove(rotation);
        }
        rotateTopCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInTopLayer) {
              cube.rotateXCW();
            }
          });
          this.onMove("rotateTopCW");
        }
        rotateXMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInXMidLayer) {
              cube.rotateXCW();
            }
          });
          this.onMove("rotateXMidCW");
        }
        rotateBottomCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBottomLayer) {
              cube.rotateXCW();
            }
          });
          this.onMove("rotateBottomCW");
        }
        rotateTopCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInTopLayer) {
              cube.rotateXCCW();
            }
          });
          this.onMove("rotateTopCCW");
        }
        rotateXMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInXMidLayer) {
              cube.rotateXCCW();
            }
          });
          this.onMove("rotateXMidCCW");
        }
        rotateBottomCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBottomLayer) {
              cube.rotateXCCW();
            }
          });
          this.onMove("rotateBottomCCW");
        }
        rotateLeftCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInLeftLayer) {
              cube.rotateYCW();
            }
          });
          this.onMove("rotateLeftCW");
        }
        rotateYMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInYMidLayer) {
              cube.rotateYCW();
            }
          });
          this.onMove("rotateYMidCW");
        }
        rotateRightCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInRightLayer) {
              cube.rotateYCW();
            }
          });
          this.onMove("rotateRightCW");
        }
        rotateLeftCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInLeftLayer) {
              cube.rotateYCCW();
            }
          });
          this.onMove("rotateLeftCCW");
        }
        rotateYMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInYMidLayer) {
              cube.rotateYCCW();
            }
          });
          this.onMove("rotateYMidCCW");
        }
        rotateRightCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInRightLayer) {
              cube.rotateYCCW();
            }
          });
          this.onMove("rotateRightCCW");
        }
        rotateFrontCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInFrontLayer) {
              cube.rotateZCW();
            }
          });
          this.onMove("rotateFrontCW");
        }
        rotateZMidCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInZMidLayer) {
              cube.rotateZCW();
            }
          });
          this.onMove("rotateZMidCW");
        }
        rotateBackCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBackLayer) {
              cube.rotateZCW();
            }
          });
          this.onMove("rotateBackCW");
        }
        rotateFrontCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInFrontLayer) {
              cube.rotateZCCW();
            }
          });
          this.onMove("rotateFrontCCW");
        }
        rotateZMidCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInZMidLayer) {
              cube.rotateZCCW();
            }
          });
          this.onMove("rotateZMidCCW");
        }
        rotateBackCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInBackLayer) {
              cube.rotateZCCW();
            }
          });
          this.onMove("rotateBackCCW");
        }
      };
    }
  });

  // src/index.ts
  var require_index = __commonJS({
    "src/index.ts"() {
      init_helpers();
      init_models();
      init_RubiksCube();
      var rubiksCube = RubiksCube.getInstance();
      var cubeState = localStorage.getItem("cubeState");
      if (cubeState) rubiksCube.setState(cubeState);
      LAYER_MOVES.forEach((move) => {
        document.getElementById(move)?.addEventListener("click", () => rubiksCube[move]());
      });
      document.querySelector("#rotateCubeXCW")?.addEventListener("click", () => {
        rubiksCube.rotateRubiksCube("XCW");
      });
      document.querySelector("#rotateCubeXCCW")?.addEventListener("click", () => {
        rubiksCube.rotateRubiksCube("XCCW");
      });
      document.querySelector("#rotateCubeYCW")?.addEventListener("click", () => {
        rubiksCube.rotateRubiksCube("YCW");
      });
      document.querySelector("#rotateCubeYCCW")?.addEventListener("click", () => {
        rubiksCube.rotateRubiksCube("YCCW");
      });
      document.querySelector("#reset")?.addEventListener("click", () => {
        rubiksCube.reset();
      });
      var observer = {
        onMove: () => {
          localStorage.setItem("cubeState", JSON.stringify(rubiksCube.cubes));
          renderCube();
        }
      };
      rubiksCube.addObserver(observer);
      function renderCube() {
        document.querySelectorAll(".cube").forEach((el) => {
          const cubeElement = el;
          const orientationKey = cubeElement.dataset.orientation;
          const { posX, posY, posZ } = cubeElement.dataset;
          if (!orientationKey || posX === void 0 || posY === void 0 || posZ === void 0)
            return;
          const position = {
            X: parseInt(posX),
            Y: parseInt(posY),
            Z: parseInt(posZ)
          };
          const cube = rubiksCube.cubes.find((c) => JSONEquals(c.position, position));
          if (!cube) return;
          cubeElement.classList.remove(...FACES);
          const faceColor = cube.orientation[orientationKey];
          if (faceColor) {
            cubeElement.classList.add(faceColor);
          }
        });
      }
      renderCube();
    }
  });
  require_index();
})();
