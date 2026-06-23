import { Position, Orientation, Face } from "./models";

export default class Cube {
  position: Position;
  orientation: Orientation;

  public constructor(position: Position, orientation: Orientation) {
    this.position = position;
    this.orientation = orientation;
  }

  get isInTopLayer(): boolean {
    return this.orientation.top !== undefined;
  }

  get isInXMidLayer(): boolean {
    return (
      this.orientation.top === undefined &&
      this.orientation.bottom === undefined
    );
  }

  get isInBottomLayer(): boolean {
    return this.orientation.bottom !== undefined;
  }

  get isInLeftLayer(): boolean {
    return this.orientation.left !== undefined;
  }

  get isInYMidLayer(): boolean {
    return (
      this.orientation.left === undefined &&
      this.orientation.right === undefined
    );
  }

  get isInRightLayer(): boolean {
    return this.orientation.right !== undefined;
  }

  get isInFrontLayer(): boolean {
    return this.orientation.front !== undefined;
  }

  get isInZMidLayer(): boolean {
    return (
      this.orientation.front === undefined &&
      this.orientation.back === undefined
    );
  }

  get isInBackLayer(): boolean {
    return this.orientation.back !== undefined;
  }

  get isCorner(): boolean {
    return (
      Object.values(this.orientation).filter((o) => o !== undefined).length ===
      3
    );
  }

  get isEdge(): boolean {
    return (
      Object.values(this.orientation).filter((o) => o !== undefined).length ===
      2
    );
  }

  get isFace(): boolean {
    return (
      Object.values(this.orientation).filter((o) => o !== undefined).length ===
      1
    );
  }

  public hasFace(face: Face): boolean {
    return Object.values(this.orientation).includes(face);
  }

  private rotate(newOrientation: Orientation) {
    this.position = {
      X: newOrientation.left ? -1 : newOrientation.right ? 1 : 0,
      Y: newOrientation.top ? 1 : newOrientation.bottom ? -1 : 0,
      Z: newOrientation.front ? 1 : newOrientation.back ? -1 : 0,
    };
    this.orientation = newOrientation;
  }

  public rotateXCW() {
    this.rotate({
      top: this.orientation.top,
      bottom: this.orientation.bottom,
      left: this.orientation.front,
      front: this.orientation.right,
      right: this.orientation.back,
      back: this.orientation.left,
    });
  }

  public rotateXCCW() {
    this.rotate({
      top: this.orientation.top,
      bottom: this.orientation.bottom,
      left: this.orientation.back,
      front: this.orientation.left,
      right: this.orientation.front,
      back: this.orientation.right,
    });
  }

  public rotateYCW() {
    this.rotate({
      top: this.orientation.front,
      back: this.orientation.top,
      bottom: this.orientation.back,
      front: this.orientation.bottom,
      left: this.orientation.left,
      right: this.orientation.right,
    });
  }

  public rotateYCCW() {
    this.rotate({
      top: this.orientation.back,
      front: this.orientation.top,
      bottom: this.orientation.front,
      back: this.orientation.bottom,
      left: this.orientation.left,
      right: this.orientation.right,
    });
  }

  public rotateZCW() {
    this.rotate({
      top: this.orientation.left,
      right: this.orientation.top,
      bottom: this.orientation.right,
      left: this.orientation.bottom,
      front: this.orientation.front,
      back: this.orientation.back,
    });
  }

  public rotateZCCW() {
    this.rotate({
      top: this.orientation.right,
      right: this.orientation.bottom,
      bottom: this.orientation.left,
      left: this.orientation.top,
      front: this.orientation.front,
      back: this.orientation.back,
    });
  }
}
