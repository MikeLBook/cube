import { Position } from "./models";

export function JSONEquals(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

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
}