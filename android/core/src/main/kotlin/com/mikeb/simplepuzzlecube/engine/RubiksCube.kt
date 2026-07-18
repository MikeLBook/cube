// Port of ../src/engine/RubiksCube.ts — the 27 cubies; the singleton source of truth.
// Pure and synchronous: no UI, timing, animation, or async.
package com.mikeb.simplepuzzlecube.engine

import com.mikeb.simplepuzzlecube.interfaces.IRubiksCubeObserver
import com.mikeb.simplepuzzlecube.parseCubeArray
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

// 3D layout of the 27 cubes in a Rubiks Cube. Coordinates are (X, Y, Z):
//   X:  -1 = left    →   1 = right
//   Y:  -1 = bottom  →   1 = top
//   Z:   1 = front   →  -1 = back
//
//              Center cube, 14, at (0, 0, 0)
//
//                       1 ──2 ──3
//                      ╱   ╱   ╱ BACK (Z: -1)
//         TOP (Y: 1)  4 ──5 ──6
//                    ╱   ╱   ╱
//                   7 ──8 ──9
//                   10──11──12
//                   ╱   ╱   ╱
//    LEFT (X: -1) 13──14──15  RIGHT (X: 1)
//                 ╱   ╱   ╱
//               16──17──18
//                19──20──21
//                ╱   ╱   ╱
//              22──23──24  BOTTOM (Y: -1)
// FRONT (Z: 1) ╱   ╱   ╱
//            25──26──27
//

class RubiksCube private constructor() {
    private var _cubes: List<Cube> = initCubes()
    private val _cubeMap: MutableMap<Position, Cube> = mutableMapOf()
    private val _observers: MutableList<IRubiksCubeObserver> = mutableListOf()

    init {
        updateCubeMap()
    }

    companion object {
        private var instance: RubiksCube? = null

        fun getInstance(): RubiksCube {
            return instance ?: RubiksCube().also { instance = it }
        }

        private fun initCubes(): List<Cube> {
            return listOf(
                // Top layer
                Cube(Position(X = -1, Y = 1, Z = -1), Orientation(top = Face.Y, left = Face.B, back = Face.O)),
                Cube(Position(X = 0, Y = 1, Z = -1), Orientation(top = Face.Y, back = Face.O)),
                Cube(Position(X = 1, Y = 1, Z = -1), Orientation(top = Face.Y, right = Face.G, back = Face.O)),
                Cube(Position(X = -1, Y = 1, Z = 0), Orientation(top = Face.Y, left = Face.B)),
                Cube(Position(X = 0, Y = 1, Z = 0), Orientation(top = Face.Y)),
                Cube(Position(X = 1, Y = 1, Z = 0), Orientation(top = Face.Y, right = Face.G)),
                Cube(Position(X = -1, Y = 1, Z = 1), Orientation(top = Face.Y, left = Face.B, front = Face.R)),
                Cube(Position(X = 0, Y = 1, Z = 1), Orientation(top = Face.Y, front = Face.R)),
                Cube(Position(X = 1, Y = 1, Z = 1), Orientation(top = Face.Y, right = Face.G, front = Face.R)),
                // Middle layer
                Cube(Position(X = -1, Y = 0, Z = -1), Orientation(left = Face.B, back = Face.O)),
                Cube(Position(X = 0, Y = 0, Z = -1), Orientation(back = Face.O)),
                Cube(Position(X = 1, Y = 0, Z = -1), Orientation(right = Face.G, back = Face.O)),
                Cube(Position(X = -1, Y = 0, Z = 0), Orientation(left = Face.B)),
                Cube(Position(X = 0, Y = 0, Z = 0), Orientation()),
                Cube(Position(X = 1, Y = 0, Z = 0), Orientation(right = Face.G)),
                Cube(Position(X = -1, Y = 0, Z = 1), Orientation(left = Face.B, front = Face.R)),
                Cube(Position(X = 0, Y = 0, Z = 1), Orientation(front = Face.R)),
                Cube(Position(X = 1, Y = 0, Z = 1), Orientation(right = Face.G, front = Face.R)),
                // Bottom layer
                Cube(Position(X = -1, Y = -1, Z = -1), Orientation(bottom = Face.W, left = Face.B, back = Face.O)),
                Cube(Position(X = 0, Y = -1, Z = -1), Orientation(bottom = Face.W, back = Face.O)),
                Cube(Position(X = 1, Y = -1, Z = -1), Orientation(bottom = Face.W, right = Face.G, back = Face.O)),
                Cube(Position(X = -1, Y = -1, Z = 0), Orientation(bottom = Face.W, left = Face.B)),
                Cube(Position(X = 0, Y = -1, Z = 0), Orientation(bottom = Face.W)),
                Cube(Position(X = 1, Y = -1, Z = 0), Orientation(bottom = Face.W, right = Face.G)),
                Cube(Position(X = -1, Y = -1, Z = 1), Orientation(bottom = Face.W, left = Face.B, front = Face.R)),
                Cube(Position(X = 0, Y = -1, Z = 1), Orientation(bottom = Face.W, front = Face.R)),
                Cube(Position(X = 1, Y = -1, Z = 1), Orientation(bottom = Face.W, right = Face.G, front = Face.R))
            )
        }
    }

    val cubes: List<Cube>
        get() = _cubes

    val cubeMap: Map<Position, Cube>
        get() = _cubeMap

    val isSolved: Boolean
        get() = ORIENTATION_KEYS.all { orientation ->
            val faces = _cubes
                .map { cube -> cube.orientation[orientation] }
                .filterNotNull()
            faces.toSet().size == 1
        }

    private fun updateCubeMap() {
        cubes.forEach { cube -> _cubeMap[cube.position] = cube }
    }

    private fun onMove(move: Move? = null) {
        updateCubeMap()
        _observers.forEach { observer -> observer.onMove(move) }
    }

    fun setState(cubeState: String) {
        val parsed = try {
            Json.parseToJsonElement(cubeState)
        } catch (e: Exception) {
            System.err.println("error $e")
            return
        }
        // Guard-then-rehydrate: parsed JSON is shape, not instances, so build real
        // Cube objects (mirrors TS's `parsed.map(c => new Cube(...))`).
        _cubes = parseCubeArray(parsed) ?: return
        updateCubeMap()
    }

    // The Kotlin analog of the TS call sites' `JSON.stringify(rubiks.cubes)` — same
    // wire format (null orientation keys omitted, as JSON.stringify drops undefined).
    // Cross-implementation comparisons must be structural, not string-equal: TS emits
    // orientation keys in rotate()-construction order, which varies per cubie.
    fun serialize(): String {
        return buildJsonArray {
            cubes.forEach { cube ->
                add(
                    buildJsonObject {
                        put(
                            "position",
                            buildJsonObject {
                                put("X", cube.position.X)
                                put("Y", cube.position.Y)
                                put("Z", cube.position.Z)
                            }
                        )
                        put(
                            "orientation",
                            buildJsonObject {
                                cube.orientation.entries().forEach { (key, face) ->
                                    if (face != null) put(key.name, face.name)
                                }
                            }
                        )
                    }
                )
            }
        }.toString()
    }

    fun addObserver(observer: IRubiksCubeObserver) {
        _observers.add(observer)
    }

    fun removeObserver(observer: IRubiksCubeObserver) {
        _observers.remove(observer)
    }

    fun reset() {
        _cubes = initCubes()
        onMove()
    }

    fun execute(move: Move) {
        val apply = Moves(move)
        cubes.forEach { cube -> apply(cube) }
        onMove(move)
    }

    // The TS `Moves` dispatch table (Record<Rotation | LayerMove, (cube) => void>) as
    // exhaustive `when`s, in the same declaration order. Rotations act on every cubie;
    // layer moves are guarded by layer membership.
    private fun Moves(move: Move): (Cube) -> Unit = when (move) {
        is Rotation -> when (move) {
            Rotation.XCW -> { cube -> cube.rotateXCW() }
            Rotation.XCCW -> { cube -> cube.rotateXCCW() }
            Rotation.YCW -> { cube -> cube.rotateYCW() }
            Rotation.YCCW -> { cube -> cube.rotateYCCW() }
            Rotation.ZCW -> { cube -> cube.rotateZCW() }
            Rotation.ZCCW -> { cube -> cube.rotateZCCW() }
        }
        is LayerMove -> when (move) {
            LayerMove.rotateTopCW -> { cube -> if (cube.isInTopLayer) cube.rotateXCW() }
            LayerMove.rotateXMidCW -> { cube -> if (cube.isInXMidLayer) cube.rotateXCW() }
            LayerMove.rotateBottomCW -> { cube -> if (cube.isInBottomLayer) cube.rotateXCW() }
            LayerMove.rotateTopCCW -> { cube -> if (cube.isInTopLayer) cube.rotateXCCW() }
            LayerMove.rotateXMidCCW -> { cube -> if (cube.isInXMidLayer) cube.rotateXCCW() }
            LayerMove.rotateBottomCCW -> { cube -> if (cube.isInBottomLayer) cube.rotateXCCW() }
            LayerMove.rotateLeftCW -> { cube -> if (cube.isInLeftLayer) cube.rotateYCW() }
            LayerMove.rotateYMidCW -> { cube -> if (cube.isInYMidLayer) cube.rotateYCW() }
            LayerMove.rotateRightCW -> { cube -> if (cube.isInRightLayer) cube.rotateYCW() }
            LayerMove.rotateLeftCCW -> { cube -> if (cube.isInLeftLayer) cube.rotateYCCW() }
            LayerMove.rotateYMidCCW -> { cube -> if (cube.isInYMidLayer) cube.rotateYCCW() }
            LayerMove.rotateRightCCW -> { cube -> if (cube.isInRightLayer) cube.rotateYCCW() }
            LayerMove.rotateFrontCW -> { cube -> if (cube.isInFrontLayer) cube.rotateZCW() }
            LayerMove.rotateZMidCW -> { cube -> if (cube.isInZMidLayer) cube.rotateZCW() }
            LayerMove.rotateBackCW -> { cube -> if (cube.isInBackLayer) cube.rotateZCW() }
            LayerMove.rotateFrontCCW -> { cube -> if (cube.isInFrontLayer) cube.rotateZCCW() }
            LayerMove.rotateZMidCCW -> { cube -> if (cube.isInZMidLayer) cube.rotateZCCW() }
            LayerMove.rotateBackCCW -> { cube -> if (cube.isInBackLayer) cube.rotateZCCW() }
        }
    }
}
