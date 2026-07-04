import { positionMap } from "../../utils";
import RubiksCubeSolver from "../RubiksCubeSolver";

export default function solveYellowCorners(solver: RubiksCubeSolver) {
  // Solve yellow top corner cubes
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
    // Solve Back Left Corner
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
    // Solve Back Right Corner
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
    // Solve Front Left Corner
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
    // Solve Front Right Corner
    return;
  }

  // Solve yellow bottom corner cubes
  const bottomBackLeft = solver.cubeMap.get(positionMap[19]);
  if (bottomBackLeft?.hasFace("Y")) {
    // Solve Bottom Back Left Corner
    return;
  }

  const bottomBackRight = solver.cubeMap.get(positionMap[21]);
  if (bottomBackRight?.hasFace("Y")) {
    // Solve Bottom Back Right Corner
    return;
  }

  const bottomFrontLeft = solver.cubeMap.get(positionMap[25]);
  if (bottomFrontLeft?.hasFace("Y")) {
    // Solve Bottom Front Left Corner
    return;
  }

  const bottomFrontRight = solver.cubeMap.get(positionMap[27]);
  if (bottomFrontRight?.hasFace("Y")) {
    // Solve Bottom Front Right Corner
    return;
  }
}
