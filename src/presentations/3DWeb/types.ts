import Cube from '../../engine/Cube'
import { LayerMove, Orientation, Rotation } from '../../engine/types'

export type Axis = 'X' | 'Y' | 'Z'
export type Status = 'free' | 'ready' | 'scrambling' | 'solving' | 'solved'

export interface Vec3 {
  X: number
  Y: number
  Z: number
}

// A layer turn: which engine layer it selects (axis + coordinate) and the engine methods for
// each direction. The engine position axis is also the CSS rotation axis (X→rotateX, …).
export interface MoveDef {
  axis: Axis
  layer: number
  cw: LayerMove
  ccw: LayerMove
}

// A whole-cube re-orientation: the engine rotation and the matching world spin.
export interface CubeMoveDef {
  rotation: Rotation
  axis: Axis
  angle: number
}

// One rendered cubie: the engine Cube it mirrors, its DOM element, and its six sticker elements.
export interface CubieEntry {
  cube: Cube
  el: HTMLElement
  stickers: Record<keyof Orientation, HTMLElement>
}
