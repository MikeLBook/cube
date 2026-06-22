import Cube from "./Cube";
import { isCubeArray } from "./helpers";
import {
  Face,
  IRubiksCubeObserver,
  ORIENTATION_KEYS,
  Rotation,
} from "./models";

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
  observers: IRubiksCubeObserver[];

  private static instance: RubiksCube;

  private constructor() {
    this.cubes = RubiksCube.initCubes();
    this.observers = [];
  }

  private static initCubes(): Cube[] {
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

  private onMove() {
    this.observers.forEach((observer) => observer.onMove());
  }

  public static getInstance() {
    if (!RubiksCube.instance) {
      RubiksCube.instance = new RubiksCube();
    }
    return RubiksCube.instance;
  }

  public setState(cubeState: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(cubeState);
    } catch (e) {
      console.error("error", e);
      return;
    }
    if (!isCubeArray(parsed)) return;
    // Rehydrate into real Cube instances — JSON.parse yields plain objects with
    // no prototype, so the rotation methods/getters would be missing otherwise.
    this.cubes = parsed.map((c) => new Cube(c.position, c.orientation));
  }

  public addObserver(observer: IRubiksCubeObserver) {
    this.observers.push(observer);
  }

  public removeObserver(observer: IRubiksCubeObserver) {
    return (this.observers = [...this.observers].filter((o) => o !== observer));
  }

  public isSolved(): boolean {
    return ORIENTATION_KEYS.every((orientation) => {
      const faces = this.cubes
        .map((cube) => cube.orientation[orientation])
        .filter((face): face is Face => face !== undefined);
      return new Set(faces).size === 1;
    });
  }

  public reset() {
    this.cubes = RubiksCube.initCubes();
    this.onMove();
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
    this.onMove();
  }

  public rotateTopCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInTopLayer) {
        cube.rotateXCW();
      }
    });
    this.onMove();
  }

  public rotateXMidCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInXMidLayer) {
        cube.rotateXCW();
      }
    });
    this.onMove();
  }

  public rotateBottomCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInBottomLayer) {
        cube.rotateXCW();
      }
    });
    this.onMove();
  }

  public rotateTopCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInTopLayer) {
        cube.rotateXCCW();
      }
    });
    this.onMove();
  }

  public rotateXMidCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInXMidLayer) {
        cube.rotateXCCW();
      }
    });
    this.onMove();
  }

  public rotateBottomCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInBottomLayer) {
        cube.rotateXCCW();
      }
    });
    this.onMove();
  }

  public rotateLeftCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInLeftLayer) {
        cube.rotateYCW();
      }
    });
    this.onMove();
  }

  public rotateYMidCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInYMidLayer) {
        cube.rotateYCW();
      }
    });
    this.onMove();
  }

  public rotateRightCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInRightLayer) {
        cube.rotateYCW();
      }
    });
    this.onMove();
  }

  public rotateLeftCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInLeftLayer) {
        cube.rotateYCCW();
      }
    });
    this.onMove();
  }

  public rotateYMidCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInYMidLayer) {
        cube.rotateYCCW();
      }
    });
    this.onMove();
  }

  public rotateRightCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInRightLayer) {
        cube.rotateYCCW();
      }
    });
    this.onMove();
  }

  public rotateFrontCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInFrontLayer) {
        cube.rotateZCW();
      }
    });
    this.onMove();
  }

  public rotateZMidCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInZMidLayer) {
        cube.rotateZCW();
      }
    });
    this.onMove();
  }

  public rotateBackCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInBackLayer) {
        cube.rotateZCW();
      }
    });
    this.onMove();
  }

  public rotateFrontCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInFrontLayer) {
        cube.rotateZCCW();
      }
    });
    this.onMove();
  }

  public rotateZMidCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInZMidLayer) {
        cube.rotateZCCW();
      }
    });
    this.onMove();
  }

  public rotateBackCCW() {
    this.cubes.forEach((cube) => {
      if (cube.isInBackLayer) {
        cube.rotateZCCW();
      }
    });
    this.onMove();
  }
}
