import Cube from '../engine/Cube'
import { OrientationKey } from '../engine/types'
import RubiksCube from '../engine/RubiksCube'
import { cubesShareFace, JSONEquals } from '../utils'
import RubiksCubeSolver from './RubiksCubeSolver'

export function isOutsideLayerSolved(orientation: OrientationKey, rubiks: RubiksCube): boolean {
  const cubesInLayer = rubiks.cubes.filter((cube) => cube.orientation[orientation] !== undefined)

  const allFacesMatch = cubesShareFace(orientation, ...cubesInLayer)
  if (!allFacesMatch) return false

  const otherOrientationKeys: OrientationKey[] = []
  cubesInLayer
    .filter((cube) => !cube.isFace)
    .forEach((cube) => {
      for (const [key, value] of Object.entries(cube.orientation)) {
        if (value !== cube.orientation[orientation] && value !== undefined) {
          otherOrientationKeys.push(key as OrientationKey)
        }
      }
    })
  const dedupedKeys = [...new Set(otherOrientationKeys)]

  return dedupedKeys.every((orientation: OrientationKey) => {
    const row = cubesInLayer
      .filter((cube) => !cube.isFace)
      .filter((cube) => cube.orientation[orientation] !== undefined)
    return cubesShareFace(orientation, ...row)
  })
}

export function isMiddleLayerSolved(
  yellowOrientation: OrientationKey,
  rubiks: RubiksCube
): boolean {
  const cubesInLayer = ((o: OrientationKey): Cube[] => {
    switch (o) {
      case 'top':
      case 'bottom':
        return rubiks.cubes.filter((cube) => cube.isInXMidLayer)
      case 'left':
      case 'right':
        return rubiks.cubes.filter((cube) => cube.isInYMidLayer)
      case 'front':
      case 'back':
        return rubiks.cubes.filter((cube) => cube.isInZMidLayer)
    }
  })(yellowOrientation)

  let orientationKeys: OrientationKey[] = []
  cubesInLayer
    .filter((cube) => {
      return !JSONEquals(cube.position, { X: 0, Y: 0, Z: 0 })
    })
    .forEach((cube) => {
      for (const [key, value] of Object.entries(cube.orientation)) {
        if (value !== undefined) {
          orientationKeys.push(key as OrientationKey)
        }
      }
    })
  const dedupedKeys = [...new Set(orientationKeys)]
  return dedupedKeys.every((orientation: OrientationKey) => {
    const row = cubesInLayer
      .filter((cube) => !JSONEquals(cube.position, { X: 0, Y: 0, Z: 0 }))
      .filter((cube) => cube.orientation[orientation] !== undefined)
    return cubesShareFace(orientation, ...row)
  })
}

export function hasSolvedYellowEdges(solver: RubiksCubeSolver): boolean {
  const topEdges = solver.rubiks.cubes.filter(
    (cube) => cube.isEdge && cube.orientation.top !== undefined
  )
  if (!topEdges.every((cube) => cube.orientation.top === 'Y')) return false

  const frontEdge = topEdges.find((cube) => cube.isInFrontLayer)
  const leftEdge = topEdges.find((cube) => cube.isInLeftLayer)
  const rightEdge = topEdges.find((cube) => cube.isInRightLayer)
  const backEdge = topEdges.find((cube) => cube.isInBackLayer)

  const frontFace = solver.fetchPosition(17)
  const leftFace = solver.fetchPosition(13)
  const rightFace = solver.fetchPosition(15)
  const backFace = solver.fetchPosition(11)

  if (!cubesShareFace('front', frontEdge, frontFace)) return false
  if (!cubesShareFace('left', leftEdge, leftFace)) return false
  if (!cubesShareFace('back', backEdge, backFace)) return false
  if (!cubesShareFace('right', rightEdge, rightFace)) return false
  return true
}

export function hasSolvedYellowCorners(solver: RubiksCubeSolver): boolean {
  const backLeft = solver.fetchPosition(1)
  const backRight = solver.fetchPosition(3)
  const frontLeft = solver.fetchPosition(7)
  const frontRight = solver.fetchPosition(9)

  if (![backLeft, backRight, frontLeft, frontRight].every((cube) => cube?.orientation.top === 'Y'))
    return false

  const backEdge = solver.fetchPosition(2)
  const leftEdge = solver.fetchPosition(4)
  const rightEdge = solver.fetchPosition(6)
  const frontEdge = solver.fetchPosition(8)

  if (!cubesShareFace('left', backLeft, leftEdge) || !cubesShareFace('back', backLeft, backEdge))
    return false

  if (
    !cubesShareFace('right', backRight, rightEdge) ||
    !cubesShareFace('back', backRight, backEdge)
  )
    return false

  if (
    !cubesShareFace('left', frontLeft, leftEdge) ||
    !cubesShareFace('front', frontLeft, frontEdge)
  )
    return false

  if (
    !cubesShareFace('right', frontRight, rightEdge) ||
    !cubesShareFace('front', frontRight, frontEdge)
  )
    return false

  return true
}

export function hasSolvedWhiteFaceEdges(solver: RubiksCubeSolver): boolean {
  const backEdge = solver.fetchPosition(2)
  const leftEdge = solver.fetchPosition(4)
  const rightEdge = solver.fetchPosition(6)
  const frontEdge = solver.fetchPosition(8)

  return [backEdge, leftEdge, rightEdge, frontEdge].every((edge) => edge?.orientation.top === 'W')
}

export function hasSolvedWhiteFaceCorners(solver: RubiksCubeSolver): boolean {
  const backLeft = solver.fetchPosition(1)
  const backRight = solver.fetchPosition(3)
  const frontLeft = solver.fetchPosition(7)
  const frontRight = solver.fetchPosition(9)

  return [backLeft, backRight, frontLeft, frontRight].every((edge) => edge?.orientation.top === 'W')
}

export function hasCompletedCorners(solver: RubiksCubeSolver): boolean {
  const backLeft = solver.fetchPosition(1)
  const backRight = solver.fetchPosition(3)
  const frontLeft = solver.fetchPosition(7)
  const frontRight = solver.fetchPosition(9)

  return (
    [backLeft, backRight, frontLeft, frontRight].every(
      (corner) => corner?.orientation.top === 'W'
    ) &&
    cubesShareFace('back', backLeft, backRight) &&
    cubesShareFace('left', backLeft, frontLeft) &&
    cubesShareFace('front', frontLeft, frontRight) &&
    cubesShareFace('right', frontRight, backRight)
  )
}
