import RubiksCube from "../engine/RubiksCube";

// Implemented by whatever presents the cube (3D view, 2D view, a robot). After the solver
// makes a move on the engine it awaits settled(), giving the representation time to present
// that move before the next one. This is the only thing the solver knows about the outside
// world — it never references a concrete representation.
export interface MovePacer {
  // Resolves once the representation has finished presenting the latest move (animation
  // settled / motor movement complete). A representation may reject it to signal a failure.
  settled(): Promise<void>;
}

export default class RubiksCubeSolver {
  private rubiks: RubiksCube;
  private pacer: MovePacer;

  constructor(rubiks: RubiksCube, pacer: MovePacer) {
    this.rubiks = rubiks;
    this.pacer = pacer;
  }

  private determineNextMove() {
    this.rubiks.rotateBackCCW();
  }

  // The "person" solving the cube: mutate the engine one move at a time and wait for the
  // representation to present each before continuing. A real solver would loop until the cube
  // is solved; this placeholder applies a fixed sequence so we can prove out the pacing.
  public async run(signal?: AbortSignal) {
    for (let i = 0; i < 10; i++) {
      if (signal?.aborted) return;
      this.determineNextMove();
      await this.pacer.settled();
    }
  }
}
