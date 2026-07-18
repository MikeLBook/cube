package com.mikeb.simplepuzzlecube.engine

import com.mikeb.simplepuzzlecube.parseCubeArray
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

// Cross-implementation parity: the canonical TypeScript engine and this port must land
// on the SAME state after the same move list. The fixture below was captured from the
// TS engine (the spec) with:
//
//   node src/solver/verification/run.mjs state '<MOVES as JSON>'
//
// The move list exercises all 18 layer moves and all 6 whole-cube rotations at least
// once, so any transposed cell in a rotation table or a mis-guarded layer in the Moves
// dispatch fails here immediately. Comparison is structural (per-index position +
// orientation) — TS JSON.stringify emits orientation keys in rotate()-construction
// order, so raw string equality would be meaningless.
class EngineParityTest {
    private val moves: List<Move> = listOf(
        LayerMove.rotateTopCW, LayerMove.rotateLeftCCW, Rotation.XCW, LayerMove.rotateFrontCW,
        LayerMove.rotateZMidCCW, Rotation.YCCW, LayerMove.rotateBottomCW, LayerMove.rotateRightCW,
        LayerMove.rotateYMidCW, Rotation.ZCW, LayerMove.rotateBackCCW, LayerMove.rotateXMidCW,
        LayerMove.rotateTopCCW, Rotation.XCCW, LayerMove.rotateFrontCCW, LayerMove.rotateLeftCW,
        Rotation.YCW, LayerMove.rotateBottomCCW, LayerMove.rotateZMidCW, LayerMove.rotateRightCCW,
        Rotation.ZCCW, LayerMove.rotateBackCW, LayerMove.rotateXMidCCW, LayerMove.rotateYMidCCW,
        LayerMove.rotateTopCW, LayerMove.rotateFrontCW, LayerMove.rotateRightCW,
        LayerMove.rotateBottomCW, LayerMove.rotateLeftCCW, LayerMove.rotateBackCW
    )

    // Captured 2026-07-15 from the TS engine at src/ (see header).
    private val expectedTsState = """
        [{"position":{"X":1,"Y":1,"Z":1},"orientation":{"top":"B","front":"Y","right":"O"}},{"position":{"X":-1,"Y":0,"Z":1},"orientation":{"front":"Y","left":"O"}},{"position":{"X":-1,"Y":-1,"Z":-1},"orientation":{"bottom":"O","left":"Y","back":"G"}},{"position":{"X":-1,"Y":0,"Z":-1},"orientation":{"left":"B","back":"Y"}},{"position":{"X":-1,"Y":0,"Z":0},"orientation":{"left":"Y"}},{"position":{"X":1,"Y":-1,"Z":0},"orientation":{"bottom":"G","right":"Y"}},{"position":{"X":-1,"Y":1,"Z":-1},"orientation":{"top":"R","left":"B","back":"Y"}},{"position":{"X":0,"Y":-1,"Z":1},"orientation":{"bottom":"Y","front":"R"}},{"position":{"X":1,"Y":1,"Z":-1},"orientation":{"top":"R","right":"G","back":"Y"}},{"position":{"X":0,"Y":1,"Z":1},"orientation":{"top":"B","front":"O"}},{"position":{"X":0,"Y":1,"Z":0},"orientation":{"top":"O"}},{"position":{"X":1,"Y":1,"Z":0},"orientation":{"top":"O","right":"G"}},{"position":{"X":0,"Y":0,"Z":-1},"orientation":{"back":"B"}},{"position":{"X":0,"Y":0,"Z":0},"orientation":{}},{"position":{"X":0,"Y":0,"Z":1},"orientation":{"front":"G"}},{"position":{"X":-1,"Y":-1,"Z":0},"orientation":{"bottom":"R","left":"B"}},{"position":{"X":0,"Y":-1,"Z":0},"orientation":{"bottom":"R"}},{"position":{"X":1,"Y":0,"Z":-1},"orientation":{"right":"G","back":"R"}},{"position":{"X":1,"Y":-1,"Z":1},"orientation":{"bottom":"O","front":"B","right":"W"}},{"position":{"X":1,"Y":0,"Z":1},"orientation":{"front":"O","right":"W"}},{"position":{"X":-1,"Y":1,"Z":1},"orientation":{"top":"G","front":"O","left":"W"}},{"position":{"X":0,"Y":-1,"Z":-1},"orientation":{"bottom":"B","back":"W"}},{"position":{"X":1,"Y":0,"Z":0},"orientation":{"right":"W"}},{"position":{"X":0,"Y":1,"Z":-1},"orientation":{"top":"G","back":"W"}},{"position":{"X":-1,"Y":-1,"Z":1},"orientation":{"front":"R","bottom":"W","left":"B"}},{"position":{"X":-1,"Y":1,"Z":0},"orientation":{"top":"R","left":"W"}},{"position":{"X":1,"Y":-1,"Z":-1},"orientation":{"right":"W","bottom":"G","back":"R"}}]
    """.trimIndent()

    @Test
    fun `kotlin engine matches the TS engine after the fixture move list`() {
        val rubiks = RubiksCube.getInstance()
        rubiks.reset()
        moves.forEach { rubiks.execute(it) }

        val expected = parseCubeArray(Json.parseToJsonElement(expectedTsState))
        assertNotNull("fixture should parse as a valid 27-cubie state", expected)

        expected!!.forEachIndexed { index, expectedCube ->
            val actual = rubiks.cubes[index]
            assertEquals("cubie #$index position", expectedCube.position, actual.position)
            assertEquals("cubie #$index orientation", expectedCube.orientation, actual.orientation)
        }
    }
}
