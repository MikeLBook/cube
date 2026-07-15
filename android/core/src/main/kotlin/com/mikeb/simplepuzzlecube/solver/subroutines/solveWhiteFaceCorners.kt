// Port of ../src/solver/subroutines/solveWhiteFaceCorners.ts.
package com.mikeb.simplepuzzlecube.solver.subroutines

import com.mikeb.simplepuzzlecube.engine.Face
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateLeftCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateLeftCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateTopCW
import com.mikeb.simplepuzzlecube.engine.Rotation.XCW
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver

suspend fun solveWhiteFaceCorners(solver: RubiksCubeSolver) {
    if (
        solver.rubiks.cubes
            .filter { cube -> cube.isCorner && cube.isInTopLayer }
            .all { corner -> corner.orientation.top != Face.W }
    ) {
        runAlgorithm(solver)
        return
    }

    while (solver.fetchPosition(7)?.orientation?.top != Face.W) {
        solver.`do`(XCW)
    }

    val frontRight = solver.fetchPosition(9)
    val backLeft = solver.fetchPosition(1)
    val backRight = solver.fetchPosition(3)

    if (
        frontRight?.orientation?.top == Face.W &&
        backLeft?.orientation?.back == Face.W &&
        backRight?.orientation?.back == Face.W
    ) {
        runInverseAlgorithm(solver)
        return
    }

    if (
        frontRight?.orientation?.top == Face.W &&
        backLeft?.orientation?.back != Face.W &&
        backRight?.orientation?.back != Face.W
    ) {
        runSidewaysAlgorithm(solver)
        return
    }

    runAlgorithm(solver)
    return
}

private suspend fun runAlgorithm(solver: RubiksCubeSolver) {
    solver.`do`(
        rotateRightCW,
        rotateTopCW,
        rotateRightCCW,
        rotateTopCW,
        rotateRightCW,
        rotateTopCW,
        rotateTopCW,
        rotateRightCCW
    )
}

private suspend fun runInverseAlgorithm(solver: RubiksCubeSolver) {
    solver.`do`(
        rotateLeftCCW,
        rotateTopCW,
        rotateLeftCW,
        rotateTopCW,
        rotateLeftCCW,
        rotateTopCW,
        rotateTopCW,
        rotateLeftCW
    )
}

private suspend fun runSidewaysAlgorithm(solver: RubiksCubeSolver) {
    solver.`do`(
        rotateFrontCW,
        rotateTopCW,
        rotateFrontCCW,
        rotateTopCW,
        rotateFrontCW,
        rotateTopCW,
        rotateTopCW,
        rotateFrontCCW
    )
}
