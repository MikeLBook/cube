import { Cube, Face, Orientation } from "./models"

export default class RubiksCube {
  cubes: Cube[]
  orientation: Orientation

  private static instance: RubiksCube

  private constructor() {
    this.cubes = [
      // Top layer
      { position: { X: 0, Y: 0, Z: 0 }, orientation: { top: "Y", left: "B", back: "O" } },
      { position: { X: 1, Y: 0, Z: 0 }, orientation: { top: "Y", back: "O" } },
      { position: { X: 2, Y: 0, Z: 0 }, orientation: { top: "Y", right: "G", back: "O" } },
      { position: { X: 0, Y: 1, Z: 0 }, orientation: { top: "Y", left: "B" } },
      { position: { X: 1, Y: 1, Z: 0 }, orientation: { top: "Y" } },
      { position: { X: 2, Y: 1, Z: 0 }, orientation: { top: "Y", right: "G" } },
      { position: { X: 0, Y: 2, Z: 0 }, orientation: { top: "Y", left: "B", front: "R" } },
      { position: { X: 1, Y: 2, Z: 0 }, orientation: { top: "Y", front: "R" } },
      { position: { X: 2, Y: 2, Z: 0 }, orientation: { top: "Y", right: "G", front: "R" } },

      // Middle layer
      { position: { X: 0, Y: 0, Z: 1 }, orientation: { left: "B", back: "O" } },
      { position: { X: 1, Y: 0, Z: 1 }, orientation: { back: "O" } },
      { position: { X: 2, Y: 0, Z: 1 }, orientation: { right: "G", back: "O" } },
      { position: { X: 0, Y: 1, Z: 1 }, orientation: { left: "B" } },
      { position: { X: 1, Y: 1, Z: 1 }, orientation: {} },
      { position: { X: 2, Y: 1, Z: 1 }, orientation: { right: "G" } },
      { position: { X: 0, Y: 2, Z: 1 }, orientation: { left: "B", front: "R" } },
      { position: { X: 1, Y: 2, Z: 1 }, orientation: { front: "R" } },
      { position: { X: 2, Y: 2, Z: 1 }, orientation: { right: "G", front: "R" } },

      // Bottom layer
      { position: { X: 0, Y: 0, Z: 2 }, orientation: { bottom: "W", left: "B", back: "O" } },
      { position: { X: 1, Y: 0, Z: 2 }, orientation: { bottom: "W", back: "O" } },
      { position: { X: 2, Y: 0, Z: 2 }, orientation: { bottom: "W", right: "G", back: "O" } },
      { position: { X: 0, Y: 1, Z: 2 }, orientation: { bottom: "W", left: "B" } },
      { position: { X: 1, Y: 1, Z: 2 }, orientation: { bottom: "W" } },
      { position: { X: 2, Y: 1, Z: 2 }, orientation: { bottom: "W", right: "G" } },
      { position: { X: 0, Y: 2, Z: 2 }, orientation: { bottom: "W", left: "B", front: "R" } },
      { position: { X: 1, Y: 2, Z: 2 }, orientation: { bottom: "W", front: "R" } },
      { position: { X: 2, Y: 2, Z: 2 }, orientation: { bottom: "W", right: "G", front: "R" } },
    ],
      this.orientation = {
        top: "Y",
        left: "B",
        front: "R",
        right: "G",
        back: "O",
        bottom: "W",
      }
  }

  public static getInstance() {
    if (!RubiksCube.instance) {
      RubiksCube.instance = new RubiksCube()
    }
    return RubiksCube.instance
  }

  private rotateXCW(old: Orientation): Orientation {
    return {
      top: old.top,
      bottom: old.bottom,
      left: old.front,
      front: old.right,
      right: old.back,
      back: old.left,
    }
  }

  private rotateXCCW(old: Orientation): Orientation {
    return {
      top: old.top,
      bottom: old.bottom,
      left: old.back,
      front: old.left,
      right: old.front,
      back: old.right
    }
  }

  private rotateYCW(old: Orientation): Orientation {
    return {
      top: old.front,
      back: old.top,
      bottom: old.back,
      front: old.bottom,
      left: old.left,
      right: old.right
    }
  }

  private rotateYCCW(old: Orientation): Orientation {
    return {
      top: old.back,
      front: old.top,
      bottom: old.front,
      back: old.bottom,
      left: old.left,
      right: old.right
    }
  }

  public rotateCubeCW() {
    this.orientation = this.rotateXCW(this.orientation)
    this.cubes.forEach(cube => {
      cube.orientation = this.rotateXCW(cube.orientation)
    })
  }

  public rotateCubeCCW() {
    this.orientation = this.rotateXCCW(this.orientation)

    this.cubes.forEach(cube => {
      cube.orientation = this.rotateXCCW(cube.orientation)
    })
  }

  public rotateCubeYCW() {
    this.orientation = this.rotateYCW(this.orientation)

    this.cubes.forEach(cube => {
      cube.orientation = this.rotateYCW(cube.orientation)
    })
  }

  public rotateCubeYCCW() {
    this.orientation = this.rotateYCCW(this.orientation)

    this.cubes.forEach(cube => {
      cube.orientation = this.rotateYCCW(cube.orientation)
    })
  }

  rotateFaceCW(face: Face) {}

  rotateFaceCCW(face: Face) {}
}