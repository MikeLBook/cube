import Cube from "./engine/Cube";
import {
  AXES,
  Face,
  FACES,
  Orientation,
  ORIENTATION_KEYS,
  Position,
} from "./engine/models";

export function JSONEquals(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isFace(value: unknown): value is Face {
  return (FACES as readonly string[]).includes(value as string);
}

export function isPosition(value: unknown): value is Position {
  if (!value || typeof value !== "object") return false;
  return AXES.every((axis) => typeof (value as any)[axis] === "number");
}

export function isOrientation(value: unknown): value is Orientation {
  if (!value || typeof value !== "object") return false;
  // Every present face key must hold a valid Face; absent keys are allowed.
  return ORIENTATION_KEYS.every((key) => {
    const face = (value as any)[key];
    return face === undefined || isFace(face);
  });
}

// Structural guard: JSON.parse yields plain objects, so we validate shape rather
// than instanceof. A valid state is 27 cubies, each with a position + orientation.
export function isCubeArray(value: unknown): value is Cube[] {
  return (
    Array.isArray(value) &&
    value.length === 27 &&
    value.every(
      (cube) =>
        cube &&
        typeof cube === "object" &&
        isPosition(cube.position) &&
        isOrientation(cube.orientation),
    )
  );
}

export const positionMap = {
  1: { X: -1, Y: 1, Z: -1 },
  2: { X: 0, Y: 1, Z: -1 },
  3: { X: 1, Y: 1, Z: -1 },
  4: { X: -1, Y: 1, Z: 0 },
  5: { X: 0, Y: 1, Z: 0 },
  6: { X: 1, Y: 1, Z: 0 },
  7: { X: -1, Y: 1, Z: 1 },
  8: { X: 0, Y: 1, Z: 1 },
  9: { X: 1, Y: 1, Z: 1 },
  // Middle layer
  10: { X: -1, Y: 0, Z: -1 },
  11: { X: 0, Y: 0, Z: -1 },
  12: { X: 1, Y: 0, Z: -1 },
  13: { X: -1, Y: 0, Z: 0 },
  14: { X: 0, Y: 0, Z: 0 },
  15: { X: 1, Y: 0, Z: 0 },
  16: { X: -1, Y: 0, Z: 1 },
  17: { X: 0, Y: 0, Z: 1 },
  18: { X: 1, Y: 0, Z: 1 },
  // Bottom layer
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
