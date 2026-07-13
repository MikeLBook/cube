import { cubesShareFace, positionMap } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveFinalEdges(solver: RubiksCubeSolver) {
  const leftEdge = solver.cubeMap.get(positionMap[4])
  const rightEdge = solver.cubeMap.get(positionMap[6])
  const frontEdge = solver.cubeMap.get(positionMap[8])
  const frontRight = solver.cubeMap.get(positionMap[9])
  const backLeft = solver.cubeMap.get(positionMap[1])
  const backRight = solver.cubeMap.get(positionMap[3])
  const frontLeft = solver.cubeMap.get(positionMap[7])

  if (cubesShareFace('left', frontLeft, leftEdge, backLeft)) {
    await solver.do('XCW')
  } else if (cubesShareFace('right', frontRight, rightEdge, backRight)) {
    await solver.do('XCCW')
  } else if (cubesShareFace('front', frontLeft, frontEdge, frontRight)) {
    await solver.do('XCW', 'XCW')
  }

  while (
    solver.cubeMap.get(positionMap[1])?.orientation.back !==
    solver.cubeMap.get(positionMap[11])?.orientation.back
  ) {
    await solver.do('rotateTopCW', 'XCCW')
  }

  if (leftEdge?.orientation.left === solver.cubeMap.get(positionMap[17])?.orientation.front) {
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
