import { cubesShareFace, positionMap } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveFinishedLayers(solver: RubiksCubeSolver) {
  while (
    !cubesShareFace('back', solver.cubeMap.get(positionMap[2]), solver.cubeMap.get(positionMap[11]))
  ) {
    await solver.do('rotateTopCW')
  }
  while (
    !cubesShareFace(
      'back',
      solver.cubeMap.get(positionMap[11]),
      solver.cubeMap.get(positionMap[20])
    )
  ) {
    await solver.do('rotateBottomCW')
  }
}
