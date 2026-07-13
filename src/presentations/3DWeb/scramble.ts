// Scramble generation, decoupled from the driver that presents it.
import { Axis } from './types'
import { MOVES, MoveKey } from './config'

export interface ScrambleTurn {
  f: MoveKey
  prime: boolean
}

// A non-trivial random sequence: no two consecutive turns on the same axis.
export function buildScramble(): ScrambleTurn[] {
  const faces: MoveKey[] = ['U', 'D', 'L', 'R', 'F', 'B']
  const seq: ScrambleTurn[] = []
  let lastAxis: Axis | '' = ''
  for (let i = 0; i < 24; i++) {
    let f: MoveKey
    let guard = 0
    do {
      f = faces[Math.floor(Math.random() * faces.length)]
      guard++
    } while (MOVES[f].axis === lastAxis && guard < 8)
    lastAxis = MOVES[f].axis
    seq.push({ f, prime: Math.random() < 0.5 })
  }
  return seq
}
