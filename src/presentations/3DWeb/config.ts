// Static configuration for the 3D view: notation/move tables, derived move->animation
// lookups, keyboard and button maps, colors, geometry, and calibration signs.
import { Face, LayerMove, Orientation } from '../../engine/types'
import { Axis, CubeMoveDef, MoveDef, Status, Vec3 } from './types'

export const DEFAULT_YAW = -28
export const DEFAULT_PITCH = -19

// sticker colours (reuse the index.css palette)
export const COLORS: Record<Face, string> = {
  Y: '#ffd43b',
  R: '#d92b3c',
  B: '#2256d6',
  G: '#1eaa5b',
  O: '#ff7a18',
  W: '#f4f4f0'
}
export const DIRS: (keyof Orientation)[] = ['front', 'back', 'right', 'left', 'top', 'bottom']

// geometry (px)
export const SIZE = 58 // cubie face size
export const HALF = 29
export const UNIT = 63 // grid pitch between cubie centers

// calibration signs (flip if a turn animates the wrong way)
export const ANIM_SIGN: Record<Axis, number> = { X: 1, Y: -1, Z: 1 }
export const CW_SIGN: Record<Axis, number> = { X: -1, Y: -1, Z: -1 }

// Singmaster-style face notation -> engine methods + layer-selection metadata.
export const MOVES = {
  U: { axis: 'Y', layer: 1, cw: 'rotateTopCW', ccw: 'rotateTopCCW' },
  E: { axis: 'Y', layer: 0, cw: 'rotateXMidCW', ccw: 'rotateXMidCCW' },
  D: { axis: 'Y', layer: -1, cw: 'rotateBottomCW', ccw: 'rotateBottomCCW' },
  L: { axis: 'X', layer: -1, cw: 'rotateLeftCW', ccw: 'rotateLeftCCW' },
  M: { axis: 'X', layer: 0, cw: 'rotateYMidCW', ccw: 'rotateYMidCCW' },
  R: { axis: 'X', layer: 1, cw: 'rotateRightCW', ccw: 'rotateRightCCW' },
  B: { axis: 'Z', layer: -1, cw: 'rotateBackCW', ccw: 'rotateBackCCW' },
  S: { axis: 'Z', layer: 0, cw: 'rotateZMidCW', ccw: 'rotateZMidCCW' },
  F: { axis: 'Z', layer: 1, cw: 'rotateFrontCW', ccw: 'rotateFrontCCW' }
} as const satisfies Record<string, MoveDef>
export type MoveKey = keyof typeof MOVES

// LayerMove -> the layer to spin and the signed CSS angle, derived once from MOVES so
// onMove can present any engine move without searching.
export const LAYER_ANIM = new Map<LayerMove, { def: MoveDef; angle: number }>()
for (const def of Object.values(MOVES)) {
  const base = ANIM_SIGN[def.axis] * 90
  LAYER_ANIM.set(def.cw, { def, angle: base })
  LAYER_ANIM.set(def.ccw, { def, angle: -base })
}

// whole-cube re-orientation -> engine rotation + matching world animation
export const CUBE_MOVES: Record<string, CubeMoveDef> = {
  spinRight: { rotation: 'XCW', axis: 'Y', angle: -90 },
  spinLeft: { rotation: 'XCCW', axis: 'Y', angle: 90 },
  rollUp: { rotation: 'YCW', axis: 'X', angle: 90 },
  rollDown: { rotation: 'YCCW', axis: 'X', angle: -90 },
  tiltRight: { rotation: 'ZCW', axis: 'Z', angle: 90 },
  tiltLeft: { rotation: 'ZCCW', axis: 'Z', angle: -90 }
}
export const ROTATION_ANIM = new Map(Object.values(CUBE_MOVES).map((c) => [c.rotation, c]))

// panel buttons that trigger whole-cube re-orientations
export const CUBE_MOVE_BUTTONS: Record<string, string> = {
  'btn-roll-up': 'rollUp',
  'btn-roll-down': 'rollDown',
  'btn-spin-left': 'spinLeft',
  'btn-spin-right': 'spinRight',
  'btn-tilt-left': 'tiltLeft',
  'btn-tilt-right': 'tiltRight'
}

// keyboard: wasd re-orients the whole cube (exact case; shifted keys do nothing),
// letter keys map to face turns (shift = counter-clockwise), space recenters the view
export const KEY_CUBE_MOVES: Record<string, string> = {
  a: 'spinLeft',
  d: 'spinRight',
  w: 'rollUp',
  s: 'rollDown'
}
export const KEY_FACE_MOVES: Record<string, MoveKey> = {
  t: 'U',
  b: 'D',
  l: 'L',
  r: 'R',
  f: 'F',
  q: 'B',
  y: 'M',
  x: 'E',
  z: 'S'
}

export const NORMALS: Record<keyof Orientation, Vec3> = {
  right: { X: 1, Y: 0, Z: 0 },
  left: { X: -1, Y: 0, Z: 0 },
  top: { X: 0, Y: 1, Z: 0 },
  bottom: { X: 0, Y: -1, Z: 0 },
  front: { X: 0, Y: 0, Z: 1 },
  back: { X: 0, Y: 0, Z: -1 }
}

export const FACE_TRANSFORMS: Record<keyof Orientation, string> = {
  front: `translateZ(${HALF}px)`,
  back: `rotateY(180deg) translateZ(${HALF}px)`,
  right: `rotateY(90deg) translateZ(${HALF}px)`,
  left: `rotateY(-90deg) translateZ(${HALF}px)`,
  top: `rotateX(90deg) translateZ(${HALF}px)`,
  bottom: `rotateX(-90deg) translateZ(${HALF}px)`
}

export const STATUS_META: Record<Status, { label: string; color: string }> = {
  free: { label: 'Free Play', color: 'var(--text)' },
  ready: { label: 'Ready', color: 'var(--text)' },
  scrambling: { label: 'Scrambling…', color: 'var(--accent-x)' },
  solving: { label: 'Solving…', color: 'var(--accent-z)' },
  solved: { label: 'Solved!', color: 'var(--accent-y)' }
}
