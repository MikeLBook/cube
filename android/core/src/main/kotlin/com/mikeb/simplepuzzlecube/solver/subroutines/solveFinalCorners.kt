// Port of ../src/solver/subroutines/solveFinalCorners.ts.
package com.mikeb.simplepuzzlecube.solver.subroutines

import com.mikeb.simplepuzzlecube.cubesShareFace
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateBackCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateTopCW
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Rotation.XCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.XCW
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver

suspend fun solveFinalCorners(solver: RubiksCubeSolver) {
    val frontRight = solver.fetchPosition(9)
    val backLeft = solver.fetchPosition(1)
    val backRight = solver.fetchPosition(3)
    val frontLeft = solver.fetchPosition(7)

    if (cubesShareFace(OrientationKey.front, frontRight, frontLeft)) {
        solver.`do`(XCW, XCW)
        runAlgorithm(solver)
        return
    }

    if (cubesShareFace(OrientationKey.left, frontLeft, backLeft)) {
        solver.`do`(XCW)
        runAlgorithm(solver)
        return
    }

    if (cubesShareFace(OrientationKey.back, backLeft, backRight)) {
        runAlgorithm(solver)
        return
    }

    if (cubesShareFace(OrientationKey.right, backRight, frontRight)) {
        solver.`do`(XCCW)
        runAlgorithm(solver)
        return
    }

    while (
        !cubesShareFace(OrientationKey.left, solver.fetchPosition(1), solver.fetchPosition(13)) &&
        !cubesShareFace(OrientationKey.back, solver.fetchPosition(1), solver.fetchPosition(11))
    ) {
        solver.`do`(rotateTopCW, XCCW)
    }

    runAlgorithm(solver)
    return
}

private suspend fun runAlgorithm(solver: RubiksCubeSolver) {
    solver.`do`(
        rotateRightCCW,
        rotateFrontCW,
        rotateRightCCW,
        rotateBackCCW,
        rotateBackCCW,
        rotateRightCW,
        rotateFrontCCW,
        rotateRightCCW,
        rotateBackCCW,
        rotateBackCCW,
        rotateRightCW,
        rotateRightCW
    )
}
