import Cube from '../../engine/Cube'
import { cubesShareFace } from '../../utils'
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
        (cube.orientation.front && !cubesShareFace('front', cube, solver.fetchPosition(17))) ||
        (cube.orientation.left && !cubesShareFace('left', cube, solver.fetchPosition(13))) ||
        (cube.orientation.back && !cubesShareFace('back', cube, solver.fetchPosition(11))) ||
        (cube.orientation.right && !cubesShareFace('right', cube, solver.fetchPosition(15)))
      )
    })!

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

  while (!cubesShareFace('front', bottomEdge, solver.fetchPosition(17))) {
    await solver.do('rotateBottomCW', 'XCCW')
  }

  if (bottomEdge.orientation.bottom === solver.fetchPosition(13)?.orientation.left) {
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
