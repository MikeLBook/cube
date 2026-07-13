// Drag-to-turn: pure math mapping a pointer drag on a sticker face to a layer turn.
import { Orientation } from '../../engine/types'
import { Axis, Vec3 } from './types'
import { CW_SIGN, MOVES, MoveKey, NORMALS } from './config'
import { faceEntry } from './cubieDom'

function projectAxis(v: Vec3, pitch: number, yaw: number) {
  // position-space vector -> css-space (cssX=X, cssY=-Y, cssZ=Z) -> screen via Rx(pitch)Ry(yaw)
  const a = (pitch * Math.PI) / 180,
    b = (yaw * Math.PI) / 180
  const x = v.X,
    y = -v.Y,
    z = v.Z
  const x1 = x * Math.cos(b) + z * Math.sin(b)
  const z1 = -x * Math.sin(b) + z * Math.cos(b)
  const y2 = y * Math.cos(a) - z1 * Math.sin(a)
  return { x: x1, y: y2 }
}

// Which turn a drag of (dx, dy) on `faceEl` means, given the current orbit (pitch/yaw).
export function pickTurn(
  faceEl: HTMLElement,
  dx: number,
  dy: number,
  pitch: number,
  yaw: number
): { face: MoveKey; prime: boolean } | null {
  const entry = faceEntry.get(faceEl)
  const dir = faceEl.dataset.dir as keyof Orientation | undefined
  if (!entry || !dir) return null
  const normal = NORMALS[dir]
  const normalAxis: Axis = normal.X ? 'X' : normal.Y ? 'Y' : 'Z'
  // Of the face's two in-plane axes, take the one whose screen projection best matches the drag.
  let best: { axis: Axis; sign: number; score: number } | null = null
  for (const axis of ['X', 'Y', 'Z'] as Axis[]) {
    if (axis === normalAxis) continue
    const vec: Vec3 = { X: 0, Y: 0, Z: 0 }
    vec[axis] = 1
    const proj = projectAxis(vec, pitch, yaw)
    const dot = dx * proj.x + dy * proj.y
    if (!best || Math.abs(dot) > best.score) {
      best = { axis, sign: dot >= 0 ? 1 : -1, score: Math.abs(dot) }
    }
  }
  if (!best) return null
  const m: Vec3 = { X: 0, Y: 0, Z: 0 }
  m[best.axis] = best.sign
  // turn axis r = face normal × drag direction
  const r: Vec3 = {
    X: normal.Y * m.Z - normal.Z * m.Y,
    Y: normal.Z * m.X - normal.X * m.Z,
    Z: normal.X * m.Y - normal.Y * m.X
  }
  const rAxis: Axis = Math.abs(r.X) > 0.5 ? 'X' : Math.abs(r.Y) > 0.5 ? 'Y' : 'Z'
  const rSign = r[rAxis] >= 0 ? 1 : -1
  const layer = entry.cube.position[rAxis]
  const face = (Object.keys(MOVES) as MoveKey[]).find(
    (k) => MOVES[k].axis === rAxis && MOVES[k].layer === layer
  )
  if (!face) return null
  return { face, prime: rSign !== CW_SIGN[rAxis] }
}
