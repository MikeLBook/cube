import { Position } from "./models";

export function JSONEquals(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// 3D layout of the 27 cubes in a Rubiks Cube. Coordinates are (X, Y, Z):
//   X = column:  0 = left  →  2 = right
//   Y = row:     0 = back  →  2 = front
//   Z = layer:   0 = top   →  2 = bottom
//
// So positionMap[1]  = (0,0,0) = top-back-left corner, and
//    positionMap[27] = (2,2,2) = bottom-front-right corner.
//
// Each block below is one Z-slice, seen from above-front (the back row sits up/right,
// the front row down/left). The slices stack top → bottom along Z. Within every slice
// the columns are left→right (X) and the rows are back→front (Y):
//          TOP
// (0,0,0) 1 ──2 ──3
//        ╱   ╱   ╱
//       4 ──5 ──6
//      ╱   ╱   ╱
//     7 ──8 ──9
//        MIDDLE
//        10──11──12
//       ╱   ╱   ╱
//      13──14──15
//     ╱   ╱   ╱
//    16──17──18
//        BOTTOM
//        19──20──21
//       ╱   ╱   ╱
//      22──23──24
//     ╱   ╱   ╱
//    25──26──27 (2, 2, 2)
//
export const positionMap: Record<number, Position> = {
  1: { X: 0, Y: 0, Z: 0 },
  2: { X: 1, Y: 0, Z: 0 },
  3: { X: 2, Y: 0, Z: 0 },
  4: { X: 0, Y: 1, Z: 0 },
  5: { X: 1, Y: 1, Z: 0 },
  6: { X: 2, Y: 1, Z: 0 },
  7: { X: 0, Y: 2, Z: 0 },
  8: { X: 1, Y: 2, Z: 0 },
  9: { X: 2, Y: 2, Z: 0 },
  10: { X: 0, Y: 0, Z: 1 },
  11: { X: 1, Y: 0, Z: 1 },
  12: { X: 2, Y: 0, Z: 1 },
  13: { X: 0, Y: 1, Z: 1 },
  14: { X: 1, Y: 1, Z: 1 },
  15: { X: 2, Y: 1, Z: 1 },
  16: { X: 0, Y: 2, Z: 1 },
  17: { X: 1, Y: 2, Z: 1 },
  18: { X: 2, Y: 2, Z: 1 },
  19: { X: 0, Y: 0, Z: 2 },
  20: { X: 1, Y: 0, Z: 2 },
  21: { X: 2, Y: 0, Z: 2 },
  22: { X: 0, Y: 1, Z: 2 },
  23: { X: 1, Y: 1, Z: 2 },
  24: { X: 2, Y: 1, Z: 2 },
  25: { X: 0, Y: 2, Z: 2 },
  26: { X: 1, Y: 2, Z: 2 },
  27: { X: 2, Y: 2, Z: 2 },
};
