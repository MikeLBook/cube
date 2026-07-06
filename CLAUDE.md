# CLAUDE.md

Guidance for working in this repo. For a narrative overview see `README.md`; this file focuses
on the architectural decisions, the invariants that keep the design honest, and the gotchas that
aren't obvious from the code.

## Commands

```sh
npm install
npm run build     # node build.mjs — bundles each presentation into build/
npm run watch     # same, rebuilding (and re-copying HTML) on change
npx tsc --noEmit -p tsconfig.json   # type-check only (no emit; esbuild does the emit)
```

There is **no test runner** and **no lint script** yet. Verify changes with `tsc --noEmit`,
`npm run build`, and by opening the built pages.

**Build output.** `build.mjs` (driven by esbuild) emits a flat `build/` directory: the 2D view
ships as `index.{html,css,js}` (the site entry point) and the 3D view as `3DView.{html,css,js}`.
`build/` is generated and git-ignored — never edit it by hand. esbuild has no HTML loader, so the
HTML files are copied verbatim; their `href`/`src` attributes must therefore match the built
names (`index.css`, `index.js`, `3DView.html`, …), not the source filenames. Output names are
chosen by the entry-point maps in `build.mjs`.

## The mental model

Three roles, kept deliberately decoupled. The long-term goal is a machine that holds a physical
cube and scrambles/solves it in a loop; the web views exist to prove out the architecture before
there's hardware. Keep that endpoint in mind for every decision.

- **Engine** (`src/engine/`) — the pure, synchronous source of truth.
- **Solver** (`src/solver/`) — the "person." Decides and applies moves. Knows nothing about any
  representation beyond a tiny pacing interface.
- **Representations** — the "reporters." Present state to viewers: the 2D net
  (`src/presentations/2DView/`), the 3D view (`src/presentations/3DView/`), and eventually a
  robot. Observe the engine; never own state.

Dependencies point inward only: representations and the solver depend on the engine; the engine
depends on nothing.

## Layers (inner → outer)

- `src/engine/models.ts` — pure types/constants: `Position`, `Orientation`, `Face`,
  `ORIENTATION_KEYS`, `AXES`, `FACES`, etc.
- `src/engine/IRubiksCubeObserver.ts` — the `IRubiksCubeObserver` interface plus the move-name
  constants/types `LayerMove` and `Rotation` (the engine's move vocabulary).
- `src/engine/Cube.ts` — one cubie. Holds `position` + `orientation` and the six axis rotations
  (`rotateXCW`…`rotateZCCW`). **Layer membership is derived from orientation, not position**
  (`isInTopLayer = orientation.top !== undefined`), and `rotate()` recomputes `position` from the
  new orientation. Don't "fix" this to be position-based; it's intentional.
- `src/engine/RubiksCube.ts` — the 27 cubies; the singleton source of truth (`getInstance`).
  Exposes the moves, `isSolved` (a getter), `setState`/serialization, and the observer registry.
  **Pure and synchronous** — no DOM, timing, animation, or async. Each move method mutates the
  cubies in place and then calls the private `onMove(move)` to notify observers.
- `src/solver/RubiksCubeSolver.ts` — the solver + the `MovePacer` interface it depends on. Its
  `do(...moves)` helper applies a sequence of moves, `await`ing the pacer between each.
- `src/solver/solutionStatusChecks.ts` — pure predicates ("is this layer/phase solved?").
- `src/solver/subroutines/` — one module per solve phase (e.g. `solveYellowEdges`,
  `solveYellowCorners`); each takes the solver and drives moves through `solver.do(...)`.
- `src/presentations/2DView/` / `src/presentations/3DView/` — the two representations. Each
  folder holds its `.ts` (logic), `.html`, and `.css`; the build flattens them into `build/`.

## The observer + pacing contract

State changes propagate one way:

```
source → RubiksCube method → onMove(move) → representation presents the change
```

- `IRubiksCubeObserver.onMove(move?: LayerMove | Rotation)` is defined in
  `IRubiksCubeObserver.ts`. The
  engine passes the move's identity so a representation can present the specific change (animate
  the right layer, or the whole cube for a `Rotation`). `reset()` passes no move.
- Representations register via `rubiks.addObserver(this)`.
- The **solver mutates the engine directly** (it does not ask a representation to move anything),
  and the representation reacts via `onMove`. The solver's only outward dependency is:

  ```ts
  interface MovePacer { settled(): Promise<void>; }
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

5. **One animation path in the 3D view.** *Every* change — drag, keyboard, button, scramble,
   solver — mutates the engine first and is animated *after the fact* in `onMove`. There is no
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
- Session bookkeeping (timer, move count, solved detection) lives in `afterUserMove` — it runs for
  user turns only, so scramble and solver moves don't count.

## Status

`RubiksCubeSolver.run()` is a real **layer-by-layer solve** (yellow face first), **under active
development**. It inspects the cube, orients yellow to the top, then advances through solve phases
(`SOLUTION_PHASES`). The yellow-edge and yellow-corner phases are implemented in
`subroutines/`; the middle-layer and white-face phases are still stubbed (they throw
"not implemented"), and `run()` currently takes one phase step per call rather than looping to a
finished cube. Fleshing this out should require **no changes** to the engine or the
representations — that's the test of whether the decoupling held.

When adding solve logic, drive every move through `solver.do(...)` (one move per `await settled()`)
rather than calling engine methods directly — that's what keeps the solver paced against the
representation.
