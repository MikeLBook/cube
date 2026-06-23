import Cube from "./Cube";
import { isCubeArray } from "../utils";
import { Face, LayerMove, ORIENTATION_KEYS, Rotation } from "./models";

// Implemented by whatever presents the cube (3D view, 2D view, a robot)
export interface IRubiksCubeObserver {
  // The move that triggered the notification, so observers can present it (e.g. animate
  // the specific layer). Whole-cube re-orientations pass a Rotation; reset passes nothing.
  onMove: (move?: LayerMove | Rotation) => void;
}

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
  private _cubes: Cube[];
  private _observers: IRubiksCubeObserver[];

  private static instance: RubiksCube;

  private constructor() {
    this._cubes = RubiksCube.initCubes();
    this._observers = [];
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

  private onMove(move?: LayerMove | Rotation) {
    this._observers.forEach((observer) => observer.onMove(move));
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
    this._cubes = parsed.map((c) => new Cube(c.position, c.orientation));
  }

  public addObserver(observer: IRubiksCubeObserver) {
    this._observers.push(observer);
  }

  public removeObserver(observer: IRubiksCubeObserver) {
    return (this._observers = [...this._observers].filter(
      (o) => o !== observer,
    ));
  }

  get cubes(): Cube[] {
    return this._cubes;
  }

  get isSolved(): boolean {
    return ORIENTATION_KEYS.every((orientation) => {
      const faces = this._cubes
        .map((cube) => cube.orientation[orientation])
        .filter((face): face is Face => face !== undefined);
      return new Set(faces).size === 1;
    });
  }

  public reset() {
    this._cubes = RubiksCube.initCubes();
    this.onMove();
  }

  public rotateRubiksCube(rotation: Rotation) {
    switch (rotation) {
      case "XCW":
        this._cubes.forEach((cube) => cube.rotateXCW());
        break;
      case "XCCW":
        this._cubes.forEach((cube) => cube.rotateXCCW());
        break;
      case "YCW":
        this._cubes.forEach((cube) => cube.rotateYCW());
        break;
      case "YCCW":
        this._cubes.forEach((cube) => cube.rotateYCCW());
        break;
    }
    this.onMove(rotation);
  }

  public rotateTopCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInTopLayer) {
        cube.rotateXCW();
      }
    });
    this.onMove("rotateTopCW");
  }

  public rotateXMidCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInXMidLayer) {
        cube.rotateXCW();
      }
    });
    this.onMove("rotateXMidCW");
  }

  public rotateBottomCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInBottomLayer) {
        cube.rotateXCW();
      }
    });
    this.onMove("rotateBottomCW");
  }

  public rotateTopCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInTopLayer) {
        cube.rotateXCCW();
      }
    });
    this.onMove("rotateTopCCW");
  }

  public rotateXMidCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInXMidLayer) {
        cube.rotateXCCW();
      }
    });
    this.onMove("rotateXMidCCW");
  }

  public rotateBottomCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInBottomLayer) {
        cube.rotateXCCW();
      }
    });
    this.onMove("rotateBottomCCW");
  }

  public rotateLeftCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInLeftLayer) {
        cube.rotateYCW();
      }
    });
    this.onMove("rotateLeftCW");
  }

  public rotateYMidCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInYMidLayer) {
        cube.rotateYCW();
      }
    });
    this.onMove("rotateYMidCW");
  }

  public rotateRightCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInRightLayer) {
        cube.rotateYCW();
      }
    });
    this.onMove("rotateRightCW");
  }

  public rotateLeftCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInLeftLayer) {
        cube.rotateYCCW();
      }
    });
    this.onMove("rotateLeftCCW");
  }

  public rotateYMidCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInYMidLayer) {
        cube.rotateYCCW();
      }
    });
    this.onMove("rotateYMidCCW");
  }

  public rotateRightCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInRightLayer) {
        cube.rotateYCCW();
      }
    });
    this.onMove("rotateRightCCW");
  }

  public rotateFrontCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInFrontLayer) {
        cube.rotateZCW();
      }
    });
    this.onMove("rotateFrontCW");
  }

  public rotateZMidCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInZMidLayer) {
        cube.rotateZCW();
      }
    });
    this.onMove("rotateZMidCW");
  }

  public rotateBackCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInBackLayer) {
        cube.rotateZCW();
      }
    });
    this.onMove("rotateBackCW");
  }

  public rotateFrontCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInFrontLayer) {
        cube.rotateZCCW();
      }
    });
    this.onMove("rotateFrontCCW");
  }

  public rotateZMidCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInZMidLayer) {
        cube.rotateZCCW();
      }
    });
    this.onMove("rotateZMidCCW");
  }

  public rotateBackCCW() {
    this._cubes.forEach((cube) => {
      if (cube.isInBackLayer) {
        cube.rotateZCCW();
      }
    });
    this.onMove("rotateBackCCW");
  }
}
