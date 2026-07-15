// Port of ../src/solver/solutionStatusChecks.ts — pure predicates: is a layer/phase solved?
package com.mikeb.simplepuzzlecube.solver

import com.mikeb.simplepuzzlecube.cubesShareFace
import com.mikeb.simplepuzzlecube.engine.Cube
import com.mikeb.simplepuzzlecube.engine.Face
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Position
import com.mikeb.simplepuzzlecube.engine.RubiksCube

fun isOutsideLayerSolved(orientation: OrientationKey, rubiks: RubiksCube): Boolean {
    val cubesInLayer = rubiks.cubes.filter { cube -> cube.orientation[orientation] != null }

    val allFacesMatch = cubesShareFace(orientation, *cubesInLayer.toTypedArray())
    if (!allFacesMatch) return false

    val otherOrientationKeys = mutableListOf<OrientationKey>()
    cubesInLayer
        .filter { cube -> !cube.isFace }
        .forEach { cube ->
            for ((key, value) in cube.orientation.entries()) {
                if (value != cube.orientation[orientation] && value != null) {
                    otherOrientationKeys.add(key)
                }
            }
        }
    val dedupedKeys = otherOrientationKeys.toSet()

    return dedupedKeys.all { o ->
        val row = cubesInLayer
            .filter { cube -> !cube.isFace }
            .filter { cube -> cube.orientation[o] != null }
        cubesShareFace(o, *row.toTypedArray())
    }
}

fun isMiddleLayerSolved(yellowOrientation: OrientationKey, rubiks: RubiksCube): Boolean {
    val cubesInLayer: List<Cube> = when (yellowOrientation) {
        OrientationKey.top,
        OrientationKey.bottom -> rubiks.cubes.filter { cube -> cube.isInXMidLayer }
        OrientationKey.left,
        OrientationKey.right -> rubiks.cubes.filter { cube -> cube.isInYMidLayer }
        OrientationKey.front,
        OrientationKey.back -> rubiks.cubes.filter { cube -> cube.isInZMidLayer }
    }

    val orientationKeys = mutableListOf<OrientationKey>()
    cubesInLayer
        .filter { cube -> cube.position != Position(0, 0, 0) }
        .forEach { cube ->
            for ((key, value) in cube.orientation.entries()) {
                if (value != null) {
                    orientationKeys.add(key)
                }
            }
        }
    val dedupedKeys = orientationKeys.toSet()
    return dedupedKeys.all { o ->
        val row = cubesInLayer
            .filter { cube -> cube.position != Position(0, 0, 0) }
            .filter { cube -> cube.orientation[o] != null }
        cubesShareFace(o, *row.toTypedArray())
    }
}

fun hasSolvedYellowEdges(solver: RubiksCubeSolver): Boolean {
    val topEdges = solver.rubiks.cubes.filter { cube ->
        cube.isEdge && cube.orientation.top != null
    }
    if (!topEdges.all { cube -> cube.orientation.top == Face.Y }) return false

    val frontEdge = topEdges.find { cube -> cube.isInFrontLayer }
    val leftEdge = topEdges.find { cube -> cube.isInLeftLayer }
    val rightEdge = topEdges.find { cube -> cube.isInRightLayer }
    val backEdge = topEdges.find { cube -> cube.isInBackLayer }

    val frontFace = solver.fetchPosition(17)
    val leftFace = solver.fetchPosition(13)
    val rightFace = solver.fetchPosition(15)
    val backFace = solver.fetchPosition(11)

    if (!cubesShareFace(OrientationKey.front, frontEdge, frontFace)) return false
    if (!cubesShareFace(OrientationKey.left, leftEdge, leftFace)) return false
    if (!cubesShareFace(OrientationKey.back, backEdge, backFace)) return false
    if (!cubesShareFace(OrientationKey.right, rightEdge, rightFace)) return false
    return true
}

fun hasSolvedYellowCorners(solver: RubiksCubeSolver): Boolean {
    val backLeft = solver.fetchPosition(1)
    val backRight = solver.fetchPosition(3)
    val frontLeft = solver.fetchPosition(7)
    val frontRight = solver.fetchPosition(9)

    if (!listOf(backLeft, backRight, frontLeft, frontRight).all { cube -> cube?.orientation?.top == Face.Y }) {
        return false
    }

    val backEdge = solver.fetchPosition(2)
    val leftEdge = solver.fetchPosition(4)
    val rightEdge = solver.fetchPosition(6)
    val frontEdge = solver.fetchPosition(8)

    if (!cubesShareFace(OrientationKey.left, backLeft, leftEdge) ||
        !cubesShareFace(OrientationKey.back, backLeft, backEdge)
    ) {
        return false
    }

    if (!cubesShareFace(OrientationKey.right, backRight, rightEdge) ||
        !cubesShareFace(OrientationKey.back, backRight, backEdge)
    ) {
        return false
    }

    if (!cubesShareFace(OrientationKey.left, frontLeft, leftEdge) ||
        !cubesShareFace(OrientationKey.front, frontLeft, frontEdge)
    ) {
        return false
    }

    if (!cubesShareFace(OrientationKey.right, frontRight, rightEdge) ||
        !cubesShareFace(OrientationKey.front, frontRight, frontEdge)
    ) {
        return false
    }

    return true
}

fun hasSolvedWhiteFaceEdges(solver: RubiksCubeSolver): Boolean {
    val backEdge = solver.fetchPosition(2)
    val leftEdge = solver.fetchPosition(4)
    val rightEdge = solver.fetchPosition(6)
    val frontEdge = solver.fetchPosition(8)

    return listOf(backEdge, leftEdge, rightEdge, frontEdge).all { edge ->
        edge?.orientation?.top == Face.W
    }
}

fun hasSolvedWhiteFaceCorners(solver: RubiksCubeSolver): Boolean {
    val backLeft = solver.fetchPosition(1)
    val backRight = solver.fetchPosition(3)
    val frontLeft = solver.fetchPosition(7)
    val frontRight = solver.fetchPosition(9)

    return listOf(backLeft, backRight, frontLeft, frontRight).all { edge ->
        edge?.orientation?.top == Face.W
    }
}

fun hasCompletedCorners(solver: RubiksCubeSolver): Boolean {
    val backLeft = solver.fetchPosition(1)
    val backRight = solver.fetchPosition(3)
    val frontLeft = solver.fetchPosition(7)
    val frontRight = solver.fetchPosition(9)

    return listOf(backLeft, backRight, frontLeft, frontRight).all { corner ->
        corner?.orientation?.top == Face.W
    } &&
        cubesShareFace(OrientationKey.back, backLeft, backRight) &&
        cubesShareFace(OrientationKey.left, backLeft, frontLeft) &&
        cubesShareFace(OrientationKey.front, frontLeft, frontRight) &&
        cubesShareFace(OrientationKey.right, frontRight, backRight)
}
