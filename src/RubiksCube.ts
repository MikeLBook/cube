import Cube from "./Cube"
import { Rotation } from "./models"

export default class RubiksCube {
  cubes: Cube[]

  private static instance: RubiksCube

  private constructor() {
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
      new Cube({ X: 2, Y: 2, Z: 2 }, { bottom: "W", right: "G", front: "R" }),
    ]
  }

  public static getInstance() {
    if (!RubiksCube.instance) {
      RubiksCube.instance = new RubiksCube()
    }
    return RubiksCube.instance
  }

  public rotateCube(rotation: Rotation) {
    switch(rotation) {
      case "XCW":
        this.cubes.forEach(cube => cube.rotateXCW())
        break;
      case "XCCW":
        this.cubes.forEach(cube => cube.rotateXCCW())
        break;
      case "YCW":
        this.cubes.forEach(cube => cube.rotateYCW())
        break;
      case "YCCW":
        this.cubes.forEach(cube => cube.rotateYCCW())
        break;
    }
  }

  public rotateTopCW() {
    this.cubes.forEach(cube => {
      if (cube.isInTopLayer) {
        cube.rotateXCW()
      }
    })
  }

  public rotateMiddleCW() {
    this.cubes.forEach(cube => {
      if (cube.isInMiddleLayer) {
        cube.rotateXCW()
      }
    })
  }

  public rotateBottomCW() {
    this.cubes.forEach(cube => {
      if (cube.isInBottomLayer) {
        cube.rotateXCW()
      }
    })
  }

  public rotateTopCCW() {
    this.cubes.forEach(cube => {
      if (cube.isInTopLayer) {
        cube.rotateXCCW()
      }
    })
  }

  public rotateMiddleCCW() {
    this.cubes.forEach(cube => {
      if (cube.isInMiddleLayer) {
        cube.rotateXCCW()
      }
    })
  }

  public rotateBottomCCW() {
    this.cubes.forEach(cube => {
      if (cube.isInBottomLayer) {
        cube.rotateXCCW()
      }
    })
  }

  public rotateLeftYCW() {
    this.cubes.forEach(cube => {
      if (cube.isInLeftLayer) {
        cube.rotateYCW()
      }
    })
  }

  public rotateCenterYCW() {
    this.cubes.forEach(cube => {
      if (cube.isInCenterLayer) {
        cube.rotateYCW()
      }
    })
  }

  public rotateRightYCW() {
    this.cubes.forEach(cube => {
      if (cube.isInRightLayer) {
        cube.rotateYCW()
      }
    })
  }

  public rotateLeftYCCW() {
    this.cubes.forEach(cube => {
      if (cube.isInLeftLayer) {
        cube.rotateYCCW()
      }
    })
  }

  public rotateCenterYCCW() {
    this.cubes.forEach(cube => {
      if (cube.isInCenterLayer) {
        cube.rotateYCCW()
      }
    })
  }

  public rotateRightYCCW() {
    this.cubes.forEach(cube => {
      if (cube.isInRightLayer) {
        cube.rotateYCCW()
      }
    })
  }
}