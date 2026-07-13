import { positionMap } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveFinalCorners(solver: RubiksCubeSolver) {
  const frontRight = solver.cubeMap.get(positionMap[9])
  const backLeft = solver.cubeMap.get(positionMap[1])
  const backRight = solver.cubeMap.get(positionMap[3])
  const frontLeft = solver.cubeMap.get(positionMap[7])

  if (frontRight?.orientation.front === frontLeft?.orientation.front) {
    await solver.do('XCW', 'XCW')
    await runAlgorithm(solver)
    return
  }

  if (frontLeft?.orientation.left === backLeft?.orientation.left) {
    await solver.do('XCW')
    await runAlgorithm(solver)
    return
  }

  if (backLeft?.orientation.back === backRight?.orientation.back) {
    await runAlgorithm(solver)
    return
  }

  if (backRight?.orientation.right === frontRight?.orientation.right) {
    await solver.do('XCCW')
    await runAlgorithm(solver)
    return
  }

  while (
    solver.cubeMap.get(positionMap[1])?.orientation.left !==
      solver.cubeMap.get(positionMap[13])?.orientation.left &&
    solver.cubeMap.get(positionMap[1])?.orientation.back !==
      solver.cubeMap.get(positionMap[11])?.orientation.back
  ) {
    await solver.do('XCW')
  }

  await runAlgorithm(solver)
  return
}

async function runAlgorithm(solver: RubiksCubeSolver) {
  await solver.do(
    'rotateRightCCW',
    'rotateFrontCW',
    'rotateRightCCW',
    'rotateBackCCW',
    'rotateBackCCW',
    'rotateRightCW',
    'rotateFrontCCW',
    'rotateRightCCW',
    'rotateBackCCW',
    'rotateBackCCW',
    'rotateRightCW',
    'rotateRightCW'
  )
}
