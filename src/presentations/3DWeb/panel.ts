// Control-panel DOM: the stats readout, status pill, and button enable/disable states.
// Pure writes from the view's session state — no cube or view logic here.
import { Status } from './types'
import { CUBE_MOVE_BUTTONS, STATUS_META } from './config'

function timeText(elapsedMs: number): string {
  const ms = elapsedMs || 0
  const total = ms / 1000
  const mm = Math.floor(total / 60)
  const ss = Math.floor(total % 60)
  const t = Math.floor((ms % 1000) / 100)
  const ssStr = (mm > 0 && ss < 10 ? '0' : '') + ss
  return (mm > 0 ? mm + ':' : '') + ssStr + '.' + t
}

export function updateStats(elapsedMs: number, moveCount: number) {
  const time = document.getElementById('stat-time')
  const moves = document.getElementById('stat-moves')
  if (time) time.textContent = timeText(elapsedMs)
  if (moves) moves.textContent = String(moveCount)
}

export function updateStatus(status: Status) {
  const st = STATUS_META[status]
  const pill = document.getElementById('status-pill')
  const dot = document.getElementById('status-dot')
  const label = document.getElementById('status-label')
  if (dot) {
    dot.style.background = st.color
    dot.style.boxShadow = '0 0 10px ' + st.color
  }
  if (label) {
    label.textContent = st.label
    label.style.color = st.color
  }
  if (pill) pill.style.borderColor = st.color
}

// While the solver is active, every control is locked except Abort. Abort is live only during a
// solve and shows a spinner + "Aborting…" while the abort unwinds (which isn't instant).
export function updateControls(solving: boolean, aborting: boolean) {
  const setDisabled = (id: string, disabled: boolean) => {
    const el = document.getElementById(id) as HTMLButtonElement | null
    if (el) el.disabled = disabled
  }
  const lockable = ['btn-scramble', 'btn-reset', 'solve', 'btn-recenter'].concat(
    Object.keys(CUBE_MOVE_BUTTONS)
  )
  lockable.forEach((id) => setDisabled(id, solving))
  const abort = document.getElementById('abort-solve') as HTMLButtonElement | null
  if (abort) {
    abort.disabled = !solving || aborting
    abort.classList.toggle('btn--busy', aborting)
    abort.textContent = aborting ? 'Aborting…' : 'Abort'
  }
}
