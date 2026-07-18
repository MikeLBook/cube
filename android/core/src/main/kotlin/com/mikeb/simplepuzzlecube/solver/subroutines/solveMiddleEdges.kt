// Port of ../src/solver/subroutines/solveMiddleEdges.ts.
package com.mikeb.simplepuzzlecube.solver.subroutines

import com.mikeb.simplepuzzlecube.cubesShareFace
import com.mikeb.simplepuzzlecube.engine.Cube
import com.mikeb.simplepuzzlecube.engine.Face
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateBottomCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateBottomCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateLeftCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateLeftCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCW
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Rotation.XCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.XCW
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver

suspend fun solveMiddleEdges(solver: RubiksCubeSolver) {
    val bottomEdge = solver.rubiks.cubes.find { cube ->
        cube.isInBottomLayer && !cube.hasFace(Face.W)
    }

    if (bottomEdge != null) {
        solveBottomEdge(solver, bottomEdge)
        return
    }

    val unsolvedMiddleEdge = solver.rubiks.cubes
        .filter { cube -> cube.isInXMidLayer }
        .find { cube ->
            (cube.orientation.front != null && !cubesShareFace(OrientationKey.front, cube, solver.fetchPosition(17))) ||
                (cube.orientation.left != null && !cubesShareFace(OrientationKey.left, cube, solver.fetchPosition(13))) ||
                (cube.orientation.back != null && !cubesShareFace(OrientationKey.back, cube, solver.fetchPosition(11))) ||
                (cube.orientation.right != null && !cubesShareFace(OrientationKey.right, cube, solver.fetchPosition(15)))
        }!!

    if (unsolvedMiddleEdge.isInLeftLayer) {
        if (unsolvedMiddleEdge.isInBackLayer) {
            solver.`do`(XCCW)
        }
        solver.`do`(
            rotateBottomCCW,
            rotateLeftCCW,
            rotateBottomCW,
            rotateLeftCW,
            rotateBottomCW,
            rotateFrontCCW,
            rotateBottomCCW,
            rotateFrontCW
        )
    }
    if (unsolvedMiddleEdge.isInRightLayer) {
        if (unsolvedMiddleEdge.isInBackLayer) {
            solver.`do`(XCW)
        }
        solver.`do`(
            rotateBottomCW,
            rotateRightCCW,
            rotateBottomCCW,
            rotateRightCW,
            rotateBottomCCW,
            rotateFrontCW,
            rotateBottomCW,
            rotateFrontCCW
        )
    }

    solveBottomEdge(solver, unsolvedMiddleEdge)
    return
}

private suspend fun solveBottomEdge(solver: RubiksCubeSolver, bottomEdge: Cube) {
    if (bottomEdge.isInBackLayer) {
        solver.`do`(XCCW, XCCW)
    } else if (bottomEdge.isInLeftLayer) {
        solver.`do`(XCCW)
    } else if (bottomEdge.isInRightLayer) {
        solver.`do`(XCW)
    }

    while (!cubesShareFace(OrientationKey.front, bottomEdge, solver.fetchPosition(17))) {
        solver.`do`(rotateBottomCW, XCCW)
    }

    if (bottomEdge.orientation.bottom == solver.fetchPosition(13)?.orientation?.left) {
        solver.`do`(
            rotateBottomCCW,
            rotateLeftCCW,
            rotateBottomCW,
            rotateLeftCW,
            rotateBottomCW,
            rotateFrontCCW,
            rotateBottomCCW,
            rotateFrontCW
        )
    } else {
        solver.`do`(
            rotateBottomCW,
            rotateRightCCW,
            rotateBottomCCW,
            rotateRightCW,
            rotateBottomCCW,
            rotateFrontCW,
            rotateBottomCW,
            rotateFrontCCW
        )
    }
    return
}
