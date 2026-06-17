import { JSONEquals, positionMap } from "./helpers";
import { Face, Faces, Orientation } from "./models";
import RubiksCube from "./RubiksCube";

const FACE_CLASSES = Object.keys(Faces) as Face[]

const rubiksCube = RubiksCube.getInstance()

document.querySelector('#rotateTopCCW')?.addEventListener('click', () => {
    rubiksCube.rotateTopCCW()
    renderCube()
})

function renderCube() {
    document.querySelectorAll('.cube').forEach(el => {
        const cubeElement = el as HTMLElement
        const orientationKey = cubeElement.dataset.orientation
        const positionStr = cubeElement.dataset.position
        if (!orientationKey || !positionStr) return

        const positionInt = parseInt(positionStr)
        const position = positionMap[positionInt]
        if (!position) return

        const cube = rubiksCube.cubes.find(c => JSONEquals(c.position, position))
        if (!cube) return

        cubeElement.classList.remove(...FACE_CLASSES)

        const faceColor = cube.orientation[orientationKey as keyof Orientation]
        if (faceColor) {
            cubeElement.classList.add(faceColor)
        }
    })
}

renderCube()