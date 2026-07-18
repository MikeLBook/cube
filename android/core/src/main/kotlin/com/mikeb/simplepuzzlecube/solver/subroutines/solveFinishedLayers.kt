// Port of ../src/solver/subroutines/solveFinishedLayers.ts.
package com.mikeb.simplepuzzlecube.solver.subroutines

import com.mikeb.simplepuzzlecube.cubesShareFace
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateBottomCW
import com.mikeb.simplepuzzlecube.engine.LayerMove.rotateTopCW
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.solver.RubiksCubeSolver

suspend fun solveFinishedLayers(solver: RubiksCubeSolver) {
    while (!cubesShareFace(OrientationKey.back, solver.fetchPosition(2), solver.fetchPosition(11))) {
        solver.`do`(rotateTopCW)
    }
    while (!cubesShareFace(OrientationKey.back, solver.fetchPosition(11), solver.fetchPosition(20))) {
        solver.`do`(rotateBottomCW)
    }
}
