// Cubie DOM: building the 27 rendered cubies and repainting them from engine state.
import Cube from '../../engine/Cube'
import { CubieEntry } from './types'
import { COLORS, DIRS, FACE_TRANSFORMS, HALF, SIZE, UNIT } from './config'

// sticker face element -> its cubie, for drag hit-testing (see dragTurn's pickTurn)
export const faceEntry = new WeakMap<HTMLElement, CubieEntry>()

export function createCubie(cube: Cube): CubieEntry {
  const el = document.createElement('div')
  el.style.cssText = `position:absolute; left:0; top:0; width:${SIZE}px; height:${SIZE}px; transform-style:preserve-3d;`
  const stickers = {} as CubieEntry['stickers']
  const entry: CubieEntry = { cube, el, stickers }
  for (const dir of DIRS) {
    const face = document.createElement('div')
    face.className = 'face'
    face.dataset.dir = dir
    faceEntry.set(face, entry)
    face.style.cssText =
      `position:absolute; left:0; top:0; width:${SIZE}px; height:${SIZE}px; ` +
      `background:#14141b; border-radius:9px; transform:${FACE_TRANSFORMS[dir]}; ` +
      '-webkit-backface-visibility:hidden; backface-visibility:hidden;'
    const st = document.createElement('div')
    st.style.cssText =
      'position:absolute; inset:5px; border-radius:7px; box-shadow: inset 0 2px 5px rgba(255,255,255,.18), inset 0 -3px 6px rgba(0,0,0,.4);'
    face.appendChild(st)
    el.appendChild(face)
    stickers[dir] = st
  }
  return entry
}

// Repaint every cubie's position and stickers from the engine state it mirrors.
export function renderCubies(entries: CubieEntry[]) {
  entries.forEach((e) => {
    const p = e.cube.position
    // engine pos -> CSS: X = right(+), Y = up(+) so screen-down is -Y, Z = front(+) toward viewer
    e.el.style.transform = `translate3d(${p.X * UNIT - HALF}px,${-p.Y * UNIT - HALF}px,${p.Z * UNIT}px)`
    DIRS.forEach((dir) => {
      const col = e.cube.orientation[dir]
      const st = e.stickers[dir]
      if (col) {
        st.style.display = 'block'
        st.style.background = COLORS[col]
      } else {
        st.style.display = 'none'
      }
    })
  })
}
