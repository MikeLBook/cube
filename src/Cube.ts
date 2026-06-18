import { positionMap } from "./helpers";
import { Position, Orientation } from "./models";

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

  // isCorner, isEdge

  public rotateXCW() {
    const oldOrientation = { ...this.orientation };
    this.orientation = {
      top: oldOrientation.top,
      bottom: oldOrientation.bottom,
      left: oldOrientation.front,
      front: oldOrientation.right,
      right: oldOrientation.back,
      back: oldOrientation.left,
    };

    let positionOffset = 0;
    if (this.isInXMidLayer) {
      positionOffset = 9;
    } else if (this.isInBottomLayer) {
      positionOffset = 18;
    }

    switch (this.position) {
      case positionMap[1 + positionOffset]:
        this.position = positionMap[3 + positionOffset];
        break;
      case positionMap[2 + positionOffset]:
        this.position = positionMap[6 + positionOffset];
        break;
      case positionMap[3 + positionOffset]:
        this.position = positionMap[9 + positionOffset];
        break;
      case positionMap[4 + positionOffset]:
        this.position = positionMap[2 + positionOffset];
        break;
      case positionMap[5 + positionOffset]:
        break;
      case positionMap[6 + positionOffset]:
        this.position = positionMap[8 + positionOffset];
        break;
      case positionMap[7 + positionOffset]:
        this.position = positionMap[1 + positionOffset];
        break;
      case positionMap[8 + positionOffset]:
        this.position = positionMap[4 + positionOffset];
        break;
      case positionMap[9 + positionOffset]:
        this.position = positionMap[7 + positionOffset];
    }
  }

  public rotateXCCW() {
    const oldOrientation = { ...this.orientation };
    this.orientation = {
      top: oldOrientation.top,
      bottom: oldOrientation.bottom,
      left: oldOrientation.back,
      front: oldOrientation.left,
      right: oldOrientation.front,
      back: oldOrientation.right,
    };

    let positionOffset = 0;
    if (this.isInXMidLayer) {
      positionOffset = 9;
    } else if (this.isInBottomLayer) {
      positionOffset = 18;
    }

    switch (this.position) {
      case positionMap[3 + positionOffset]:
        this.position = positionMap[1 + positionOffset];
        break;
      case positionMap[6 + positionOffset]:
        this.position = positionMap[2 + positionOffset];
        break;
      case positionMap[9 + positionOffset]:
        this.position = positionMap[3 + positionOffset];
        break;
      case positionMap[2 + positionOffset]:
        this.position = positionMap[4 + positionOffset];
        break;
      case positionMap[5 + positionOffset]:
        break;
      case positionMap[8 + positionOffset]:
        this.position = positionMap[6 + positionOffset];
        break;
      case positionMap[1 + positionOffset]:
        this.position = positionMap[7 + positionOffset];
        break;
      case positionMap[4 + positionOffset]:
        this.position = positionMap[8 + positionOffset];
        break;
      case positionMap[7 + positionOffset]:
        this.position = positionMap[9 + positionOffset];
    }
  }

  public rotateYCW() {
    const oldOrientation = { ...this.orientation };
    this.orientation = {
      top: oldOrientation.front,
      back: oldOrientation.top,
      bottom: oldOrientation.back,
      front: oldOrientation.bottom,
      left: oldOrientation.left,
      right: oldOrientation.right,
    };

    let positionOffset = 0;
    if (this.isInYMidLayer) {
      positionOffset = 1;
    } else if (this.isInRightLayer) {
      positionOffset = 2;
    }

    switch (this.position) {
      case positionMap[7 + positionOffset]:
        this.position = positionMap[1 + positionOffset];
        break;
      case positionMap[16 + positionOffset]:
        this.position = positionMap[4 + positionOffset];
        break;
      case positionMap[25 + positionOffset]:
        this.position = positionMap[7 + positionOffset];
        break;
      case positionMap[4 + positionOffset]:
        this.position = positionMap[10 + positionOffset];
        break;
      case positionMap[13 + positionOffset]:
        break;
      case positionMap[22 + positionOffset]:
        this.position = positionMap[16 + positionOffset];
        break;
      case positionMap[1 + positionOffset]:
        this.position = positionMap[19 + positionOffset];
        break;
      case positionMap[10 + positionOffset]:
        this.position = positionMap[22 + positionOffset];
        break;
      case positionMap[19 + positionOffset]:
        this.position = positionMap[25 + positionOffset];
        break;
    }
  }

  public rotateYCCW() {
    const oldOrientation = { ...this.orientation };
    this.orientation = {
      top: oldOrientation.back,
      front: oldOrientation.top,
      bottom: oldOrientation.front,
      back: oldOrientation.bottom,
      left: oldOrientation.left,
      right: oldOrientation.right,
    };

    let positionOffset = 0;
    if (this.isInYMidLayer) {
      positionOffset = 1;
    } else if (this.isInRightLayer) {
      positionOffset = 2;
    }

    switch (this.position) {
      case positionMap[1 + positionOffset]:
        this.position = positionMap[7 + positionOffset];
        break;
      case positionMap[4 + positionOffset]:
        this.position = positionMap[16 + positionOffset];
        break;
      case positionMap[7 + positionOffset]:
        this.position = positionMap[25 + positionOffset];
        break;
      case positionMap[10 + positionOffset]:
        this.position = positionMap[4 + positionOffset];
        break;
      case positionMap[13 + positionOffset]:
        break;
      case positionMap[16 + positionOffset]:
        this.position = positionMap[22 + positionOffset];
        break;
      case positionMap[19 + positionOffset]:
        this.position = positionMap[1 + positionOffset];
        break;
      case positionMap[22 + positionOffset]:
        this.position = positionMap[10 + positionOffset];
        break;
      case positionMap[25 + positionOffset]:
        this.position = positionMap[19 + positionOffset];
        break;
    }
  }

  public rotateZCW() {
    const oldOrientation = { ...this.orientation };
    this.orientation = {
      top: oldOrientation.left,
      right: oldOrientation.top,
      bottom: oldOrientation.right,
      left: oldOrientation.bottom,
      front: oldOrientation.front,
      back: oldOrientation.back,
    };

    let positionOffset = 0;
    if (this.isInZMidLayer) {
      positionOffset = 3;
    } else if (this.isInFrontLayer) {
      positionOffset = 6;
    }

    switch (this.position) {
      case positionMap[1 + positionOffset]:
        this.position = positionMap[3 + positionOffset];
        break;
      case positionMap[2 + positionOffset]:
        this.position = positionMap[12 + positionOffset];
        break;
      case positionMap[3 + positionOffset]:
        this.position = positionMap[21 + positionOffset];
        break;
      case positionMap[10 + positionOffset]:
        this.position = positionMap[2 + positionOffset];
        break;
      case positionMap[11 + positionOffset]:
        break;
      case positionMap[12 + positionOffset]:
        this.position = positionMap[20 + positionOffset];
        break;
      case positionMap[19 + positionOffset]:
        this.position = positionMap[1 + positionOffset];
        break;
      case positionMap[20 + positionOffset]:
        this.position = positionMap[10 + positionOffset];
        break;
      case positionMap[21 + positionOffset]:
        this.position = positionMap[19 + positionOffset];
    }
  }

  public rotateZCCW() {
    const oldOrientation = { ...this.orientation };
    this.orientation = {
      top: oldOrientation.right,
      right: oldOrientation.bottom,
      bottom: oldOrientation.left,
      left: oldOrientation.top,
      front: oldOrientation.front,
      back: oldOrientation.back,
    };

    let positionOffset = 0;
    if (this.isInZMidLayer) {
      positionOffset = 3;
    } else if (this.isInFrontLayer) {
      positionOffset = 6;
    }

    switch (this.position) {
      case positionMap[3 + positionOffset]:
        this.position = positionMap[1 + positionOffset];
        break;
      case positionMap[12 + positionOffset]:
        this.position = positionMap[2 + positionOffset];
        break;
      case positionMap[21 + positionOffset]:
        this.position = positionMap[3 + positionOffset];
        break;
      case positionMap[2 + positionOffset]:
        this.position = positionMap[10 + positionOffset];
        break;
      case positionMap[11 + positionOffset]:
        break;
      case positionMap[20 + positionOffset]:
        this.position = positionMap[12 + positionOffset];
        break;
      case positionMap[1 + positionOffset]:
        this.position = positionMap[19 + positionOffset];
        break;
      case positionMap[10 + positionOffset]:
        this.position = positionMap[20 + positionOffset];
        break;
      case positionMap[19 + positionOffset]:
        this.position = positionMap[21 + positionOffset];
    }
  }
}
