import Cube from "./Cube"
import { positionMap } from "./helpers"
import { Rotation } from "./models"

export default class RubiksCube {
  cubes: Cube[]

  private static instance: RubiksCube

  private constructor() {
    this.cubes = [
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