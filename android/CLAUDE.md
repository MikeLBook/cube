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

## MVVM mapping

The web project's three roles map onto Android MVVM like this:

| Web (TypeScript)                          | Android (Kotlin / MVVM)                                    |
|-------------------------------------------|------------------------------------------------------------|
| Engine (`RubiksCube`, source of truth)    | **Model** — the "SceneState" the UI renders from           |
| Solver (the "person")                     | driven by the **ViewModel**; acts directly on the engine   |
| Presentations (2D/3D observers)           | **View** — Composables that observe `onMove` and animate   |
| `IRubiksCubeObserver.onMove(move)`        | the ViewModel observes the engine; exposes state to the UI |
| `IMovePacer.settled()`                    | a `suspend` fn that resolves when the animation finishes   |

The engine stays the single mutable source of truth. The ViewModel owns the solver and the pacer,
translates engine `onMove` events into observable UI state (e.g. a `StateFlow`), and handles user
intents (scramble, solve, manual turns). Composables render from that state and animate the move
they're told about — they never own cube state.

## Module layout

- **`:core`** — pure Kotlin/JVM, **no Android dependencies** (enforced: it applies only
  `kotlin("jvm")`). Houses the port of `../src/`: `engine/`, `solver/` (+ `solver/subroutines/`),
  `interfaces/`, and a top-level `Utils.kt`. Package root `com.mikeb.simplepuzzlecube`.
- **`:app`** — the Compose application; depends on `:core`. Houses the View + ViewModel (the
  presentation layer) and Android glue.

Dependencies point inward only, exactly as in the web project: `:app` → `:core`; `:core` → nothing
Android. If engine or solver code ever needs an Android type, the design has drifted — stop and
reconsider rather than adding the dependency.

## Translation notes (TS idiom → Kotlin)

- `as const` string-literal-union types that double as runtime arrays → **enums** (`entries`
  covers both the compile-time union and the runtime-iterable list).
- `async` / `Promise<void>` → **`suspend fun`**; the solver's `do(...)` pacing loop → `suspend`
  with `vararg`.
- `IMovePacer.settled(): Promise<void>` → `suspend fun settled()`.
- `AbortSignal` (solver cancellation) → **coroutine cancellation** / `CoroutineScope.isActive`.
- `Record<Union, fn>` dispatch tables (`Moves`, `Phases`) → `when` over an enum, or an `EnumMap`.
- `Orientation` (six optional face keys) → a data class with nullable `Face?` fields, or a
  `Map<OrientationKey, Face>`; decide once and keep the `values()`/`entries()` helpers the TS
  relies on (`Object.values`/`Object.entries`).
- Structural type guards (`value is T`) + `JSON.parse` in `setState` → kotlinx.serialization (add
  it to `:core` when the engine lands) or explicit validation.
- Singleton engine (`getInstance`) → a Kotlin `object` or a companion-held lazy instance; preserve
  the shared-instance semantics the solver and harness both rely on.

## Invariants to preserve

- **One mutable source of truth.** All state lives in the engine; the View renders a projection.
- **One-way propagation.** Every change mutates the engine first and is presented afterward via
  the `onMove` path — never animate-then-commit.
- **One move per `settled()`.** The solver applies a move, then awaits the pacer; the model must
  never outrun the presentation. This is what makes the eventual robot correct, and it's the
  reason the solver is `suspend`.

## Commands

Run from `android/` (or pass `-p android` from the repo root):

```sh
./gradlew :core:test          # headless JVM tests — the verification path (analog of `npm run verify`)
./gradlew :app:assembleDebug  # build the app (also type-checks/compiles everything)
./gradlew :app:installDebug   # install on a running emulator/device
```

There is no separate type-check step — the Gradle build compiles Kotlin and fails on type errors.
Re-run `:core:test` after any change under `:core` once the harness exists.

## Port roadmap

Each phase is validated before the next:

- **A.** `../src/engine/types.ts` → enums / data classes.
- **B.** `Cube` + `RubiksCube` engine, verbatim.
- **C.** `../src/interfaces/*` + `../src/utils.ts`.
- **D.** solver + `solutionStatusChecks` + all 8 subroutines.
- **E.** verification harness as JVM tests — must report "all N scrambles solved".
- **F.** Compose View + ViewModel + animation-backed pacer.
