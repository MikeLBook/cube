import RubiksCube from "../engine/RubiksCube";
import { JSONEquals } from "../utils";

// Implemented by whatever presents the cube (3D view, 2D view, a robot). After the solver
// makes a move on the engine it awaits settled(), giving the representation time to present
// that move before the next one. This is the only thing the solver knows about the outside
// world — it never references a concrete representation.
export interface MovePacer {
  // Resolves once the representation has finished presenting the latest move (animation
  // or motor movement complete). A representation may reject the Promise to signal a failure.
  settled(): Promise<void>;
}

const positionMap = {
  1: { X: -1, Y: 1, Z: -1 },
  2: { X: 0, Y: 1, Z: -1 },
  3: { X: 1, Y: 1, Z: -1 },
  4: { X: -1, Y: 1, Z: 0 },
  5: { X: 0, Y: 1, Z: 0 },
  6: { X: 1, Y: 1, Z: 0 },
  7: { X: -1, Y: 1, Z: 1 },
  8: { X: 0, Y: 1, Z: 1 },
  9: { X: 1, Y: 1, Z: 1 },
  // Middle layer
  10: { X: -1, Y: 0, Z: -1 },
  11: { X: 0, Y: 0, Z: -1 },
  12: { X: 1, Y: 0, Z: -1 },
  13: { X: -1, Y: 0, Z: 0 },
  14: { X: 0, Y: 0, Z: 0 },
  15: { X: 1, Y: 0, Z: 0 },
  16: { X: -1, Y: 0, Z: 1 },
  17: { X: 0, Y: 0, Z: 1 },
  18: { X: 1, Y: 0, Z: 1 },
  // Bottom layer
  19: { X: -1, Y: -1, Z: -1 },
  20: { X: 0, Y: -1, Z: -1 },
  21: { X: 1, Y: -1, Z: -1 },
  22: { X: -1, Y: -1, Z: 0 },
  23: { X: 0, Y: -1, Z: 0 },
  24: { X: 1, Y: -1, Z: 0 },
  25: { X: -1, Y: -1, Z: 1 },
  26: { X: 0, Y: -1, Z: 1 },
  27: { X: 1, Y: -1, Z: 1 },
};

export default class RubiksCubeSolver {
  private rubiks: RubiksCube;
  private pacer: MovePacer;

  constructor(rubiks: RubiksCube, pacer: MovePacer) {
    this.rubiks = rubiks;
    this.pacer = pacer;
  }

  // Mutate the engine one move at a time and wait for the presentation to settle
  // before continuing. The finished solver will loop until the cube is solved;
  // This placeholder is under active development
  public async run(signal?: AbortSignal) {
    // switch to while loop
    if (this.rubiks.isSolved || signal?.aborted) return;
    const move = this.determineNextMove();
    move();
    await this.pacer.settled();
  }

  private determineNextMove(): () => void {
    const yellowFaceCube = this.rubiks.cubes.find(
      (cube) => cube.isFace && cube.hasFace("Y"),
    );

    if (!yellowFaceCube) throw new Error("Unable to locate Yellow Face Cube");

    if (JSONEquals(yellowFaceCube.position, positionMap[23])) {
      return () => this.rubiks.rotateRubiksCube("YCW");
    } else if (JSONEquals(yellowFaceCube.position, positionMap[17])) {
      return () => this.rubiks.rotateRubiksCube("YCW");
    } else if (JSONEquals(yellowFaceCube.position, positionMap[11])) {
      return () => this.rubiks.rotateRubiksCube("YCCW");
    } else if (JSONEquals(yellowFaceCube.position, positionMap[13])) {
      return () => this.rubiks.rotateRubiksCube("XCCW");
    } else if (JSONEquals(yellowFaceCube.position, positionMap[15])) {
      return () => this.rubiks.rotateRubiksCube("XCW");
    } else {
      return () => {};
    }
  }
}
