import { JSONEquals, positionMap } from "./helpers";
import { Face, Faces, Orientation } from "./models";
import RubiksCube from "./RubiksCube";

const FACE_CLASSES = Object.keys(Faces) as Face[];

const rubiksCube = RubiksCube.getInstance();

document.querySelector("#rotateTopCW")?.addEventListener("click", () => {
  rubiksCube.rotateTopCW();
  renderCube();
});

document.querySelector("#rotateXMidCW")?.addEventListener("click", () => {
  rubiksCube.rotateXMidCW();
  renderCube();
});

document.querySelector("#rotateBottomCW")?.addEventListener("click", () => {
  rubiksCube.rotateBottomCW();
  renderCube();
});

document.querySelector("#rotateTopCCW")?.addEventListener("click", () => {
  rubiksCube.rotateTopCCW();
  renderCube();
});

document.querySelector("#rotateXMidCCW")?.addEventListener("click", () => {
  rubiksCube.rotateXMidCCW();
  renderCube();
});

document.querySelector("#rotateBottomCCW")?.addEventListener("click", () => {
  rubiksCube.rotateBottomCCW();
  renderCube();
});

document.querySelector("#rotateLeftCW")?.addEventListener("click", () => {
  rubiksCube.rotateLeftCW();
  renderCube();
});

document.querySelector("#rotateYMidCW")?.addEventListener("click", () => {
  rubiksCube.rotateYMidCW();
  renderCube();
});

document.querySelector("#rotateRightCW")?.addEventListener("click", () => {
  rubiksCube.rotateRightCW();
  renderCube();
});

document.querySelector("#rotateLeftCCW")?.addEventListener("click", () => {
  rubiksCube.rotateLeftCCW();
  renderCube();
});

document.querySelector("#rotateYMidCCW")?.addEventListener("click", () => {
  rubiksCube.rotateYMidCCW();
  renderCube();
});

document.querySelector("#rotateRightCCW")?.addEventListener("click", () => {
  rubiksCube.rotateRightCCW();
  renderCube();
});

document.querySelector("#rotateFrontCW")?.addEventListener("click", () => {
  rubiksCube.rotateFrontCW();
  renderCube();
});

document.querySelector("#rotateZMidCW")?.addEventListener("click", () => {
  rubiksCube.rotateZMidCW();
  renderCube();
});

document.querySelector("#rotateBackCW")?.addEventListener("click", () => {
  rubiksCube.rotateBackCW();
  renderCube();
});

document.querySelector("#rotateFrontCCW")?.addEventListener("click", () => {
  rubiksCube.rotateFrontCCW();
  renderCube();
});

document.querySelector("#rotateZMidCCW")?.addEventListener("click", () => {
  rubiksCube.rotateZMidCCW();
  renderCube();
});

document.querySelector("#rotateBackCCW")?.addEventListener("click", () => {
  rubiksCube.rotateBackCCW();
  renderCube();
});

document.querySelector("#rotateCubeXCW")?.addEventListener("click", () => {
  rubiksCube.rotateCube("XCW");
  renderCube();
});

document.querySelector("#rotateCubeXCCW")?.addEventListener("click", () => {
  rubiksCube.rotateCube("XCCW");
  renderCube();
});

document.querySelector("#rotateCubeYCW")?.addEventListener("click", () => {
  rubiksCube.rotateCube("YCW");
  renderCube();
});

document.querySelector("#rotateCubeYCCW")?.addEventListener("click", () => {
  rubiksCube.rotateCube("YCCW");
  renderCube();
});

function renderCube() {
  document.querySelectorAll(".cube").forEach((el) => {
    const cubeElement = el as HTMLElement;
    const orientationKey = cubeElement.dataset.orientation;
    const positionStr = cubeElement.dataset.position;
    if (!orientationKey || !positionStr) return;

    const positionInt = parseInt(positionStr);
    const position = positionMap[positionInt];
    if (!position) return;

    const cube = rubiksCube.cubes.find((c) => JSONEquals(c.position, position));
    if (!cube) return;

    cubeElement.classList.remove(...FACE_CLASSES);

    const faceColor = cube.orientation[orientationKey as keyof Orientation];
    if (faceColor) {
      cubeElement.classList.add(faceColor);
    }
  });
}

renderCube();
