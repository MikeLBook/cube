import Cube from "../engine/Cube";
import { OrientationKey } from "../engine/models";
import RubiksCube from "../engine/RubiksCube";
import { JSONEquals, positionMap } from "../utils";

// Implemented by whatever presents the cube (3D view, 2D view, a robot). After the solver
// makes a move on the engine it awaits settled(), giving the representation time to present
// that move before the next one. This is the only thing the solver knows about the outside
// world — it never references a concrete representation.
export interface MovePacer {
  // Resolves once the representation has finished presenting the latest move (animation
  // or motor movement complete). A representation may reject the Promise to signal a failure.
  settled(): Promise<void>;
}

const SOLUTION_PHASES = [
  "YellowEdges",
  "YellowCorners",
  "MiddleEdges",
  "WhiteFaceEdges",
  "WhiteFaceCorners",
] as const;
type SolutionPhase = (typeof SOLUTION_PHASES)[number];

export default class RubiksCubeSolver {
  private rubiks: RubiksCube;
  private pacer: MovePacer;
  private yellowLayerSolved: boolean | undefined;
  private middleLayerSolved: boolean | undefined;
  private solutionPhase: SolutionPhase = "YellowEdges";

  constructor(rubiks: RubiksCube, pacer: MovePacer) {
    this.rubiks = rubiks;
    this.pacer = pacer;
  }

  get cubeMap(): Map<string, Cube> {
    const cubeMap = new Map<string, Cube>();
    this.rubiks.cubes.forEach((cube) =>
      cubeMap.set(JSON.stringify(cube.position), cube),
    );
    return cubeMap;
  }

  public reset() {
    this.yellowLayerSolved = undefined;
    this.middleLayerSolved = undefined;
    this.solutionPhase = "YellowEdges";
  }

  // Mutate the engine one move at a time and wait for the presentation to settle
  // before continuing. The finished solver will loop until the cube is solved;
  // This placeholder is under active development
  public async run(signal?: AbortSignal) {
    if (!this.rubiks.isSolved && !signal?.aborted) {
      this.determineNextMove();
    }
  }

  private async determineNextMove() {
    if (this.yellowLayerSolved === undefined) {
      this.performInitialInspection();
    } else {
      this.updateSolveStatus();
    }
  }

  private async performInitialInspection() {
    const yellowFaceCube = this.rubiks.cubes.find(
      (cube) => cube.isFace && cube.hasFace("Y"),
    );
    if (!yellowFaceCube) throw new Error("Unable to locate Yellow Face Cube");

    const orientation = yellowFaceCube.getFaceOrientation("Y");
    if (!orientation)
      throw new Error("Unable to determine Yellow Face Cube Orientation");

    this.yellowLayerSolved = this.isOutsideLayerSolved(orientation);
    this.middleLayerSolved = this.yellowLayerSolved
      ? this.isMiddleLayerSolved(orientation)
      : false;

    if (this.middleLayerSolved) {
      this.solutionPhase = "WhiteFaceEdges";
    } else if (this.yellowLayerSolved) {
      this.solutionPhase = "MiddleEdges";
    }
    if (
      !(
        this.yellowLayerSolved &&
        this.middleLayerSolved &&
        yellowFaceCube.isInTopLayer
      )
    ) {
      this.rotateYellowFaceToTop(yellowFaceCube);
    }
  }

  private async updateSolveStatus() {
    switch (this.solutionPhase) {
      case "YellowEdges":
        if (this.hasSolvedYellowEdges()) {
          this.solutionPhase = "YellowCorners";
          this.updateSolveStatus();
        } else {
          this.solveYellowEdges();
        }
        break;
      case "YellowCorners":
        if (this.hasSolvedYellowCorners()) {
          this.solutionPhase = "MiddleEdges";
          this.updateSolveStatus();
        } else {
          this.solveYellowCorners();
        }
        break;
      case "MiddleEdges":
        if (this.isMiddleLayerSolved("top")) {
          this.solutionPhase = "WhiteFaceEdges";
          this.updateSolveStatus();
        } else {
          this.solveMiddleEdges();
        }
        break;
      case "WhiteFaceEdges":
        if (this.hasSolvedWhiteFaceEdges()) {
          this.solutionPhase = "WhiteFaceCorners";
          this.updateSolveStatus();
        } else {
          this.solveWhiteFaceEdges();
        }
        break;
      case "WhiteFaceCorners":
        if (this.hasSolvedWhiteFaceCorners()) {
          console.log("what now");
        } else {
          this.solveWhiteFaceCorners();
        }
        break;
    }
  }

  hasSolvedYellowCorners(): boolean {
    throw new Error("Method not implemented.");
  }
  solveYellowCorners() {
    throw new Error("Method not implemented.");
  }
  solveMiddleEdges() {
    throw new Error("Method not implemented.");
  }
  hasSolvedWhiteFaceEdges(): boolean {
    throw new Error("Method not implemented.");
  }
  solveWhiteFaceEdges() {
    throw new Error("Method not implemented.");
  }
  hasSolvedWhiteFaceCorners(): boolean {
    throw new Error("Method not implemented.");
  }
  solveWhiteFaceCorners() {
    throw new Error("Method not implemented.");
  }

  // CHECKS
  private isOutsideLayerSolved(orientation: OrientationKey): boolean {
    const cubesInLayer = this.rubiks.cubes.filter(
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

  private isMiddleLayerSolved(yellowOrientation: OrientationKey): boolean {
    const cubesInLayer = ((o: OrientationKey): Cube[] => {
      switch (o) {
        case "top":
        case "bottom":
          return this.rubiks.cubes.filter((cube) => cube.isInXMidLayer);
        case "left":
        case "right":
          return this.rubiks.cubes.filter((cube) => cube.isInYMidLayer);
        case "front":
        case "back":
          return this.rubiks.cubes.filter((cube) => cube.isInZMidLayer);
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

  hasSolvedYellowEdges(): boolean {
    const topEdges = this.rubiks.cubes.filter(
      (cube) => cube.isEdge && cube.orientation.top !== undefined,
    );
    if (!topEdges.every((cube) => cube.orientation.top === "Y")) return false;

    const frontEdge = topEdges.find((cube) => cube.isInFrontLayer);
    const leftEdge = topEdges.find((cube) => cube.isInLeftLayer);
    const rightEdge = topEdges.find((cube) => cube.isInRightLayer);
    const backEdge = topEdges.find((cube) => cube.isInBackLayer);

    const frontFace = this.cubeMap.get(positionMap[17]);
    const leftFace = this.cubeMap.get(positionMap[13]);
    const rightFace = this.cubeMap.get(positionMap[15]);
    const backFace = this.cubeMap.get(positionMap[11]);

    if (frontEdge?.orientation.front !== frontFace?.orientation.front)
      return false;
    if (leftEdge?.orientation.left !== leftFace?.orientation.left) return false;
    if (backEdge?.orientation.back !== backFace?.orientation.back) return false;
    if (rightEdge?.orientation.right !== rightFace?.orientation.right)
      return false;
    return true;
  }

  // MOVES
  private async rotateYellowFaceToTop(yellowCube: Cube) {
    if (yellowCube === this.cubeMap.get(positionMap[23])) {
      this.rubiks.rotateRubiksCube("YCW");
      await this.pacer.settled();
      this.rubiks.rotateRubiksCube("YCW");
      await this.pacer.settled();
    } else if (yellowCube === this.cubeMap.get(positionMap[17])) {
      this.rubiks.rotateRubiksCube("YCW");
      await this.pacer.settled();
    } else if (yellowCube === this.cubeMap.get(positionMap[11])) {
      this.rubiks.rotateRubiksCube("YCCW");
      await this.pacer.settled();
    } else if (yellowCube === this.cubeMap.get(positionMap[13])) {
      this.rubiks.rotateRubiksCube("ZCW");
      await this.pacer.settled();
    } else if (yellowCube === this.cubeMap.get(positionMap[15])) {
      this.rubiks.rotateRubiksCube("ZCCW");
      await this.pacer.settled();
    }
  }

  private async solveYellowEdges() {
    // Solve top facing yellow edge cubes
    const yellowTops = this.rubiks.cubes.filter(
      (cube) => cube.orientation.top === "Y" && cube.isEdge,
    );

    for (const yellowTop of yellowTops) {
      if (yellowTop.isInLeftLayer) {
        this.rubiks.rotateRubiksCube("XCCW");
        await this.pacer.settled();
      } else if (yellowTop.isInBackLayer) {
        this.rubiks.rotateRubiksCube("XCCW");
        await this.pacer.settled();
        this.rubiks.rotateRubiksCube("XCCW");
        await this.pacer.settled();
      } else if (yellowTop.isInRightLayer) {
        this.rubiks.rotateRubiksCube("XCW");
        await this.pacer.settled();
      }

      if (
        this.cubeMap.get(positionMap[17])?.orientation.front !==
        yellowTop.orientation.front
      ) {
        this.rubiks.rotateFrontCW();
        await this.pacer.settled();
        this.rubiks.rotateFrontCW();
        await this.pacer.settled();

        do {
          this.rubiks.rotateBottomCW();
          await this.pacer.settled();
          this.rubiks.rotateRubiksCube("XCCW");
          await this.pacer.settled();
        } while (
          this.cubeMap.get(positionMap[17])?.orientation.front !==
          yellowTop.orientation.front
        );

        this.rubiks.rotateFrontCW();
        await this.pacer.settled();
        this.rubiks.rotateFrontCW();
        await this.pacer.settled();
        break;
      }
    }

    // Solve bottom facing yellow edge cubes
    debugger;
    // Rotate cube to locate any front facing yellows. Rotate appropriate side down, bottom layer left, then back up. Repeat above
    // If no bottom facing yellows and no outside facing yellows, need to shuffle top.
    return;
  }
}
