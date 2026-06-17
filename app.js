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

  // src/helpers.ts
  var positionMap;
  var init_helpers = __esm({
    "src/helpers.ts"() {
      "use strict";
      positionMap = {
        1: { X: 0, Y: 0, Z: 0 },
        2: { X: 1, Y: 0, Z: 0 },
        3: { X: 2, Y: 0, Z: 0 },
        4: { X: 0, Y: 1, Z: 0 },
        5: { X: 1, Y: 1, Z: 0 },
        6: { X: 2, Y: 1, Z: 0 },
        7: { X: 0, Y: 2, Z: 0 },
        8: { X: 1, Y: 2, Z: 0 },
        9: { X: 2, Y: 2, Z: 0 },
        10: { X: 0, Y: 0, Z: 1 },
        11: { X: 1, Y: 0, Z: 1 },
        12: { X: 2, Y: 0, Z: 1 },
        13: { X: 0, Y: 1, Z: 1 },
        14: { X: 1, Y: 1, Z: 1 },
        15: { X: 2, Y: 1, Z: 1 },
        16: { X: 0, Y: 2, Z: 1 },
        17: { X: 1, Y: 2, Z: 1 },
        18: { X: 2, Y: 2, Z: 1 },
        19: { X: 0, Y: 0, Z: 2 },
        20: { X: 1, Y: 0, Z: 2 },
        21: { X: 2, Y: 0, Z: 2 },
        22: { X: 0, Y: 1, Z: 2 },
        23: { X: 1, Y: 1, Z: 2 },
        24: { X: 2, Y: 1, Z: 2 },
        25: { X: 0, Y: 2, Z: 2 },
        26: { X: 1, Y: 2, Z: 2 },
        27: { X: 2, Y: 2, Z: 2 }
      };
    }
  });

  // src/Cube.ts
  var Cube;
  var init_Cube = __esm({
    "src/Cube.ts"() {
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
        get isInMiddleLayer() {
          return this.orientation.top === void 0 && this.orientation.bottom === void 0;
        }
        get isInBottomLayer() {
          return this.orientation.bottom !== void 0;
        }
        get isInLeftLayer() {
          return this.orientation.left !== void 0;
        }
        get isInCenterLayer() {
          return this.orientation.left === void 0 && this.orientation.right === void 0;
        }
        get isInRightLayer() {
          return this.orientation.right !== void 0;
        }
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
          if (this.isInMiddleLayer) {
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
          if (this.isInMiddleLayer) {
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
          if (this.isInCenterLayer) {
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
          if (this.isInCenterLayer) {
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
      };
    }
  });

  // src/RubiksCube.ts
  var RubiksCube;
  var init_RubiksCube = __esm({
    "src/RubiksCube.ts"() {
      "use strict";
      init_Cube();
      RubiksCube = class _RubiksCube {
        constructor() {
          this.cubes = [
            // Top layer
            new Cube({ X: 0, Y: 0, Z: 0 }, { top: "Y", left: "B", back: "O" }),
            new Cube({ X: 1, Y: 0, Z: 0 }, { top: "Y", back: "O" }),
            new Cube({ X: 2, Y: 0, Z: 0 }, { top: "Y", right: "G", back: "O" }),
            new Cube({ X: 0, Y: 1, Z: 0 }, { top: "Y", left: "B" }),
            new Cube({ X: 1, Y: 1, Z: 0 }, { top: "Y" }),
            new Cube({ X: 2, Y: 1, Z: 0 }, { top: "Y", right: "G" }),
            new Cube({ X: 0, Y: 2, Z: 0 }, { top: "Y", left: "B", front: "R" }),
            new Cube({ X: 1, Y: 2, Z: 0 }, { top: "Y", front: "R" }),
            new Cube({ X: 2, Y: 2, Z: 0 }, { top: "Y", right: "G", front: "R" }),
            // Middle layer
            new Cube({ X: 0, Y: 0, Z: 1 }, { left: "B", back: "O" }),
            new Cube({ X: 1, Y: 0, Z: 1 }, { back: "O" }),
            new Cube({ X: 2, Y: 0, Z: 1 }, { right: "G", back: "O" }),
            new Cube({ X: 0, Y: 1, Z: 1 }, { left: "B" }),
            new Cube({ X: 1, Y: 1, Z: 1 }, {}),
            new Cube({ X: 2, Y: 1, Z: 1 }, { right: "G" }),
            new Cube({ X: 0, Y: 2, Z: 1 }, { left: "B", front: "R" }),
            new Cube({ X: 1, Y: 2, Z: 1 }, { front: "R" }),
            new Cube({ X: 2, Y: 2, Z: 1 }, { right: "G", front: "R" }),
            // Bottom layer
            new Cube({ X: 0, Y: 0, Z: 2 }, { bottom: "W", left: "B", back: "O" }),
            new Cube({ X: 1, Y: 0, Z: 2 }, { bottom: "W", back: "O" }),
            new Cube({ X: 2, Y: 0, Z: 2 }, { bottom: "W", right: "G", back: "O" }),
            new Cube({ X: 0, Y: 1, Z: 2 }, { bottom: "W", left: "B" }),
            new Cube({ X: 1, Y: 1, Z: 2 }, { bottom: "W" }),
            new Cube({ X: 2, Y: 1, Z: 2 }, { bottom: "W", right: "G" }),
            new Cube({ X: 0, Y: 2, Z: 2 }, { bottom: "W", left: "B", front: "R" }),
            new Cube({ X: 1, Y: 2, Z: 2 }, { bottom: "W", front: "R" }),
            new Cube({ X: 2, Y: 2, Z: 2 }, { bottom: "W", right: "G", front: "R" })
          ];
        }
        static getInstance() {
          if (!_RubiksCube.instance) {
            _RubiksCube.instance = new _RubiksCube();
          }
          return _RubiksCube.instance;
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
        rotateMiddleCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInMiddleLayer) {
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
        rotateMiddleCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInMiddleLayer) {
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
        rotateLeftYCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInLeftLayer) {
              cube.rotateYCW();
            }
          });
        }
        rotateCenterYCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInCenterLayer) {
              cube.rotateYCW();
            }
          });
        }
        rotateRightYCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInRightLayer) {
              cube.rotateYCW();
            }
          });
        }
        rotateLeftYCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInLeftLayer) {
              cube.rotateYCCW();
            }
          });
        }
        rotateCenterYCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInCenterLayer) {
              cube.rotateYCCW();
            }
          });
        }
        rotateRightYCCW() {
          this.cubes.forEach((cube) => {
            if (cube.isInRightLayer) {
              cube.rotateYCCW();
            }
          });
        }
      };
    }
  });

  // src/app.ts
  var require_app = __commonJS({
    "src/app.ts"() {
      init_helpers();
      init_RubiksCube();
      var rubiksCube = RubiksCube.getInstance();
      document.querySelector("#rotateTopCCW")?.addEventListener("click", () => {
        rubiksCube.rotateTopCCW();
        renderCube();
      });
      function renderCube() {
        console.log(rubiksCube);
        document.querySelectorAll(".cube").forEach((el) => {
          const cubeElement = el;
          const orientation = cubeElement.dataset.orientation;
          const position = parseInt(cubeElement.dataset.position);
          const cube = rubiksCube.cubes.find((c) => {
            return JSON.stringify(c.position) === JSON.stringify(positionMap[position]);
          });
          switch (orientation) {
            case "top":
              cubeElement.classList.add(cube.orientation.top);
              break;
            case "left":
              cubeElement.classList.add(cube.orientation.left);
              break;
            case "front":
              cubeElement.classList.add(cube.orientation.front);
              break;
            case "right":
              cubeElement.classList.add(cube.orientation.right);
              break;
            case "bottom":
              cubeElement.classList.add(cube.orientation.bottom);
              break;
          }
        });
      }
      renderCube();
    }
  });
  require_app();
})();
