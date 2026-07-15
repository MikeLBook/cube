// Port of ../src/solver/RubiksCubeSolver.ts — the solution algorithm entry point;
// suspend-based and paced via IMovePacer (TS: async + Promise).
package com.mikeb.simplepuzzlecube.solver

import com.mikeb.simplepuzzlecube.engine.Cube
import com.mikeb.simplepuzzlecube.engine.Face
import com.mikeb.simplepuzzlecube.engine.Move
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Rotation.YCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.YCW
import com.mikeb.simplepuzzlecube.engine.Rotation.ZCCW
import com.mikeb.simplepuzzlecube.engine.Rotation.ZCW
import com.mikeb.simplepuzzlecube.engine.RubiksCube
import com.mikeb.simplepuzzlecube.interfaces.IMovePacer
import com.mikeb.simplepuzzlecube.positionMap
import com.mikeb.simplepuzzlecube.solver.subroutines.solveFinalCorners
import com.mikeb.simplepuzzlecube.solver.subroutines.solveFinalEdges
import com.mikeb.simplepuzzlecube.solver.subroutines.solveFinishedLayers
import com.mikeb.simplepuzzlecube.solver.subroutines.solveMiddleEdges
import com.mikeb.simplepuzzlecube.solver.subroutines.solveWhiteFaceCorners
import com.mikeb.simplepuzzlecube.solver.subroutines.solveWhiteFaceEdges
import com.mikeb.simplepuzzlecube.solver.subroutines.solveYellowCorners
import com.mikeb.simplepuzzlecube.solver.subroutines.solveYellowEdges
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.isActive

enum class SolutionPhase {
    YellowEdges,
    YellowCorners,
    MiddleEdges,
    WhiteFaceEdges,
    WhiteFaceCorners,
    CompleteCorners,
    CompleteEdges
}

class RubiksCubeSolver(
    val rubiks: RubiksCube,
    val pacer: IMovePacer
) {
    private var yellowLayerSolved: Boolean? = null
    private var middleLayerSolved: Boolean? = null
    private var solutionPhase: SolutionPhase = SolutionPhase.YellowEdges

    fun fetchPosition(position: Int): Cube? = rubiks.cubeMap[positionMap.getValue(position)]

    // Apply a sequence of moves to the engine, one per settled() so the presentation
    // paces the solver. Rotations reorient the whole cube; everything else is a layer move.
    // (`do` is a Kotlin keyword; backticks keep call sites grep-parallel with the TS spec.)
    suspend fun `do`(vararg moves: Move) {
        for (move in moves) {
            rubiks.execute(move)
            pacer.settled()
        }
    }

    fun reset() {
        yellowLayerSolved = null
        middleLayerSolved = null
        solutionPhase = SolutionPhase.YellowEdges
    }

    // TS: run(signal?: AbortSignal), aborting only when checked at the loop top.
    // Kotlin: cooperative cancellation of the enclosing Job. Divergence note: cancelling
    // ALSO throws CancellationException at the next settled() suspension point, unwinding
    // mid-subroutine — a faster abort than TS. Either way the trailing reset() below is
    // skipped on a throw (as in TS), so callers on the abort/error path must call
    // solver.reset() themselves (the view and the harness both do).
    suspend fun run() {
        while (currentCoroutineContext().isActive && !rubiks.isSolved) {
            if (yellowLayerSolved == null) {
                performInitialInspection()
            } else {
                resume()
            }
        }
        reset()
    }

    // `internal` (not private) because the verification harness drives the phase loop
    // itself and needs the inspection step — the TS harness reached it via `(solver as any)`.
    internal suspend fun performInitialInspection() {
        val yellowFaceCube = rubiks.cubes.find { cube -> cube.isFace && cube.hasFace(Face.Y) }
        val orientation = yellowFaceCube?.getFaceOrientation(Face.Y)!!

        yellowLayerSolved = isOutsideLayerSolved(orientation, rubiks)
        middleLayerSolved = if (yellowLayerSolved == true) {
            isMiddleLayerSolved(orientation, rubiks)
        } else {
            false
        }

        if (middleLayerSolved == true) {
            advancePhase(SolutionPhase.WhiteFaceEdges)
        } else {
            if (yellowFaceCube.isInBottomLayer) {
                `do`(YCW, YCW)
            } else if (yellowFaceCube.isInFrontLayer) {
                `do`(YCW)
            } else if (yellowFaceCube.isInBackLayer) {
                `do`(YCCW)
            } else if (yellowFaceCube.isInLeftLayer) {
                `do`(ZCW)
            } else if (yellowFaceCube.isInRightLayer) {
                `do`(ZCCW)
            }
            if (yellowLayerSolved == true) {
                advancePhase(SolutionPhase.MiddleEdges)
            } else {
                resume()
            }
        }
    }

    private suspend fun advancePhase(phase: SolutionPhase) {
        solutionPhase = phase
        if (phase == SolutionPhase.MiddleEdges) yellowLayerSolved = true
        if (phase == SolutionPhase.WhiteFaceEdges) {
            middleLayerSolved = true
            val whiteFace = rubiks.cubes.find { cube -> cube.isFace && cube.hasFace(Face.W) }
            if (whiteFace?.isInBottomLayer == true) {
                `do`(YCW, YCW)
            } else if (whiteFace?.isInLeftLayer == true) {
                `do`(ZCW)
            } else if (whiteFace?.isInRightLayer == true) {
                `do`(ZCCW)
            } else if (whiteFace?.isInFrontLayer == true) {
                `do`(YCW)
            } else if (whiteFace?.isInBackLayer == true) {
                `do`(YCCW)
            }
        }
        resume()
    }

    // The TS `Phases` dispatch table as an exhaustive `when`, branches in table order.
    private suspend fun resume() {
        when (solutionPhase) {
            SolutionPhase.YellowEdges -> {
                if (hasSolvedYellowEdges(this)) {
                    advancePhase(SolutionPhase.YellowCorners)
                } else {
                    solveYellowEdges(this)
                }
            }
            SolutionPhase.YellowCorners -> {
                if (hasSolvedYellowCorners(this)) {
                    advancePhase(SolutionPhase.MiddleEdges)
                } else {
                    solveYellowCorners(this)
                }
            }
            SolutionPhase.MiddleEdges -> {
                if (isMiddleLayerSolved(OrientationKey.top, rubiks)) {
                    advancePhase(SolutionPhase.WhiteFaceEdges)
                } else {
                    solveMiddleEdges(this)
                }
            }
            SolutionPhase.WhiteFaceEdges -> {
                if (hasSolvedWhiteFaceEdges(this)) {
                    advancePhase(SolutionPhase.WhiteFaceCorners)
                } else {
                    solveWhiteFaceEdges(this)
                }
            }
            SolutionPhase.WhiteFaceCorners -> {
                if (hasSolvedWhiteFaceCorners(this)) {
                    advancePhase(SolutionPhase.CompleteCorners)
                } else {
                    solveWhiteFaceCorners(this)
                }
            }
            SolutionPhase.CompleteCorners -> {
                if (hasCompletedCorners(this)) {
                    advancePhase(SolutionPhase.CompleteEdges)
                } else {
                    solveFinalCorners(this)
                }
            }
            SolutionPhase.CompleteEdges -> {
                if (
                    isOutsideLayerSolved(OrientationKey.top, rubiks) &&
                    isOutsideLayerSolved(OrientationKey.bottom, rubiks) &&
                    isMiddleLayerSolved(OrientationKey.bottom, rubiks)
                ) {
                    solveFinishedLayers(this)
                } else {
                    solveFinalEdges(this)
                }
            }
        }
    }
}
