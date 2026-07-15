// Port of ../src/presentations/3DWeb/dragTurn.ts — drag-to-turn: pure math mapping a
// pointer drag on a sticker face to a layer turn. The web resolves the sticker via a DOM
// WeakMap; here the 3D view hit-tests its own projected quads and passes the sticker's
// cubie position + face directly.
package com.mikeb.simplepuzzlecube.ui.view.cube3d

import com.mikeb.simplepuzzlecube.engine.Axis
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Position
import com.mikeb.simplepuzzlecube.ui.model.MOVES
import com.mikeb.simplepuzzlecube.ui.model.MoveKey

// Calibration sign (config.ts CW_SIGN): a positive right-hand turn about any +axis reads
// as CCW from that axis's viewpoint, so CW = -1 everywhere.
private val CW_SIGN: Map<Axis, Int> = mapOf(Axis.X to -1, Axis.Y to -1, Axis.Z to -1)

data class Turn(val face: MoveKey, val prime: Boolean)

// Which turn a drag of (dx, dy) on the sticker at `position`/`dir` means, given the
// current orbit (pitch/yaw).
fun pickTurn(
    position: Position,
    dir: OrientationKey,
    dx: Float,
    dy: Float,
    pitch: Float,
    yaw: Float
): Turn? {
    val normal = NORMALS.getValue(dir)
    val normalAxis = when {
        normal.x != 0.0 -> Axis.X
        normal.y != 0.0 -> Axis.Y
        else -> Axis.Z
    }
    // Of the face's two in-plane axes, take the one whose screen projection best matches
    // the drag.
    var best: Triple<Axis, Int, Double>? = null // axis, sign, score
    for (axis in Axis.entries) {
        if (axis == normalAxis) continue
        val vec = when (axis) {
            Axis.X -> Vec3(1.0, 0.0, 0.0)
            Axis.Y -> Vec3(0.0, 1.0, 0.0)
            Axis.Z -> Vec3(0.0, 0.0, 1.0)
        }
        val proj = projectView(vec, pitch, yaw)
        val dot = dx * proj.x + dy * proj.y
        if (best == null || kotlin.math.abs(dot) > best.third) {
            best = Triple(axis, if (dot >= 0) 1 else -1, kotlin.math.abs(dot))
        }
    }
    if (best == null) return null
    val m = when (best.first) {
        Axis.X -> Vec3(best.second.toDouble(), 0.0, 0.0)
        Axis.Y -> Vec3(0.0, best.second.toDouble(), 0.0)
        Axis.Z -> Vec3(0.0, 0.0, best.second.toDouble())
    }
    // turn axis r = face normal × drag direction
    val r = cross(normal, m)
    val rAxis = when {
        kotlin.math.abs(r.x) > 0.5 -> Axis.X
        kotlin.math.abs(r.y) > 0.5 -> Axis.Y
        else -> Axis.Z
    }
    val rComponent = when (rAxis) {
        Axis.X -> r.x
        Axis.Y -> r.y
        Axis.Z -> r.z
    }
    val rSign = if (rComponent >= 0) 1 else -1
    val layer = position[rAxis]
    val face = MOVES.entries.find { it.value.axis == rAxis && it.value.layer == layer }?.key
        ?: return null
    return Turn(face, prime = rSign != CW_SIGN.getValue(rAxis))
}
