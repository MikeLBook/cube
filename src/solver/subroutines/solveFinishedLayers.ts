import { cubesShareFace } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveFinishedLayers(solver: RubiksCubeSolver) {
  while (!cubesShareFace('back', solver.fetchPosition(2), solver.fetchPosition(11))) {
    await solver.do('rotateTopCW')
  }
  while (!cubesShareFace('back', solver.fetchPosition(11), solver.fetchPosition(20))) {
    await solver.do('rotateBottomCW')
  }
}
