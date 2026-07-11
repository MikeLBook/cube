import { JSONEquals } from '../../utils'
import { FACES, Orientation } from '../../engine/models'
import RubiksCube from '../../engine/RubiksCube'
import IRubiksCubeObserver, { LAYER_MOVES } from '../../engine/IRubiksCubeObserver'

const rubiksCube = RubiksCube.getInstance()
const cubeState = localStorage.getItem('cubeState')
if (cubeState) rubiksCube.setState(cubeState)

LAYER_MOVES.forEach((move) => {
    document.getElementById(move)?.addEventListener('click', () => rubiksCube[move]())
})

document.querySelector('#rotateCubeXCW')?.addEventListener('click', () => {
    rubiksCube.rotateRubiksCube('XCW')
})

document.querySelector('#rotateCubeXCCW')?.addEventListener('click', () => {
    rubiksCube.rotateRubiksCube('XCCW')
})

document.querySelector('#rotateCubeYCW')?.addEventListener('click', () => {
    rubiksCube.rotateRubiksCube('YCW')
})

document.querySelector('#rotateCubeYCCW')?.addEventListener('click', () => {
    rubiksCube.rotateRubiksCube('YCCW')
})

document.querySelector('#rotateCubeZCW')?.addEventListener('click', () => {
    rubiksCube.rotateRubiksCube('ZCW')
})

document.querySelector('#rotateCubeZCCW')?.addEventListener('click', () => {
    rubiksCube.rotateRubiksCube('ZCCW')
})

document.querySelector('#reset')?.addEventListener('click', () => {
    rubiksCube.reset()
})

const observer: IRubiksCubeObserver = {
    onMove: () => {
        localStorage.setItem('cubeState', JSON.stringify(rubiksCube.cubes))
        renderCube()
    }
}

rubiksCube.addObserver(observer)

function renderCube() {
    document.querySelectorAll('.cube').forEach((el) => {
        const cubeElement = el as HTMLElement
        const orientationKey = cubeElement.dataset.orientation
        const { posX, posY, posZ } = cubeElement.dataset
        if (!orientationKey || posX === undefined || posY === undefined || posZ === undefined)
            return

        const position = {
            X: parseInt(posX),
            Y: parseInt(posY),
            Z: parseInt(posZ)
        }

        const cube = rubiksCube.cubes.find((c) => JSONEquals(c.position, position))
        if (!cube) return

        cubeElement.classList.remove(...FACES)

        const faceColor = cube.orientation[orientationKey as keyof Orientation]
        if (faceColor) {
            cubeElement.classList.add(faceColor)
        }
    })
}

renderCube()
