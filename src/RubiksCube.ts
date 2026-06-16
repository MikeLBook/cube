import { Direction, Face, Orientation, Position } from "./models"

const positionMap: Record<number, Position> = {
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
  27: { X: 2, Y: 2, Z: 2 },
}

class Cube {
  position: Position
  orientation: Orientation

  public constructor(position: Position, orientation: Orientation) {
    this.position = position
    this.orientation = orientation
  }

  public isInTopLayer(): boolean {
    return this.orientation.top !== undefined
  }

  public isInBottomLayer(): boolean {
    return this.orientation.bottom !== undefined
  }

  public isInMiddleLayer(): boolean {
    return this.orientation.top === undefined && this.orientation.bottom === undefined
  }

  public rotateXCW() {
    const oldOrientation = { ...this.orientation }
    this.orientation = {
      top: oldOrientation.top,
      bottom: oldOrientation.bottom,
      left: oldOrientation.front,
      front: oldOrientation.right,
      right: oldOrientation.back,
      back: oldOrientation.left,
    }

    if (this.isInTopLayer()) {
      switch(this.position) {
        case positionMap[1]:
          this.position = positionMap[3]
          break;
        case positionMap[2]:
          this.position = positionMap[6]
          break;
        case positionMap[3]:
          this.position = positionMap[9]
          break;
        case positionMap[4]:
          this.position = positionMap[2]
          break;
        case positionMap[5]:
          break;
        case positionMap[6]:
          this.position = positionMap[8]
          break;
        case positionMap[7]:
          this.position = positionMap[1]
          break;
        case positionMap[8]:
          this.position = positionMap[4]
          break;
        case positionMap[9]:
          this.position = positionMap[7]
      }
    } else if (this.isInMiddleLayer()) {
      //
    } else if (this.isInBottomLayer()) {
      //
    }
  }

  public rotateXCCW() {
    const oldOrientation = { ...this.orientation }
    this.orientation = {
      top: oldOrientation.top,
      bottom: oldOrientation.bottom,
      left: oldOrientation.back,
      front: oldOrientation.left,
      right: oldOrientation.front,
      back: oldOrientation.right
    }
  }

  public rotateYCW() {
    const oldOrientation = { ...this.orientation }
    this.orientation = {
      top: oldOrientation.front,
      back: oldOrientation.top,
      bottom: oldOrientation.back,
      front: oldOrientation.bottom,
      left: oldOrientation.left,
      right: oldOrientation.right
    }
  }

  public rotateYCCW() {
    const oldOrientation = { ...this.orientation }
    this.orientation = {
      top: oldOrientation.back,
      front: oldOrientation.top,
      bottom: oldOrientation.front,
      back: oldOrientation.bottom,
      left: oldOrientation.left,
      right: oldOrientation.right
    }
  }
}

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

  public rotateCube(direction: Direction) {
    switch(direction) {
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
      if (cube.isInTopLayer()) {
        cube.rotateXCW()
      }
    })
  }

  public rotateMiddleCW() {
    this.cubes.forEach(cube => {
      if (cube.isInMiddleLayer()) {
        cube.rotateXCW()
      }
    })
  }

  public rotateBottomCW() {
    this.cubes.forEach(cube => {
      if (cube.isInBottomLayer()) {
        cube.rotateXCW()
      }
    })
  }

  // top, middle, and bottom ccw
  // left, middle, and right ycw
  // left, middle, and right yccw
}