import { cubesShareFace } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveYellowEdges(solver: RubiksCubeSolver) {
  // Solve top facing yellow edge cubes
  const yellowTops = solver.rubiks.cubes.filter(
    (cube) => cube.orientation.top === 'Y' && cube.isEdge
  )

  for (const yellowTop of yellowTops) {
    let solved = true
    if (yellowTop.isInLeftLayer && !cubesShareFace('left', solver.fetchPosition(13), yellowTop)) {
      await solver.do('XCCW')
      solved = false
    } else if (
      yellowTop.isInBackLayer &&
      !cubesShareFace('back', solver.fetchPosition(11), yellowTop)
    ) {
      await solver.do('XCCW', 'XCCW')
      solved = false
    } else if (
      yellowTop.isInRightLayer &&
      !cubesShareFace('right', solver.fetchPosition(15), yellowTop)
    ) {
      await solver.do('XCW')
      solved = false
    }

    if (!solved) {
      await solver.do('rotateFrontCW', 'rotateFrontCW')
      do {
        await solver.do('rotateBottomCW', 'XCCW')
      } while (!cubesShareFace('front', solver.fetchPosition(17), yellowTop))
      await solver.do('rotateFrontCW', 'rotateFrontCW')
      return
    }
  }

  // Solve bottom facing yellow edge cubes
  const yellowBottoms = solver.rubiks.cubes.filter(
    (cube) => cube.orientation.bottom === 'Y' && cube.isEdge
  )

  for (const yellowBottom of yellowBottoms) {
    if (yellowBottom.isInLeftLayer) {
      await solver.do('XCCW')
    } else if (yellowBottom.isInBackLayer) {
      await solver.do('XCCW', 'XCCW')
    } else if (yellowBottom.isInRightLayer) {
      await solver.do('XCW')
    }

    while (!cubesShareFace('front', solver.fetchPosition(17), yellowBottom)) {
      await solver.do('rotateBottomCW', 'XCCW')
    }

    await solver.do('rotateFrontCW', 'rotateFrontCW')
    return
  }

  const yellowEdge = solver.rubiks.cubes.find(
    (cube) =>
      cube.isEdge &&
      cube.hasFace('Y') &&
      cube.orientation.top !== 'Y' &&
      cube.orientation.bottom !== 'Y'
  )!

  if (yellowEdge.orientation.left === 'Y') {
    await solver.do('XCCW')
  } else if (yellowEdge.orientation.back === 'Y') {
    await solver.do('XCCW', 'XCCW')
  } else if (yellowEdge.orientation.right === 'Y') {
    await solver.do('XCW')
  }

  if (yellowEdge.isInBottomLayer) {
    while (solver.fetchPosition(17)?.orientation.front !== yellowEdge.orientation.bottom) {
      await solver.do('rotateBottomCW', 'XCCW')
    }
    await solver.do('rotateBottomCW', 'rotateYMidCCW', 'rotateBottomCCW', 'rotateYMidCW')
  } else if (yellowEdge.isInLeftLayer) {
    await solver.do('rotateLeftCCW', 'rotateBottomCCW', 'rotateLeftCW')
    while (!cubesShareFace('front', solver.fetchPosition(17), yellowEdge)) {
      await solver.do('rotateBottomCW', 'XCCW')
    }
    await solver.do('rotateFrontCW', 'rotateFrontCW')
  } else if (yellowEdge.isInRightLayer) {
    await solver.do('rotateRightCCW', 'rotateBottomCW', 'rotateRightCW')
    while (!cubesShareFace('front', solver.fetchPosition(17), yellowEdge)) {
      await solver.do('rotateBottomCW', 'XCCW')
    }
    await solver.do('rotateFrontCW', 'rotateFrontCW')
  } else if (yellowEdge.isInTopLayer) {
    await solver.do('rotateFrontCW', 'rotateFrontCW')
    while (solver.fetchPosition(17)?.orientation.front !== yellowEdge.orientation.bottom) {
      await solver.do('rotateBottomCW', 'XCCW')
    }
    await solver.do('rotateBottomCW', 'rotateYMidCCW', 'rotateBottomCCW', 'rotateYMidCW')
  }
  return
}
