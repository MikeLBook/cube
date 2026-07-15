// Port of ../src/solver/subroutines/solveWhiteFaceEdges.ts.
package com.mikeb.simplepuzzlecube.solver.subroutines

import com.mikeb.simplepuzzlecube.engine.Face
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateTopCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateTopCW
import com.mikeb.simplepuzzlecube.engine.Rotation.XCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.XCW
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver

suspend fun solveWhiteFaceEdges(solver: RubiksCubeSolver) {
    val backEdge = solver.fetchPosition(2)
    val leftEdge = solver.fetchPosition(4)
    val rightEdge = solver.fetchPosition(6)
    val frontEdge = solver.fetchPosition(8)

    if (backEdge?.orientation?.top == Face.W) {
        if (leftEdge?.orientation?.top == Face.W) {
            runAlgorithm(solver)
            return
        }
        if (rightEdge?.orientation?.top == Face.W) {
            solver.`do`(XCCW)
            runAlgorithm(solver)
            return
        }
    }

    if (frontEdge?.orientation?.top == Face.W) {
        if (leftEdge?.orientation?.top == Face.W) {
            solver.`do`(XCW)
            runAlgorithm(solver)
            return
        }
        if (rightEdge?.orientation?.top == Face.W) {
            solver.`do`(XCW, XCW)
            runAlgorithm(solver)
            return
        }
    }

    runAlgorithm(solver)
    return
}

private suspend fun runAlgorithm(solver: RubiksCubeSolver) {
    solver.`do`(
        rotateFrontCW,
        rotateTopCW,
        rotateRightCW,
        rotateTopCCW,
        rotateRightCCW,
        rotateFrontCCW
    )
}
