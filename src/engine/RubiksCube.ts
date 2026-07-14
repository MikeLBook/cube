import Cube from './Cube'
import { isCubeArray } from '../utils'
import { Face, LayerMove, ORIENTATION_KEYS, Rotation } from './types'
import IRubiksCubeObserver from '../interfaces/IRubiksCubeObserver'

// 3D layout of the 27 cubes in a Rubiks Cube. Coordinates are (X, Y, Z):
//   X:  -1 = left    →   1 = right
//   Y:  -1 = bottom  →   1 = top
//   Z:   1 = front   →  -1 = back
//
//              Center cube, 14, at (0, 0, 0)
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
//

export default class RubiksCube {
  private _cubes: Cube[]
  private _cubeMap: Map<string, Cube> = new Map()
  private _observers: IRubiksCubeObserver[]

  private static instance: RubiksCube

  private constructor() {
    this._cubes = RubiksCube.initCubes()
    this._observers = []
    this.updateCubeMap()
  }

  private static initCubes(): Cube[] {
    return [
      // Top layer
      new Cube({ X: -1, Y: 1, Z: -1 }, { top: 'Y', left: 'B', back: 'O' }),
      new Cube({ X: 0, Y: 1, Z: -1 }, { top: 'Y', back: 'O' }),
      new Cube({ X: 1, Y: 1, Z: -1 }, { top: 'Y', right: 'G', back: 'O' }),
      new Cube({ X: -1, Y: 1, Z: 0 }, { top: 'Y', left: 'B' }),
      new Cube({ X: 0, Y: 1, Z: 0 }, { top: 'Y' }),
      new Cube({ X: 1, Y: 1, Z: 0 }, { top: 'Y', right: 'G' }),
      new Cube({ X: -1, Y: 1, Z: 1 }, { top: 'Y', left: 'B', front: 'R' }),
      new Cube({ X: 0, Y: 1, Z: 1 }, { top: 'Y', front: 'R' }),
      new Cube({ X: 1, Y: 1, Z: 1 }, { top: 'Y', right: 'G', front: 'R' }),
      // Middle layer
      new Cube({ X: -1, Y: 0, Z: -1 }, { left: 'B', back: 'O' }),
      new Cube({ X: 0, Y: 0, Z: -1 }, { back: 'O' }),
      new Cube({ X: 1, Y: 0, Z: -1 }, { right: 'G', back: 'O' }),
      new Cube({ X: -1, Y: 0, Z: 0 }, { left: 'B' }),
      new Cube({ X: 0, Y: 0, Z: 0 }, {}),
      new Cube({ X: 1, Y: 0, Z: 0 }, { right: 'G' }),
      new Cube({ X: -1, Y: 0, Z: 1 }, { left: 'B', front: 'R' }),
      new Cube({ X: 0, Y: 0, Z: 1 }, { front: 'R' }),
      new Cube({ X: 1, Y: 0, Z: 1 }, { right: 'G', front: 'R' }),
      // Bottom layer
      new Cube({ X: -1, Y: -1, Z: -1 }, { bottom: 'W', left: 'B', back: 'O' }),
      new Cube({ X: 0, Y: -1, Z: -1 }, { bottom: 'W', back: 'O' }),
      new Cube({ X: 1, Y: -1, Z: -1 }, { bottom: 'W', right: 'G', back: 'O' }),
      new Cube({ X: -1, Y: -1, Z: 0 }, { bottom: 'W', left: 'B' }),
      new Cube({ X: 0, Y: -1, Z: 0 }, { bottom: 'W' }),
      new Cube({ X: 1, Y: -1, Z: 0 }, { bottom: 'W', right: 'G' }),
      new Cube({ X: -1, Y: -1, Z: 1 }, { bottom: 'W', left: 'B', front: 'R' }),
      new Cube({ X: 0, Y: -1, Z: 1 }, { bottom: 'W', front: 'R' }),
      new Cube({ X: 1, Y: -1, Z: 1 }, { bottom: 'W', right: 'G', front: 'R' })
    ]
  }

  private updateCubeMap() {
    this.cubes.forEach((cube) => this._cubeMap.set(JSON.stringify(cube.position), cube))
  }

  public static getInstance() {
    if (!RubiksCube.instance) {
      RubiksCube.instance = new RubiksCube()
    }
    return RubiksCube.instance
  }

  get cubes(): Cube[] {
    return this._cubes
  }

  get cubeMap(): Map<string, Cube> {
    return this._cubeMap
  }

  get isSolved(): boolean {
    return ORIENTATION_KEYS.every((orientation) => {
      const faces = this._cubes
        .map((cube) => cube.orientation[orientation])
        .filter((face): face is Face => face !== undefined)
      return new Set(faces).size === 1
    })
  }

  public setState(cubeState: string) {
    let parsed: unknown
    try {
      parsed = JSON.parse(cubeState)
    } catch (e) {
      console.error('error', e)
      return
    }
    if (!isCubeArray(parsed)) return
    // Rehydrate into real Cube instances — JSON.parse yields plain objects with
    // no prototype, so the rotation methods/getters would be missing otherwise.
    this._cubes = parsed.map((c) => new Cube(c.position, c.orientation))
    this.updateCubeMap()
  }

  public addObserver(observer: IRubiksCubeObserver) {
    this._observers.push(observer)
  }

  public removeObserver(observer: IRubiksCubeObserver) {
    return (this._observers = [...this._observers].filter((o) => o !== observer))
  }

  public reset() {
    this._cubes = RubiksCube.initCubes()
    this.onMove()
  }

  private onMove(move?: LayerMove | Rotation) {
    this.updateCubeMap()
    this._observers.forEach((observer) => observer.onMove(move))
  }

  public execute(move: LayerMove | Rotation) {
    this.cubes.forEach((cube) => this.Moves[move](cube))
    this.onMove(move)
  }

  Moves: Record<Rotation | LayerMove, (cube: Cube) => void> = {
    XCW: (cube) => cube.rotateXCW(),
    XCCW: (cube) => cube.rotateXCCW(),
    YCW: (cube) => cube.rotateYCW(),
    YCCW: (cube) => cube.rotateYCCW(),
    ZCW: (cube) => cube.rotateZCW(),
    ZCCW: (cube) => cube.rotateZCCW(),
    rotateTopCW: (cube) => {
      if (cube.isInTopLayer) cube.rotateXCW()
    },
    rotateXMidCW: (cube) => {
      if (cube.isInXMidLayer) cube.rotateXCW()
    },
    rotateBottomCW: (cube) => {
      if (cube.isInBottomLayer) cube.rotateXCW()
    },
    rotateTopCCW: (cube) => {
      if (cube.isInTopLayer) cube.rotateXCCW()
    },
    rotateXMidCCW: (cube) => {
      if (cube.isInXMidLayer) cube.rotateXCCW()
    },
    rotateBottomCCW: (cube) => {
      if (cube.isInBottomLayer) cube.rotateXCCW()
    },
    rotateLeftCW: (cube) => {
      if (cube.isInLeftLayer) cube.rotateYCW()
    },
    rotateYMidCW: (cube) => {
      if (cube.isInYMidLayer) cube.rotateYCW()
    },
    rotateRightCW: (cube) => {
      if (cube.isInRightLayer) cube.rotateYCW()
    },
    rotateLeftCCW: (cube) => {
      if (cube.isInLeftLayer) cube.rotateYCCW()
    },
    rotateYMidCCW: (cube) => {
      if (cube.isInYMidLayer) cube.rotateYCCW()
    },
    rotateRightCCW: (cube) => {
      if (cube.isInRightLayer) cube.rotateYCCW()
    },
    rotateFrontCW: (cube) => {
      if (cube.isInFrontLayer) cube.rotateZCW()
    },
    rotateZMidCW: (cube) => {
      if (cube.isInZMidLayer) cube.rotateZCW()
    },
    rotateBackCW: (cube) => {
      if (cube.isInBackLayer) cube.rotateZCW()
    },
    rotateFrontCCW: (cube) => {
      if (cube.isInFrontLayer) cube.rotateZCCW()
    },
    rotateZMidCCW: (cube) => {
      if (cube.isInZMidLayer) cube.rotateZCCW()
    },
    rotateBackCCW: (cube) => {
      if (cube.isInBackLayer) cube.rotateZCCW()
    }
  }
}
