import { positionMap } from "./helpers";
import RubiksCube from "./RubiksCube";

const rubiksCube = RubiksCube.getInstance()

document.querySelectorAll('.cube').forEach(el => {
    const cubeElement = el as HTMLElement
    const orientation = cubeElement.dataset.orientation!!
    const position = parseInt(cubeElement.dataset.position!!)
    const cube = rubiksCube.cubes.find(c => {
        return JSON.stringify(c.position) === JSON.stringify(positionMap[position])
    })!!
    console.log('orientation', cube.orientation)
    switch(orientation) {
        case 'top':
            cubeElement.classList.add(cube.orientation.top!!)
            break;
        case 'left':
            cubeElement.classList.add(cube.orientation.left!!)
            break;
        case 'front':
            cubeElement.classList.add(cube.orientation.front!!)
            break;
        case 'right':
            cubeElement.classList.add(cube.orientation.right!!)
            break;
        case 'bottom':
            cubeElement.classList.add(cube.orientation.bottom!!)
            break;
    }
})

console.log(rubiksCube);