// Port of ../src/presentations/3DWeb/scramble.ts plus the notation tables it draws on
// from config.ts (MOVES, CUBE_MOVES) — needed by scramble, manual turns, and (later)
// drag-to-turn.
package com.mikeb.simplepuzzlecube.ui.model

import com.mikeb.simplepuzzlecube.engine.Axis
import com.mikeb.simplepuzzlecube.engine.LayerMove
import com.mikeb.simplepuzzlecube.engine.Rotation
import kotlin.random.Random

// Singmaster-style face notation -> engine moves + layer-selection metadata.
enum class MoveKey { U, E, D, L, M, R, B, S, F }

data class MoveDef(val axis: Axis, val layer: Int, val cw: LayerMove, val ccw: LayerMove)

val MOVES: Map<MoveKey, MoveDef> = mapOf(
    MoveKey.U to MoveDef(Axis.Y, 1, LayerMove.rotateTopCW, LayerMove.rotateTopCCW),
    MoveKey.E to MoveDef(Axis.Y, 0, LayerMove.rotateXMidCW, LayerMove.rotateXMidCCW),
    MoveKey.D to MoveDef(Axis.Y, -1, LayerMove.rotateBottomCW, LayerMove.rotateBottomCCW),
    MoveKey.L to MoveDef(Axis.X, -1, LayerMove.rotateLeftCW, LayerMove.rotateLeftCCW),
    MoveKey.M to MoveDef(Axis.X, 0, LayerMove.rotateYMidCW, LayerMove.rotateYMidCCW),
    MoveKey.R to MoveDef(Axis.X, 1, LayerMove.rotateRightCW, LayerMove.rotateRightCCW),
    MoveKey.B to MoveDef(Axis.Z, -1, LayerMove.rotateBackCW, LayerMove.rotateBackCCW),
    MoveKey.S to MoveDef(Axis.Z, 0, LayerMove.rotateZMidCW, LayerMove.rotateZMidCCW),
    MoveKey.F to MoveDef(Axis.Z, 1, LayerMove.rotateFrontCW, LayerMove.rotateFrontCCW)
)

// Whole-cube re-orientations (config.ts CUBE_MOVES, minus the CSS animation metadata,
// which the net view doesn't need).
enum class CubeMoveKey(val rotation: Rotation) {
    spinRight(Rotation.XCW),
    spinLeft(Rotation.XCCW),
    rollUp(Rotation.YCW),
    rollDown(Rotation.YCCW),
    tiltRight(Rotation.ZCW),
    tiltLeft(Rotation.ZCCW)
}

data class ScrambleTurn(val f: MoveKey, val prime: Boolean)

// A non-trivial random sequence: no two consecutive turns on the same axis.
fun buildScramble(rng: Random = Random.Default): List<ScrambleTurn> {
    val faces = listOf(MoveKey.U, MoveKey.D, MoveKey.L, MoveKey.R, MoveKey.F, MoveKey.B)
    val seq = mutableListOf<ScrambleTurn>()
    var lastAxis: Axis? = null
    repeat(24) {
        var f: MoveKey
        var guard = 0
        do {
            f = faces[rng.nextInt(faces.size)]
            guard++
        } while (MOVES.getValue(f).axis == lastAxis && guard < 8)
        lastAxis = MOVES.getValue(f).axis
        seq.add(ScrambleTurn(f, rng.nextBoolean()))
    }
    return seq
}
