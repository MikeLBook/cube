export const AXES = ['X', 'Y', 'Z'] as const

export interface Position {
  X: number
  Y: number
  Z: number
}

export const FACES = ['Y', 'B', 'R', 'G', 'O', 'W'] as const
export type Face = (typeof FACES)[number]

export interface Orientation {
  top?: Face
  left?: Face
  front?: Face
  right?: Face
  back?: Face
  bottom?: Face
}

export const ORIENTATION_KEYS = ['top', 'bottom', 'left', 'right', 'front', 'back'] as const
export type OrientationKey = (typeof ORIENTATION_KEYS)[number]

export const ROTATIONS = ['XCW', 'XCCW', 'YCW', 'YCCW', 'ZCW', 'ZCCW'] as const
export type Rotation = (typeof ROTATIONS)[number]

export const LAYER_MOVES = [
  'rotateTopCW',
  'rotateTopCCW',
  'rotateXMidCW',
  'rotateXMidCCW',
  'rotateBottomCW',
  'rotateBottomCCW',
  'rotateLeftCW',
  'rotateLeftCCW',
  'rotateYMidCW',
  'rotateYMidCCW',
  'rotateRightCW',
  'rotateRightCCW',
  'rotateFrontCW',
  'rotateFrontCCW',
  'rotateZMidCW',
  'rotateZMidCCW',
  'rotateBackCW',
  'rotateBackCCW'
] as const
export type LayerMove = (typeof LAYER_MOVES)[number]

// ── Which way a face move turns ─────────────────────────────────────
//
// A move's CW/CCW is judged from ONE fixed viewpoint per axis: the
// +axis side, looking toward the origin —
//   • top / bottom : from ABOVE       (+Y, looking down)
//   • left / right : from the RIGHT   (+X, looking left)
//   • front / back : from the FRONT   (+Z, looking back)
//
// A face and its opposite share the same cubie method (rotateX/Y/ZCW),
// so a pair always spins the same way *in space*. That means the near
// face of each pair reads as named, while its opposite reads reversed
// when you look straight AT it from outside the cube:
//
//   as-named (near, +axis)            reversed (far, -axis)
//     TOP    RIGHT   FRONT              BOTTOM   LEFT    BACK
//   ┌────┐ ┌────┐ ┌────┐              ┌────┐ ┌────┐ ┌────┐
//   │ ↻  │ │ ↻  │ │ ↻  │              │ ↺  │ │ ↺  │ │ ↺  │
//   └────┘ └────┘ └────┘              └────┘ └────┘ └────┘
//   a CW move looks CW here           a CW move looks CCW here
//
// So `rotateLeftCW` looks CCW if you face the left side head-on, but
// CW once you picture that face pushed to the back (viewing from +X) —
// the same clockwise sense as `rotateRightCW`. Likewise `rotateTopCW`
// and `rotateBottomCW` both turn clockwise seen from above; the bottom
// only *looks* reversed because you flip the cube over to face it.
//
// Exact sticker cycles (the axis's own face stays put; CCW = reversed):
//   rotateXCW  (top / xMid / bottom):  front→left→back→right→front
//   rotateYCW  (left / yMid / right):  front→top→back→bottom→front
//   rotateZCW  (front / zMid / back):  left→top→right→bottom→left
