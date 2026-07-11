// Implemented by whatever presents the cube (3D view, 2D view, a robot)
export default interface IRubiksCubeObserver {
    // The move that triggered the notification, so observers can present it (e.g. animate
    // the specific layer). Whole-cube re-orientations pass a Rotation; reset passes nothing.
    onMove: (move?: LayerMove | Rotation) => void
}

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
