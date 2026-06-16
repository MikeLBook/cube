import { RubiksCube } from "./models";

export function createCube(): RubiksCube {
    return {
        cubes: [
            // Top layer
            { position: { X: 0, Y: 0, Z: 0 }, orientation: { top: 'Y', left: 'B', back: 'O' } },
            { position: { X: 1, Y: 0, Z: 0 }, orientation: { top: 'Y', back: 'O' } },
            { position: { X: 2, Y: 0, Z: 0 }, orientation: { top: 'Y', right: 'G', back: 'O' } },
            { position: { X: 0, Y: 1, Z: 0 }, orientation: { top: 'Y', left: 'B' } },
            { position: { X: 1, Y: 1, Z: 0 }, orientation: { top: 'Y' } },
            { position: { X: 2, Y: 1, Z: 0 }, orientation: { top: 'Y', right: 'G' } },
            { position: { X: 0, Y: 2, Z: 0 }, orientation: { top: 'Y', left: 'B', front: 'R' } },
            { position: { X: 1, Y: 2, Z: 0 }, orientation: { top: 'Y', front: 'R' } },
            { position: { X: 2, Y: 2, Z: 0 }, orientation: { top: 'Y', right: 'G', front: 'R' } },

            // Middle layer
            { position: { X: 0, Y: 0, Z: 1 }, orientation: { left: 'B', back: 'O' } },
            { position: { X: 1, Y: 0, Z: 1 }, orientation: { back: 'O' } },
            { position: { X: 2, Y: 0, Z: 1 }, orientation: { right: 'G', back: 'O' } },
            { position: { X: 0, Y: 1, Z: 1 }, orientation: { left: 'B' } },
            { position: { X: 1, Y: 1, Z: 1 }, orientation: {} },
            { position: { X: 2, Y: 1, Z: 1 }, orientation: { right: 'G' } },
            { position: { X: 0, Y: 2, Z: 1 }, orientation: { left: 'B', front: 'R' } },
            { position: { X: 1, Y: 2, Z: 1 }, orientation: { front: 'R' } },
            { position: { X: 2, Y: 2, Z: 1 }, orientation: { right: 'G', front: 'R' } },

            // Bottom layer
            { position: { X: 0, Y: 0, Z: 2 }, orientation: { bottom: 'W', left: 'B', back: 'O' } },
            { position: { X: 1, Y: 0, Z: 2 }, orientation: { bottom: 'W', back: 'O' } },
            { position: { X: 2, Y: 0, Z: 2 }, orientation: { bottom: 'W', right: 'G', back: 'O' } },
            { position: { X: 0, Y: 1, Z: 2 }, orientation: { bottom: 'W', left: 'B' } },
            { position: { X: 1, Y: 1, Z: 2 }, orientation: { bottom: 'W' } },
            { position: { X: 2, Y: 1, Z: 2 }, orientation: { bottom: 'W', right: 'G' } },
            { position: { X: 0, Y: 2, Z: 2 }, orientation: { bottom: 'W', left: 'B', front: 'R' } },
            { position: { X: 1, Y: 2, Z: 2 }, orientation: { bottom: 'W', front: 'R' } },
            { position: { X: 2, Y: 2, Z: 2 }, orientation: { bottom: 'W', right: 'G', front: 'R' } },
        ],
        orientation: {
            top: "Y",
            left: "B",
            front: "R",
            right: "G",
            back: "O",
            bottom: "W"
        }
    }
}