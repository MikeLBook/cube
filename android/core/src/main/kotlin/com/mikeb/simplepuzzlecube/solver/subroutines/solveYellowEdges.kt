// Port of ../src/solver/subroutines/solveYellowEdges.ts.
package com.mikeb.simplepuzzlecube.solver.subroutines

import com.mikeb.simplepuzzlecube.cubesShareFace
import com.mikeb.simplepuzzlecube.engine.Face
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateBottomCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateLeftCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateLeftCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateBottomCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateRightCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateYMidCCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateYMidCW
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Rotation.XCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.XCW
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver

suspend fun solveYellowEdges(solver: RubiksCubeSolver) {
    // Solve top facing yellow edge cubes
    val yellowTops = solver.rubiks.cubes.filter { cube ->
        cube.orientation.top == Face.Y && cube.isEdge
    }

    for (yellowTop in yellowTops) {
        var solved = true
        if (yellowTop.isInLeftLayer && !cubesShareFace(OrientationKey.left, solver.fetchPosition(13), yellowTop)) {
            solver.`do`(XCCW)
            solved = false
        } else if (
            yellowTop.isInBackLayer &&
            !cubesShareFace(OrientationKey.back, solver.fetchPosition(11), yellowTop)
        ) {
            solver.`do`(XCCW, XCCW)
            solved = false
        } else if (
            yellowTop.isInRightLayer &&
            !cubesShareFace(OrientationKey.right, solver.fetchPosition(15), yellowTop)
        ) {
            solver.`do`(XCW)
            solved = false
        }

        if (!solved) {
            solver.`do`(rotateFrontCW, rotateFrontCW)
            do {
                solver.`do`(rotateBottomCW, XCCW)
            } while (!cubesShareFace(OrientationKey.front, solver.fetchPosition(17), yellowTop))
            solver.`do`(rotateFrontCW, rotateFrontCW)
            return
        }
    }

    // Solve bottom facing yellow edge cubes
    val yellowBottoms = solver.rubiks.cubes.filter { cube ->
        cube.orientation.bottom == Face.Y && cube.isEdge
    }

    for (yellowBottom in yellowBottoms) {
        if (yellowBottom.isInLeftLayer) {
            solver.`do`(XCCW)
        } else if (yellowBottom.isInBackLayer) {
            solver.`do`(XCCW, XCCW)
        } else if (yellowBottom.isInRightLayer) {
            solver.`do`(XCW)
        }

        while (!cubesShareFace(OrientationKey.front, solver.fetchPosition(17), yellowBottom)) {
            solver.`do`(rotateBottomCW, XCCW)
        }

        solver.`do`(rotateFrontCW, rotateFrontCW)
        return
    }

    val yellowEdge = solver.rubiks.cubes.find { cube ->
        cube.isEdge &&
            cube.hasFace(Face.Y) &&
            cube.orientation.top != Face.Y &&
            cube.orientation.bottom != Face.Y
    }!!

    if (yellowEdge.orientation.left == Face.Y) {
        solver.`do`(XCCW)
    } else if (yellowEdge.orientation.back == Face.Y) {
        solver.`do`(XCCW, XCCW)
    } else if (yellowEdge.orientation.right == Face.Y) {
        solver.`do`(XCW)
    }

    if (yellowEdge.isInBottomLayer) {
        while (solver.fetchPosition(17)?.orientation?.front != yellowEdge.orientation.bottom) {
            solver.`do`(rotateBottomCW, XCCW)
        }
        solver.`do`(rotateBottomCW, rotateYMidCCW, rotateBottomCCW, rotateYMidCW)
    } else if (yellowEdge.isInLeftLayer) {
        solver.`do`(rotateLeftCCW, rotateBottomCCW, rotateLeftCW)
        while (!cubesShareFace(OrientationKey.front, solver.fetchPosition(17), yellowEdge)) {
            solver.`do`(rotateBottomCW, XCCW)
        }
        solver.`do`(rotateFrontCW, rotateFrontCW)
    } else if (yellowEdge.isInRightLayer) {
        solver.`do`(rotateRightCCW, rotateBottomCW, rotateRightCW)
        while (!cubesShareFace(OrientationKey.front, solver.fetchPosition(17), yellowEdge)) {
            solver.`do`(rotateBottomCW, XCCW)
        }
        solver.`do`(rotateFrontCW, rotateFrontCW)
    } else if (yellowEdge.isInTopLayer) {
        solver.`do`(rotateFrontCW, rotateFrontCW)
        while (solver.fetchPosition(17)?.orientation?.front != yellowEdge.orientation.bottom) {
            solver.`do`(rotateBottomCW, XCCW)
        }
        solver.`do`(rotateBottomCW, rotateYMidCCW, rotateBottomCCW, rotateYMidCW)
    }
    return
}
