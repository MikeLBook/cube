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

  rotateXCW() {
    const newOrientation: Orientation = {
      top: this.orientation.top,
      bottom: this.orientation.bottom,
      left: this.orientation.front,
      front: this.orientation.right,
      right: this.orientation.back,
      back: this.orientation.left,
    }

    this.orientation = newOrientation

    this.cubes.forEach(cube => {
      const newOrientation: Orientation = {
        top: cube.orientation.top,
        bottom: cube.orientation.bottom,
        left: cube.orientation.front,
        front: cube.orientation.right,
        right: cube.orientation.back,
        back: cube.orientation.left,
      }
      cube.orientation = newOrientation
    })
  }

  rotateXCCW() {
    const newOrientation: Orientation = {
      top: this.orientation.top,
      bottom: this.orientation.bottom,
      left: this.orientation.back,
      front: this.orientation.left,
      right: this.orientation.front,
      back: this.orientation.right
    }

    this.orientation = newOrientation

    this.cubes.forEach(cube => {
      const newOrientation: Orientation = {
        top: cube.orientation.top,
        bottom: cube.orientation.bottom,
        left: cube.orientation.back,
        front: cube.orientation.left,
        right: cube.orientation.front,
        back: cube.orientation.right
      }

      cube.orientation = newOrientation
    })
  }

  rotateYCW() {
    const newOrientation: Orientation = {
      top: this.orientation.front,
      back: this.orientation.top,
      bottom: this.orientation.back,
      front: this.orientation.bottom,
      left: this.orientation.left,
      right: this.orientation.right
    }

    this.orientation = newOrientation

    this.cubes.forEach(cube => {
      const newOrientation: Orientation = {
        top: cube.orientation.front,
        back: cube.orientation.top,
        bottom: cube.orientation.back,
        front: cube.orientation.bottom,
        left: cube.orientation.left,
        right: cube.orientation.right
      }

      cube.orientation = newOrientation
    })
  }

  rotateYCCW() {
    const newOrientation: Orientation = {
      top: this.orientation.back,
      front: this.orientation.top,
      bottom: this.orientation.front,
      back: this.orientation.bottom,
      left: this.orientation.left,
      right: this.orientation.right
    }

    this.orientation = newOrientation

    this.cubes.forEach(cube => {
      const newOrientation: Orientation = {
        top: cube.orientation.back,
        front: cube.orientation.top,
        bottom: cube.orientation.front,
        back: cube.orientation.bottom,
        left: cube.orientation.left,
        right: cube.orientation.right
      }

      cube.orientation = newOrientation
    })
  }

  rotateFaceCW(face: Face) {}

  rotateFaceCCW(face: Face) {}
}