package com.mikeb.simplepuzzlecube.ui

import com.mikeb.simplepuzzlecube.engine.Position
import com.mikeb.simplepuzzlecube.engine.RubiksCube
import kotlin.math.roundToInt
import org.junit.Assert.assertEquals
import org.junit.Test

// Pins the presentation's rotation-sign mapping to the engine: for every engine move,
// rotating the moved cubies' POST-move positions back by -finalDeg must reproduce their
// PRE-move positions — i.e. the animation's rotated-back starting pose shows exactly the
// pre-move cube, so a spin can never land somewhere the engine didn't go. This is the
// Kotlin analog of hand-calibrating the web view's ANIM_SIGN table.
class ProjectionTest {
    private fun Vec3.toPosition() = Position(x.roundToInt(), y.roundToInt(), z.roundToInt())

    @Test
    fun `rotating each move's layer back by -finalDeg reproduces the pre-move positions`() {
        val rubiks = RubiksCube.getInstance()
        val allMoves = com.mikeb.simplepuzzlecube.engine.LAYER_MOVES +
            com.mikeb.simplepuzzlecube.engine.ROTATIONS
        for (move in allMoves) {
            rubiks.reset()
            // Displace from solved so cubie identities are distinguishable by orientation.
            rubiks.execute(com.mikeb.simplepuzzlecube.engine.LayerMove.rotateTopCW)
            rubiks.execute(com.mikeb.simplepuzzlecube.engine.LayerMove.rotateFrontCW)
            val before = rubiks.cubes.map { it.position }
            rubiks.execute(move)
            val after = rubiks.cubes.map { it.position }

            val anim = moveAnim(move)
            val restored = after.mapIndexed { i, position ->
                val affected = anim.layer == null || position[anim.axis] == anim.layer
                if (!affected) return@mapIndexed position
                rotateAboutAxis(
                    anim.axis,
                    -anim.finalDeg,
                    Vec3(position.X.toDouble(), position.Y.toDouble(), position.Z.toDouble())
                ).toPosition()
            }
            assertEquals("move $move should un-rotate to its pre-move layout", before, restored)
        }
    }
}
