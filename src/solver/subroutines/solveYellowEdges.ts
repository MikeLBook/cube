import { positionMap } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveYellowEdges(solver: RubiksCubeSolver) {
  // Solve top facing yellow edge cubes
  const yellowTops = solver.rubiks.cubes.filter(
    (cube) => cube.orientation.top === 'Y' && cube.isEdge
  )

  for (const yellowTop of yellowTops) {
    if (yellowTop.isInLeftLayer) {
      await solver.do('XCCW')
    } else if (yellowTop.isInBackLayer) {
      await solver.do('XCCW', 'XCCW')
    } else if (yellowTop.isInRightLayer) {
      await solver.do('XCW')
    }

    if (solver.cubeMap.get(positionMap[17])?.orientation.front !== yellowTop.orientation.front) {
      await solver.do('rotateFrontCW', 'rotateFrontCW')

      do {
        await solver.do('rotateBottomCW', 'XCCW')
      } while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !== yellowTop.orientation.front
      )

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

    while (
      solver.cubeMap.get(positionMap[17])?.orientation.front !== yellowBottom.orientation.front
    ) {
      await solver.do('rotateBottomCW', 'XCCW')
    }

    await solver.do('rotateFrontCW', 'rotateFrontCW')
    return
  }

  // Solve outward facing yellow edge cubes (one at a time)
  const yellowEdge = solver.rubiks.cubes.find(
    (cube) =>
      cube.isEdge &&
      cube.hasFace('Y') &&
      cube.orientation.top !== 'Y' &&
      cube.orientation.bottom !== 'Y'
  )

  if (yellowEdge) {
    if (yellowEdge.orientation.left === 'Y') {
      await solver.do('XCCW')
    } else if (yellowEdge.orientation.back === 'Y') {
      await solver.do('XCCW', 'XCCW')
    } else if (yellowEdge.orientation.right === 'Y') {
      await solver.do('XCW')
    }

    if (yellowEdge.isInBottomLayer) {
      while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !== yellowEdge.orientation.bottom
      ) {
        await solver.do('rotateBottomCW', 'XCCW')
      }
      await solver.do('rotateBottomCW', 'rotateYMidCCW', 'rotateBottomCCW', 'rotateYMidCW')
    } else if (yellowEdge.isInLeftLayer) {
      await solver.do('rotateLeftCCW', 'rotateBottomCCW', 'rotateLeftCW')
      while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !== yellowEdge.orientation.front
      ) {
        await solver.do('rotateBottomCW', 'XCCW')
      }
      await solver.do('rotateFrontCW', 'rotateFrontCW')
    } else if (yellowEdge.isInRightLayer) {
      await solver.do('rotateRightCCW', 'rotateBottomCW', 'rotateRightCW')
      while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !== yellowEdge.orientation.front
      ) {
        await solver.do('rotateBottomCW', 'XCCW')
      }
      await solver.do('rotateFrontCW', 'rotateFrontCW')
    } else if (yellowEdge.isInTopLayer) {
      await solver.do('rotateFrontCW', 'rotateFrontCW')
      while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !== yellowEdge.orientation.bottom
      ) {
        await solver.do('rotateBottomCW', 'XCCW')
      }
      await solver.do('rotateBottomCW', 'rotateYMidCCW', 'rotateBottomCCW', 'rotateYMidCW')
    }
    return
  }
  debugger
  console.error('not sure how I got to the end of solveYellowEdges with no operation to perform')
  return
}
