// Headless verification harness for the solver.
//
// The app has no test runner. This harness bundles the *real* engine + solver
// (via esbuild, same as the site build — see run.mjs alongside this file) and exercises
// the solver over thousands of random scrambles with a mock, instant `IMovePacer`.
//
// Why it exists: the solver mutates the engine one move at a time and is otherwise
// impossible to eyeball. This harness gives three tools that together make solver
// bugs tractable — see README.md alongside this file for the full playbook.
//
//   node src/solver/verification/run.mjs count            # tally outcomes over N scrambles
//   node src/solver/verification/run.mjs realcount <N>    # solve rate driving the real solver.run()
//   node src/solver/verification/run.mjs solve '<json>'   # run one scramble through solver.run()
//   node src/solver/verification/run.mjs repro <outcome>  # find the SHORTEST scramble with that outcome
//   node src/solver/verification/run.mjs trace '<json>'   # step through one scramble, logging every move
//
// The independent `edgesSolved`/`cornersSolved` checkers below compare stickers to
// the *centers* and are deliberately NOT the solver's own solutionStatusChecks —
// so a bug in a completion check surfaces as a disagreement instead of hiding.

import RubiksCube from '../../engine/RubiksCube'
import { LayerMove, Rotation } from '../../engine/types'
import RubiksCubeSolver from '../RubiksCubeSolver'
import solveYellowEdges from '../subroutines/solveYellowEdges'
import solveYellowCorners from '../subroutines/solveYellowCorners'
import solveMiddleEdges from '../subroutines/solveMiddleEdges'
import solveWhiteFaceEdges from '../subroutines/solveWhiteFaceEdges'
import solveWhiteFaceCorners from '../subroutines/solveWhiteFaceCorners'
import solveFinalCorners from '../subroutines/solveFinalCorners'
import solveFinalEdges from '../subroutines/solveFinalEdges'
import {
  hasSolvedYellowEdges,
  hasSolvedYellowCorners,
  hasSolvedWhiteFaceEdges,
  hasSolvedWhiteFaceCorners,
  hasCompletedCorners,
  isMiddleLayerSolved
} from '../solutionStatusChecks'

const rubiks = RubiksCube.getInstance()

// A budget-limited mock pacer. `settled()` resolves instantly, but throws once the
// move budget is exhausted — this is how we turn an infinite loop in a subroutine
// into a catchable "budget" outcome instead of a hang.
let moveBudget = 0
const pacer = {
  settled() {
    if (--moveBudget < 0) throw new Error('BUDGET')
    return Promise.resolve()
  }
}
const solver = new RubiksCubeSolver(rubiks, pacer as any)

// ---- Move log (populated only while `logging` is true), for the trace tool. ----
// Every move now flows through the engine's single `execute(move)` dispatcher, so we wrap
// that one method and log the move identity it's handed (e.g. `rotateTopCW`, `XCW`).
const moveLog: string[] = []
let logging = false
const origExecute = rubiks.execute.bind(rubiks)
;(rubiks as any).execute = (move: LayerMove | Rotation) => {
  if (logging) moveLog.push(move)
  return origExecute(move)
}

// @ts-ignore
const get = (i: number) => solver.fetchPosition(i)
const centers = () => ({
  back: get(11)?.orientation.back,
  left: get(13)?.orientation.left,
  right: get(15)?.orientation.right,
  front: get(17)?.orientation.front
})

// Independent ground truth: all 4 top edges are Y-on-top and match adjacent centers.
function edgesSolved(): boolean {
  const c = centers()
  const e2 = get(2),
    e4 = get(4),
    e6 = get(6),
    e8 = get(8)
  return !!(
    e2?.orientation.top === 'Y' &&
    e2?.orientation.back === c.back &&
    e4?.orientation.top === 'Y' &&
    e4?.orientation.left === c.left &&
    e6?.orientation.top === 'Y' &&
    e6?.orientation.right === c.right &&
    e8?.orientation.top === 'Y' &&
    e8?.orientation.front === c.front
  )
}
// Independent ground truth: all 4 top corners are Y-on-top with both sides matching centers.
function cornersSolved(): boolean {
  const c = centers()
  const c1 = get(1),
    c3 = get(3),
    c7 = get(7),
    c9 = get(9)
  return !!(
    c1?.orientation.top === 'Y' &&
    c1?.orientation.left === c.left &&
    c1?.orientation.back === c.back &&
    c3?.orientation.top === 'Y' &&
    c3?.orientation.right === c.right &&
    c3?.orientation.back === c.back &&
    c7?.orientation.top === 'Y' &&
    c7?.orientation.left === c.left &&
    c7?.orientation.front === c.front &&
    c9?.orientation.top === 'Y' &&
    c9?.orientation.right === c.right &&
    c9?.orientation.front === c.front
  )
}
// Independent ground truth: the 4 equator edges (no top/bottom sticker) each match
// both adjacent centers. Positions 10/12/16/18 are the X-mid-layer edges.
function middleEdgesSolved(): boolean {
  const c = centers()
  const e10 = get(10),
    e12 = get(12),
    e16 = get(16),
    e18 = get(18)
  return !!(
    e10?.orientation.left === c.left &&
    e10?.orientation.back === c.back &&
    e12?.orientation.right === c.right &&
    e12?.orientation.back === c.back &&
    e16?.orientation.left === c.left &&
    e16?.orientation.front === c.front &&
    e18?.orientation.right === c.right &&
    e18?.orientation.front === c.front
  )
}
// Independent ground truth for the white-cross phase, which runs after the cube is
// flipped white-on-top. Its goal is orientation only — form the cross — not permutation:
// each of the 4 top edges shows white up. (This is deliberately the same condition the
// phase targets; there is no stricter honest definition of "cross formed". Its value here
// is as the loop's exit condition, independent of the solver's own hasSolvedWhiteFaceEdges,
// so a check that fires early still surfaces as `white-edge-check-early`.)
function whiteCrossSolved(): boolean {
  return [2, 4, 6, 8].every((i) => get(i)?.orientation.top === 'W')
}
// Independent ground truth for the white-corners phase. Its goal, like the cross, is
// orientation only: each of the 4 top corners shows white up. It does NOT yet place the
// corners into their solved slots — that's the CompleteCorners phase below. Mirrors the
// solver's own hasSolvedWhiteFaceCorners.
function whiteCornersSolved(): boolean {
  return [1, 3, 7, 9].every((i) => get(i)?.orientation.top === 'W')
}
// Independent ground truth for the CompleteCorners phase: all 4 top corners are white-up AND
// the side stickers shared by adjacent corners agree — i.e. the corners are permuted into their
// correct relative arrangement (a white-up cube with a consistent corner ring). This mirrors the
// phase's own goal (hasCompletedCorners) but is coded independently so a bug in that check
// surfaces as a disagreement. It intentionally does NOT assert center-alignment of the whole top
// layer; that (and the edges) is the CompleteEdges phase's job, verified by the terminal
// `rubiks.isSolved`.
function lastCornersPlaced(): boolean {
  const c1 = get(1),
    c3 = get(3),
    c7 = get(7),
    c9 = get(9)
  return !!(
    [c1, c3, c7, c9].every((c) => c?.orientation.top === 'W') &&
    c1?.orientation.back === c3?.orientation.back &&
    c1?.orientation.left === c7?.orientation.left &&
    c7?.orientation.front === c9?.orientation.front &&
    c9?.orientation.right === c3?.orientation.right
  )
}

// Flip the white face to the top — the reorientation the solver's advancePhase('WhiteFaceEdges')
// performs before the last-layer phases. The harness does it directly rather than calling
// advancePhase, because that method unconditionally recurses into resume() (firing an
// un-awaited subroutine that interleaves with, and corrupts, the harness's own phase loops). The
// harness only needs the physical flip; it drives the white phases itself. Mirror of the solver's
// own flip logic — keep in sync if that changes.
async function flipWhiteToTop() {
  const whiteFace = rubiks.cubes.find((cube) => cube.isFace && cube.hasFace('W'))
  if (!whiteFace) throw new Error('no white face cube')
  if (whiteFace.isInBottomLayer) await solver.do('YCW', 'YCW')
  else if (whiteFace.isInLeftLayer) await solver.do('ZCW')
  else if (whiteFace.isInRightLayer) await solver.do('ZCCW')
  else if (whiteFace.isInFrontLayer) await solver.do('YCW')
  else if (whiteFace.isInBackLayer) await solver.do('YCCW')
}

const MOVES = [
  'rotateTopCW',
  'rotateTopCCW',
  'rotateBottomCW',
  'rotateBottomCCW',
  'rotateLeftCW',
  'rotateLeftCCW',
  'rotateRightCW',
  'rotateRightCCW',
  'rotateFrontCW',
  'rotateFrontCCW',
  'rotateBackCW',
  'rotateBackCCW'
]
function randSeq(n: number): string[] {
  const s: string[] = []
  for (let i = 0; i < n; i++) s.push(MOVES[Math.floor(Math.random() * MOVES.length)])
  return s
}

// Outcomes. "ok" is the only success. Everything else names a distinct failure mode
// so `count` reveals the shape of the problem and `repro` can target one.
type Outcome =
  | 'ok'
  | 'edges-stuck' // edge phase made no progress for many iterations (dead-end path)
  | 'corners-stuck' // corner phase made no progress
  | 'middle-stuck' // middle-edge phase made no progress
  | 'white-edges-stuck' // white-cross phase made no progress
  | 'white-corners-stuck' // white-corners phase made no progress
  | 'final-corners-stuck' // CompleteCorners phase made no progress
  | 'final-edges-stuck' // CompleteEdges phase made no progress (cube never fully solved)
  | 'edge-check-early' // hasSolvedYellowEdges said done while edges NOT actually solved
  | 'corner-check-early' // hasSolvedYellowCorners said done while corners NOT actually solved
  | 'middle-check-early' // isMiddleLayerSolved said done while equator NOT actually solved
  | 'white-edge-check-early' // hasSolvedWhiteFaceEdges said done while cross NOT formed
  | 'white-corner-check-early' // hasSolvedWhiteFaceCorners said done while corners NOT white-up
  | 'checks-disagree' // solved per ground truth but a completion check disagrees
  | 'budget' // a subroutine ran away (infinite loop)

async function runSeq(seq: string[]): Promise<Outcome> {
  rubiks.reset()
  // Isolate each run. The solver instance is reused across thousands of scrambles, and its
  // self-reset (run() line 80) only fires on a normal loop exit — a runaway throws BUDGET out of
  // run() and skips it, leaking solutionPhase into the next scramble. Without this, a prior
  // runaway makes performInitialInspection dispatch a late-phase subroutine onto a fresh scramble
  // and hang, reporting a fabricated `budget`. Reset here so every run starts from a clean solver.
  solver.reset()
  moveBudget = 1e9
  for (const m of seq) rubiks.execute(m as LayerMove | Rotation)
  moveBudget = 5000 // generous per-solve cap; a healthy solve uses well under this

  try {
    await (solver as any).performInitialInspection() // orient the yellow center to the top
    let g = 0
    while (!edgesSolved()) {
      if (hasSolvedYellowEdges(solver)) return 'edge-check-early'
      await solveYellowEdges(solver)
      if (++g > 80) return 'edges-stuck'
    }
    g = 0
    while (!cornersSolved()) {
      if (hasSolvedYellowCorners(solver)) return 'corner-check-early'
      await solveYellowCorners(solver)
      if (++g > 80) return 'corners-stuck'
    }
    g = 0
    while (!middleEdgesSolved()) {
      if (isMiddleLayerSolved('top', rubiks)) return 'middle-check-early'
      await solveMiddleEdges(solver)
      if (++g > 80) return 'middle-stuck'
    }
    // Assert the yellow-side checks agree while yellow is still on top — the flip
    // below reorients white up, after which the yellow-oriented ground truths no longer apply.
    if (!hasSolvedYellowEdges(solver) || !hasSolvedYellowCorners(solver)) return 'checks-disagree'
    if (!isMiddleLayerSolved('top', rubiks)) return 'checks-disagree'

    // Final layer: flip the white face to the top (as run() does), then form the white cross.
    await flipWhiteToTop()
    g = 0
    while (!whiteCrossSolved()) {
      if (hasSolvedWhiteFaceEdges(solver)) return 'white-edge-check-early'
      await solveWhiteFaceEdges(solver)
      if (++g > 80) return 'white-edges-stuck'
    }
    if (!hasSolvedWhiteFaceEdges(solver)) return 'checks-disagree'

    // White-face corners: orient all 4 top corners white-up.
    g = 0
    while (!whiteCornersSolved()) {
      if (hasSolvedWhiteFaceCorners(solver)) return 'white-corner-check-early'
      await solveWhiteFaceCorners(solver)
      if (++g > 80) return 'white-corners-stuck'
    }
    if (!hasSolvedWhiteFaceCorners(solver)) return 'checks-disagree'

    // CompleteCorners: permute the top corners into their solved arrangement.
    g = 0
    while (!lastCornersPlaced()) {
      await solveFinalCorners(solver)
      if (++g > 80) return 'final-corners-stuck'
    }
    if (!hasCompletedCorners(solver)) return 'checks-disagree'

    // CompleteEdges: permute the top edges — this places the last layer and finishes the cube.
    // `rubiks.isSolved` is the engine's own all-faces-uniform check: the strongest, fully
    // independent ground truth, and orientation-agnostic (the final algorithms leave the solved
    // cube in whatever orientation the whole-cube rotations landed on).
    g = 0
    while (!rubiks.isSolved) {
      await solveFinalEdges(solver)
      if (++g > 80) return 'final-edges-stuck'
    }
    return 'ok'
  } catch (e: any) {
    if (e.message === 'BUDGET') return 'budget'
    throw e
  }
}

// Drive the REAL solver exactly as production does — `solver.run()` over the mock pacer — and
// judge it only by what the engine can see. This is the authoritative measure of the solver's
// ability: no hand-rolled phase loop and no independent checks that could push a subroutine into a
// state the real state machine never reaches. `ok` iff the cube ends solved; `budget` iff a
// subroutine ran away. (`unsolved` can't normally happen — run()'s loop only exits on isSolved —
// but is reported rather than hidden if it ever does.)
async function runReal(seq: string[]): Promise<string> {
  rubiks.reset()
  solver.reset()
  moveBudget = 1e9
  for (const m of seq) rubiks.execute(m as LayerMove | Rotation)
  moveBudget = 5000
  try {
    await solver.run()
    return rubiks.isSolved ? 'ok' : 'unsolved'
  } catch (e: any) {
    if (e.message === 'BUDGET') return 'budget'
    return 'threw:' + e.message
  }
}

// ---- Modes ----
async function count(n: number) {
  const tally: Record<string, number> = {}
  for (let i = 0; i < n; i++) {
    let r: string
    try {
      r = await runSeq(randSeq(50))
    } catch (e: any) {
      r = 'threw:' + e.message
    }
    tally[r] = (tally[r] || 0) + 1
  }
  console.log(JSON.stringify(tally, null, 2))
  if ((tally['ok'] ?? 0) === n) console.log(`\n✅ all ${n} scrambles solved`)
  else
    console.log(
      `\n❌ ${n - (tally['ok'] ?? 0)} / ${n} did not solve — use \`repro\` on a failing outcome`
    )
}

// Authoritative solve rate: drive the real `solver.run()` over N scrambles.
async function realCount(n: number) {
  const tally: Record<string, number> = {}
  for (let i = 0; i < n; i++) {
    const r = await runReal(randSeq(50))
    tally[r] = (tally[r] || 0) + 1
  }
  console.log(JSON.stringify(tally, null, 2))
  if ((tally['ok'] ?? 0) === n) console.log(`\n✅ solver.run() solved all ${n} scrambles`)
  else console.log(`\n❌ solver.run() left ${n - (tally['ok'] ?? 0)} / ${n} unsolved`)
}

// Drive the real `solver.run()` on ONE scramble — cross-check a repro against production behavior.
async function solve(seq: string[]) {
  const r = await runReal(seq)
  console.log(`solver.run() → ${r}  (isSolved=${rubiks.isSolved})`)
}

async function repro(want: string) {
  for (let len = 1; len <= 14; len++) {
    for (let t = 0; t < 6000; t++) {
      const seq = randSeq(len)
      if ((await runSeq(seq)) === want) {
        console.log(`REPRO (${len} moves) for "${want}":`)
        console.log(JSON.stringify(seq))
        console.log(
          `\nInspect it with:  node src/solver/verification/run.mjs trace '${JSON.stringify(seq)}'`
        )
        return
      }
    }
  }
  console.log(`No repro found for "${want}" (may be rare or already fixed).`)
}

// Step through one scramble, printing the top/bottom cubies and every engine move
// each subroutine call makes. This is how you localize *which* subroutine misbehaves.
async function trace(seq: string[]) {
  const snap = () => {
    const fmt = (i: number) => `${i}:${JSON.stringify(get(i)?.orientation)}`
    const c = centers()
    return [
      '  centers ' + JSON.stringify(c),
      '  top corners  ' + [1, 3, 7, 9].map(fmt).join('  '),
      '  top edges    ' + [2, 4, 6, 8].map(fmt).join('  '),
      '  middle edges ' + [10, 12, 16, 18].map(fmt).join('  '),
      '  bottom corn. ' + [19, 21, 25, 27].map(fmt).join('  '),
      '  bottom edges ' + [20, 22, 24, 26].map(fmt).join('  ')
    ].join('\n')
  }

  rubiks.reset()
  // Isolate each run. The solver instance is reused across thousands of scrambles, and its
  // self-reset (run() line 80) only fires on a normal loop exit — a runaway throws BUDGET out of
  // run() and skips it, leaking solutionPhase into the next scramble. Without this, a prior
  // runaway makes performInitialInspection dispatch a late-phase subroutine onto a fresh scramble
  // and hang, reporting a fabricated `budget`. Reset here so every run starts from a clean solver.
  solver.reset()
  moveBudget = 1e9
  for (const m of seq) rubiks.execute(m as LayerMove | Rotation)
  moveBudget = 5000
  await (solver as any).performInitialInspection()
  logging = true

  // The yellow-oriented ground truths (edges/corners/middle) are valid only until the cube
  // is flipped white-on-top; after that, drive the white + final phases. `flipped` gates the two.
  let flipped = false
  for (let i = 0; i < 120; i++) {
    let phase: string
    if (!flipped) {
      if (edgesSolved() && cornersSolved() && middleEdgesSolved()) {
        moveLog.length = 0
        await flipWhiteToTop()
        flipped = true
        console.log(`\n--- flip white to top ---`)
        console.log('  moves:', moveLog.join(' ') || '(none — white already on top)')
        console.log(snap())
        continue
      }
      phase = !edgesSolved() ? 'edges' : !cornersSolved() ? 'corners' : 'middle'
    } else {
      if (rubiks.isSolved) break
      phase = !whiteCrossSolved()
        ? 'white-edges'
        : !whiteCornersSolved()
          ? 'white-corners'
          : !lastCornersPlaced()
            ? 'final-corners'
            : 'final-edges'
    }
    moveLog.length = 0
    console.log(`\n--- ${phase} call #${i + 1} ---`)
    console.log(snap())
    try {
      if (phase === 'edges') await solveYellowEdges(solver)
      else if (phase === 'corners') await solveYellowCorners(solver)
      else if (phase === 'middle') await solveMiddleEdges(solver)
      else if (phase === 'white-edges') await solveWhiteFaceEdges(solver)
      else if (phase === 'white-corners') await solveWhiteFaceCorners(solver)
      else if (phase === 'final-corners') await solveFinalCorners(solver)
      else await solveFinalEdges(solver)
    } catch (e: any) {
      console.log('  THREW:', e.message, '(infinite loop — see the repeating tail below)')
      console.log('  moves:', moveLog.slice(0, 40).join(' '), '...')
      return
    }
    console.log('  moves:', moveLog.join(' ') || '(NONE — no progress; likely the bug)')
  }
  console.log(
    `\nFinal: edgesSolved=${edgesSolved()} cornersSolved=${cornersSolved()} ` +
      `middleEdgesSolved=${middleEdgesSolved()} whiteCrossSolved=${whiteCrossSolved()} ` +
      `whiteCornersSolved=${whiteCornersSolved()} lastCornersPlaced=${lastCornersPlaced()} ` +
      `isSolved=${rubiks.isSolved}`
  )
}

async function main() {
  const mode = process.argv[2] ?? 'count'
  if (mode === 'count') await count(Number(process.argv[3]) || 5000)
  else if (mode === 'realcount') await realCount(Number(process.argv[3]) || 5000)
  else if (mode === 'solve') await solve(JSON.parse(process.argv[3]))
  else if (mode === 'repro') await repro(process.argv[3] ?? 'edges-stuck')
  else if (mode === 'trace') await trace(JSON.parse(process.argv[3]))
  else
    console.log(
      "modes: count [N] | realcount [N] | solve '<json>' | repro <outcome> | trace '<json-move-array>'"
    )
}
main()
