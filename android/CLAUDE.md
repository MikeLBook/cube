# android/CLAUDE.md

Guidance for the Android port. Read the repo-root `CLAUDE.md` first for the overall architecture
and the (unusual) AI-scope rules; this file covers what's specific to `android/`.

## What this app is

A native Android port of the TypeScript Rubik's cube project one directory up. The port is a
**deliberate, near-verbatim TypeScript→Kotlin translation of the engine and solver** — not a
redesign. The whole point is to find out how cleanly the original decoupled architecture survives
the move to a different language, UI toolkit, and concurrency model. A faithful translation that
"just works" is the win; if something resists translating, that's a finding about the original
design, not license to redesign it.

The TypeScript files under `../src/` are the **canonical spec**. When porting, keep Kotlin names,
file layout, and control flow parallel to their TS counterparts so any divergence is obvious at a
glance.

**Status: the port is complete** — engine, solver, verification harness (all three lenses green at
20000/20000, matching the TS record), and a Compose app with two renderers (2D net and a
software-projected 3D cube) sharing one ViewModel/pacer. See "How it's laid out" below.

## MVVM mapping

The web project's three roles map onto Android MVVM like this:

| Web (TypeScript)                          | Android (Kotlin / MVVM)                                    |
|-------------------------------------------|------------------------------------------------------------|
| Engine (`RubiksCube`, source of truth)    | **Model** — the "SceneState" the UI renders from           |
| Solver (the "person")                     | driven by the **ViewModel**; acts directly on the engine   |
| Presentations (2D/3D observers)           | **View** — Composables that observe via the ViewModel      |
| `IRubiksCubeObserver.onMove(move)`        | the ViewModel observes the engine; publishes a `UiState`   |
| `IMovePacer.settled()`                    | a `suspend fun` resumed when the View acknowledges a move  |

The engine stays the single mutable source of truth. `CubeViewModel` (the counterpart of the web
`CubeView` core in `3DWeb.ts`) owns the solver and **is** both the observer and the pacer: engine
`onMove` events become an immutable `UiState` snapshot (a `StateFlow`) carrying a one-shot
`pendingMove`; the active renderer presents it (a turn animation in 3D, a presentation delay for
the net) and acknowledges via `moveSettled(id)`, which is what resumes a paced driver's
`settled()` await. Composables render from `UiState` and never own cube state.

## How it's laid out

- **`:core`** — pure Kotlin/JVM, **no Android dependencies** (enforced: it applies only
  `kotlin("jvm")`). The port of `../src/`: `engine/` (`Types.kt`, `Cube.kt`, `RubiksCube.kt`),
  `interfaces/`, `solver/` (+ `solver/subroutines/`, `solutionStatusChecks.kt`), and top-level
  `Utils.kt`. Package root `com.mikeb.simplepuzzlecube`.
  - Test sources hold the **verification harness** (`verification/Harness.kt`, a member-for-member
    port of `../src/solver/verification/Harness.ts`), the JUnit gate (`VerificationTest.kt`),
    engine tests, the **TS-parity fixture test** (`EngineParityTest.kt`), and a `TraceTool.kt`
    `main()` mirroring the TS `run.mjs` debug modes.
- **`:app`** — the Compose application; depends on `:core`. The presentation layer lives under
  `ui/`, organized as the MVVM triad so each file's architectural role is visible from its path:
  - `ui/viewmodel/` — **the view controller.** `CubeViewModel.kt` (pacing/drivers/session — the
    `3DWeb.ts` CubeView port; the only class that touches the engine/solver) and `UiState.kt`
    (the immutable snapshot it publishes — the contract the views render from).
  - `ui/view/` — **everything composable, or used only by composables.** `CubeScreen.kt` (the
    composition point: renderer toggle, panel wiring, the net mode's presentation-delay
    handshake), `NetView.kt` (2D net), `Panel.kt` (status row + controls), `theme/` (Material
    theme), and `cube3d/` — the 3D renderer: `Cube3DView.kt` (Canvas + gestures + turn
    animation) with its composable-only math helpers `Projection.kt` and `DragTurn.kt`
    (`pickTurn` port). `ProjectionTest.kt` (JVM unit test, same package) pins the animation
    sign mapping. `theme/Color.kt` holds the design tokens ported from the web views' shared
    palette (`3DWeb.css` `:root` + the `config.ts` sticker colors) — the app is dark-only,
    like the web, with no dynamic color. The cubie look mirrors `cubieDom.ts`: a dark
    rounded plastic face carrying an inset rounded, glossed sticker.
  - `ui/model/` — presentation-layer model vocabulary shared by both sides: `Scramble.kt`, the
    Singmaster notation tables (`MoveKey`/`MOVES`, `CubeMoveKey`) and scramble generation, used
    by the ViewModel to apply turns and by the views to label buttons and resolve drags.

Dependencies point inward only, exactly as in the web project: `:app` → `:core`; `:core` → nothing
Android. If engine or solver code ever needs an Android type, the design has drifted — stop and
reconsider rather than adding the dependency.

## Translation decisions (settled — apply consistently)

- `as const` string-literal-union types → **enums**, keeping the TS camelCase constant names
  (`rotateTopCW`, `XCW`) so call sites stay grep-parallel. The `LayerMove | Rotation` union is a
  **`sealed interface Move`** implemented by both enums.
- `async` / `Promise<void>` → **`suspend fun`**; `IMovePacer.settled()` → `suspend fun settled()`.
- **`solver.do(...)` keeps its name via backticks** (`` suspend fun `do`(vararg moves: Move) ``) —
  `do` is a Kotlin keyword, but hundreds of call sites staying identical to the spec wins.
- `AbortSignal` → **coroutine cancellation**: `run()` loops `while (coroutineContext.isActive …)`.
  Divergence note (documented in the code): cancellation *also* throws at the next `settled()`
  suspension, unwinding mid-subroutine — a faster abort than TS. Either way `run()` skips its
  trailing self-`reset()` on a throw, so abort/error paths must call `solver.reset()` (the
  ViewModel and harness both do, mirroring the web).
- `Record<Union, fn>` dispatch tables (`Moves`, `Phases`) → **exhaustive `when`**, branches in TS
  table order.
- `Orientation` → a **data class with six nullable `Face?` fields** plus `get(key)`/`values()`/
  `entries()` helpers standing in for indexed access / `Object.values` / `Object.entries`.
- `Position` → a **data class**; its structural equality replaces every `JSON.stringify` key:
  `cubeMap: Map<Position, Cube>`, `positionMap: Map<Int, Position>`, and TS `JSONEquals`
  disappears entirely.
- `JSON.parse` + structural guards in `setState` → **kotlinx-serialization's dynamic `JsonElement`
  API** (runtime dep only — no `@Serializable`, no compiler plugin; multiplatform, so `:core`
  stays Android-free). `RubiksCube.serialize()` emits the same wire shape the web writes to
  `localStorage` (null orientation keys omitted). Cross-implementation comparisons must be
  **structural**, never string-equal — TS emits orientation keys in `rotate()`-construction order.
- TS `!` non-null assertions → `!!` (they encode reachability invariants; let them crash loudly).
- Singleton engine (`getInstance`) → private constructor + companion `getInstance()`, preserving
  the shared-instance semantics the solver, harness, and ViewModel all rely on. Tests run
  sequentially in one JVM against it — **never add an in-JVM parallel test runner to `:core`**.

## Invariants to preserve

- **One mutable source of truth.** All state lives in the engine; the View renders a projection
  (`UiState` copies, never live `Cube` references).
- **One-way propagation.** Every change mutates the engine first and is presented afterward via
  the `onMove` path — never animate-then-commit. (The 3D view renders the *post-move* state with
  the turned layer rotated back, then eases it to rest — landing is exact by construction;
  `ProjectionTest` pins the sign mapping for all 24 moves.)
- **One move per `settled()`.** The solver applies a move, then awaits the pacer; the model must
  never outrun the presentation. This is what makes the eventual robot correct, and it's the
  reason the solver is `suspend`.
- **Manual input is dropped while presenting, not queued**, and locked out entirely while a
  driver (scramble/solve) runs. `reset()` is the one force-stop exception to pacing.

## Commands

Run from `android/` (or pass `-p android` from the repo root):

```sh
./gradlew :core:test                    # headless JVM verification — the Kotlin `npm run verify`
./gradlew :core:test -DVERIFY_N=20000   # scale the scramble count (default 2000/2000/1000)
./gradlew :core:test -DVERIFY_SEED=123  # fuzz a different deterministic seed (default 424242)
./gradlew :app:testDebugUnitTest        # :app unit tests (projection sign pinning)
./gradlew :app:assembleDebug            # build the app (also type-checks/compiles everything)
./gradlew :app:installDebug             # install on a running emulator/device
```

There is no separate type-check step — the Gradle build compiles Kotlin and fails on type errors.
Re-run `:core:test` after any change under `:core` and expect **all scrambles solved** across all
three lenses (`count` / `realcount` / `statecount`); any non-`ok` outcome is a bug to trace, not
noise. On failure the assertion message prints the seed and the first failing scramble as a JSON
move array — replay it with `verification/TraceTool.kt` (run its `main()` from the IDE) **or**
against the TS reference via `node src/solver/verification/run.mjs trace '<json>'`; both accept
the same format. The TS harness's `state '<json>'` mode regenerates the parity fixture in
`EngineParityTest.kt` if the fixed scramble ever changes.

## Port roadmap — done

All phases landed and verified in order:

- **A.** `../src/engine/types.ts` → enums / data classes — `engine/Types.kt`. ✅
- **B.** `Cube` + `RubiksCube` engine, verbatim (+ `serialize()`/`setState` via `JsonElement`). ✅
- **C.** `../src/interfaces/*` + `../src/utils.ts` → `interfaces/`, `Utils.kt`. ✅
- **D.** Solver + `solutionStatusChecks` + all 8 subroutines, transcribed loop-for-loop. ✅
- **E.** Verification harness as JVM tests — **20000/20000 solved** on `count`, `realcount`, and
  (10000) `statecount`, matching the TS record. ✅
- **F1.** Compose ViewModel + acknowledged pacer + 2D net + control panel + `SharedPreferences`
  persistence of `cubeState` (restored via `setState` on launch — the same wire format as the
  web's `localStorage`). Verified on-device: paced scramble/solve/abort/reset, state survives
  process kill. ✅
- **F2.** Canvas 3D renderer (software projection + painter's algorithm — Compose `graphicsLayer`
  has no `preserve-3d`, so the CSS-3D approach doesn't port), `Animatable` layer turns that
  acknowledge the pacer on animation end, drag-to-turn (`pickTurn` ported verbatim), orbit drag,
  recenter (the panel's "Recenter" button, inline with the driver buttons and shown in 3D mode
  only, plus double-tap; both ease the camera home like the web's `resetView()`). ✅

The engine and presentations needed **no changes** to accommodate each other — the same result as
the web build-out, now confirmed in a second language and UI toolkit.
