package com.mikeb.simplepuzzlecube.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

// Engine-level checks for the Kotlin port. The engine is a process-wide singleton
// (mirroring the TS design); each test starts from reset(). Do not add an in-JVM
// parallel test runner to this module.
class EngineTest {
    private val rubiks = RubiksCube.getInstance()

    @Before
    fun reset() {
        rubiks.reset()
    }

    private fun snapshot(): List<Pair<Position, Orientation>> =
        rubiks.cubes.map { it.position to it.orientation }

    @Test
    fun `initial cube is solved`() {
        assertTrue(rubiks.isSolved)
    }

    @Test
    fun `every move applied four times is the identity`() {
        for (move in ROTATIONS + LAYER_MOVES) {
            rubiks.reset()
            val before = snapshot()
            repeat(4) { rubiks.execute(move) }
            assertEquals("4x $move should be the identity", before, snapshot())
            assertTrue("cube should be solved after 4x $move", rubiks.isSolved)
        }
    }

    @Test
    fun `one layer move leaves the cube unsolved`() {
        rubiks.execute(LayerMove.rotateTopCW)
        assertFalse(rubiks.isSolved)
    }

    // The CW/CCW naming trap, encoded (see the comment block in Types.kt): the exact
    // sticker cycle of rotateXCCW is front→right→back→left→front viewed from above,
    // i.e. the old LEFT face (Blue) arrives at the FRONT.
    @Test
    fun `XCCW brings the left face to the front`() {
        rubiks.execute(Rotation.XCCW)
        val frontCenter = rubiks.cubeMap.getValue(Position(0, 0, 1))
        assertEquals(Face.B, frontCenter.orientation.front)
        // ...and XCW the other way: the old RIGHT face (Green) arrives at the front.
        rubiks.reset()
        rubiks.execute(Rotation.XCW)
        assertEquals(Face.G, rubiks.cubeMap.getValue(Position(0, 0, 1)).orientation.front)
    }

    @Test
    fun `serialize then setState round-trips a scrambled state`() {
        rubiks.execute(LayerMove.rotateTopCW)
        rubiks.execute(LayerMove.rotateFrontCCW)
        rubiks.execute(LayerMove.rotateRightCW)
        val scrambled = snapshot()
        val persisted = rubiks.serialize()

        rubiks.reset() // leaves cubeMap reflecting the solved cube...
        rubiks.setState(persisted) // ...so this must refresh it (the staleness guard)

        assertEquals(scrambled, snapshot())
        // The cubeMap must reflect the restored state, not the intervening reset.
        for ((position, orientation) in scrambled) {
            assertEquals(orientation, rubiks.cubeMap.getValue(position).orientation)
        }
    }

    @Test
    fun `setState rejects malformed input and keeps current state`() {
        rubiks.execute(LayerMove.rotateTopCW)
        val before = snapshot()
        rubiks.setState("not json at all")
        assertEquals(before, snapshot())
        rubiks.setState("""[{"position":{"X":0,"Y":0,"Z":0},"orientation":{}}]""") // not 27
        assertEquals(before, snapshot())
    }
}
