# Solver verification & troubleshooting

The app has **no test runner**. This folder is how we verify and debug the solver
without opening a browser. It bundles the *real* engine + solver (via esbuild, the
same bundler the site uses) and drives them headlessly over thousands of random
scrambles with a mock, instant `MovePacer`.

## Running it

```sh
npm run verify                       # tally outcomes over 5000 random scrambles
node src/solver/verification/run.mjs count 20000      # ...over N scrambles
node src/solver/verification/run.mjs repro <outcome>  # find the SHORTEST scramble with that outcome
node src/solver/verification/run.mjs trace '["rotateBackCCW"]'   # step through one scramble
```

The harness lives in `src/solver/verification/` (`Harness.ts` + `run.mjs`). `build/` is
git-ignored and wiped by `npm run build`, so `run.mjs` bundles to a git-ignored `dist/`
beside itself (`src/solver/verification/dist/`) instead. It does **not** touch the site
build, and although it now sits under `src/`, `tsconfig.json` **excludes**
`src/solver/verification`, so it never affects `tsc --noEmit`.

## Latest verification result

The yellow layer (edges → corners), the middle-layer edges, **and** the final-layer
white cross form on **every** scramble:

```
full pipeline (edges + corners + middle edges + white cross): 20000 / 20000  ok
```

Re-run `npm run verify` after any change to `src/solver/**` and expect
`✅ all N scrambles solved`. Anything else is a regression.

> Scope note: the solver currently solves through the **final-layer white cross** (phases
> `YellowEdges`, `YellowCorners`, `MiddleEdges`, `WhiteFaceEdges`). After the middle layer,
> the harness calls `moveToFinalLayer()` — flipping white on top, as `run()` does — then
> drives `solveWhiteFaceEdges` until the cross is formed. `WhiteFaceCorners` onward remain
> stubs; the harness stops at the white cross.
>
> Orientation-flip note: the `edges/corners/middle` ground truths are defined
> **yellow-on-top** and stop applying once `moveToFinalLayer()` flips white up. Both
> `runSeq` and `trace` assert (or gate) the yellow-side checks *before* the flip, then switch
> to `whiteCrossSolved()` afterward. The white-cross check is orientation-only (each top edge
> shows white up) — that is genuinely all the phase targets, so it is not permutation-matched.
>
> Middle-edge coverage note: the harder branch — all four bottom edges carry white, so
> a misplaced equator edge must first be *extracted* to the bottom before re-inserting —
> fires in ~38% of solves, so it is genuinely exercised, not skipped. The equator
> extraction's two `if` blocks (`isInLeftLayer` / `isInRightLayer`) never both fire in a
> single call, so the missing `else` is safe (verified: 0 double-fires / 20000).

## The debugging playbook (how the current bugs were found)

The solver mutates the engine one move at a time; you cannot eyeball it. Use these
three tools in order:

1. **`count`** — classify the failure. Each outcome is a distinct failure mode:
   | outcome | meaning |
   |---|---|
   | `ok` | solved through the white cross (only success) |
   | `edges-stuck` / `corners-stuck` / `middle-stuck` / `white-edges-stuck` | subroutine returned making **no progress**, solver spun in place |
   | `edge-check-early` / `corner-check-early` / `middle-check-early` / `white-edge-check-early` | a completion check reported "done" while the layer/cross was **not** actually solved → phase advanced too early |
   | `checks-disagree` | ground truth says solved but a completion check disagrees |
   | `budget` | a subroutine **infinite-looped** (a `while`/`do-while` whose exit condition can never be met) |

2. **`repro <outcome>`** — brute-forces the **shortest** scramble producing that
   outcome (often 1–2 moves). Short repros are decisive; long ones aren't.

3. **`trace '<json>'`** — replays one scramble and prints, per subroutine call, the
   top/bottom cubies + centers and **every engine move** made. Read it for:
   - `moves: (NONE ...)` → the subroutine took no action = a stall bug.
   - a repeating move tail before `THREW` → the runaway `while` loop; look at what
     it compares. (Corners spun forever matching a **white** sticker to a side
     center — side centers are never white, so it never terminated.)

For a specific loop, add a temporary `console.log` guarded by
`if ((globalThis as any).__DBG)` inside the subroutine and set `__DBG` in the trace;
that's how the runaway loop's state was captured. Remove it afterward.

### Two engine facts that make the geometry non-obvious

- **The cubie rotation method names don't match the geometric axis.** On `Cube`,
  `rotateXCW` keeps top/bottom fixed (it's a spin about the **vertical** axis);
  `rotateYCW` keeps left/right fixed (spin about the **left-right** axis). Track
  *stickers*, not the letters. `rotateRubiksCube("XCCW")` brings the **left** face
  to the **front**; `"XCW"` brings the **right** face to the front.
- **The alignment loops keep the bottom layer fixed while spinning the rest.** A
  `rotateBottomCW()` immediately followed by `rotateRubiksCube("XCCW")` cancels out
  for bottom-layer cubies (`rotateXCW` then `rotateXCCW` = identity) but rotates the
  top+middle. That's *why* naive left/right mirroring of a subroutine is wrong (see
  below) — the loop reorients the whole cube differently on each side.

### The left↔right subroutine symmetry (transform `T`)

`solveYellowCorners.ts` has mirror-image left/right routines. The correct transform
between a working **Left** routine and its **Right** twin is **not** a plain
reflection. It is:

> swap `Left`↔`Right` **keeping** CW/CCW sense · **reverse** every `Bottom` turn ·
> swap `rotateRubiksCube("XCW")`↔`"XCCW")` · `Front` reversed · swap `solveBottomLeft`↔`solveBottomRight`.

Verified: `T` maps `solveBottomLeft` (loop **and** insert) exactly onto
`solveBottomRight`, and `solveFrontLeftCorner` exactly onto `solveFrontRightCorner`.
The bugs fixed were Right-side routines that had been copy-pasted from the Left side
without applying `T` to the face turns (they still used `Left` turns, and the naive
mirror using `RightCW`↔`LeftCCW` inserts into the *wrong* slot — it lands a corner in
the **back-right** slot instead of **front-right**).

### Reference: which insertion trigger fills which top-corner slot

From a solved cube, each 4-move `[Bottom, Face, Bottom', Face']` trigger disturbs
exactly one top corner. Handy when checking a corner-insertion routine targets the
slot its alignment loop set up:

| trigger | slot filled |
|---|---|
| `Bottom- Left- Bottom+ Left+` | 7 (front-left) — used by `solveBottomLeft` |
| `Bottom+ Right- Bottom- Right+` | 9 (front-right) — used by `solveBottomRight` |
| `Bottom+ Left+ Bottom- Left-` | 1 (back-left) |
| `Bottom+ Right+ Bottom- Right-` | 3 (back-right) |
| `Bottom+ Front+ Bottom- Front-` | 9 (front-right) |

(`+` = CW, `-` = CCW. Slot numbers are `positionMap` indices; see
`RubiksCube.ts`'s ASCII layout.)

## Bugs this harness has already caught (case studies)

1. **`hasSolvedYellowCorners` advanced too early** (`solutionStatusChecks.ts`) —
   an inverted `.every(top !== "Y")` guard and `&&` (should be `||`) between the two
   side-sticker checks let a half-placed corner count as solved.
   → surfaced as `corner-check-early`.
2. **`solveBottomRight` / `solveBottomRightFaceDown`** used `Left`-face turns where
   the front-right slot needs `Right` turns (`rotateLeftCW`→`rotateRightCCW`,
   `rotateLeftCCW`→`rotateRightCW`). Corrupted a solved corner and left a non-yellow
   corner at pos 27, making the alignment loop spin forever.
   → surfaced as `corners-stuck` and `budget`.
3. **`solveYellowEdges` phase 2 stalled on an already-aligned bottom edge** — the
   `F2` insertion lived inside `if (frontCenter !== edge.front)`, so a yellow-down
   edge whose front color already matched its center was never inserted. Fixed by
   making the alignment a `while` (0+ turns) with the `F2` always running.
   → surfaced as `edges-stuck`.
