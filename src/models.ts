export const Face_Variants = {
  Y: 'YELLOW',
  B: 'BLUE',
  R: 'RED',
  G: 'GREEN',
  O: 'ORANGE',
  W: 'WHITE'
} as const;

export type Face = keyof typeof Face_Variants;

export interface Position {
    X: number
    Y: number
    Z: number
}

export interface Orientation {
    top?: Face,
    left?: Face,
    front?: Face,
    right?: Face,
    back?: Face,
    bottom?: Face
}

export interface Cube {
    position: Position
    orientation: Orientation
}

export interface RubiksCube {
    cubes: Cube[]
    orientation: {
        top: Face,
        left: Face,
        front: Face,
        right: Face,
        back: Face,
        bottom: Face
    }
}