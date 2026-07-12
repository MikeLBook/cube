import { LayerMove, Rotation } from '../engine/types'

// Implemented by whatever presents the cube (3D view, 2D view, a robot)
export default interface IRubiksCubeObserver {
  // The move that triggered the notification, so observers can present it (e.g. animate
  // the specific layer). Whole-cube re-orientations pass a Rotation; reset passes nothing.
  onMove: (move?: LayerMove | Rotation) => void
}
