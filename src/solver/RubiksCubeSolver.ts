import RubiksCube from "../engine/RubiksCube";

// Implemented by whatever presents the cube (3D view, 2D view, a robot). After the solver
// makes a move on the engine it awaits settled(), giving the representation time to present
// that move before the next one. This is the only thing the solver knows about the outside
// world — it never references a concrete representation.
export interface MovePacer {
  // Resolves once the representation has finished presenting the latest move (animation
  // or motor movement complete). A representation may reject the Promise to signal a failure.
  settled(): Promise<void>;
}

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
    while (!this.rubiks.isSolved && !signal?.aborted) {
      this.rubiks.rotateBackCCW();
      await this.pacer.settled();
    }
  }
}
