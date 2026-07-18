// Port of ../src/solver/subroutines/solveYellowCorners.ts.
package com.mikeb.simplepuzzlecube.solver.subroutines

import com.mikeb.simplepuzzlecube.cubesShareFace
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

suspend fun solveYellowCorners(solver: RubiksCubeSolver) {
    /////////////////////////////////
    // Solve yellow top corner cubes
    /////////////////////////////////
    val backLeft = solver.fetchPosition(1)
    val backEdge = solver.fetchPosition(2)
    val leftEdge = solver.fetchPosition(4)
    if (
        backLeft?.hasFace(Face.Y) == true &&
        !(
            backLeft.orientation.top == Face.Y &&
                cubesShareFace(OrientationKey.left, backLeft, leftEdge) &&
                cubesShareFace(OrientationKey.back, backLeft, backEdge)
            )
    ) {
        solver.`do`(XCCW)
        solveFrontLeftCorner(solver)
        return
    }

    val backRight = solver.fetchPosition(3)
    val rightEdge = solver.fetchPosition(6)
    if (
        backRight?.hasFace(Face.Y) == true &&
        !(
            backRight.orientation.top == Face.Y &&
                cubesShareFace(OrientationKey.right, backRight, rightEdge) &&
                cubesShareFace(OrientationKey.back, backRight, backEdge)
            )
    ) {
        solver.`do`(XCW)
        solveFrontRightCorner(solver)
        return
    }

    val frontLeft = solver.fetchPosition(7)
    val frontEdge = solver.fetchPosition(8)
    if (
        frontLeft?.hasFace(Face.Y) == true &&
        !(
            frontLeft.orientation.top == Face.Y &&
                cubesShareFace(OrientationKey.left, frontLeft, leftEdge) &&
                cubesShareFace(OrientationKey.front, frontLeft, frontEdge)
            )
    ) {
        solveFrontLeftCorner(solver)
        return
    }

    val frontRight = solver.fetchPosition(9)
    if (
        frontRight?.hasFace(Face.Y) == true &&
        !(
            frontRight.orientation.top == Face.Y &&
                cubesShareFace(OrientationKey.right, frontRight, rightEdge) &&
                cubesShareFace(OrientationKey.front, frontRight, frontEdge)
            )
    ) {
        solveFrontRightCorner(solver)
        return
    }

    ////////////////////////////////////
    // Solve yellow bottom corner cubes
    ////////////////////////////////////
    val bottomBackLeft = solver.fetchPosition(19)
    if (bottomBackLeft?.hasFace(Face.Y) == true) {
        if (bottomBackLeft.orientation.bottom == Face.Y) {
            solver.`do`(XCCW)
            solveBottomLeftFaceDown(solver)
        } else if (bottomBackLeft.orientation.left == Face.Y) {
            solver.`do`(rotateBottomCCW)
            solveBottomLeft(solver)
        } else {
            solver.`do`(rotateBottomCCW, rotateBottomCCW)
            solveBottomRight(solver)
        }
        return
    }

    val bottomBackRight = solver.fetchPosition(21)
    if (bottomBackRight?.hasFace(Face.Y) == true) {
        if (bottomBackRight.orientation.bottom == Face.Y) {
            solver.`do`(XCW)
            solveBottomRightFaceDown(solver)
        } else if (bottomBackRight.orientation.right == Face.Y) {
            solver.`do`(rotateBottomCW)
            solveBottomRight(solver)
        } else {
            solver.`do`(rotateBottomCW, rotateBottomCW)
            solveBottomLeft(solver)
        }
        return
    }

    val bottomFrontLeft = solver.fetchPosition(25)
    if (bottomFrontLeft?.hasFace(Face.Y) == true) {
        if (bottomFrontLeft.orientation.bottom == Face.Y) {
            solveBottomLeftFaceDown(solver)
        } else if (bottomFrontLeft.orientation.left == Face.Y) {
            solver.`do`(rotateBottomCCW)
            solveBottomRight(solver)
        } else {
            solveBottomLeft(solver)
        }
        return
    }

    val bottomFrontRight = solver.fetchPosition(27)
    if (bottomFrontRight?.hasFace(Face.Y) == true) {
        if (bottomFrontRight.orientation.bottom == Face.Y) {
            solveBottomRightFaceDown(solver)
        } else if (bottomFrontRight.orientation.right == Face.Y) {
            solver.`do`(rotateBottomCW)
            solveBottomLeft(solver)
        } else {
            solveBottomRight(solver)
        }
        return
    }
}

////////////////////////////////////
// Solve for specific cubes
////////////////////////////////////
private suspend fun solveFrontRightCorner(solver: RubiksCubeSolver) {
    val unsolvedCube = solver.fetchPosition(9)
    if (unsolvedCube?.orientation?.front == Face.Y) {
        solver.`do`(rotateFrontCW, rotateBottomCCW, rotateFrontCCW, XCW)
        solveBottomRight(solver)
    } else if (unsolvedCube?.orientation?.top == Face.Y) {
        solver.`do`(rotateRightCCW, rotateBottomCW, rotateRightCW, XCCW)
        solveBottomRight(solver)
    } else {
        solver.`do`(rotateRightCCW, rotateBottomCW, rotateRightCW)
        solveBottomLeft(solver)
    }
    return
}

private suspend fun solveFrontLeftCorner(solver: RubiksCubeSolver) {
    val unsolvedCube = solver.fetchPosition(7)
    if (unsolvedCube?.orientation?.front == Face.Y) {
        solver.`do`(rotateFrontCCW, rotateBottomCW, rotateFrontCW, XCCW)
        solveBottomLeft(solver)
    } else if (unsolvedCube?.orientation?.top == Face.Y) {
        solver.`do`(rotateLeftCCW, rotateBottomCCW, rotateLeftCW, XCW)
        solveBottomLeft(solver)
    } else {
        solver.`do`(rotateLeftCCW, rotateBottomCCW, rotateLeftCW)
        solveBottomRight(solver)
    }
    return
}

private suspend fun solveBottomLeftFaceDown(solver: RubiksCubeSolver) {
    var unsolvedWorkingCube = false
    do {
        val topLeftCorner = solver.fetchPosition(7)
        val topLeftEdge = solver.fetchPosition(4)
        val topFrontEdge = solver.fetchPosition(8)
        if (
            topLeftCorner?.orientation?.top != Face.Y ||
            !cubesShareFace(OrientationKey.left, topLeftCorner, topLeftEdge) ||
            !cubesShareFace(OrientationKey.front, topLeftCorner, topFrontEdge)
        ) {
            unsolvedWorkingCube = true
        } else {
            solver.`do`(rotateBottomCW, XCCW)
        }
    } while (!unsolvedWorkingCube)

    solver.`do`(
        rotateBottomCCW,
        rotateLeftCCW,
        rotateBottomCW,
        rotateLeftCW,
        rotateFrontCCW,
        rotateBottomCW,
        rotateFrontCW,
        rotateBottomCCW
    )
    solveBottomLeft(solver)
    return
}

private suspend fun solveBottomRightFaceDown(solver: RubiksCubeSolver) {
    var unsolvedWorkingCube = false
    do {
        val topRightCorner = solver.fetchPosition(9)
        val topRightEdge = solver.fetchPosition(6)
        val topFrontEdge = solver.fetchPosition(8)
        if (
            topRightCorner?.orientation?.top != Face.Y ||
            !cubesShareFace(OrientationKey.right, topRightCorner, topRightEdge) ||
            !cubesShareFace(OrientationKey.front, topRightCorner, topFrontEdge)
        ) {
            unsolvedWorkingCube = true
        } else {
            solver.`do`(rotateBottomCCW, XCW)
        }
    } while (!unsolvedWorkingCube)

    solver.`do`(
        rotateBottomCW,
        rotateRightCCW,
        rotateBottomCCW,
        rotateRightCW,
        rotateFrontCW,
        rotateBottomCCW,
        rotateFrontCCW,
        rotateBottomCW
    )
    solveBottomRight(solver)
    return
}

private suspend fun solveBottomLeft(solver: RubiksCubeSolver) {
    val cube = solver.fetchPosition(25)
    while (!cubesShareFace(OrientationKey.left, cube, solver.fetchPosition(13))) {
        solver.`do`(rotateBottomCW, XCCW)
    }
    solver.`do`(rotateBottomCCW, rotateLeftCCW, rotateBottomCW, rotateLeftCW)
    return
}

private suspend fun solveBottomRight(solver: RubiksCubeSolver) {
    val cube = solver.fetchPosition(27)
    while (!cubesShareFace(OrientationKey.right, cube, solver.fetchPosition(15))) {
        solver.`do`(rotateBottomCCW, XCW)
    }
    solver.`do`(rotateBottomCW, rotateRightCCW, rotateBottomCCW, rotateRightCW)
    return
}
