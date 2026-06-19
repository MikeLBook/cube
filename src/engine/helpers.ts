import Cube from "./Cube";
import {
  AXES,
  Face,
  Faces,
  Orientation,
  ORIENTATION_KEYS,
  Position,
} from "./models";

export function JSONEquals(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isFace(value: unknown): value is Face {
  return typeof value === "string" && value in Faces;
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
