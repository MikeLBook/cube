// Port of ../src/solver/subroutines/solveFinalEdges.ts.
package com.mikeb.simplepuzzlecube.solver.subroutines

import com.mikeb.simplepuzzlecube.cubesShareFace
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateLeftCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateLeftCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateTopCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateTopCW
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Rotation.XCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.XCW
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver

suspend fun solveFinalEdges(solver: RubiksCubeSolver) {
    val leftEdge = solver.fetchPosition(4)
    val rightEdge = solver.fetchPosition(6)
    val frontEdge = solver.fetchPosition(8)
    val frontRight = solver.fetchPosition(9)
    val backLeft = solver.fetchPosition(1)
    val backRight = solver.fetchPosition(3)
    val frontLeft = solver.fetchPosition(7)

    if (cubesShareFace(OrientationKey.left, frontLeft, leftEdge, backLeft)) {
        solver.`do`(XCW)
    } else if (cubesShareFace(OrientationKey.right, frontRight, rightEdge, backRight)) {
        solver.`do`(XCCW)
    } else if (cubesShareFace(OrientationKey.front, frontLeft, frontEdge, frontRight)) {
        solver.`do`(XCW, XCW)
    }

    while (solver.fetchPosition(1)?.orientation?.back != solver.fetchPosition(11)?.orientation?.back) {
        solver.`do`(rotateTopCW, XCCW)
    }

    if (leftEdge?.orientation?.left == solver.fetchPosition(17)?.orientation?.front) {
        runAlgorithmLR(solver)
        return
    } else {
        runAlgorithmRL(solver)
        return
    }
}

private suspend fun runAlgorithmLR(solver: RubiksCubeSolver) {
    solver.`do`(
        rotateFrontCW,
        rotateFrontCW,
        rotateTopCCW,
        rotateLeftCCW,
        rotateRightCCW,
        rotateFrontCW,
        rotateFrontCW,
        rotateLeftCW,
        rotateRightCW,
        rotateTopCCW,
        rotateFrontCW,
        rotateFrontCW
    )
}

private suspend fun runAlgorithmRL(solver: RubiksCubeSolver) {
    solver.`do`(
        rotateFrontCW,
        rotateFrontCW,
        rotateTopCW,
        rotateLeftCCW,
        rotateRightCCW,
        rotateFrontCW,
        rotateFrontCW,
        rotateLeftCW,
        rotateRightCW,
        rotateTopCW,
        rotateFrontCW,
        rotateFrontCW
    )
}
