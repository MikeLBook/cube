import { JSONEquals } from '../../utils'
import { FACES, LAYER_MOVES, Orientation, ROTATIONS } from '../../engine/types'
import RubiksCube from '../../engine/RubiksCube'

const rubiksCube = RubiksCube.getInstance()
const cubeState = localStorage.getItem('cubeState')
if (cubeState) rubiksCube.setState(cubeState)

LAYER_MOVES.forEach((move) => {
  document.getElementById(move)?.addEventListener('click', () => rubiksCube[move]())
})

ROTATIONS.forEach((rotation) => {
  document
    .getElementById(rotation)
    ?.addEventListener('click', () => rubiksCube.rotateRubiksCube(rotation))
})

document.querySelector('#reset')?.addEventListener('click', () => {
  rubiksCube.reset()
})

function renderCube() {
  document.querySelectorAll('.cube').forEach((el) => {
    const cubeElement = el as HTMLElement
    const orientationKey = cubeElement.dataset.orientation
    const { posX, posY, posZ } = cubeElement.dataset
    if (!orientationKey || posX === undefined || posY === undefined || posZ === undefined) return

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

rubiksCube.addObserver({
  onMove: () => {
    localStorage.setItem('cubeState', JSON.stringify(rubiksCube.cubes))
    renderCube()
  }
})

renderCube()
