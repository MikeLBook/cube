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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.input.pointer.pointerInput
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Position
import com.mikeb.simplepuzzlecube.ui.model.MoveKey
import com.mikeb.simplepuzzlecube.ui.view.theme.COLORS
import com.mikeb.simplepuzzlecube.ui.view.theme.Plastic
import com.mikeb.simplepuzzlecube.ui.viewmodel.UiState
import kotlin.math.hypot

private const val ORBIT_SPEED = 0.42f
private const val TURN_THRESHOLD_PX = 14f
private val EASING = CubicBezierEasing(0.34f, 0.66f, 0.24f, 1f)

// Cubie face styling, matching the web's cubieDom.ts: a dark rounded plastic face
// (border-radius 9px on a 58px face) with an inset rounded sticker (inset 5px of the
// 29px half-extent, radius 7px on its 48px side) that carries the color.
private const val FACE_CORNER = 9f / 58f // corner cut as a fraction of the edge
private const val STICKER_SCALE = 1f - 5f / 29f // sticker corner distance from face center
private const val STICKER_CORNER = 7f / 48f
// Approximation of the web sticker's inset gloss (box-shadow: light top, shade bottom).
private val GLOSS_TOP = Color(0x24FFFFFF)
private val GLOSS_BOTTOM = Color(0x4D000000)

// One projected cubie face from the last drawn frame: the full plastic quad (also the
// hit-test surface for drag-to-turn — the analog of the web's DOM faces + faceEntry
// WeakMap) plus the inset sticker quad it carries.
private data class DrawnQuad(
    val position: Position,
    val dir: OrientationKey,
    val points: List<Offset>,
    val stickerPoints: List<Offset>,
    val depth: Double
)

private fun lerp(a: Offset, b: Offset, t: Float) =
    Offset(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)

// A projected quad with its corners rounded off: walk the edges, entering each corner a
// fraction early and leaving it a fraction late, bridging with a quadratic curve through
// the corner point. Perspective-safe because it works on the projected polygon.
private fun roundedQuadPath(points: List<Offset>, cornerFraction: Float): Path {
    val path = Path()
    for (i in points.indices) {
        val corner = points[i]
        val prev = points[(i + points.size - 1) % points.size]
        val next = points[(i + 1) % points.size]
        val entry = lerp(corner, prev, cornerFraction)
        val exit = lerp(corner, next, cornerFraction)
        if (i == 0) path.moveTo(entry.x, entry.y) else path.lineTo(entry.x, entry.y)
        path.quadraticTo(corner.x, corner.y, exit.x, exit.y)
    }
    path.close()
    return path
}

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
    val quads = remember { mutableStateOf<List<DrawnQuad>>(emptyList()) }
    val currentState = rememberUpdatedState(state)
    val currentOnUserMove = rememberUpdatedState(onUserMove)

    // Present the pending move: start at the rotated-back pose, ease to rest, acknowledge.
    //
    // The Animatable is created per move id AT COMPOSITION TIME, already at 0. During a
    // driven sequence the next move arrives in the same instant the previous one settles,
    // and an effect-based snapTo(0) can land a frame late — that stale frame renders the
    // new move's END state at rest before snapping back, a visible flicker at every move
    // boundary. Initializing at composition closes that window: the first frame of a new
    // pending move already shows the rotated-back pose, which is pixel-identical to the
    // previous move's resting pose, so chained turns are seamless.
    val pending = state.pendingMove
    val progress = remember(pending?.id) { Animatable(if (pending == null) 1f else 0f) }
    LaunchedEffect(pending?.id) {
        if (pending != null) {
            val anim = moveAnim(pending.move)
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

        fun project(v: Vec3): Offset {
            val view = projectView(v, pitch, yaw)
            val persp = (PERSPECTIVE / (PERSPECTIVE - view.z)).toFloat()
            return Offset(cx + view.x.toFloat() * persp * scale, cy + view.y.toFloat() * persp * scale)
        }

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
                // The inset sticker, shrunk toward the face center in 3D so its
                // perspective matches the plastic face it sits on.
                val faceCenter = Vec3(
                    corners.sumOf { it.x } / 4,
                    corners.sumOf { it.y } / 4,
                    corners.sumOf { it.z } / 4
                )
                val stickerPoints = corners.map { corner ->
                    project(faceCenter + (corner - faceCenter) * STICKER_SCALE.toDouble())
                }
                drawn.add(DrawnQuad(cubie.position, dir, points, stickerPoints, projected.sumOf { it.z }))
            }
        }
        drawn.sortBy { it.depth }

        val byPosition = state.cubies.associateBy { it.position }
        for (quad in drawn) {
            // Dark rounded plastic face, then the colored rounded sticker inset on it —
            // the same two-layer construction as the web cubie (cubieDom.ts).
            drawPath(roundedQuadPath(quad.points, FACE_CORNER), Plastic)
            val face = byPosition.getValue(quad.position).orientation[quad.dir] ?: continue
            val sticker = roundedQuadPath(quad.stickerPoints, STICKER_CORNER)
            drawPath(sticker, COLORS.getValue(face))
            // Subtle top-light/bottom-shade, approximating the web sticker's inset shadows.
            val minY = quad.stickerPoints.minOf { it.y }
            val maxY = quad.stickerPoints.maxOf { it.y }
            drawPath(
                sticker,
                Brush.verticalGradient(
                    0f to GLOSS_TOP,
                    0.35f to Color.Transparent,
                    0.75f to Color.Transparent,
                    1f to GLOSS_BOTTOM,
                    startY = minY,
                    endY = maxY
                )
            )
        }
        quads.value = drawn
    }
}
