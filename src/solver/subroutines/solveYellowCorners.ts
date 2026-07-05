import { positionMap } from "../../utils";
import RubiksCubeSolver from "../RubiksCubeSolver";

export default async function solveYellowCorners(solver: RubiksCubeSolver) {
  /////////////////////////////////
  // Solve yellow top corner cubes
  /////////////////////////////////
  const backLeft = solver.cubeMap.get(positionMap[1]);
  const backEdge = solver.cubeMap.get(positionMap[2]);
  const leftEdge = solver.cubeMap.get(positionMap[4]);
  if (
    backLeft?.hasFace("Y") &&
    !(
      backLeft?.orientation.top === "Y" &&
      backLeft?.orientation.left === leftEdge?.orientation.left &&
      backLeft?.orientation.back === backEdge?.orientation.back
    )
  ) {
    solver.rubiks.rotateRubiksCube("XCCW");
    await solver.pacer.settled();
    await solveFrontLeftCorner(solver);
    return;
  }

  const backRight = solver.cubeMap.get(positionMap[3]);
  const rightEdge = solver.cubeMap.get(positionMap[6]);
  if (
    backRight?.hasFace("Y") &&
    !(
      backRight?.orientation.top === "Y" &&
      backRight?.orientation.right === rightEdge?.orientation.right &&
      backRight?.orientation.back === backEdge?.orientation.back
    )
  ) {
    solver.rubiks.rotateRubiksCube("XCW");
    await solver.pacer.settled();
    await solveFrontRightCorner(solver);
    return;
  }

  const frontLeft = solver.cubeMap.get(positionMap[7]);
  const frontEdge = solver.cubeMap.get(positionMap[8]);
  if (
    frontLeft?.hasFace("Y") &&
    !(
      frontLeft?.orientation.top === "Y" &&
      frontLeft?.orientation.left === leftEdge?.orientation.left &&
      frontLeft?.orientation.front === frontEdge?.orientation.front
    )
  ) {
    await solveFrontLeftCorner(solver);
    return;
  }

  const frontRight = solver.cubeMap.get(positionMap[9]);
  if (
    frontRight?.hasFace("Y") &&
    !(
      frontRight?.orientation.top === "Y" &&
      frontRight?.orientation.right === rightEdge?.orientation.right &&
      frontRight?.orientation.front === frontEdge?.orientation.front
    )
  ) {
    await solveFrontRightCorner(solver);
    return;
  }

  ////////////////////////////////////
  // Solve yellow bottom corner cubes
  ////////////////////////////////////
  const bottomBackLeft = solver.cubeMap.get(positionMap[19]);
  if (bottomBackLeft?.hasFace("Y")) {
    if (bottomBackLeft.orientation.bottom === "Y") {
      // fuuuuck
    } else if (bottomBackLeft.orientation.left === "Y") {
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      await solveBottomLeft(solver);
    } else {
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      await solveBottomRight(solver);
    }
    return;
  }

  const bottomBackRight = solver.cubeMap.get(positionMap[21]);
  if (bottomBackRight?.hasFace("Y")) {
    if (bottomBackRight.orientation.bottom === "Y") {
      // fuuuuck
    } else if (bottomBackRight.orientation.right === "Y") {
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      await solveBottomRight(solver);
    } else {
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      await solveBottomLeft(solver);
    }
    return;
  }

  const bottomFrontLeft = solver.cubeMap.get(positionMap[25]);
  if (bottomFrontLeft?.hasFace("Y")) {
    if (bottomFrontLeft.orientation.bottom === "Y") {
      // fuuuuuck
    } else if (bottomFrontLeft.orientation.left === "Y") {
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      await solveBottomRight(solver);
    } else {
      await solveBottomLeft(solver);
    }
    return;
  }

  const bottomFrontRight = solver.cubeMap.get(positionMap[27]);
  if (bottomFrontRight?.hasFace("Y")) {
    if (bottomFrontRight.orientation.bottom === "Y") {
      // fuuuuuuck
    } else if (bottomFrontRight.orientation.right === "Y") {
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      await solveBottomLeft(solver);
    } else {
      await solveBottomRight(solver);
    }
    return;
  }
}

async function solveFrontRightCorner(solver: RubiksCubeSolver) {
  const unsolvedCube = solver.cubeMap.get(positionMap[9]);
  if (unsolvedCube?.orientation.front === "Y") {
    solver.rubiks.rotateFrontCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCW();
    await solver.pacer.settled();
    solver.rubiks.rotateFrontCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCW");
    await solver.pacer.settled();
    await solveBottomRight(solver);
  } else if (unsolvedCube?.orientation.top === "Y") {
    solver.rubiks.rotateLeftCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateLeftCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCCW");
    await solver.pacer.settled();
    await solveBottomRight(solver);
  } else {
    solver.rubiks.rotateLeftCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateLeftCW();
    await solver.pacer.settled();
    await solveBottomLeft(solver);
  }
  return;
}

async function solveFrontLeftCorner(solver: RubiksCubeSolver) {
  const unsolvedCube = solver.cubeMap.get(positionMap[7]);
  if (unsolvedCube?.orientation.front === "Y") {
    solver.rubiks.rotateFrontCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateFrontCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCCW");
    await solver.pacer.settled();
    await solveBottomLeft(solver);
  } else if (unsolvedCube?.orientation.top === "Y") {
    solver.rubiks.rotateLeftCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCW();
    await solver.pacer.settled();
    solver.rubiks.rotateLeftCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCW");
    await solver.pacer.settled();
    await solveBottomLeft(solver);
  } else {
    solver.rubiks.rotateLeftCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCW();
    await solver.pacer.settled();
    solver.rubiks.rotateLeftCCW();
    await solver.pacer.settled();
    await solveBottomRight(solver);
  }
  return;
}

async function solveBottomLeft(solver: RubiksCubeSolver) {
  // TODO: Implement Happy Path
  return;
}

async function solveBottomRight(solver: RubiksCubeSolver) {
  // TODO: Implement Happy Path
  return;
}
