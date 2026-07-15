// The 3D renderer — a software-projected Canvas cube (Compose graphicsLayer has no
// preserve-3d, so the web view's nested CSS-3D transforms don't port; instead we project
// the 162 cubie-face quads ourselves, painter's-algorithm sort them, and draw Paths).
//
// The pacing handshake is the real, animation-backed one: a pending move spins the
// affected layer (or the whole cube) from its rotated-back pose to rest via an
// Animatable, and moveSettled() fires on animation end — exactly the 3D web view's
// animate-then-settle contract.
//
// Interaction (ported from 3DWeb.ts pointer handling): drag on a sticker past a
// threshold turns that layer (pickTurn); drag on empty space orbits (yaw/pitch, pitch
// clamped ±86°); double-tap recenters the view.
package com.mikeb.simplepuzzlecube.ui.view.cube3d

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Position
import com.mikeb.simplepuzzlecube.ui.model.MoveKey
import com.mikeb.simplepuzzlecube.ui.viewmodel.COLORS
import com.mikeb.simplepuzzlecube.ui.viewmodel.UiState
import kotlin.math.hypot

private const val ORBIT_SPEED = 0.42f
private const val TURN_THRESHOLD_PX = 14f
private val EASING = CubicBezierEasing(0.34f, 0.66f, 0.24f, 1f)
private val PLASTIC = Color(0xFF20242B)
private val EDGE = Color(0xCC12151A)

// One projected sticker quad from the last drawn frame — the hit-test surface for
// drag-to-turn (the analog of the web's DOM faces + faceEntry WeakMap).
private data class DrawnQuad(
    val position: Position,
    val dir: OrientationKey,
    val points: List<Offset>,
    val depth: Double
)

private fun pointInQuad(p: Offset, quad: List<Offset>): Boolean {
    var sign = 0
    for (i in quad.indices) {
        val a = quad[i]
        val b = quad[(i + 1) % quad.size]
        val crossZ = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
        val s = if (crossZ >= 0) 1 else -1
        if (sign == 0) sign = s else if (s != sign) return false
    }
    return true
}

private fun shoelace(points: List<Offset>): Float {
    var area = 0f
    for (i in points.indices) {
        val a = points[i]
        val b = points[(i + 1) % points.size]
        area += a.x * b.y - b.x * a.y
    }
    return area / 2f
}

@Composable
fun Cube3DView(
    state: UiState,
    onUserMove: (MoveKey, Boolean) -> Unit,
    onMoveSettled: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    var yaw by remember { mutableFloatStateOf(DEFAULT_YAW) }
    var pitch by remember { mutableFloatStateOf(DEFAULT_PITCH) }
    val progress = remember { Animatable(1f) }
    val quads = remember { mutableStateOf<List<DrawnQuad>>(emptyList()) }
    val currentState = rememberUpdatedState(state)
    val currentOnUserMove = rememberUpdatedState(onUserMove)

    // Present the pending move: snap to the rotated-back pose, ease to rest, acknowledge.
    val pending = state.pendingMove
    LaunchedEffect(pending?.id) {
        if (pending != null) {
            val anim = moveAnim(pending.move)
            progress.snapTo(0f)
            val duration = when {
                anim.layer == null -> 320
                pending.fast -> 135
                else -> 290
            }
            progress.animateTo(1f, tween(duration, easing = EASING))
            onMoveSettled(pending.id)
        }
    }

    Canvas(
        modifier = modifier
            .pointerInput(Unit) {
                detectTapGestures(onDoubleTap = {
                    yaw = DEFAULT_YAW
                    pitch = DEFAULT_PITCH
                })
            }
            .pointerInput(Unit) {
                var dragQuad: DrawnQuad? = null
                var turnCommitted = false
                var totalX = 0f
                var totalY = 0f
                var yaw0 = 0f
                var pitch0 = 0f
                detectDragGestures(
                    onDragStart = { down ->
                        totalX = 0f
                        totalY = 0f
                        yaw0 = yaw
                        pitch0 = pitch
                        turnCommitted = false
                        // Topmost (nearest) sticker under the pointer; none while a move
                        // is being presented — then the drag orbits instead (as on web).
                        dragQuad = if (currentState.value.pendingMove == null) {
                            quads.value.lastOrNull { pointInQuad(down, it.points) }
                        } else null
                    },
                    onDrag = { change, amount ->
                        change.consume()
                        totalX += amount.x
                        totalY += amount.y
                        val quad = dragQuad
                        if (quad != null) {
                            if (!turnCommitted && hypot(totalX, totalY) > TURN_THRESHOLD_PX) {
                                turnCommitted = true
                                pickTurn(quad.position, quad.dir, totalX, totalY, pitch, yaw)
                                    ?.let { currentOnUserMove.value(it.face, it.prime) }
                            }
                        } else {
                            yaw = yaw0 + totalX * ORBIT_SPEED
                            pitch = (pitch0 - totalY * ORBIT_SPEED).coerceIn(-86f, 86f)
                        }
                    },
                    onDragEnd = { dragQuad = null },
                    onDragCancel = { dragQuad = null }
                )
            }
    ) {
        val scale = (size.minDimension / 5.6).toFloat()
        val cx = size.width / 2f
        val cy = size.height / 2f
        val anim = state.pendingMove?.let { moveAnim(it.move) }
        val extraDeg = anim?.let { -it.finalDeg * (1 - progress.value) }

        val drawn = mutableListOf<DrawnQuad>()
        for (cubie in state.cubies) {
            val affected = anim != null &&
                (anim.layer == null || cubie.position[anim.axis] == anim.layer)
            for (dir in OrientationKey.entries) {
                var corners = faceCorners(cubie.position, dir)
                if (affected && extraDeg != null) {
                    corners = corners.map { rotateAboutAxis(anim.axis, extraDeg, it) }
                }
                val projected = corners.map { projectView(it, pitch, yaw) }
                val points = projected.map { v ->
                    val persp = (PERSPECTIVE / (PERSPECTIVE - v.z)).toFloat()
                    Offset(cx + v.x.toFloat() * persp * scale, cy + v.y.toFloat() * persp * scale)
                }
                // Backface cull: corners wind CCW seen from outside; the view's y-flip
                // reverses that on screen, so visible faces have negative shoelace area.
                if (shoelace(points) >= 0f) continue
                drawn.add(DrawnQuad(cubie.position, dir, points, projected.sumOf { it.z }))
            }
        }
        drawn.sortBy { it.depth }

        val byPosition = state.cubies.associateBy { it.position }
        for (quad in drawn) {
            val face = byPosition.getValue(quad.position).orientation[quad.dir]
            val path = Path().apply {
                moveTo(quad.points[0].x, quad.points[0].y)
                for (i in 1 until quad.points.size) lineTo(quad.points[i].x, quad.points[i].y)
                close()
            }
            drawPath(path, face?.let { COLORS.getValue(it) } ?: PLASTIC)
            drawPath(path, EDGE, style = Stroke(width = scale * 0.045f))
        }
        quads.value = drawn
    }
}
