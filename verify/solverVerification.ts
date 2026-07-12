// Headless verification harness for the solver.
//
// The app has no test runner. This harness bundles the *real* engine + solver
// (via esbuild, same as the site build — see verify/run.mjs) and exercises the
// solver over thousands of random scrambles with a mock, instant `MovePacer`.
//
// Why it exists: the solver mutates the engine one move at a time and is otherwise
// impossible to eyeball. This harness gives three tools that together make solver
// bugs tractable — see verify/README.md for the full playbook.
//
//   node verify/run.mjs count            # tally outcomes over N scrambles
//   node verify/run.mjs repro <outcome>  # find the SHORTEST scramble with that outcome
//   node verify/run.mjs trace '<json>'   # step through one scramble, logging every move
//
// The independent `edgesSolved`/`cornersSolved` checkers below compare stickers to
// the *centers* and are deliberately NOT the solver's own solutionStatusChecks —
// so a bug in a completion check surfaces as a disagreement instead of hiding.

console.error = () => {} // solver logs a diagnostic on its dead-end path; silence the spam.

import RubiksCube from '../src/engine/RubiksCube'
import RubiksCubeSolver from '../src/solver/RubiksCubeSolver'
import solveYellowEdges from '../src/solver/subroutines/solveYellowEdges'
import solveYellowCorners from '../src/solver/subroutines/solveYellowCorners'
import solveMiddleEdges from '../src/solver/subroutines/solveMiddleEdges'
import {
  hasSolvedYellowEdges,
  hasSolvedYellowCorners,
  isMiddleLayerSolved
} from '../src/solver/solutionStatusChecks'
import { positionMap } from '../src/utils'

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
const moveLog: string[] = []
let logging = false
for (const k of Object.getOwnPropertyNames(Object.getPrototypeOf(rubiks))) {
  if (k.startsWith('rotate')) {
    const orig = (rubiks as any)[k].bind(rubiks)
    ;(rubiks as any)[k] = (...a: any[]) => {
      if (logging) moveLog.push(a.length ? `${k}(${a[0]})` : k)
      return orig(...a)
    }
  }
}

// @ts-ignore
const get = (i: number) => solver.cubeMap.get(positionMap[i])
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
  | 'edge-check-early' // hasSolvedYellowEdges said done while edges NOT actually solved
  | 'corner-check-early' // hasSolvedYellowCorners said done while corners NOT actually solved
  | 'middle-check-early' // isMiddleLayerSolved said done while equator NOT actually solved
  | 'checks-disagree' // solved per ground truth but a completion check disagrees
  | 'budget' // a subroutine ran away (infinite loop)

async function runSeq(seq: string[]): Promise<Outcome> {
  rubiks.reset()
  moveBudget = 1e9
  for (const m of seq) (rubiks as any)[m]()
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
    if (!hasSolvedYellowEdges(solver) || !hasSolvedYellowCorners(solver)) return 'checks-disagree'
    if (!isMiddleLayerSolved('top', rubiks)) return 'checks-disagree'
    return 'ok'
  } catch (e: any) {
    if (e.message === 'BUDGET') return 'budget'
    throw e
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

async function repro(want: string) {
  for (let len = 1; len <= 14; len++) {
    for (let t = 0; t < 6000; t++) {
      const seq = randSeq(len)
      if ((await runSeq(seq)) === want) {
        console.log(`REPRO (${len} moves) for "${want}":`)
        console.log(JSON.stringify(seq))
        console.log(`\nInspect it with:  node verify/run.mjs trace '${JSON.stringify(seq)}'`)
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
  moveBudget = 1e9
  for (const m of seq) (rubiks as any)[m]()
  moveBudget = 600
  await (solver as any).performInitialInspection()
  logging = true

  for (let i = 0; i < 40 && (!edgesSolved() || !cornersSolved() || !middleEdgesSolved()); i++) {
    const phase = !edgesSolved() ? 'edges' : !cornersSolved() ? 'corners' : 'middle'
    moveLog.length = 0
    console.log(`\n--- ${phase} call #${i + 1} ---`)
    console.log(snap())
    try {
      if (phase === 'edges') await solveYellowEdges(solver)
      else if (phase === 'corners') await solveYellowCorners(solver)
      else await solveMiddleEdges(solver)
    } catch (e: any) {
      console.log('  THREW:', e.message, '(infinite loop — see the repeating tail below)')
      console.log('  moves:', moveLog.slice(0, 40).join(' '), '...')
      return
    }
    console.log('  moves:', moveLog.join(' ') || '(NONE — no progress; likely the bug)')
  }
  console.log(
    `\nFinal: edgesSolved=${edgesSolved()} cornersSolved=${cornersSolved()} middleEdgesSolved=${middleEdgesSolved()}`
  )
}

async function main() {
  const mode = process.argv[2] ?? 'count'
  if (mode === 'count') await count(Number(process.argv[3]) || 5000)
  else if (mode === 'repro') await repro(process.argv[3] ?? 'edges-stuck')
  else if (mode === 'trace') await trace(JSON.parse(process.argv[3]))
  else console.log("modes: count [N] | repro <outcome> | trace '<json-move-array>'")
}
main()
