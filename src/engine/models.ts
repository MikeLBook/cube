export const Faces = {
  Y: "YELLOW",
  B: "BLUE",
  R: "RED",
  G: "GREEN",
  O: "ORANGE",
  W: "WHITE",
} as const;

export type Face = keyof typeof Faces;

export interface Position {
  X: number;
  Y: number;
  Z: number;
}

export const AXES = ["X", "Y", "Z"] as const;

export interface Orientation {
  top?: Face;
  left?: Face;
  front?: Face;
  right?: Face;
  back?: Face;
  bottom?: Face;
}

export const ORIENTATION_KEYS = [
  "top",
  "bottom",
  "left",
  "right",
  "front",
  "back",
] as const;

export const Rotations = {
  XCW: "X-CLOCKWISE",
  XCCW: "X-COUNTER-CLOCKWISE",
  YCW: "Y-CLOCKWISE",
  YCCW: "Y-COUNTER-CLOCKWISE",
} as const;

export type Rotation = keyof typeof Rotations;
