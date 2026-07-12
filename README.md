# Cube

A Rubik's Cube engine with multiple representations — a 2D net view, a 3D interactive
view — and a pluggable solver. The long-term goal is a machine that holds a physical cube and
scrambles/solves it in a loop; the web views are how we prove out the architecture before
there's hardware.

> **A note on AI.** This project is a coding puzzle/challenge — modeling the cube and writing the
> solver by hand is the point, and using AI to represent or solve the cube would be antithetical
> to its spirit. AI involvement is therefore restricted to the **3D view**
> (`src/presentations/3DWeb/`), the **verification harness** (`src/solver/verification/`), and
> **miscellaneous tooling** (e.g. `package.json` scripts). Every TypeScript file except `3DWeb.ts`
> and the harness's `Harness.ts` — the engine, the rest of the solver, the 2D view, and
> `utils.ts` — is human-authored.

## Layers

The codebase is built in deliberate layers, inner to outer. Each layer knows only about the
ones beneath it.

```
                 types  (Position, Orientation, Face; move names: LayerMove, Rotation)
                   │
                  Cube  (one cubie: position + sticker orientation, rotation methods)
                   │
              RubiksCube  (the 27 cubies; the single source of truth; emits move events)
                 │   │
         ┌───────┘   └────────────┐
       Solver                Representations
   (decides moves)     (2D view · 3D view · …robot)
```

- **`src/engine/types.ts`** — pure types and constants shared everywhere, including the engine's
  move vocabulary (`LayerMove`, `Rotation`).
- **`src/engine/Cube.ts`** — a single cubie. Knows its position and which colour faces which
  way, and how to rotate itself about each axis.
- **`src/engine/RubiksCube.ts`** — the whole cube and the **single source of truth** for state.
  A singleton (`getInstance`) so every representation on a page sees the same cube. It exposes
  the moves (`rotateTopCW`, … , `rotateRubiksCube`, `reset`), `isSolved`, and
  `setState`/serialization. It is **pure and synchronous** — it knows nothing about animation,
  timing, pixels, or motors.

This inner core was built and validated first; everything outside it is a consumer.

## The observer pattern: how representations stay in sync

`RubiksCube` doesn't draw anything. After every state change it notifies observers, passing
the move that caused it:

```ts
// src/interfaces/IRubiksCubeObserver.ts
interface IRubiksCubeObserver {
  onMove: (move?: LayerMove | Rotation) => void
}
```

A representation implements `onMove` and registers via `rubiks.addObserver(this)`. The flow is
always:

```
input → RubiksCube method call → onMove(move) → representation presents the change
```

- The **2D view** (`src/presentations/2DWeb/`) is the simplest consumer: `onMove` just
  re-renders the net and writes the state to `localStorage` (shared with the 3D page).
- The **3D view** (`src/presentations/3DWeb/`) animates. _Every_ change is animated the
  same way: after the fact, from the move in the `onMove` event — there is one animation path,
  whether the move came from a drag, the keyboard, a button, a scramble, or the solver.

The move identity in the event is what lets the 3D view animate the correct layer (or the whole
cube, for a `Rotation`) for a change it didn't initiate.

Because the engine mutates synchronously but animation takes time, the 3D view keeps the engine
from running ahead of the animation by **pacing every source**: discrete manual turns apply only
while the view is idle, and multi-move sources (scramble, solver) are paced "drivers" that apply
one move then wait for it to be presented (see below). This guarantees each `onMove` animates
exactly one fresh move.

## The solver and the pacing contract

The **solver** is the "person" solving the cube. It has direct access to `RubiksCube` and
mutates it directly — it does not ask a representation to move anything. It is decoupled from
every representation; the only thing it knows about the outside world is a small interface it
uses to pace itself:

```ts
// src/interfaces/IMovePacer.ts
interface IMovePacer {
  settled(): Promise<void> // resolves when the latest move has been fully presented
}
```

The solver is **async** and makes **one move per `await`**:

```ts
async run(signal?: AbortSignal) {
  while (/* not solved */) {
    this.determineNextMove();   // mutate the engine directly → fires onMove
    await this.pacer.settled(); // wait for the representation to present it
  }
}
```

Think of the representation as a **reporter** broadcasting each change to viewers. It is allowed
to tell the solver to slow down: it resolves `settled()` only once it has finished presenting
the move. This keeps the model and the representation in **lock-step** — essential for the
eventual robot, where the model must not race ahead of the physical cube.

Each representation implements `IMovePacer.settled()` for its own medium:

| Representation           | `settled()` resolves when…                           |
| ------------------------ | ---------------------------------------------------- |
| 2D view / headless tests | immediately (presentation is instant)                |
| 3D view                  | the move's CSS animation finishes                    |
| Robot (future)           | the physical turn completes (and rejects on a fault) |

In the 3D view, `CubeView` implements both `IRubiksCubeObserver` (to learn what changed) and
`IMovePacer` (to pace a driver). One click runs the solver's whole paced sequence; `reset()`
aborts an in-flight driver via the `AbortSignal`.

The same `IMovePacer` mechanism paces the 3D view's own **scramble**: it's just another paced
driver (apply a random turn → `await settled()` → repeat), so the solver isn't special — any
multi-move source shares one pacing path. Only one driver runs at a time, and manual input is
locked out while one is active.

### Why async (not a generator or a fixed delay)

The robot future drives the choice: a real solver will do async work (read the cube via a
camera, compute a solution), actuation is fallible and variable-duration, and "scramble and
solve forever" needs clean cancellation. `async`/`await` with an `AbortSignal` models all of
this directly, where a synchronous generator could not, and a hard-coded delay would couple the
solver to animation timing.

## Project layout

```
src/
  engine/
    types.ts                types + constants (incl. LayerMove/Rotation move names)
    Cube.ts                 one cubie
    RubiksCube.ts           the cube; source of truth; emits onMove
  interfaces/
    IRubiksCubeObserver.ts  observer interface (onMove)
    IMovePacer.ts               pacing interface (settled) the solver depends on
  utils.ts                  (de)serialization guards, position map, isRotation
  solver/
    RubiksCubeSolver.ts     the "person"; async, paced via IMovePacer
    solutionStatusChecks.ts predicates: is a given layer/phase solved?
    subroutines/            per-phase solving routines (solveYellowEdges, solveYellowCorners, solveMiddleEdges, …)
  presentations/
    2DWeb/                  2DWeb.ts/.html/.css   — 2D net view (observer)
    3DWeb/                  3DWeb.ts/.html/.css   — 3D interactive view (observer + IMovePacer)
build.mjs                   esbuild build → build/
```

`RubiksCubeSolver.run()` implements a **layer-by-layer solve** (yellow face first). It's
**under active development**: the yellow-edge, yellow-corner, middle-edge, and white-face-edge
phases are implemented, while the last phase (`WhiteFaceCorners`) is still stubbed and `throw`s.
Fleshing it out requires no changes to the engine or the representations — the
decoupling is the point.

Solver routines never call an engine move directly; they apply moves through `solver.do(...)`,
which runs each move and `await`s the pacer between them, so a whole algorithm is one paced call:

```ts
await solver.do('rotateFrontCW', 'rotateFrontCW', 'rotateBottomCW')
```

## Build & run

```sh
npm install
npm run build      # node build.mjs — bundles each presentation into build/
npm run watch      # rebuild (and re-copy HTML) on change
```

The build emits a flat `build/` directory (git-ignored): the 2D view as `index.{html,css,js}`
and the 3D view as `3DWeb.{html,css,js}`. Open `build/index.html` (2D net) or
`build/3DWeb.html` (3D) in a browser. Both pages share cube state through `localStorage`, so a
scramble on one is reflected on the other.

There is no browser test runner, but the solver has a headless verification harness that bundles
the real engine + solver and drives them over thousands of random scrambles with an instant
`IMovePacer` (see `src/solver/verification/README.md`):

```sh
npm run verify                       # tally outcomes over random scrambles
node src/solver/verification/run.mjs repro <outcome>  # find the shortest scramble producing an outcome
node src/solver/verification/run.mjs trace '<json>'   # step through one scramble
```

### 3D view controls

- Drag a face to turn that layer; drag the background to orbit.
- `w`/`a`/`s`/`d` roll & spin the whole cube; keys map to face turns (see `onKey`).
- **Solve** runs the solver as a paced animation.
