import { Position } from "./models";

export function JSONEquals(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// 3D layout of the 27 cubes in a Rubiks Cube. Coordinates are (X, Y, Z):
//   X:  -1 = left    →   1 = right
//   Y:  -1 = bottom  →   1 = top
//   Z:   1 = front   →  -1 = back
//
//               Center cube at (0, 0)
//
//                       1 ──2 ──3
//                      ╱   ╱   ╱ BACK (Z: -1)
//         TOP (Y: 1)  4 ──5 ──6
//                    ╱   ╱   ╱
//                   7 ──8 ──9
//                   10──11──12
//                   ╱   ╱   ╱
//    LEFT (X: -1) 13──14──15  RIGHT (X: 1)
//                 ╱   ╱   ╱
//               16──17──18
//                19──20──21
//                ╱   ╱   ╱
//              22──23──24  BOTTOM (Y: -1)
// FRONT (Z: 1) ╱   ╱   ╱
//            25──26──27
//
export const positionMap: Record<number, Position> = {
  1: { X: -1, Y: 1, Z: -1 },
  2: { X: 0, Y: 1, Z: -1 },
  3: { X: 1, Y: 1, Z: -1 },
  4: { X: -1, Y: 1, Z: 0 },
  5: { X: 0, Y: 1, Z: 0 },
  6: { X: 1, Y: 1, Z: 0 },
  7: { X: -1, Y: 1, Z: 1 },
  8: { X: 0, Y: 1, Z: 1 },
  9: { X: 1, Y: 1, Z: 1 },
  10: { X: -1, Y: 0, Z: -1 },
  11: { X: 0, Y: 0, Z: -1 },
  12: { X: 1, Y: 0, Z: -1 },
  13: { X: -1, Y: 0, Z: 0 },
  14: { X: 0, Y: 0, Z: 0 },
  15: { X: 1, Y: 0, Z: 0 },
  16: { X: -1, Y: 0, Z: 1 },
  17: { X: 0, Y: 0, Z: 1 },
  18: { X: 1, Y: 0, Z: 1 },
  19: { X: -1, Y: -1, Z: -1 },
  20: { X: 0, Y: -1, Z: -1 },
  21: { X: 1, Y: -1, Z: -1 },
  22: { X: -1, Y: -1, Z: 0 },
  23: { X: 0, Y: -1, Z: 0 },
  24: { X: 1, Y: -1, Z: 0 },
  25: { X: -1, Y: -1, Z: 1 },
  26: { X: 0, Y: -1, Z: 1 },
  27: { X: 1, Y: -1, Z: 1 },
};
