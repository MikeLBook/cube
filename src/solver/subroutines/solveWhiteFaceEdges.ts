import { positionMap } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveWhiteFaceEdges(solver: RubiksCubeSolver) {
  const backEdge = solver.cubeMap.get(positionMap[2])
  const leftEdge = solver.cubeMap.get(positionMap[4])
  const rightEdge = solver.cubeMap.get(positionMap[6])
  const frontEdge = solver.cubeMap.get(positionMap[8])

  if (backEdge?.orientation.top === 'W') {
    if (leftEdge?.orientation.top === 'W') {
      await runAlgorithm(solver)
      return
    }
    if (rightEdge?.orientation.top === 'W') {
      await solver.do('XCCW')
      await runAlgorithm(solver)
      return
    }
  }

  if (frontEdge?.orientation.top === 'W') {
    if (leftEdge?.orientation.top === 'W') {
      await solver.do('XCW')
      await runAlgorithm(solver)
      return
    }
    if (rightEdge?.orientation.top === 'W') {
      await solver.do('XCW', 'XCW')
      await runAlgorithm(solver)
      return
    }
  }

  await runAlgorithm(solver)
  return
}

async function runAlgorithm(solver: RubiksCubeSolver) {
  await solver.do(
    'rotateFrontCW',
    'rotateTopCW',
    'rotateRightCW',
    'rotateTopCCW',
    'rotateRightCCW',
    'rotateFrontCCW'
  )
}
