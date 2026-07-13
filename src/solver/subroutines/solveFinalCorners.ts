import { cubesShareFace } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveFinalCorners(solver: RubiksCubeSolver) {
  const frontRight = solver.fetchPosition(9)
  const backLeft = solver.fetchPosition(1)
  const backRight = solver.fetchPosition(3)
  const frontLeft = solver.fetchPosition(7)

  if (cubesShareFace('front', frontRight, frontLeft)) {
    await solver.do('XCW', 'XCW')
    await runAlgorithm(solver)
    return
  }

  if (cubesShareFace('left', frontLeft, backLeft)) {
    await solver.do('XCW')
    await runAlgorithm(solver)
    return
  }

  if (cubesShareFace('back', backLeft, backRight)) {
    await runAlgorithm(solver)
    return
  }

  if (cubesShareFace('right', backRight, frontRight)) {
    await solver.do('XCCW')
    await runAlgorithm(solver)
    return
  }

  while (
    !cubesShareFace('left', solver.fetchPosition(1), solver.fetchPosition(13)) &&
    !cubesShareFace('back', solver.fetchPosition(1), solver.fetchPosition(11))
  ) {
    await solver.do('rotateTopCW', 'XCCW')
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
