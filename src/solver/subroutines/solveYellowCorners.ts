import { cubesShareFace } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveYellowCorners(solver: RubiksCubeSolver) {
  /////////////////////////////////
  // Solve yellow top corner cubes
  /////////////////////////////////
  const backLeft = solver.fetchPosition(1)
  const backEdge = solver.fetchPosition(2)
  const leftEdge = solver.fetchPosition(4)
  if (
    backLeft?.hasFace('Y') &&
    !(
      backLeft?.orientation.top === 'Y' &&
      cubesShareFace('left', backLeft, leftEdge) &&
      cubesShareFace('back', backLeft, backEdge)
    )
  ) {
    await solver.do('XCCW')
    await solveFrontLeftCorner(solver)
    return
  }

  const backRight = solver.fetchPosition(3)
  const rightEdge = solver.fetchPosition(6)
  if (
    backRight?.hasFace('Y') &&
    !(
      backRight?.orientation.top === 'Y' &&
      cubesShareFace('right', backRight, rightEdge) &&
      cubesShareFace('back', backRight, backEdge)
    )
  ) {
    await solver.do('XCW')
    await solveFrontRightCorner(solver)
    return
  }

  const frontLeft = solver.fetchPosition(7)
  const frontEdge = solver.fetchPosition(8)
  if (
    frontLeft?.hasFace('Y') &&
    !(
      frontLeft?.orientation.top === 'Y' &&
      cubesShareFace('left', frontLeft, leftEdge) &&
      cubesShareFace('front', frontLeft, frontEdge)
    )
  ) {
    await solveFrontLeftCorner(solver)
    return
  }

  const frontRight = solver.fetchPosition(9)
  if (
    frontRight?.hasFace('Y') &&
    !(
      frontRight?.orientation.top === 'Y' &&
      cubesShareFace('right', frontRight, rightEdge) &&
      cubesShareFace('front', frontRight, frontEdge)
    )
  ) {
    await solveFrontRightCorner(solver)
    return
  }

  ////////////////////////////////////
  // Solve yellow bottom corner cubes
  ////////////////////////////////////
  const bottomBackLeft = solver.fetchPosition(19)
  if (bottomBackLeft?.hasFace('Y')) {
    if (bottomBackLeft.orientation.bottom === 'Y') {
      await solver.do('XCCW')
      await solveBottomLeftFaceDown(solver)
    } else if (bottomBackLeft.orientation.left === 'Y') {
      await solver.do('rotateBottomCCW')
      await solveBottomLeft(solver)
    } else {
      await solver.do('rotateBottomCCW', 'rotateBottomCCW')
      await solveBottomRight(solver)
    }
    return
  }

  const bottomBackRight = solver.fetchPosition(21)
  if (bottomBackRight?.hasFace('Y')) {
    if (bottomBackRight.orientation.bottom === 'Y') {
      await solver.do('XCW')
      await solveBottomRightFaceDown(solver)
    } else if (bottomBackRight.orientation.right === 'Y') {
      await solver.do('rotateBottomCW')
      await solveBottomRight(solver)
    } else {
      await solver.do('rotateBottomCW', 'rotateBottomCW')
      await solveBottomLeft(solver)
    }
    return
  }

  const bottomFrontLeft = solver.fetchPosition(25)
  if (bottomFrontLeft?.hasFace('Y')) {
    if (bottomFrontLeft.orientation.bottom === 'Y') {
      await solveBottomLeftFaceDown(solver)
    } else if (bottomFrontLeft.orientation.left === 'Y') {
      await solver.do('rotateBottomCCW')
      await solveBottomRight(solver)
    } else {
      await solveBottomLeft(solver)
    }
    return
  }

  const bottomFrontRight = solver.fetchPosition(27)
  if (bottomFrontRight?.hasFace('Y')) {
    if (bottomFrontRight.orientation.bottom === 'Y') {
      await solveBottomRightFaceDown(solver)
    } else if (bottomFrontRight.orientation.right === 'Y') {
      await solver.do('rotateBottomCW')
      await solveBottomLeft(solver)
    } else {
      await solveBottomRight(solver)
    }
    return
  }
}

////////////////////////////////////
// Solve for specific cubes
////////////////////////////////////
async function solveFrontRightCorner(solver: RubiksCubeSolver) {
  const unsolvedCube = solver.fetchPosition(9)
  if (unsolvedCube?.orientation.front === 'Y') {
    await solver.do('rotateFrontCW', 'rotateBottomCCW', 'rotateFrontCCW', 'XCW')
    await solveBottomRight(solver)
  } else if (unsolvedCube?.orientation.top === 'Y') {
    await solver.do('rotateRightCCW', 'rotateBottomCW', 'rotateRightCW', 'XCCW')
    await solveBottomRight(solver)
  } else {
    await solver.do('rotateRightCCW', 'rotateBottomCW', 'rotateRightCW')
    await solveBottomLeft(solver)
  }
  return
}

async function solveFrontLeftCorner(solver: RubiksCubeSolver) {
  const unsolvedCube = solver.fetchPosition(7)
  if (unsolvedCube?.orientation.front === 'Y') {
    await solver.do('rotateFrontCCW', 'rotateBottomCW', 'rotateFrontCW', 'XCCW')
    await solveBottomLeft(solver)
  } else if (unsolvedCube?.orientation.top === 'Y') {
    await solver.do('rotateLeftCCW', 'rotateBottomCCW', 'rotateLeftCW', 'XCW')
    await solveBottomLeft(solver)
  } else {
    await solver.do('rotateLeftCCW', 'rotateBottomCCW', 'rotateLeftCW')
    await solveBottomRight(solver)
  }
  return
}

async function solveBottomLeftFaceDown(solver: RubiksCubeSolver) {
  let unsolvedWorkingCube = false
  do {
    const topLeftCorner = solver.fetchPosition(7)
    const topLeftEdge = solver.fetchPosition(4)
    const topFrontEdge = solver.fetchPosition(8)
    if (
      topLeftCorner?.orientation.top !== 'Y' ||
      !cubesShareFace('left', topLeftCorner, topLeftEdge) ||
      !cubesShareFace('front', topLeftCorner, topFrontEdge)
    ) {
      unsolvedWorkingCube = true
    } else {
      await solver.do('rotateBottomCW', 'XCCW')
    }
  } while (!unsolvedWorkingCube)

  await solver.do(
    'rotateBottomCCW',
    'rotateLeftCCW',
    'rotateBottomCW',
    'rotateLeftCW',
    'rotateFrontCCW',
    'rotateBottomCW',
    'rotateFrontCW',
    'rotateBottomCCW'
  )
  await solveBottomLeft(solver)
  return
}

async function solveBottomRightFaceDown(solver: RubiksCubeSolver) {
  let unsolvedWorkingCube = false
  do {
    const topRightCorner = solver.fetchPosition(9)
    const topRightEdge = solver.fetchPosition(6)
    const topFrontEdge = solver.fetchPosition(8)
    if (
      topRightCorner?.orientation.top !== 'Y' ||
      !cubesShareFace('right', topRightCorner, topRightEdge) ||
      !cubesShareFace('front', topRightCorner, topFrontEdge)
    ) {
      unsolvedWorkingCube = true
    } else {
      await solver.do('rotateBottomCCW', 'XCW')
    }
  } while (!unsolvedWorkingCube)

  await solver.do(
    'rotateBottomCW',
    'rotateRightCCW',
    'rotateBottomCCW',
    'rotateRightCW',
    'rotateFrontCW',
    'rotateBottomCCW',
    'rotateFrontCCW',
    'rotateBottomCW'
  )
  await solveBottomRight(solver)
  return
}

async function solveBottomLeft(solver: RubiksCubeSolver) {
  const cube = solver.fetchPosition(25)
  while (!cubesShareFace('left', cube, solver.fetchPosition(13))) {
    await solver.do('rotateBottomCW', 'XCCW')
  }
  await solver.do('rotateBottomCCW', 'rotateLeftCCW', 'rotateBottomCW', 'rotateLeftCW')
  return
}

async function solveBottomRight(solver: RubiksCubeSolver) {
  const cube = solver.fetchPosition(27)
  while (!cubesShareFace('right', cube, solver.fetchPosition(15))) {
    await solver.do('rotateBottomCCW', 'XCW')
  }
  await solver.do('rotateBottomCW', 'rotateRightCCW', 'rotateBottomCCW', 'rotateRightCW')
  return
}
