import { JSONEquals } from "./engine/helpers";
import { Face, Faces, Orientation } from "./engine/models";
import RubiksCube from "./engine/RubiksCube";

const rubiksCube = RubiksCube.getInstance();
const cubeState = localStorage.getItem("cubeState");

if (cubeState) rubiksCube.setState(cubeState);

const FACE_CLASSES = Object.keys(Faces) as Face[];

document.querySelector("#rotateTopCW")?.addEventListener("click", () => {
  rubiksCube.rotateTopCW();
  updateClient();
});

document.querySelector("#rotateXMidCW")?.addEventListener("click", () => {
  rubiksCube.rotateXMidCW();
  updateClient();
});

document.querySelector("#rotateBottomCW")?.addEventListener("click", () => {
  rubiksCube.rotateBottomCW();
  updateClient();
});

document.querySelector("#rotateTopCCW")?.addEventListener("click", () => {
  rubiksCube.rotateTopCCW();
  updateClient();
});

document.querySelector("#rotateXMidCCW")?.addEventListener("click", () => {
  rubiksCube.rotateXMidCCW();
  updateClient();
});

document.querySelector("#rotateBottomCCW")?.addEventListener("click", () => {
  rubiksCube.rotateBottomCCW();
  updateClient();
});

document.querySelector("#rotateLeftCW")?.addEventListener("click", () => {
  rubiksCube.rotateLeftCW();
  updateClient();
});

document.querySelector("#rotateYMidCW")?.addEventListener("click", () => {
  rubiksCube.rotateYMidCW();
  updateClient();
});

document.querySelector("#rotateRightCW")?.addEventListener("click", () => {
  rubiksCube.rotateRightCW();
  updateClient();
});

document.querySelector("#rotateLeftCCW")?.addEventListener("click", () => {
  rubiksCube.rotateLeftCCW();
  updateClient();
});

document.querySelector("#rotateYMidCCW")?.addEventListener("click", () => {
  rubiksCube.rotateYMidCCW();
  updateClient();
});

document.querySelector("#rotateRightCCW")?.addEventListener("click", () => {
  rubiksCube.rotateRightCCW();
  updateClient();
});

document.querySelector("#rotateFrontCW")?.addEventListener("click", () => {
  rubiksCube.rotateFrontCW();
  updateClient();
});

document.querySelector("#rotateZMidCW")?.addEventListener("click", () => {
  rubiksCube.rotateZMidCW();
  updateClient();
});

document.querySelector("#rotateBackCW")?.addEventListener("click", () => {
  rubiksCube.rotateBackCW();
  updateClient();
});

document.querySelector("#rotateFrontCCW")?.addEventListener("click", () => {
  rubiksCube.rotateFrontCCW();
  updateClient();
});

document.querySelector("#rotateZMidCCW")?.addEventListener("click", () => {
  rubiksCube.rotateZMidCCW();
  updateClient();
});

document.querySelector("#rotateBackCCW")?.addEventListener("click", () => {
  rubiksCube.rotateBackCCW();
  updateClient();
});

document.querySelector("#rotateCubeXCW")?.addEventListener("click", () => {
  rubiksCube.rotateRubiksCube("XCW");
  updateClient();
});

document.querySelector("#rotateCubeXCCW")?.addEventListener("click", () => {
  rubiksCube.rotateRubiksCube("XCCW");
  updateClient();
});

document.querySelector("#rotateCubeYCW")?.addEventListener("click", () => {
  rubiksCube.rotateRubiksCube("YCW");
  updateClient();
});

document.querySelector("#rotateCubeYCCW")?.addEventListener("click", () => {
  rubiksCube.rotateRubiksCube("YCCW");
  updateClient();
});

document.querySelector("#reset")?.addEventListener("click", () => {
  rubiksCube.reset();
  updateClient();
});

function updateClient() {
  localStorage.setItem("cubeState", JSON.stringify(rubiksCube.cubes));
  renderCube();
}

function renderCube() {
  document.querySelectorAll(".cube").forEach((el) => {
    const cubeElement = el as HTMLElement;
    const orientationKey = cubeElement.dataset.orientation;
    const { posX, posY, posZ } = cubeElement.dataset;
    if (
      !orientationKey ||
      posX === undefined ||
      posY === undefined ||
      posZ === undefined
    )
      return;

    const position = {
      X: parseInt(posX),
      Y: parseInt(posY),
      Z: parseInt(posZ),
    };

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
