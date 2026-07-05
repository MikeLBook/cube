import Cube from "../engine/Cube";
import { OrientationKey } from "../engine/models";
import RubiksCube from "../engine/RubiksCube";
import { JSONEquals, positionMap } from "../utils";
import RubiksCubeSolver from "./RubiksCubeSolver";

export function isOutsideLayerSolved(
  orientation: OrientationKey,
  rubiks: RubiksCube,
): boolean {
  const cubesInLayer = rubiks.cubes.filter(
    (cube) => cube.orientation[orientation] !== undefined,
  );

  const allFacesMatch = cubesInLayer.every(
    (cube, _, cubes) =>
      cube.orientation[orientation] === cubes[0].orientation[orientation],
  );
  if (!allFacesMatch) return false;

  const otherOrientationKeys: OrientationKey[] = [];
  cubesInLayer
    .filter((cube) => !cube.isFace)
    .forEach((cube) => {
      for (const [key, value] of Object.entries(cube.orientation)) {
        if (value !== cube.orientation[orientation] && value !== undefined) {
          otherOrientationKeys.push(key as OrientationKey);
        }
      }
    });
  const dedupedKeys = [...new Set(otherOrientationKeys)];

  return dedupedKeys.every((orientation: OrientationKey) => {
    const row = cubesInLayer
      .filter((cube) => !cube.isFace)
      .filter((cube) => cube.orientation[orientation] !== undefined);
    return row.every((cube) =>
      JSONEquals(
        cube.orientation[orientation],
        row[0].orientation[orientation],
      ),
    );
  });
}

export function isMiddleLayerSolved(
  yellowOrientation: OrientationKey,
  rubiks: RubiksCube,
): boolean {
  const cubesInLayer = ((o: OrientationKey): Cube[] => {
    switch (o) {
      case "top":
      case "bottom":
        return rubiks.cubes.filter((cube) => cube.isInXMidLayer);
      case "left":
      case "right":
        return rubiks.cubes.filter((cube) => cube.isInYMidLayer);
      case "front":
      case "back":
        return rubiks.cubes.filter((cube) => cube.isInZMidLayer);
    }
  })(yellowOrientation);

  let orientationKeys: OrientationKey[] = [];
  cubesInLayer
    .filter((cube) => {
      return !JSONEquals(cube.position, { X: 0, Y: 0, Z: 0 });
    })
    .forEach((cube) => {
      for (const [key, value] of Object.entries(cube.orientation)) {
        if (value !== undefined) {
          orientationKeys.push(key as OrientationKey);
        }
      }
    });
  const dedupedKeys = [...new Set(orientationKeys)];
  return dedupedKeys.every((orientation: OrientationKey) => {
    const row = cubesInLayer
      .filter((cube) => !JSONEquals(cube.position, { X: 0, Y: 0, Z: 0 }))
      .filter((cube) => cube.orientation[orientation] !== undefined);
    return row.every((cube) =>
      JSONEquals(
        cube.orientation[orientation],
        row[0].orientation[orientation],
      ),
    );
  });
}

export function hasSolvedYellowEdges(solver: RubiksCubeSolver): boolean {
  const topEdges = solver.rubiks.cubes.filter(
    (cube) => cube.isEdge && cube.orientation.top !== undefined,
  );
  if (!topEdges.every((cube) => cube.orientation.top === "Y")) return false;

  const frontEdge = topEdges.find((cube) => cube.isInFrontLayer);
  const leftEdge = topEdges.find((cube) => cube.isInLeftLayer);
  const rightEdge = topEdges.find((cube) => cube.isInRightLayer);
  const backEdge = topEdges.find((cube) => cube.isInBackLayer);

  const frontFace = solver.cubeMap.get(positionMap[17]);
  const leftFace = solver.cubeMap.get(positionMap[13]);
  const rightFace = solver.cubeMap.get(positionMap[15]);
  const backFace = solver.cubeMap.get(positionMap[11]);

  if (frontEdge?.orientation.front !== frontFace?.orientation.front)
    return false;
  if (leftEdge?.orientation.left !== leftFace?.orientation.left) return false;
  if (backEdge?.orientation.back !== backFace?.orientation.back) return false;
  if (rightEdge?.orientation.right !== rightFace?.orientation.right)
    return false;
  return true;
}

export function hasSolvedYellowCorners(solver: RubiksCubeSolver): boolean {
  const backLeft = solver.cubeMap.get(positionMap[1]);
  const backRight = solver.cubeMap.get(positionMap[3]);
  const frontLeft = solver.cubeMap.get(positionMap[7]);
  const frontRight = solver.cubeMap.get(positionMap[9]);

  if (
    ![backLeft, backRight, frontLeft, frontRight].every(
      (cube) => cube?.orientation.top === "Y",
    )
  )
    return false;

  const backEdge = solver.cubeMap.get(positionMap[2]);
  const leftEdge = solver.cubeMap.get(positionMap[4]);
  const rightEdge = solver.cubeMap.get(positionMap[6]);
  const frontEdge = solver.cubeMap.get(positionMap[8]);

  if (
    backLeft?.orientation.left !== leftEdge?.orientation.left ||
    backLeft?.orientation.back !== backEdge?.orientation.back
  )
    return false;

  if (
    backRight?.orientation.right !== rightEdge?.orientation.right ||
    backRight?.orientation.back !== backEdge?.orientation.back
  )
    return false;

  if (
    frontLeft?.orientation.left !== leftEdge?.orientation.left ||
    frontLeft?.orientation.front !== frontEdge?.orientation.front
  )
    return false;

  if (
    frontRight?.orientation.right !== rightEdge?.orientation.right ||
    frontRight?.orientation.front !== frontEdge?.orientation.front
  )
    return false;

  return true;
}
