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
  function JSONEquals(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  var positionMap;
  var init_helpers = __esm({
    "src/engine/helpers.ts"() {
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

  // src/engine/models.ts
  var Faces;
  var init_models = __esm({
    "src/engine/models.ts"() {
      "use strict";
      Faces = {
        Y: "YELLOW",
        B: "BLUE",
        R: "RED",
        G: "GREEN",
        O: "ORANGE",
        W: "WHITE"
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

  // src/index.ts
  var require_index = __commonJS({
    "src/index.ts"() {
      init_helpers();
      init_models();
      init_RubiksCube();
      var FACE_CLASSES = Object.keys(Faces);
      var rubiksCube = RubiksCube.getInstance();
      document.querySelector("#rotateTopCW")?.addEventListener("click", () => {
        rubiksCube.rotateTopCW();
        renderCube();
      });
      document.querySelector("#rotateXMidCW")?.addEventListener("click", () => {
        rubiksCube.rotateXMidCW();
        renderCube();
      });
      document.querySelector("#rotateBottomCW")?.addEventListener("click", () => {
        rubiksCube.rotateBottomCW();
        renderCube();
      });
      document.querySelector("#rotateTopCCW")?.addEventListener("click", () => {
        rubiksCube.rotateTopCCW();
        renderCube();
      });
      document.querySelector("#rotateXMidCCW")?.addEventListener("click", () => {
        rubiksCube.rotateXMidCCW();
        renderCube();
      });
      document.querySelector("#rotateBottomCCW")?.addEventListener("click", () => {
        rubiksCube.rotateBottomCCW();
        renderCube();
      });
      document.querySelector("#rotateLeftCW")?.addEventListener("click", () => {
        rubiksCube.rotateLeftCW();
        renderCube();
      });
      document.querySelector("#rotateYMidCW")?.addEventListener("click", () => {
        rubiksCube.rotateYMidCW();
        renderCube();
      });
      document.querySelector("#rotateRightCW")?.addEventListener("click", () => {
        rubiksCube.rotateRightCW();
        renderCube();
      });
      document.querySelector("#rotateLeftCCW")?.addEventListener("click", () => {
        rubiksCube.rotateLeftCCW();
        renderCube();
      });
      document.querySelector("#rotateYMidCCW")?.addEventListener("click", () => {
        rubiksCube.rotateYMidCCW();
        renderCube();
      });
      document.querySelector("#rotateRightCCW")?.addEventListener("click", () => {
        rubiksCube.rotateRightCCW();
        renderCube();
      });
      document.querySelector("#rotateFrontCW")?.addEventListener("click", () => {
        rubiksCube.rotateFrontCW();
        renderCube();
      });
      document.querySelector("#rotateZMidCW")?.addEventListener("click", () => {
        rubiksCube.rotateZMidCW();
        renderCube();
      });
      document.querySelector("#rotateBackCW")?.addEventListener("click", () => {
        rubiksCube.rotateBackCW();
        renderCube();
      });
      document.querySelector("#rotateFrontCCW")?.addEventListener("click", () => {
        rubiksCube.rotateFrontCCW();
        renderCube();
      });
      document.querySelector("#rotateZMidCCW")?.addEventListener("click", () => {
        rubiksCube.rotateZMidCCW();
        renderCube();
      });
      document.querySelector("#rotateBackCCW")?.addEventListener("click", () => {
        rubiksCube.rotateBackCCW();
        renderCube();
      });
      document.querySelector("#rotateCubeXCW")?.addEventListener("click", () => {
        rubiksCube.rotateCube("XCW");
        renderCube();
      });
      document.querySelector("#rotateCubeXCCW")?.addEventListener("click", () => {
        rubiksCube.rotateCube("XCCW");
        renderCube();
      });
      document.querySelector("#rotateCubeYCW")?.addEventListener("click", () => {
        rubiksCube.rotateCube("YCW");
        renderCube();
      });
      document.querySelector("#rotateCubeYCCW")?.addEventListener("click", () => {
        rubiksCube.rotateCube("YCCW");
        renderCube();
      });
      function renderCube() {
        document.querySelectorAll(".cube").forEach((el) => {
          const cubeElement = el;
          const orientationKey = cubeElement.dataset.orientation;
          const positionStr = cubeElement.dataset.position;
          if (!orientationKey || !positionStr) return;
          const positionInt = parseInt(positionStr);
          const position = positionMap[positionInt];
          if (!position) return;
          const cube = rubiksCube.cubes.find((c) => JSONEquals(c.position, position));
          if (!cube) return;
          cubeElement.classList.remove(...FACE_CLASSES);
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
