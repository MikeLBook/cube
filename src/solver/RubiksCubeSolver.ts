import Cube from '../engine/Cube'
import RubiksCube from '../engine/RubiksCube'
import { isRotation, positionMap } from '../utils'
import {
  hasSolvedWhiteFaceCorners,
  hasSolvedWhiteFaceEdges,
  hasSolvedYellowCorners,
  hasSolvedYellowEdges,
  isMiddleLayerSolved,
  isOutsideLayerSolved
} from './solutionStatusChecks'
import solveYellowCorners from './subroutines/solveYellowCorners'
import solveYellowEdges from './subroutines/solveYellowEdges'
import solveMiddleEdges from './subroutines/solveMiddleEdges'
import { LayerMove, Rotation } from '../engine/types'
import { IPacer } from '../interfaces/IPacer'
import solveWhiteFaceCorners from './subroutines/solveWhiteFaceCorners'
import solveWhiteFaceEdges from './subroutines/solveWhiteFaceEdges'

type SolutionPhase =
  | 'YellowEdges'
  | 'YellowCorners'
  | 'MiddleEdges'
  | 'WhiteFaceEdges'
  | 'WhiteFaceCorners'

export default class RubiksCubeSolver {
  rubiks: RubiksCube
  pacer: IPacer
  private yellowLayerSolved: boolean | undefined
  private middleLayerSolved: boolean | undefined
  private solutionPhase: SolutionPhase = 'YellowEdges'

  constructor(rubiks: RubiksCube, pacer: IPacer) {
    this.rubiks = rubiks
    this.pacer = pacer
  }

  get cubeMap(): Map<string, Cube> {
    const cubeMap = new Map<string, Cube>()
    this.rubiks.cubes.forEach((cube) => cubeMap.set(JSON.stringify(cube.position), cube))
    return cubeMap
  }

  // Apply a sequence of moves to the engine, one per settled() so the representation
  // paces the solver. Rotations reorient the whole cube; everything else is a layer move.
  public async do(...moves: (LayerMove | Rotation)[]) {
    for (const move of moves) {
      if (isRotation(move)) {
        this.rubiks.rotateRubiksCube(move)
      } else {
        this.rubiks[move]()
      }
      await this.pacer.settled()
    }
  }

  public reset() {
    this.yellowLayerSolved = undefined
    this.middleLayerSolved = undefined
    this.solutionPhase = 'YellowEdges'
  }

  // Mutate the engine one move at a time and wait for the presentation to settle
  // before continuing. The finished solver will loop until the cube is solved;
  // This placeholder is under active development
  public async run(signal?: AbortSignal) {
    if (!this.rubiks.isSolved && !signal?.aborted) {
      this.determineNextMove()
    }
  }

  private async determineNextMove() {
    if (this.yellowLayerSolved === undefined) {
      this.performInitialInspection()
    } else {
      this.updateSolutionStatus()
    }
  }

  private async performInitialInspection() {
    const yellowFaceCube = this.rubiks.cubes.find((cube) => cube.isFace && cube.hasFace('Y'))
    if (!yellowFaceCube) throw new Error('Unable to locate Yellow Face Cube')

    const orientation = yellowFaceCube.getFaceOrientation('Y')
    if (!orientation) throw new Error('Unable to determine Yellow Face Cube Orientation')

    this.yellowLayerSolved = isOutsideLayerSolved(orientation, this.rubiks)
    this.middleLayerSolved = this.yellowLayerSolved
      ? isMiddleLayerSolved(orientation, this.rubiks)
      : false

    if (this.middleLayerSolved) {
      await this.moveToFinalLayer()
    } else {
      if (this.yellowLayerSolved) {
        this.solutionPhase = 'MiddleEdges'
      }
      if (yellowFaceCube.isInBottomLayer) {
        await this.do('YCW', 'YCW')
      } else if (yellowFaceCube.isInFrontLayer) {
        await this.do('YCW')
      } else if (yellowFaceCube.isInBackLayer) {
        await this.do('YCCW')
      } else if (yellowFaceCube.isInLeftLayer) {
        await this.do('ZCW')
      } else if (yellowFaceCube.isInRightLayer) {
        await this.do('ZCCW')
      }
    }
  }

  private async updateSolutionStatus() {
    switch (this.solutionPhase) {
      case 'YellowEdges':
        if (hasSolvedYellowEdges(this)) {
          this.solutionPhase = 'YellowCorners'
          this.updateSolutionStatus()
        } else {
          solveYellowEdges(this)
        }
        break
      case 'YellowCorners':
        if (hasSolvedYellowCorners(this)) {
          this.solutionPhase = 'MiddleEdges'
          this.yellowLayerSolved = true
          this.updateSolutionStatus()
        } else {
          solveYellowCorners(this)
        }
        break
      case 'MiddleEdges':
        if (isMiddleLayerSolved('top', this.rubiks)) {
          await this.moveToFinalLayer()
          this.updateSolutionStatus()
        } else {
          solveMiddleEdges(this)
        }
        break
      case 'WhiteFaceEdges':
        if (hasSolvedWhiteFaceEdges(this)) {
          this.solutionPhase = 'WhiteFaceCorners'
          this.updateSolutionStatus()
        } else {
          solveWhiteFaceEdges(this)
        }
        break
      case 'WhiteFaceCorners':
        if (hasSolvedWhiteFaceCorners(this)) {
          console.log('what now')
        } else {
          solveWhiteFaceCorners(this)
        }
        break
    }
  }

  private async moveToFinalLayer() {
    this.solutionPhase = 'WhiteFaceEdges'
    this.middleLayerSolved = true
    const whiteFace = this.rubiks.cubes.find((cube) => cube.isFace && cube.hasFace('W'))
    if (!whiteFace) {
      console.error('Why is there no white face?')
    } else {
      if (whiteFace.isInBottomLayer) {
        await this.do('YCW', 'YCW')
      } else if (whiteFace.isInLeftLayer) {
        await this.do('ZCW')
      } else if (whiteFace.isInRightLayer) {
        await this.do('ZCCW')
      } else if (whiteFace.isInFrontLayer) {
        await this.do('YCW')
      } else if (whiteFace.isInBackLayer) {
        await this.do('YCCW')
      }
    }
  }
}
