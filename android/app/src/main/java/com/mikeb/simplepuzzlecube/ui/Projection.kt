// The 3D view's pure math: model geometry, view rotation/projection, and the mapping
// from an engine Move to the layer spin that presents it. No Compose types here so the
// sign conventions can be pinned by plain JVM unit tests.
//
// Conventions (matching the web view's CSS-3D space, see dragTurn.ts projectAxis):
// position space is the engine's (X right, Y up, Z toward viewer); view space flips Y
// down (cssY = -Y) and applies Rx(pitch)·Ry(yaw); +z is toward the viewer, so larger
// projected z = closer. Model rotations are right-handed about the +axis in position
// space — under which every engine CW move is a -90° turn (CW viewed from the +axis
// looking toward the origin = negative right-hand rotation; the web's CW_SIGN = -1
// encodes the same fact).
package com.mikeb.simplepuzzlecube.ui

import com.mikeb.simplepuzzlecube.engine.Axis
import com.mikeb.simplepuzzlecube.engine.LayerMove
import com.mikeb.simplepuzzlecube.engine.Move
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Position
import com.mikeb.simplepuzzlecube.engine.Rotation
import kotlin.math.cos
import kotlin.math.sin

const val DEFAULT_YAW = -28f
const val DEFAULT_PITCH = -19f

// Geometry in cubie-pitch units (web: 58px face / 63px pitch → half-face 0.46).
const val CUBIE_HALF = 0.46
// Perspective distance in the same units (web: ~800px perspective / 63px pitch).
const val PERSPECTIVE = 12.7

data class Vec3(val x: Double, val y: Double, val z: Double) {
    operator fun plus(o: Vec3) = Vec3(x + o.x, y + o.y, z + o.z)
    operator fun minus(o: Vec3) = Vec3(x - o.x, y - o.y, z - o.z)
    operator fun times(s: Double) = Vec3(x * s, y * s, z * s)
}

fun cross(a: Vec3, b: Vec3) = Vec3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
)

// Position-space outward normals per face (config.ts NORMALS).
val NORMALS: Map<OrientationKey, Vec3> = mapOf(
    OrientationKey.right to Vec3(1.0, 0.0, 0.0),
    OrientationKey.left to Vec3(-1.0, 0.0, 0.0),
    OrientationKey.top to Vec3(0.0, 1.0, 0.0),
    OrientationKey.bottom to Vec3(0.0, -1.0, 0.0),
    OrientationKey.front to Vec3(0.0, 0.0, 1.0),
    OrientationKey.back to Vec3(0.0, 0.0, -1.0)
)

// The four corners of a cubie's face quad, wound counterclockwise as seen from outside
// the face (so the projected winding tells front from back for culling).
fun faceCorners(position: Position, dir: OrientationKey): List<Vec3> {
    val n = NORMALS.getValue(dir)
    val u = if (n.x == 0.0 && n.z == 0.0) Vec3(1.0, 0.0, 0.0) else Vec3(0.0, 1.0, 0.0)
    val v = cross(n, u)
    val center = Vec3(position.X.toDouble(), position.Y.toDouble(), position.Z.toDouble()) +
        n * CUBIE_HALF
    val uh = u * CUBIE_HALF
    val vh = v * CUBIE_HALF
    return listOf(
        center + uh + vh,
        center - uh + vh,
        center - uh - vh,
        center + uh - vh
    )
}

// Right-handed rotation about a principal +axis in position space.
fun rotateAboutAxis(axis: Axis, deg: Double, p: Vec3): Vec3 {
    val r = Math.toRadians(deg)
    val c = cos(r)
    val s = sin(r)
    return when (axis) {
        Axis.X -> Vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c)
        Axis.Y -> Vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c)
        Axis.Z -> Vec3(p.x * c - p.y * s, p.x * s + p.y * c, p.z)
    }
}

// Position space -> view space: cssY = -Y, then Rx(pitch)·Ry(yaw) — the exact formula of
// dragTurn.ts projectAxis, extended with the depth component. +z = toward the viewer.
fun projectView(v: Vec3, pitchDeg: Float, yawDeg: Float): Vec3 {
    val a = Math.toRadians(pitchDeg.toDouble())
    val b = Math.toRadians(yawDeg.toDouble())
    val x = v.x
    val y = -v.y
    val z = v.z
    val x1 = x * cos(b) + z * sin(b)
    val z1 = -x * sin(b) + z * cos(b)
    val y2 = y * cos(a) - z1 * sin(a)
    val z2 = y * sin(a) + z1 * cos(a)
    return Vec3(x1, y2, z2)
}

// How an engine move is presented: spin `layer` (null = the whole cube) about `axis`,
// landing at `finalDeg`. The view renders the POST-move state, so the animation starts
// with the affected cubies rotated back by -finalDeg (which reproduces the pre-move
// look exactly) and eases them to rest — landing is exact by construction.
data class MoveAnim(val axis: Axis, val finalDeg: Double, val layer: Int?)

fun moveAnim(move: Move): MoveAnim = when (move) {
    is LayerMove -> {
        val def = MOVES.values.first { it.cw == move || it.ccw == move }
        MoveAnim(def.axis, if (def.cw == move) -90.0 else 90.0, def.layer)
    }
    // The engine's Rotation names follow the cubie METHOD names (rotateXCW spins about
    // the vertical axis — the CW/CCW naming-trap comment in Types.kt), so the model
    // axis here is deliberately NOT the letter in the name.
    is Rotation -> when (move) {
        Rotation.XCW -> MoveAnim(Axis.Y, -90.0, null)
        Rotation.XCCW -> MoveAnim(Axis.Y, 90.0, null)
        Rotation.YCW -> MoveAnim(Axis.X, -90.0, null)
        Rotation.YCCW -> MoveAnim(Axis.X, 90.0, null)
        Rotation.ZCW -> MoveAnim(Axis.Z, -90.0, null)
        Rotation.ZCCW -> MoveAnim(Axis.Z, 90.0, null)
    }
}
