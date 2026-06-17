import { JSONEquals, positionMap } from "./helpers";
import { Face, Faces, Orientation } from "./models";
import RubiksCube from "./RubiksCube";

const FACE_CLASSES = Object.keys(Faces) as Face[]

const rubiksCube = RubiksCube.getInstance()

document.querySelector('#rotateTopCW')?.addEventListener('click', () => {
    rubiksCube.rotateTopCW()
    renderCube()
})

document.querySelector('#rotateMiddleCW')?.addEventListener('click', () => {
    rubiksCube.rotateMiddleCW()
    renderCube()
})

document.querySelector('#rotateBottomCW')?.addEventListener('click', () => {
    rubiksCube.rotateBottomCW()
    renderCube()
})

document.querySelector('#rotateTopCCW')?.addEventListener('click', () => {
    rubiksCube.rotateTopCCW()
    renderCube()
})

document.querySelector('#rotateMiddleCCW')?.addEventListener('click', () => {
    rubiksCube.rotateMiddleCCW()
    renderCube()
})

document.querySelector('#rotateBottomCCW')?.addEventListener('click', () => {
    rubiksCube.rotateBottomCCW()
    renderCube()
})

document.querySelector('#rotateLeftYCW')?.addEventListener('click', () => {
    rubiksCube.rotateLeftYCW()
    renderCube()
})

document.querySelector('#rotateCenterYCW')?.addEventListener('click', () => {
    rubiksCube.rotateCenterYCW()
    renderCube()
})

document.querySelector('#rotateRightYCW')?.addEventListener('click', () => {
    rubiksCube.rotateRightYCW()
    renderCube()
})

document.querySelector('#rotateLeftYCCW')?.addEventListener('click', () => {
    rubiksCube.rotateLeftYCCW()
    renderCube()
})

document.querySelector('#rotateCenterYCCW')?.addEventListener('click', () => {
    rubiksCube.rotateCenterYCCW()
    renderCube()
})

document.querySelector('#rotateRightYCCW')?.addEventListener('click', () => {
    rubiksCube.rotateRightYCCW()
    renderCube()
})

document.querySelector('#rotateCubeXCW')?.addEventListener('click', () => {
    rubiksCube.rotateCube("XCW")
    renderCube()
})

document.querySelector('#rotateCubeXCCW')?.addEventListener('click', () => {
    rubiksCube.rotateCube("XCCW")
    renderCube()
})

document.querySelector('#rotateCubeYCW')?.addEventListener('click', () => {
    rubiksCube.rotateCube("YCW")
    renderCube()
})

document.querySelector('#rotateCubeYCCW')?.addEventListener('click', () => {
    rubiksCube.rotateCube("YCCW")
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