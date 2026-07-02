import Cube from "../engine/Cube";
import RubiksCube from "../engine/RubiksCube";
import { positionMap } from "../utils";
import {
  hasSolvedYellowEdges,
  isMiddleLayerSolved,
  isOutsideLayerSolved,
} from "./StatusChecks";
import solveYellowEdges from "./subroutines/solveYellowEdges";

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
  rubiks: RubiksCube;
  pacer: MovePacer;
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

    this.yellowLayerSolved = isOutsideLayerSolved(orientation, this.rubiks);
    this.middleLayerSolved = this.yellowLayerSolved
      ? isMiddleLayerSolved(orientation, this.rubiks)
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
      // Set Yellow as the Top
      if (yellowFaceCube === this.cubeMap.get(positionMap[23])) {
        this.rubiks.rotateRubiksCube("YCW");
        await this.pacer.settled();
        this.rubiks.rotateRubiksCube("YCW");
        await this.pacer.settled();
      } else if (yellowFaceCube === this.cubeMap.get(positionMap[17])) {
        this.rubiks.rotateRubiksCube("YCW");
        await this.pacer.settled();
      } else if (yellowFaceCube === this.cubeMap.get(positionMap[11])) {
        this.rubiks.rotateRubiksCube("YCCW");
        await this.pacer.settled();
      } else if (yellowFaceCube === this.cubeMap.get(positionMap[13])) {
        this.rubiks.rotateRubiksCube("ZCW");
        await this.pacer.settled();
      } else if (yellowFaceCube === this.cubeMap.get(positionMap[15])) {
        this.rubiks.rotateRubiksCube("ZCCW");
        await this.pacer.settled();
      }
    }
  }

  private async updateSolveStatus() {
    switch (this.solutionPhase) {
      case "YellowEdges":
        if (hasSolvedYellowEdges(this)) {
          this.solutionPhase = "YellowCorners";
          this.updateSolveStatus();
        } else {
          solveYellowEdges(this);
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
        if (isMiddleLayerSolved("top", this.rubiks)) {
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
}
