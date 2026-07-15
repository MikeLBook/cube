// The view's shared types — the analog of ../src/presentations/3DWeb/types.ts plus the
// immutable render snapshot the ViewModel publishes (engine Cubes are mutable, so the UI
// gets copies, never live references).
package com.mikeb.simplepuzzlecube.ui

import androidx.compose.ui.graphics.Color
import com.mikeb.simplepuzzlecube.engine.Face
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

// Sticker colours (config.ts COLORS).
val COLORS: Map<Face, Color> = mapOf(
    Face.Y to Color(0xFFFFD43B),
    Face.R to Color(0xFFD92B3C),
    Face.B to Color(0xFF2256D6),
    Face.G to Color(0xFF1EAA5B),
    Face.O to Color(0xFFFF7A18),
    Face.W to Color(0xFFF4F4F0)
)

data class StatusMeta(val label: String, val color: Color?)

// config.ts STATUS_META; null color = the theme's default text color.
val STATUS_META: Map<Status, StatusMeta> = mapOf(
    Status.free to StatusMeta("Free Play", null),
    Status.ready to StatusMeta("Ready", null),
    Status.scrambling to StatusMeta("Scrambling…", Color(0xFFFF7A18)),
    Status.solving to StatusMeta("Solving…", Color(0xFF2256D6)),
    Status.solved to StatusMeta("Solved!", Color(0xFF1EAA5B))
)

// panel.ts timeText.
fun timeText(elapsedMs: Long): String {
    val total = elapsedMs / 1000
    val mm = (total / 60).toInt()
    val ss = (total % 60).toInt()
    val t = ((elapsedMs % 1000) / 100).toInt()
    val ssStr = (if (mm > 0 && ss < 10) "0" else "") + ss
    return (if (mm > 0) "$mm:" else "") + ssStr + "." + t
}
