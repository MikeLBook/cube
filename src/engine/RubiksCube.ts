import Cube from "./Cube";
import { positionMap } from "./helpers";
import { Face, Orientation, Rotation } from "./models";

export default class RubiksCube {
  cubes: Cube[];

  private static instance: RubiksCube;

  private constructor() {
    this.cubes = RubiksCube.buildSolvedCubes();
  }

  private static buildSolvedCubes(): Cube[] {
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
      new Cube(positionMap[27], { bottom: "W", right: "G", front: "R" }),
    ];
  }

  public static getInstance() {
    if (!RubiksCube.instance) {
      RubiksCube.instance = new RubiksCube();
    }
    return RubiksCube.instance;
  }

  public reset() {
    this.cubes = RubiksCube.buildSolvedCubes();
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

  public rotateCube(rotation: Rotation) {
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
