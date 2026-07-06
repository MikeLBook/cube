import { positionMap } from "../../utils";
import RubiksCubeSolver from "../RubiksCubeSolver";

export default async function solveYellowEdges(solver: RubiksCubeSolver) {
  // Solve top facing yellow edge cubes
  const yellowTops = solver.rubiks.cubes.filter(
    (cube) => cube.orientation.top === "Y" && cube.isEdge,
  );

  for (const yellowTop of yellowTops) {
    if (yellowTop.isInLeftLayer) {
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
    } else if (yellowTop.isInBackLayer) {
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
    } else if (yellowTop.isInRightLayer) {
      solver.rubiks.rotateRubiksCube("XCW");
      await solver.pacer.settled();
    }

    if (
      solver.cubeMap.get(positionMap[17])?.orientation.front !==
      yellowTop.orientation.front
    ) {
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();

      do {
        solver.rubiks.rotateBottomCW();
        await solver.pacer.settled();
        solver.rubiks.rotateRubiksCube("XCCW");
        await solver.pacer.settled();
      } while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !==
        yellowTop.orientation.front
      );

      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
      return;
    }
  }

  // Solve bottom facing yellow edge cubes
  const yellowBottoms = solver.rubiks.cubes.filter(
    (cube) => cube.orientation.bottom === "Y" && cube.isEdge,
  );

  for (const yellowBottom of yellowBottoms) {
    if (yellowBottom.isInLeftLayer) {
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
    } else if (yellowBottom.isInBackLayer) {
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
    } else if (yellowBottom.isInRightLayer) {
      solver.rubiks.rotateRubiksCube("XCW");
      await solver.pacer.settled();
    }

    while (
      solver.cubeMap.get(positionMap[17])?.orientation.front !==
      yellowBottom.orientation.front
    ) {
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
    }

    solver.rubiks.rotateFrontCW();
    await solver.pacer.settled();
    solver.rubiks.rotateFrontCW();
    await solver.pacer.settled();
    return;
  }

  // Solve outward facing yellow edge cubes (one at a time)
  const yellowEdge = solver.rubiks.cubes.find(
    (cube) =>
      cube.isEdge &&
      cube.hasFace("Y") &&
      cube.orientation.top !== "Y" &&
      cube.orientation.bottom !== "Y",
  );

  if (yellowEdge) {
    if (yellowEdge.orientation.left === "Y") {
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
    } else if (yellowEdge.orientation.back === "Y") {
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
    } else if (yellowEdge.orientation.right === "Y") {
      solver.rubiks.rotateRubiksCube("XCW");
      await solver.pacer.settled();
    }

    if (yellowEdge.isInBottomLayer) {
      while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !==
        yellowEdge.orientation.bottom
      ) {
        solver.rubiks.rotateBottomCW();
        await solver.pacer.settled();
        solver.rubiks.rotateRubiksCube("XCCW");
        await solver.pacer.settled();
      }
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      solver.rubiks.rotateYMidCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateYMidCW();
      await solver.pacer.settled();
    } else if (yellowEdge.isInLeftLayer) {
      solver.rubiks.rotateLeftCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateLeftCW();
      await solver.pacer.settled();
      while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !==
        yellowEdge.orientation.front
      ) {
        solver.rubiks.rotateBottomCW();
        await solver.pacer.settled();
        solver.rubiks.rotateRubiksCube("XCCW");
        await solver.pacer.settled();
      }
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
    } else if (yellowEdge.isInRightLayer) {
      solver.rubiks.rotateRightCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      solver.rubiks.rotateRightCW();
      await solver.pacer.settled();
      while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !==
        yellowEdge.orientation.front
      ) {
        solver.rubiks.rotateBottomCW();
        await solver.pacer.settled();
        solver.rubiks.rotateRubiksCube("XCCW");
        await solver.pacer.settled();
      }
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
    } else if (yellowEdge.isInTopLayer) {
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
      solver.rubiks.rotateFrontCW();
      await solver.pacer.settled();
      while (
        solver.cubeMap.get(positionMap[17])?.orientation.front !==
        yellowEdge.orientation.bottom
      ) {
        solver.rubiks.rotateBottomCW();
        await solver.pacer.settled();
        solver.rubiks.rotateRubiksCube("XCCW");
        await solver.pacer.settled();
      }
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      solver.rubiks.rotateYMidCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateYMidCW();
      await solver.pacer.settled();
    }
    return;
  }
  debugger;
  console.error(
    "not sure how I got to the end of solveYellowEdges with no operation to perform",
  );
  return;
}
