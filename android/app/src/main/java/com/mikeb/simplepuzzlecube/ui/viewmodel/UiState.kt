// The ViewModel↔View contract — the immutable render snapshot the ViewModel publishes
// (engine Cubes are mutable, so the UI gets copies, never live references).
// Presentation styling (colors, status labels, formatting) lives in the view layer.
package com.mikeb.simplepuzzlecube.ui.viewmodel

import com.mikeb.simplepuzzlecube.engine.Move
import com.mikeb.simplepuzzlecube.engine.Orientation
import com.mikeb.simplepuzzlecube.engine.Position

enum class Status { free, ready, scrambling, solving, solved }

data class CubieState(val position: Position, val orientation: Orientation)

// One move for the View to present. The View acknowledges it via
// CubeViewModel.moveSettled(id) once presented — that acknowledgment is what resumes a
// paced driver's settled() await.
data class MoveEvent(val id: Long, val move: Move, val fast: Boolean)

data class UiState(
    val cubies: List<CubieState>,
    val status: Status = Status.free,
    val moveCount: Int = 0,
    val elapsedMs: Long = 0,
    val solverActive: Boolean = false,
    val aborting: Boolean = false,
    val isSolved: Boolean = true,
    val pendingMove: MoveEvent? = null
)
