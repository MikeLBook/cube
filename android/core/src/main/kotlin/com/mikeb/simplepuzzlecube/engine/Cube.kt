// Port of ../src/engine/Cube.ts — one cubie.
package com.mikeb.simplepuzzlecube.engine

class Cube(
    var position: Position,
    var orientation: Orientation
) {
    // Layer membership is derived from orientation, not position, and `rotate()`
    // recomputes position from the new orientation. Intentional — don't "fix" it.
    val isInTopLayer: Boolean
        get() = orientation.top != null

    val isInXMidLayer: Boolean
        get() = orientation.top == null && orientation.bottom == null

    val isInBottomLayer: Boolean
        get() = orientation.bottom != null

    val isInLeftLayer: Boolean
        get() = orientation.left != null

    val isInYMidLayer: Boolean
        get() = orientation.left == null && orientation.right == null

    val isInRightLayer: Boolean
        get() = orientation.right != null

    val isInFrontLayer: Boolean
        get() = orientation.front != null

    val isInZMidLayer: Boolean
        get() = orientation.front == null && orientation.back == null

    val isInBackLayer: Boolean
        get() = orientation.back != null

    val isCorner: Boolean
        get() = orientation.values().count { it != null } == 3

    val isEdge: Boolean
        get() = orientation.values().count { it != null } == 2

    val isFace: Boolean
        get() = orientation.values().count { it != null } == 1

    fun hasFace(face: Face): Boolean = orientation.values().contains(face)

    fun getFaceOrientation(face: Face): OrientationKey? {
        for ((key, value) in orientation.entries()) {
            if (value == face) return key
        }
        return null
    }

    private fun rotate(newOrientation: Orientation) {
        position = Position(
            X = if (newOrientation.left != null) -1 else if (newOrientation.right != null) 1 else 0,
            Y = if (newOrientation.top != null) 1 else if (newOrientation.bottom != null) -1 else 0,
            Z = if (newOrientation.front != null) 1 else if (newOrientation.back != null) -1 else 0
        )
        orientation = newOrientation
    }

    fun rotateXCW() {
        rotate(
            Orientation(
                top = orientation.top,
                bottom = orientation.bottom,
                left = orientation.front,
                front = orientation.right,
                right = orientation.back,
                back = orientation.left
            )
        )
    }

    fun rotateXCCW() {
        rotate(
            Orientation(
                top = orientation.top,
                bottom = orientation.bottom,
                left = orientation.back,
                front = orientation.left,
                right = orientation.front,
                back = orientation.right
            )
        )
    }

    fun rotateYCW() {
        rotate(
            Orientation(
                top = orientation.front,
                back = orientation.top,
                bottom = orientation.back,
                front = orientation.bottom,
                left = orientation.left,
                right = orientation.right
            )
        )
    }

    fun rotateYCCW() {
        rotate(
            Orientation(
                top = orientation.back,
                front = orientation.top,
                bottom = orientation.front,
                back = orientation.bottom,
                left = orientation.left,
                right = orientation.right
            )
        )
    }

    fun rotateZCW() {
        rotate(
            Orientation(
                top = orientation.left,
                right = orientation.top,
                bottom = orientation.right,
                left = orientation.bottom,
                front = orientation.front,
                back = orientation.back
            )
        )
    }

    fun rotateZCCW() {
        rotate(
            Orientation(
                top = orientation.right,
                right = orientation.bottom,
                bottom = orientation.left,
                left = orientation.top,
                front = orientation.front,
                back = orientation.back
            )
        )
    }
}
