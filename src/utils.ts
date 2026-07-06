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
  // Top Layer
  1: JSON.stringify({ X: -1, Y: 1, Z: -1 }),
  2: JSON.stringify({ X: 0, Y: 1, Z: -1 }),
  3: JSON.stringify({ X: 1, Y: 1, Z: -1 }),
  4: JSON.stringify({ X: -1, Y: 1, Z: 0 }),
  5: JSON.stringify({ X: 0, Y: 1, Z: 0 }),
  6: JSON.stringify({ X: 1, Y: 1, Z: 0 }),
  7: JSON.stringify({ X: -1, Y: 1, Z: 1 }),
  8: JSON.stringify({ X: 0, Y: 1, Z: 1 }),
  9: JSON.stringify({ X: 1, Y: 1, Z: 1 }),
  // Middle layer
  10: JSON.stringify({ X: -1, Y: 0, Z: -1 }),
  11: JSON.stringify({ X: 0, Y: 0, Z: -1 }),
  12: JSON.stringify({ X: 1, Y: 0, Z: -1 }),
  13: JSON.stringify({ X: -1, Y: 0, Z: 0 }),
  14: JSON.stringify({ X: 0, Y: 0, Z: 0 }),
  15: JSON.stringify({ X: 1, Y: 0, Z: 0 }),
  16: JSON.stringify({ X: -1, Y: 0, Z: 1 }),
  17: JSON.stringify({ X: 0, Y: 0, Z: 1 }),
  18: JSON.stringify({ X: 1, Y: 0, Z: 1 }),
  // Bottom layer
  19: JSON.stringify({ X: -1, Y: -1, Z: -1 }),
  20: JSON.stringify({ X: 0, Y: -1, Z: -1 }),
  21: JSON.stringify({ X: 1, Y: -1, Z: -1 }),
  22: JSON.stringify({ X: -1, Y: -1, Z: 0 }),
  23: JSON.stringify({ X: 0, Y: -1, Z: 0 }),
  24: JSON.stringify({ X: 1, Y: -1, Z: 0 }),
  25: JSON.stringify({ X: -1, Y: -1, Z: 1 }),
  26: JSON.stringify({ X: 0, Y: -1, Z: 1 }),
  27: JSON.stringify({ X: 1, Y: -1, Z: 1 }),
};
