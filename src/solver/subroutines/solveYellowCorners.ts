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
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
      await solveBottomLeftFaceDown(solver);
    } else if (bottomBackLeft.orientation.left === "Y") {
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      await solveBottomLeft(solver);
    } else {
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      await solveBottomRight(solver);
    }
    return;
  }

  const bottomBackRight = solver.cubeMap.get(positionMap[21]);
  if (bottomBackRight?.hasFace("Y")) {
    if (bottomBackRight.orientation.bottom === "Y") {
      solver.rubiks.rotateRubiksCube("XCW");
      await solver.pacer.settled();
      await solveBottomRightFaceDown(solver);
    } else if (bottomBackRight.orientation.right === "Y") {
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      await solveBottomRight(solver);
    } else {
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      await solveBottomLeft(solver);
    }
    return;
  }

  const bottomFrontLeft = solver.cubeMap.get(positionMap[25]);
  if (bottomFrontLeft?.hasFace("Y")) {
    if (bottomFrontLeft.orientation.bottom === "Y") {
      await solveBottomLeftFaceDown(solver);
    } else if (bottomFrontLeft.orientation.left === "Y") {
      solver.rubiks.rotateBottomCCW();
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
      await solveBottomRightFaceDown(solver);
    } else if (bottomFrontRight.orientation.right === "Y") {
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      await solveBottomLeft(solver);
    } else {
      await solveBottomRight(solver);
    }
    return;
  }
}

////////////////////////////////////
// Solve for specific cubes
////////////////////////////////////
async function solveFrontRightCorner(solver: RubiksCubeSolver) {
  const unsolvedCube = solver.cubeMap.get(positionMap[9]);
  if (unsolvedCube?.orientation.front === "Y") {
    solver.rubiks.rotateFrontCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateFrontCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCW");
    await solver.pacer.settled();
    await solveBottomRight(solver);
  } else if (unsolvedCube?.orientation.top === "Y") {
    solver.rubiks.rotateRightCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRightCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCCW");
    await solver.pacer.settled();
    await solveBottomRight(solver);
  } else {
    solver.rubiks.rotateRightCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRightCW();
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
    solver.rubiks.rotateBottomCW();
    await solver.pacer.settled();
    solver.rubiks.rotateFrontCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCCW");
    await solver.pacer.settled();
    await solveBottomLeft(solver);
  } else if (unsolvedCube?.orientation.top === "Y") {
    solver.rubiks.rotateLeftCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateLeftCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCW");
    await solver.pacer.settled();
    await solveBottomLeft(solver);
  } else {
    solver.rubiks.rotateLeftCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateBottomCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateLeftCW();
    await solver.pacer.settled();
    await solveBottomRight(solver);
  }
  return;
}

async function solveBottomLeftFaceDown(solver: RubiksCubeSolver) {
  let unsolvedWorkingCube = false;
  do {
    const topLeftCorner = solver.cubeMap.get(positionMap[7]);
    const topLeftEdge = solver.cubeMap.get(positionMap[4]);
    const topFrontEdge = solver.cubeMap.get(positionMap[8]);
    if (
      topLeftCorner?.orientation.top !== "Y" ||
      topLeftCorner.orientation.left !== topLeftEdge?.orientation.left ||
      topLeftCorner.orientation.front !== topFrontEdge?.orientation.front
    ) {
      unsolvedWorkingCube = true;
    } else {
      solver.rubiks.rotateBottomCW();
      await solver.pacer.settled();
      solver.rubiks.rotateRubiksCube("XCCW");
      await solver.pacer.settled();
    }
  } while (!unsolvedWorkingCube);

  solver.rubiks.rotateBottomCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateLeftCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateBottomCW();
  await solver.pacer.settled();
  solver.rubiks.rotateLeftCW();
  await solver.pacer.settled();
  solver.rubiks.rotateFrontCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateBottomCW();
  await solver.pacer.settled();
  solver.rubiks.rotateFrontCW();
  await solver.pacer.settled();
  solver.rubiks.rotateBottomCCW();
  await solveBottomLeft(solver);
  return;
}

async function solveBottomRightFaceDown(solver: RubiksCubeSolver) {
  let unsolvedWorkingCube = false;
  do {
    const topRightCorner = solver.cubeMap.get(positionMap[9]);
    const topRightEdge = solver.cubeMap.get(positionMap[6]);
    const topFrontEdge = solver.cubeMap.get(positionMap[8]);
    if (
      topRightCorner?.orientation.top !== "Y" ||
      topRightCorner.orientation.right !== topRightEdge?.orientation.right ||
      topRightCorner.orientation.front !== topFrontEdge?.orientation.front
    ) {
      unsolvedWorkingCube = true;
    } else {
      solver.rubiks.rotateBottomCCW();
      await solver.pacer.settled();
      solver.rubiks.rotateRubiksCube("XCW");
      await solver.pacer.settled();
    }
  } while (!unsolvedWorkingCube);

  solver.rubiks.rotateBottomCW();
  await solver.pacer.settled();
  solver.rubiks.rotateLeftCW();
  await solver.pacer.settled();
  solver.rubiks.rotateBottomCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateLeftCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateFrontCW();
  await solver.pacer.settled();
  solver.rubiks.rotateBottomCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateFrontCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateBottomCW();
  await solveBottomRight(solver);
  return;
}

async function solveBottomLeft(solver: RubiksCubeSolver) {
  const cube = solver.cubeMap.get(positionMap[25]);
  while (
    cube?.orientation.left !==
    solver.cubeMap.get(positionMap[13])?.orientation.left
  ) {
    solver.rubiks.rotateBottomCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCCW");
    await solver.pacer.settled();
  }
  solver.rubiks.rotateBottomCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateLeftCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateBottomCW();
  await solver.pacer.settled();
  solver.rubiks.rotateLeftCW();
  await solver.pacer.settled();
  return;
}

async function solveBottomRight(solver: RubiksCubeSolver) {
  const cube = solver.cubeMap.get(positionMap[27]);
  while (
    cube?.orientation.right !==
    solver.cubeMap.get(positionMap[15])?.orientation.right
  ) {
    solver.rubiks.rotateBottomCCW();
    await solver.pacer.settled();
    solver.rubiks.rotateRubiksCube("XCW");
    await solver.pacer.settled();
  }
  solver.rubiks.rotateBottomCW();
  await solver.pacer.settled();
  solver.rubiks.rotateLeftCW();
  await solver.pacer.settled();
  solver.rubiks.rotateBottomCCW();
  await solver.pacer.settled();
  solver.rubiks.rotateLeftCCW();
  await solver.pacer.settled();
  return;
}
