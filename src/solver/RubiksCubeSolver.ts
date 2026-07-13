import Cube from '../engine/Cube'
import RubiksCube from '../engine/RubiksCube'
import {
  hasCompletedCorners,
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
import { IMovePacer } from '../interfaces/IMovePacer'
import solveWhiteFaceCorners from './subroutines/solveWhiteFaceCorners'
import solveWhiteFaceEdges from './subroutines/solveWhiteFaceEdges'
import solveFinalCorners from './subroutines/solveFinalCorners'
import solveFinalEdges from './subroutines/solveFinalEdges'
import solveFinishedLayers from './subroutines/solveFinishedLayers'

type SolutionPhase =
  | 'YellowEdges'
  | 'YellowCorners'
  | 'MiddleEdges'
  | 'WhiteFaceEdges'
  | 'WhiteFaceCorners'
  | 'CompleteCorners'
  | 'CompleteEdges'

export default class RubiksCubeSolver {
  rubiks: RubiksCube
  pacer: IMovePacer
  private yellowLayerSolved: boolean | undefined
  private middleLayerSolved: boolean | undefined
  private solutionPhase: SolutionPhase = 'YellowEdges'

  constructor(rubiks: RubiksCube, pacer: IMovePacer) {
    this.rubiks = rubiks
    this.pacer = pacer
  }

  get cubeMap(): Map<string, Cube> {
    const cubeMap = new Map<string, Cube>()
    this.rubiks.cubes.forEach((cube) => cubeMap.set(JSON.stringify(cube.position), cube))
    return cubeMap
  }

  // Apply a sequence of moves to the engine, one per settled() so the presentation
  // paces the solver. Rotations reorient the whole cube; everything else is a layer move.
  public async do(...moves: (LayerMove | Rotation)[]) {
    for (const move of moves) {
      this.rubiks.execute(move)
      await this.pacer.settled()
    }
  }

  public reset() {
    this.yellowLayerSolved = undefined
    this.middleLayerSolved = undefined
    this.solutionPhase = 'YellowEdges'
  }

  public async run(signal?: AbortSignal) {
    while (!signal?.aborted && !this.rubiks.isSolved) {
      if (this.yellowLayerSolved === undefined) {
        await this.performInitialInspection()
      } else {
        await this.updateSolutionStatus()
      }
    }
    this.reset()
  }

  private async performInitialInspection() {
    const yellowFaceCube = this.rubiks.cubes.find((cube) => cube.isFace && cube.hasFace('Y'))
    const orientation = yellowFaceCube?.getFaceOrientation('Y')!

    this.yellowLayerSolved = isOutsideLayerSolved(orientation, this.rubiks)
    this.middleLayerSolved = this.yellowLayerSolved
      ? isMiddleLayerSolved(orientation, this.rubiks)
      : false

    if (this.middleLayerSolved) {
      await this.advancePhase('WhiteFaceEdges')
    } else {
      if (yellowFaceCube?.isInBottomLayer) {
        await this.do('YCW', 'YCW')
      } else if (yellowFaceCube?.isInFrontLayer) {
        await this.do('YCW')
      } else if (yellowFaceCube?.isInBackLayer) {
        await this.do('YCCW')
      } else if (yellowFaceCube?.isInLeftLayer) {
        await this.do('ZCW')
      } else if (yellowFaceCube?.isInRightLayer) {
        await this.do('ZCCW')
      }
      if (this.yellowLayerSolved) {
        await this.advancePhase('MiddleEdges')
      } else await this.updateSolutionStatus()
    }
  }

  private async updateSolutionStatus() {
    switch (this.solutionPhase) {
      case 'YellowEdges':
        if (hasSolvedYellowEdges(this)) {
          await this.advancePhase('YellowCorners')
        } else {
          await solveYellowEdges(this)
        }
        break
      case 'YellowCorners':
        if (hasSolvedYellowCorners(this)) {
          await this.advancePhase('MiddleEdges')
        } else {
          await solveYellowCorners(this)
        }
        break
      case 'MiddleEdges':
        if (isMiddleLayerSolved('top', this.rubiks)) {
          await this.advancePhase('WhiteFaceEdges')
        } else {
          await solveMiddleEdges(this)
        }
        break
      case 'WhiteFaceEdges':
        if (hasSolvedWhiteFaceEdges(this)) {
          await this.advancePhase('WhiteFaceCorners')
        } else {
          await solveWhiteFaceEdges(this)
        }
        break
      case 'WhiteFaceCorners':
        if (hasSolvedWhiteFaceCorners(this)) {
          await this.advancePhase('CompleteCorners')
        } else {
          await solveWhiteFaceCorners(this)
        }
        break
      case 'CompleteCorners':
        if (hasCompletedCorners(this)) {
          await this.advancePhase('CompleteEdges')
        } else {
          await solveFinalCorners(this)
        }
        break
      case 'CompleteEdges':
        if (
          isOutsideLayerSolved('top', this.rubiks) &&
          isOutsideLayerSolved('bottom', this.rubiks) &&
          isMiddleLayerSolved('bottom', this.rubiks)
        ) {
          await solveFinishedLayers(this)
        } else {
          await solveFinalEdges(this)
        }
        break
    }
  }

  private async advancePhase(phase: SolutionPhase) {
    this.solutionPhase = phase
    if (phase === 'MiddleEdges') this.yellowLayerSolved = true
    if (phase === 'WhiteFaceEdges') {
      this.middleLayerSolved = true
      const whiteFace = this.rubiks.cubes.find((cube) => cube.isFace && cube.hasFace('W'))
      if (whiteFace?.isInBottomLayer) {
        await this.do('YCW', 'YCW')
      } else if (whiteFace?.isInLeftLayer) {
        await this.do('ZCW')
      } else if (whiteFace?.isInRightLayer) {
        await this.do('ZCCW')
      } else if (whiteFace?.isInFrontLayer) {
        await this.do('YCW')
      } else if (whiteFace?.isInBackLayer) {
        await this.do('YCCW')
      }
    }
    await this.updateSolutionStatus()
  }
}
