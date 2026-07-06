export const AXES = ["X", "Y", "Z"] as const;

export interface Position {
  X: number;
  Y: number;
  Z: number;
}

export const FACES = ["Y", "B", "R", "G", "O", "W"] as const;
export type Face = (typeof FACES)[number];

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
export type OrientationKey = (typeof ORIENTATION_KEYS)[number];
