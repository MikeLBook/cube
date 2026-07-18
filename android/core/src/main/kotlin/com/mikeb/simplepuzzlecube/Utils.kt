// Port of ../src/utils.ts.
//
// Divergence note: TS `JSONEquals` has no Kotlin counterpart — `Position` and
// `Orientation` are data classes, so `==` is the structural equality JS lacked.
// Likewise `positionMap` holds real `Position` values instead of JSON.stringify keys.
package com.mikeb.simplepuzzlecube

import com.mikeb.simplepuzzlecube.engine.AXES
import com.mikeb.simplepuzzlecube.engine.Cube
import com.mikeb.simplepuzzlecube.engine.Face
import com.mikeb.simplepuzzlecube.engine.Move
import com.mikeb.simplepuzzlecube.engine.ORIENTATION_KEYS
import com.mikeb.simplepuzzlecube.engine.Orientation
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Position
import com.mikeb.simplepuzzlecube.engine.Rotation
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

// The TS structural guards validate `unknown` from JSON.parse; the Kotlin analogs
// validate `JsonElement` from Json.parseToJsonElement. Same shapes, same rules.

fun isFace(value: JsonElement?): Boolean {
    val name = (value as? JsonPrimitive)?.takeIf { it.isString }?.content ?: return false
    return Face.entries.any { it.name == name }
}

fun isRotation(move: Move): Boolean = move is Rotation

fun isPosition(value: JsonElement?): Boolean {
    if (value !is JsonObject) return false
    return AXES.all { axis ->
        (value[axis.name] as? JsonPrimitive)?.takeIf { !it.isString }?.content?.toIntOrNull() != null
    }
}

fun isOrientation(value: JsonElement?): Boolean {
    if (value !is JsonObject) return false
    // Every present face key must hold a valid Face; absent keys are allowed.
    return ORIENTATION_KEYS.all { key ->
        val face = value[key.name]
        face == null || isFace(face)
    }
}

// Structural guard: parsed JSON is shape, not instances — validate that it is
// 27 cubies, each with a position + orientation (mirrors TS `isCubeArray`).
fun isCubeArray(value: JsonElement): Boolean {
    return value is JsonArray &&
        value.size == 27 &&
        value.all { cube ->
            cube is JsonObject &&
                isPosition(cube["position"]) &&
                isOrientation(cube["orientation"])
        }
}

// Guard-then-rehydrate, the Kotlin half of TS `setState`'s `parsed.map(c => new Cube(...))`:
// returns real Cube instances, or null when the shape is invalid.
fun parseCubeArray(value: JsonElement): List<Cube>? {
    if (!isCubeArray(value)) return null
    return (value as JsonArray).map { element ->
        val cube = element as JsonObject
        val position = cube["position"] as JsonObject
        val orientation = cube["orientation"] as JsonObject
        Cube(
            Position(
                X = (position["X"] as JsonPrimitive).content.toInt(),
                Y = (position["Y"] as JsonPrimitive).content.toInt(),
                Z = (position["Z"] as JsonPrimitive).content.toInt()
            ),
            Orientation(
                top = orientation.face(OrientationKey.top),
                left = orientation.face(OrientationKey.left),
                front = orientation.face(OrientationKey.front),
                right = orientation.face(OrientationKey.right),
                back = orientation.face(OrientationKey.back),
                bottom = orientation.face(OrientationKey.bottom)
            )
        )
    }
}

private fun JsonObject.face(key: OrientationKey): Face? =
    (this[key.name] as? JsonPrimitive)?.content?.let { Face.valueOf(it) }

fun cubesShareFace(orientation: OrientationKey, vararg cubes: Cube?): Boolean {
    return cubes.all { cube -> cube?.orientation?.get(orientation) == cubes[0]?.orientation?.get(orientation) }
}

// Keys based on the ascii representation in RubiksCube.kt
val positionMap: Map<Int, Position> = mapOf(
    // Top Layer
    1 to Position(X = -1, Y = 1, Z = -1),
    2 to Position(X = 0, Y = 1, Z = -1),
    3 to Position(X = 1, Y = 1, Z = -1),
    4 to Position(X = -1, Y = 1, Z = 0),
    5 to Position(X = 0, Y = 1, Z = 0),
    6 to Position(X = 1, Y = 1, Z = 0),
    7 to Position(X = -1, Y = 1, Z = 1),
    8 to Position(X = 0, Y = 1, Z = 1),
    9 to Position(X = 1, Y = 1, Z = 1),
    // Middle layer
    10 to Position(X = -1, Y = 0, Z = -1),
    11 to Position(X = 0, Y = 0, Z = -1),
    12 to Position(X = 1, Y = 0, Z = -1),
    13 to Position(X = -1, Y = 0, Z = 0),
    14 to Position(X = 0, Y = 0, Z = 0),
    15 to Position(X = 1, Y = 0, Z = 0),
    16 to Position(X = -1, Y = 0, Z = 1),
    17 to Position(X = 0, Y = 0, Z = 1),
    18 to Position(X = 1, Y = 0, Z = 1),
    // Bottom layer
    19 to Position(X = -1, Y = -1, Z = -1),
    20 to Position(X = 0, Y = -1, Z = -1),
    21 to Position(X = 1, Y = -1, Z = -1),
    22 to Position(X = -1, Y = -1, Z = 0),
    23 to Position(X = 0, Y = -1, Z = 0),
    24 to Position(X = 1, Y = -1, Z = 0),
    25 to Position(X = -1, Y = -1, Z = 1),
    26 to Position(X = 0, Y = -1, Z = 1),
    27 to Position(X = 1, Y = -1, Z = 1)
)
