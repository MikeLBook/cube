export const AXES = ["X", "Y", "Z"] as const;

export interface Position {
  X: number;
  Y: number;
  Z: number;
}

export interface Orientation {
  top?: Face;
  left?: Face;
  front?: Face;
  right?: Face;
  back?: Face;
  bottom?: Face;
}

export const FACES = ["Y", "B", "R", "G", "O", "W"] as const;
export type Face = (typeof FACES)[number];

export const ORIENTATION_KEYS = [
  "top",
  "bottom",
  "left",
  "right",
  "front",
  "back",
] as const;
export type OrientationKey = (typeof ORIENTATION_KEYS)[number];

export const ROTATIONS = ["XCW", "XCCW", "YCW", "YCCW", "ZCW", "ZCCW"] as const;
export type Rotation = (typeof ROTATIONS)[number];

export const LAYER_MOVES = [
  "rotateTopCW",
  "rotateTopCCW",
  "rotateXMidCW",
  "rotateXMidCCW",
  "rotateBottomCW",
  "rotateBottomCCW",
  "rotateLeftCW",
  "rotateLeftCCW",
  "rotateYMidCW",
  "rotateYMidCCW",
  "rotateRightCW",
  "rotateRightCCW",
  "rotateFrontCW",
  "rotateFrontCCW",
  "rotateZMidCW",
  "rotateZMidCCW",
  "rotateBackCW",
  "rotateBackCCW",
] as const;
export type LayerMove = (typeof LAYER_MOVES)[number];
