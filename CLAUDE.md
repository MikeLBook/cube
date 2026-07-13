# CLAUDE.md

Guidance for working in this repo. For a narrative overview see `README.md`; this file focuses
on the architectural decisions, the invariants that keep the design honest, and the gotchas that
aren't obvious from the code.

## Scope of AI involvement (read first)

This project is a **coding puzzle/challenge**: engineering the cube and its solver by hand is the
whole point. Using AI to design the cube engine or to write the solver would defeat that
purpose, so AI assistance is **restricted** to a narrow perimeter:

- **`src/presentations/3DWeb/`** — the 3D view (everything in the folder: the `3DWeb.ts` entry
  point, its supporting modules, and the `.html`/`.css`).
- **The verification harness** — everything under `src/solver/verification/`.
- **Miscellaneous tooling** — build/config plumbing such as `package.json` scripts and
  `build.mjs`.

**Every other TypeScript file is human-authored and off-limits to AI.** Concretely, the only
`.ts` files AI may edit are the 3D view's modules (everything under `src/presentations/3DWeb/`)
and the verification harness
(`src/solver/verification/Harness.ts`) — the engine (`src/engine/`), the rest of the solver
(everything in `src/solver/` _outside_ `verification/`, including all subroutines and status
checks), the shared interfaces (`src/interfaces/`), the 2D view (`src/presentations/2DWeb/`), and
`src/utils.ts` must stay hand-written. Do not add solver logic, cube-modeling logic, or any other
core code with AI, even if asked to "just fix" something there; flag it and let the human author
it. (Editing this doc, `README.md`, and other Markdown is fine.)

## Commands

```sh
npm install
npm run build     # node build.mjs — bundles each presentation into build/
npm run watch     # same, rebuilding (and re-copying HTML) on change
npx tsc --noEmit -p tsconfig.json   # type-check only (no emit; esbuild does the emit)
```

There is **no browser test runner** and **no lint script** yet. Verify changes with
`tsc --noEmit`, `npm run build`, and by opening the built pages.

The solver, however, has a headless verification harness (`src/solver/verification/`, see its
README):

```sh
npm run verify                       # node src/solver/verification/run.mjs count — tally outcomes over random scrambles
node src/solver/verification/run.mjs realcount <N>    # solve rate driving the real solver.run() (production path)
node src/solver/verification/run.mjs solve '<json>'   # run one scramble through solver.run()
node src/solver/verification/run.mjs repro <outcome>  # shortest scramble producing an outcome
node src/solver/verification/run.mjs trace '<json>'   # step through one scramble
```

It bundles the _real_ engine + solver with esbuild and drives them over thousands of scrambles
with an instant mock `IMovePacer`. It bundles to a git-ignored `dist/` beside itself
(`src/solver/verification/dist/`) and doesn't touch the site build. Because it lives under
`src/` it's part of the `tsc --noEmit` project (so node types resolve and the editor checks it),
but it's written to type-check cleanly, so it passes the check rather than breaking it. Re-run it
after any change to `src/solver/**`.

**Build output.** `build.mjs` (driven by esbuild) emits a flat `build/` directory: the 2D view
ships as `index.{html,css,js}` (the site entry point) and the 3D view as `3D.html` +
`3DWeb.{css,js}`.
`build/` is generated and git-ignored — never edit it by hand. esbuild has no HTML loader, so the
HTML files are copied verbatim; their `href`/`src` attributes must therefore match the built
names (`index.css`, `index.js`, `3D.html`, …), not the source filenames. Output names are
chosen by the entry-point maps in `build.mjs`.

## The mental model

Three roles, kept deliberately decoupled. The long-term goal is a machine that holds a physical
cube and scrambles/solves it in a loop; the web views exist to prove out the architecture before
there's hardware. Keep that endpoint in mind for every decision.

- **Engine** (`src/engine/`) — the pure, synchronous source of truth.
- **Solver** (`src/solver/`) — the "person." Decides and applies moves. Knows nothing about any
  representation beyond a tiny pacing interface.
- **Representations** — the "reporters." Present state to viewers: the 2D net
  (`src/presentations/2DWeb/`), the 3D view (`src/presentations/3DWeb/`), and eventually a
  robot. Observe the engine; never own state.

Dependencies point inward only: representations and the solver depend on the engine; the engine
depends on nothing.

## Layers (inner → outer)

- `src/engine/types.ts` — pure types/constants: `Position`, `Orientation`, `Face`,
  `ORIENTATION_KEYS`, `AXES`, `FACES`, plus the engine's move vocabulary — the
  `LAYER_MOVES`/`ROTATIONS` constants and their `LayerMove`/`Rotation` types.
- `src/interfaces/IRubiksCubeObserver.ts` — the `IRubiksCubeObserver` interface (`onMove`,
  the one-way contract representations implement); default-exported.
- `src/interfaces/IMovePacer.ts` — the `IMovePacer` interface (`settled()`) the solver depends on to
  pace itself against a representation.
- `src/engine/Cube.ts` — one cubie. Holds `position` + `orientation` and the six axis rotations
  (`rotateXCW`…`rotateZCCW`). **Layer membership is derived from orientation, not position**
  (`isInTopLayer = orientation.top !== undefined`), and `rotate()` recomputes `position` from the
  new orientation. Don't "fix" this to be position-based; it's intentional.
- `src/engine/RubiksCube.ts` — the 27 cubies; the singleton source of truth (`getInstance`).
  Exposes the moves, `isSolved` (a getter), `setState`/serialization, and the observer registry.
  **Pure and synchronous** — no DOM, timing, animation, or async. Each move method mutates the
  cubies in place and then calls the private `onMove(move)` to notify observers.
- `src/solver/RubiksCubeSolver.ts` — the solver; depends on `IMovePacer`
  (`src/interfaces/IMovePacer.ts`). Its `do(...moves)` helper applies a sequence of moves,
  `await`ing the pacer between each.
- `src/solver/solutionStatusChecks.ts` — pure predicates ("is this layer/phase solved?").
- `src/solver/subroutines/` — one module per solve phase (e.g. `solveYellowEdges`,
  `solveYellowCorners`, `solveMiddleEdges`); each takes the solver and drives moves through
  `solver.do(...)`.
- `src/presentations/2DWeb/` / `src/presentations/3DWeb/` — the two representations. Each
  folder holds its `.ts` (logic), `.html`, and `.css`; the build flattens them into `build/`.
  The 3D view's logic is split into modules: `3DWeb.ts` (the entry point — the stateful
  `CubeView` core owning the pacing/driver/animation invariants), plus `types.ts`, `config.ts`
  (static tables + derived move→animation lookups), `cubieDom.ts` (cubie DOM build/repaint),
  `dragTurn.ts` (drag-to-turn math), `scramble.ts`, and `panel.ts` (control-panel DOM).

## The observer + pacing contract

State changes propagate one way:

```
source → RubiksCube method → onMove(move) → representation presents the change
```

- `IRubiksCubeObserver.onMove(move?: LayerMove | Rotation)` is defined in
  `src/interfaces/IRubiksCubeObserver.ts`. The
  engine passes the move's identity so a representation can present the specific change (animate
  the right layer, or the whole cube for a `Rotation`). `reset()` passes no move.
- Representations register via `rubiks.addObserver(this)`.
- The **solver mutates the engine directly** (it does not ask a representation to move anything),
  and the representation reacts via `onMove`. The solver's only outward dependency is:

  ```ts
  // src/interfaces/IMovePacer.ts
  interface IMovePacer {
    settled(): Promise<void>
  }
  ```

  The solver is **async** and makes **one move per `await settled()`**. `settled()` resolves once
  the representation has finished presenting the move (instant for 2D, animation-end for 3D, motor
  movement for a robot). This lets the "reporter" pace the "person," keeping the model and the
  representation in **lock-step** — required for the robot, where the model must not race ahead of
  the physical cube.

## Key decisions and why

1. **Singleton engine.** Both pages on a tab share one `RubiksCube` and persist to the same
   `localStorage` key (`cubeState`), so a scramble on one view shows on the other.

2. **Engine stays pure/synchronous.** Animation speed, timing, "fast", move counting, motors —
   none of that belongs in the engine. The `onMove` event carries only the move identity; any
   view-only metadata is the view's concern (see the 3D view's one-shot `movePresentation` hint).

3. **Observer carries the move.** Earlier `onMove()` carried nothing, so a representation couldn't
   animate a change it didn't initiate. Passing `move` is what makes solver-driven animation
   possible without the view diffing state.

4. **Solver is async + paced (not a generator, not a fixed delay, not buffered).** The robot
   future settles this: a real solver does async work (camera, planning), actuation is fallible
   and variable-duration, and "scramble/solve forever" needs clean cancellation — all natural with
   `async`/`await` + `AbortSignal`. A generator can't `await`; a fixed delay couples the solver to
   animation timing; buffering (let the solver finish instantly, replay later) would let the model
   race ahead of the physical cube, which is exactly wrong for a robot.

5. **One animation path in the 3D view.** _Every_ change — drag, keyboard, button, scramble,
   solver — mutates the engine first and is animated _after the fact_ in `onMove`. There is no
   separate "animate then commit" path. This is the literal realization of "all downstream effects
   flow through `onMove`."

6. **Every move source is paced so the engine never outruns the animation.** This is the
   invariant that makes (5) correct — see below.

## Invariants to preserve (3D view)

These are load-bearing. Breaking them brings back the "animate then teleport" bug.

- **The engine is never mutated while `animating` is true.** That guarantee is what lets `onMove`
  always animate exactly one fresh move. It's upheld by pacing every source:
  - Discrete manual turns (`userMove`/`userCubeMove`) early-return if `animating || driving`.
  - Multi-move sources (scramble, solver) are **paced "drivers"**: `runSequence` runs an async
    loop that applies one move then `await settled()`. `settled()` only resolves when idle.
  - Only one driver runs at a time (`driving`), and manual input is locked out while one runs.
- **A post-mutation spin works because the DOM still shows the pre-move state** when `onMove`
  fires (we don't `renderCube` until the spin settles). Spinning the affected layer/world by 90°
  lands exactly where the settling `renderCube` repaints it. Don't render before animating.
- **`reset()` is the one intentional exception** — it force-stops (aborts the driver, wakes it via
  `flushSettled`, cleans up in-flight animation DOM) and settles instantly. It does not gate on
  `animating`.
- The `movePresentation` hint is **one-shot**: `onMove` consumes and clears it. Set it immediately
  before the engine call (synchronous, no gap before `onMove`).

## Behavior choices worth knowing

- **Manual input is dropped while animating, not queued.** Inputting faster than the ~290ms turn
  drops the extra (drag already behaved this way). This is the trade for a single animation path.
- **Manual input is locked out during a scramble or solve.** ("Don't grab the cube while the robot
  turns it.")
- Session bookkeeping for manual turns (timer, move count, solved detection) lives in
  `afterUserMove` — it runs for user turns only. The solver's layer turns are counted in `onMove`
  while a timed attempt is in the `solving` state (gated on `solverActive`); scramble moves and
  whole-cube rotations never count.

## Status

`RubiksCubeSolver.run()` is a real **layer-by-layer solve** (yellow face first). It inspects the
cube, orients yellow to the top, then advances a `solutionPhase` field through the `SolutionPhase`
phases, **looping until `rubiks.isSolved`**. All seven phases are implemented in `subroutines/`:
yellow-edge, yellow-corner, middle-edge, white-face-edge, white-face-corner, and the two
last-layer phases — `CompleteCorners` (`solveFinalCorners`, permute the top corners into their
solved slots, gated by `hasCompletedCorners`) and `CompleteEdges` (`solveFinalEdges`, permute the
top edges, gated by `rubiks.isSolved`). The last two place the top layer's side stickers, so the
solve now runs through to a fully solved cube. Building this out required **no changes** to the
engine or the representations — that's the test of whether the decoupling held.

The headless verification harness (`src/solver/verification/`) drives the full pipeline to
`rubiks.isSolved` over thousands of random scrambles and the solver **solves all of them** —
confirmed both by `count` (a hand-rolled phase loop with independent per-phase checks) and by
`realcount`/`solve` (which drive the real `solver.run()`, the production path). Re-run
`npm run verify` after any `src/solver/**` change and expect `✅ all N scrambles solved`.

When adding solve logic, drive every move through `solver.do(...)` (one move per `await settled()`)
rather than calling engine methods directly — that's what keeps the solver paced against the
representation.
