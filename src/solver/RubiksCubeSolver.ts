import Cube from "../engine/Cube";
import { OrientationKey } from "../engine/models";
import RubiksCube from "../engine/RubiksCube";
import { JSONEquals, positionMap } from "../utils";

// Implemented by whatever presents the cube (3D view, 2D view, a robot). After the solver
// makes a move on the engine it awaits settled(), giving the representation time to present
// that move before the next one. This is the only thing the solver knows about the outside
// world — it never references a concrete representation.
export interface MovePacer {
  // Resolves once the representation has finished presenting the latest move (animation
  // or motor movement complete). A representation may reject the Promise to signal a failure.
  settled(): Promise<void>;
}

export default class RubiksCubeSolver {
  private rubiks: RubiksCube;
  private pacer: MovePacer;
  private yellowLayerSolved: boolean | undefined;
  private middleLayerSolved: boolean | undefined;

  constructor(rubiks: RubiksCube, pacer: MovePacer) {
    this.rubiks = rubiks;
    this.pacer = pacer;
  }

  // Mutate the engine one move at a time and wait for the presentation to settle
  // before continuing. The finished solver will loop until the cube is solved;
  // This placeholder is under active development
  public async run(signal?: AbortSignal) {
    // switch to while loop
    if (this.rubiks.isSolved || signal?.aborted) return;
    const move = this.determineNextMove();
    move();
    await this.pacer.settled();
  }

  private determineNextMove(): () => void {
    if (this.yellowLayerSolved !== true || this.middleLayerSolved !== true) {
      const yellowFaceCube = this.rubiks.cubes.find(
        (cube) => cube.isFace && cube.hasFace("Y"),
      );
      if (!yellowFaceCube) throw new Error("Unable to locate Yellow Face Cube");

      const orientation = yellowFaceCube.getFaceOrientation("Y");
      if (!orientation)
        throw new Error("Unable to determine Yellow Face Cube Orientation");

      // if (this.yellowLayerSolved === undefined) {
      //   this.yellowLayerSolved = this.isOutsideLayerSolved(orientation);
      // }

      // if (!this.yellowLayerSolved) {
      //   if (!yellowFaceCube.isInTopLayer) {
      //     return this.rotateYellowFaceToTop(yellowFaceCube);
      //   }
      //   // Solution Top Layer
      //   return () => {};
      // }

      if (this.middleLayerSolved === undefined) {
        // this.middleLayerSolved = this.isMiddleLayerSolved(orientation);
        this.isMiddleLayerSolved(orientation);
      }

      if (!this.middleLayerSolved) {
        if (!yellowFaceCube.isInTopLayer) {
          return this.rotateYellowFaceToTop(yellowFaceCube);
        }
        // Solution Middle Layer
        return () => {};
      }
      // Solution Bottom Layer
      return () => {};
    } else {
      // Solution Bottom Layer
      return () => {};
    }
  }

  // CHECKS
  private isOutsideLayerSolved(orientation: OrientationKey): boolean {
    const cubesInLayer = this.rubiks.cubes.filter(
      (cube) => cube.orientation[orientation] !== undefined,
    );

    const allFacesMatch = cubesInLayer.every(
      (cube, _, cubes) =>
        cube.orientation[orientation] === cubes[0].orientation[orientation],
    );
    if (!allFacesMatch) return false;

    const otherOrientationKeys: OrientationKey[] = [];
    cubesInLayer
      .filter((cube) => !cube.isFace)
      .forEach((cube) => {
        for (const [key, value] of Object.entries(cube.orientation)) {
          if (value !== cube.orientation[orientation] && value !== undefined) {
            otherOrientationKeys.push(key as OrientationKey);
          }
        }
      });
    const dedupedKeys = [...new Set(otherOrientationKeys)];

    return dedupedKeys.every((orientation: OrientationKey) => {
      const row = cubesInLayer
        .filter((cube) => !cube.isFace)
        .filter((cube) => cube.orientation[orientation] !== undefined);
      return row.every((cube) =>
        JSONEquals(
          cube.orientation[orientation],
          row[0].orientation[orientation],
        ),
      );
    });
  }

  private isMiddleLayerSolved(yellowOrientation: OrientationKey): boolean {
    const cubesInLayer = ((o: OrientationKey): Cube[] => {
      switch (o) {
        case "top":
        case "bottom":
          return this.rubiks.cubes.filter((cube) => cube.isInXMidLayer);
        case "left":
        case "right":
          return this.rubiks.cubes.filter((cube) => cube.isInYMidLayer);
        case "front":
        case "back":
          return this.rubiks.cubes.filter((cube) => cube.isInZMidLayer);
      }
    })(yellowOrientation);

    let orientationKeys: OrientationKey[] = [];
    cubesInLayer
      .filter((cube) => JSONEquals(cube.position, { X: 0, Y: 0, Z: 0 }))
      .forEach((cube) => {
        for (const [key, value] of Object.entries(cube.orientation)) {
          if (value !== undefined) {
            orientationKeys.push(key as OrientationKey);
          }
        }
      });
    const dedupedKeys = [...new Set(orientationKeys)];

    return dedupedKeys.every((orientation: OrientationKey) => {
      const row = cubesInLayer
        .filter((cube) => JSONEquals(cube.position, { X: 0, Y: 0, Z: 0 }))
        .filter((cube) => cube.orientation[orientation] !== undefined);
      return row.every((cube) =>
        JSONEquals(
          cube.orientation[orientation],
          row[0].orientation[orientation],
        ),
      );
    });
  }

  // MOVES
  private rotateYellowFaceToTop(yellowCube: Cube): () => void {
    if (JSONEquals(yellowCube.position, positionMap[23])) {
      return () => this.rubiks.rotateRubiksCube("YCW");
    } else if (JSONEquals(yellowCube.position, positionMap[17])) {
      return () => this.rubiks.rotateRubiksCube("YCW");
    } else if (JSONEquals(yellowCube.position, positionMap[11])) {
      return () => this.rubiks.rotateRubiksCube("YCCW");
    } else if (JSONEquals(yellowCube.position, positionMap[13])) {
      return () => this.rubiks.rotateRubiksCube("ZCW");
    } else if (JSONEquals(yellowCube.position, positionMap[15])) {
      return () => this.rubiks.rotateRubiksCube("ZCCW");
    } else {
      return () => {};
    }
  }
}
