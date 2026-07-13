import { cubesShareFace } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveFinalEdges(solver: RubiksCubeSolver) {
  const leftEdge = solver.fetchPosition(4)
  const rightEdge = solver.fetchPosition(6)
  const frontEdge = solver.fetchPosition(8)
  const frontRight = solver.fetchPosition(9)
  const backLeft = solver.fetchPosition(1)
  const backRight = solver.fetchPosition(3)
  const frontLeft = solver.fetchPosition(7)

  if (cubesShareFace('left', frontLeft, leftEdge, backLeft)) {
    await solver.do('XCW')
  } else if (cubesShareFace('right', frontRight, rightEdge, backRight)) {
    await solver.do('XCCW')
  } else if (cubesShareFace('front', frontLeft, frontEdge, frontRight)) {
    await solver.do('XCW', 'XCW')
  }

  while (solver.fetchPosition(1)?.orientation.back !== solver.fetchPosition(11)?.orientation.back) {
    await solver.do('rotateTopCW', 'XCCW')
  }

  if (leftEdge?.orientation.left === solver.fetchPosition(17)?.orientation.front) {
    await runAlgorithmLR(solver)
    return
  } else {
    await runAlgorithmRL(solver)
    return
  }
}

async function runAlgorithmLR(solver: RubiksCubeSolver) {
  await solver.do(
    'rotateFrontCW',
    'rotateFrontCW',
    'rotateTopCCW',
    'rotateLeftCCW',
    'rotateRightCCW',
    'rotateFrontCW',
    'rotateFrontCW',
    'rotateLeftCW',
    'rotateRightCW',
    'rotateTopCCW',
    'rotateFrontCW',
    'rotateFrontCW'
  )
}

async function runAlgorithmRL(solver: RubiksCubeSolver) {
  await solver.do(
    'rotateFrontCW',
    'rotateFrontCW',
    'rotateTopCW',
    'rotateLeftCCW',
    'rotateRightCCW',
    'rotateFrontCW',
    'rotateFrontCW',
    'rotateLeftCW',
    'rotateRightCW',
    'rotateTopCW',
    'rotateFrontCW',
    'rotateFrontCW'
  )
}
