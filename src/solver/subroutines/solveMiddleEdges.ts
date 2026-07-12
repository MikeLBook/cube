import Cube from '../../engine/Cube'
import { positionMap } from '../../utils'
import RubiksCubeSolver from '../RubiksCubeSolver'

export default async function solveMiddleEdges(solver: RubiksCubeSolver) {
  const bottomEdge = solver.rubiks.cubes.find((cube) => cube.isInBottomLayer && !cube.hasFace('W'))

  if (bottomEdge) {
    await solveBottomEdge(solver, bottomEdge)
    return
  }

  const unsolvedMiddleEdge = solver.rubiks.cubes
    .filter((cube) => cube.isInXMidLayer)
    .find((cube) => {
      return (
        (cube.orientation.front &&
          cube.orientation.front !== solver.cubeMap.get(positionMap[17])?.orientation.front) ||
        (cube.orientation.left &&
          cube.orientation.left !== solver.cubeMap.get(positionMap[13])?.orientation.left) ||
        (cube.orientation.back &&
          cube.orientation.back !== solver.cubeMap.get(positionMap[11])?.orientation.back) ||
        (cube.orientation.right &&
          cube.orientation.right !== solver.cubeMap.get(positionMap[15])?.orientation.right)
      )
    })

  if (!unsolvedMiddleEdge) {
    console.error('How did we get here?')
    return
  }

  if (unsolvedMiddleEdge.isInLeftLayer) {
    if (unsolvedMiddleEdge.isInBackLayer) {
      await solver.do('XCCW')
    }
    await solver.do(
      'rotateBottomCCW',
      'rotateLeftCCW',
      'rotateBottomCW',
      'rotateLeftCW',
      'rotateBottomCW',
      'rotateFrontCCW',
      'rotateBottomCCW',
      'rotateFrontCW'
    )
  }
  if (unsolvedMiddleEdge.isInRightLayer) {
    if (unsolvedMiddleEdge.isInBackLayer) {
      await solver.do('XCW')
    }
    await solver.do(
      'rotateBottomCW',
      'rotateRightCCW',
      'rotateBottomCCW',
      'rotateRightCW',
      'rotateBottomCCW',
      'rotateFrontCW',
      'rotateBottomCW',
      'rotateFrontCCW'
    )
  }

  await solveBottomEdge(solver, unsolvedMiddleEdge)
  return
}

async function solveBottomEdge(solver: RubiksCubeSolver, bottomEdge: Cube) {
  if (bottomEdge.isInBackLayer) {
    await solver.do('XCCW', 'XCCW')
  } else if (bottomEdge.isInLeftLayer) {
    await solver.do('XCCW')
  } else if (bottomEdge.isInRightLayer) {
    await solver.do('XCW')
  }

  while (bottomEdge.orientation.front !== solver.cubeMap.get(positionMap[17])?.orientation.front) {
    await solver.do('rotateBottomCW', 'XCCW')
  }

  if (bottomEdge.orientation.bottom === solver.cubeMap.get(positionMap[13])?.orientation.left) {
    await solver.do(
      'rotateBottomCCW',
      'rotateLeftCCW',
      'rotateBottomCW',
      'rotateLeftCW',
      'rotateBottomCW',
      'rotateFrontCCW',
      'rotateBottomCCW',
      'rotateFrontCW'
    )
  } else {
    await solver.do(
      'rotateBottomCW',
      'rotateRightCCW',
      'rotateBottomCCW',
      'rotateRightCW',
      'rotateBottomCCW',
      'rotateFrontCW',
      'rotateBottomCW',
      'rotateFrontCCW'
    )
  }
  return
}
