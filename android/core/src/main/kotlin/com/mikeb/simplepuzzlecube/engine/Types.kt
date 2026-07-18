// Port of ../src/engine/types.ts — the pure type/constant vocabulary shared everywhere.
// TS `as const` arrays double as compile-time unions and runtime-iterable lists; the
// Kotlin equivalents are enums, with `entries` standing in for the runtime array.
package com.mikeb.simplepuzzlecube.engine

enum class Axis { X, Y, Z }

val AXES = Axis.entries

data class Position(val X: Int, val Y: Int, val Z: Int) {
    operator fun get(axis: Axis): Int = when (axis) {
        Axis.X -> X
        Axis.Y -> Y
        Axis.Z -> Z
    }
}

enum class Face { Y, B, R, G, O, W }

val FACES = Face.entries

data class Orientation(
    val top: Face? = null,
    val left: Face? = null,
    val front: Face? = null,
    val right: Face? = null,
    val back: Face? = null,
    val bottom: Face? = null
) {
    operator fun get(key: OrientationKey): Face? = when (key) {
        OrientationKey.top -> top
        OrientationKey.bottom -> bottom
        OrientationKey.left -> left
        OrientationKey.right -> right
        OrientationKey.front -> front
        OrientationKey.back -> back
    }

    // Stand-ins for the TS `Object.values` / `Object.entries` idioms, in
    // ORIENTATION_KEYS order (callers only count/contain/dedupe, so order is inert).
    fun values(): List<Face?> = ORIENTATION_KEYS.map { this[it] }

    fun entries(): List<Pair<OrientationKey, Face?>> = ORIENTATION_KEYS.map { it to this[it] }
}

enum class OrientationKey { top, bottom, left, right, front, back }

val ORIENTATION_KEYS = OrientationKey.entries

// TS `LayerMove | Rotation` union — the engine's whole move vocabulary.
sealed interface Move

enum class Rotation : Move { XCW, XCCW, YCW, YCCW, ZCW, ZCCW }

enum class LayerMove : Move {
    rotateTopCW,
    rotateTopCCW,
    rotateXMidCW,
    rotateXMidCCW,
    rotateBottomCW,
    rotateBottomCCW,
    rotateLeftCW,
    rotateLeftCCW,
    rotateYMidCW,
    rotateYMidCCW,
    rotateRightCW,
    rotateRightCCW,
    rotateFrontCW,
    rotateFrontCCW,
    rotateZMidCW,
    rotateZMidCCW,
    rotateBackCW,
    rotateBackCCW
}

val ROTATIONS = Rotation.entries
val LAYER_MOVES = LayerMove.entries

// ── Which way a face move turns ─────────────────────────────────────
//
// A move's CW/CCW is judged from ONE fixed viewpoint per axis: the
// +axis side, looking toward the origin —
//   • top / bottom : from ABOVE       (+Y, looking down)
//   • left / right : from the RIGHT   (+X, looking left)
//   • front / back : from the FRONT   (+Z, looking back)
//
// A face and its opposite share the same cubie method (rotateX/Y/ZCW),
// so a pair always spins the same way *in space*. That means the near
// face of each pair reads as named, while its opposite reads reversed
// when you look straight AT it from outside the cube:
//
//   as-named (near, +axis)            reversed (far, -axis)
//     TOP    RIGHT   FRONT              BOTTOM   LEFT    BACK
//   ┌────┐ ┌────┐ ┌────┐              ┌────┐ ┌────┐ ┌────┐
//   │ ↻  │ │ ↻  │ │ ↻  │              │ ↺  │ │ ↺  │ │ ↺  │
//   └────┘ └────┘ └────┘              └────┘ └────┘ └────┘
//   a CW move looks CW here           a CW move looks CCW here
//
// So `rotateLeftCW` looks CCW if you face the left side head-on, but
// CW once you picture that face pushed to the back (viewing from +X) —
// the same clockwise sense as `rotateRightCW`. Likewise `rotateTopCW`
// and `rotateBottomCW` both turn clockwise seen from above; the bottom
// only *looks* reversed because you flip the cube over to face it.
//
// Exact sticker cycles (the axis's own face stays put; CCW = reversed):
//   rotateXCW  (top / xMid / bottom):  front→left→back→right→front
//   rotateYCW  (left / yMid / right):  front→top→back→bottom→front
//   rotateZCW  (front / zMid / back):  left→top→right→bottom→left
