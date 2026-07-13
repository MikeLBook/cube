import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveWhiteFaceCorners(solver: RubiksCubeSolver) {
  if (
    solver.rubiks.cubes
      .filter((cube) => cube.isCorner && cube.isInTopLayer)
      .every((corner) => corner?.orientation.top !== 'W')
  ) {
    await runAlgorithm(solver)
    return
  }

  while (solver.fetchPosition(7)?.orientation.top !== 'W') {
    await solver.do('XCW')
  }

  const frontRight = solver.fetchPosition(9)
  const backLeft = solver.fetchPosition(1)
  const backRight = solver.fetchPosition(3)

  if (
    frontRight?.orientation.top === 'W' &&
    backLeft?.orientation.back === 'W' &&
    backRight?.orientation.back === 'W'
  ) {
    await runInverseAlgorithm(solver)
    return
  }

  if (
    frontRight?.orientation.top === 'W' &&
    backLeft?.orientation.back !== 'W' &&
    backRight?.orientation.back !== 'W'
  ) {
    await runSidewaysAlgorithm(solver)
    return
  }

  await runAlgorithm(solver)
  return
}

async function runAlgorithm(solver: RubiksCubeSolver) {
  await solver.do(
    'rotateRightCW',
    'rotateTopCW',
    'rotateRightCCW',
    'rotateTopCW',
    'rotateRightCW',
    'rotateTopCW',
    'rotateTopCW',
    'rotateRightCCW'
  )
}

async function runInverseAlgorithm(solver: RubiksCubeSolver) {
  await solver.do(
    'rotateLeftCCW',
    'rotateTopCW',
    'rotateLeftCW',
    'rotateTopCW',
    'rotateLeftCCW',
    'rotateTopCW',
    'rotateTopCW',
    'rotateLeftCW'
  )
}

async function runSidewaysAlgorithm(solver: RubiksCubeSolver) {
  await solver.do(
    'rotateFrontCW',
    'rotateTopCW',
    'rotateFrontCCW',
    'rotateTopCW',
    'rotateFrontCW',
    'rotateTopCW',
    'rotateTopCW',
    'rotateFrontCCW'
  )
}
