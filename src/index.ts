import { JSONEquals } from "./engine/helpers";
import { FACES, LAYER_MOVES, Orientation } from "./engine/models";
import RubiksCube from "./engine/RubiksCube";

const rubiksCube = RubiksCube.getInstance();
const cubeState = localStorage.getItem("cubeState");
if (cubeState) rubiksCube.setState(cubeState);

LAYER_MOVES.forEach((move) => {
  document.getElementById(move)?.addEventListener("click", () => {
    rubiksCube[move]();
    updateClient();
  });
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

    cubeElement.classList.remove(...FACES);

    const faceColor = cube.orientation[orientationKey as keyof Orientation];
    if (faceColor) {
      cubeElement.classList.add(faceColor);
    }
  });
}

renderCube();
