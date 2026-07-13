import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveWhiteFaceEdges(solver: RubiksCubeSolver) {
  const backEdge = solver.fetchPosition(2)
  const leftEdge = solver.fetchPosition(4)
  const rightEdge = solver.fetchPosition(6)
  const frontEdge = solver.fetchPosition(8)

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
