import Cube from "./Cube";
import { Face, Orientation, Rotation } from "./models";

// 3D layout of the 27 cubes in a Rubiks Cube. Coordinates are (X, Y, Z):
//   X:  -1 = left    →   1 = right
//   Y:  -1 = bottom  →   1 = top
//   Z:   1 = front   →  -1 = back
//
//               Center cube at (0, 0)
//
//                       1 ──2 ──3
//                      ╱   ╱   ╱ BACK (Z: -1)
//         TOP (Y: 1)  4 ──5 ──6
//                    ╱   ╱   ╱
//                   7 ──8 ──9
//                   10──11──12
//                   ╱   ╱   ╱
//    LEFT (X: -1) 13──14──15  RIGHT (X: 1)
//                 ╱   ╱   ╱
//               16──17──18
//                19──20──21
//                ╱   ╱   ╱
//              22──23──24  BOTTOM (Y: -1)
// FRONT (Z: 1) ╱   ╱   ╱
//            25──26──27

export default class RubiksCube {
  cubes: Cube[];

  private static instance: RubiksCube;

  private constructor() {
    this.cubes = RubiksCube.initSolvedRubiksCube();
  }

  private static initSolvedRubiksCube(): Cube[] {
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
      new Cube({ X: 1, Y: -1, Z: 1 }, { bottom: "W", right: "G", front: "R" }),
    ];
  }

  public static getInstance() {
    if (!RubiksCube.instance) {
      RubiksCube.instance = new RubiksCube();
    }
    return RubiksCube.instance;
  }

  public isSolved(): boolean {
    const faces: (keyof Orientation)[] = [
      "top",
      "bottom",
      "left",
      "right",
      "front",
      "back",
    ];
    return faces.every((face) => {
      const colors = this.cubes
        .map((cube) => cube.orientation[face])
        .filter((color): color is Face => color !== undefined);
      return colors.every((color) => color === colors[0]);
    });
  }

  public reset() {
    this.cubes = RubiksCube.initSolvedRubiksCube();
  }

  public rotateRubiksCube(rotation: Rotation) {
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

  public rotateTopCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInTopLayer) {
        cube.rotateXCW();
      }
    });
  }

  public rotateXMidCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInXMidLayer) {
        cube.rotateXCW();
      }
    });
  }

  public rotateBottomCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInBottomLayer) {
        cube.rotateXCW();
      }
    });
  }

  public rotateTopCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInTopLayer) {
        cube.rotateXCCW();
      }
    });
  }

  public rotateXMidCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInXMidLayer) {
        cube.rotateXCCW();
      }
    });
  }

  public rotateBottomCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInBottomLayer) {
        cube.rotateXCCW();
      }
    });
  }

  public rotateLeftCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInLeftLayer) {
        cube.rotateYCW();
      }
    });
  }

  public rotateYMidCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInYMidLayer) {
        cube.rotateYCW();
      }
    });
  }

  public rotateRightCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInRightLayer) {
        cube.rotateYCW();
      }
    });
  }

  public rotateLeftCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInLeftLayer) {
        cube.rotateYCCW();
      }
    });
  }

  public rotateYMidCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInYMidLayer) {
        cube.rotateYCCW();
      }
    });
  }

  public rotateRightCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInRightLayer) {
        cube.rotateYCCW();
      }
    });
  }

  public rotateFrontCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInFrontLayer) {
        cube.rotateZCW();
      }
    });
  }

  public rotateZMidCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInZMidLayer) {
        cube.rotateZCW();
      }
    });
  }

  public rotateBackCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInBackLayer) {
        cube.rotateZCW();
      }
    });
  }

  public rotateFrontCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInFrontLayer) {
        cube.rotateZCCW();
      }
    });
  }

  public rotateZMidCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInZMidLayer) {
        cube.rotateZCCW();
      }
    });
  }

  public rotateBackCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInBackLayer) {
        cube.rotateZCCW();
      }
    });
  }
}
