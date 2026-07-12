// Implemented by whatever presents the cube (e.g a web view or a robot). After the Solver
// makes a move on the engine it awaits settled(), giving the presentation time to present
// that move before the next one. This is the only thing the solver knows about the outside
// world — it never references a specific style of presentation.
export interface IMovePacer {
  // Resolves once the presentation has finished presenting the latest move (animation
  // or motor movement complete). A presentation may reject the Promise to signal a failure.
  settled(): Promise<void>
}
