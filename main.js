"use strict"

const LEVEL = [
  "#########",
  "#...T#..#",
  "#.#.##..#",
  "#...B...#",
  "##P.#..##",
  "#########",
]

/** Main */
const gridEl = document.getElementById("grid")
const msgEl = document.getElementById("message")
const movesEl = document.getElementById("moves")
const initial = parseLevel(LEVEL)
let state = {
  player: { ...initial.player },
  box: { ...initial.box },
  moved: 0,
}

window.addEventListener("keydown", onKeyPress)

render()


/** Parse an ASCII level to derive dimensions and starting entities. */
function parseLevel(lines) {
  const h = lines.length
  const w = Math.max(...lines.map((l) => l.length))
  let player = null
  let box = null
  for (let r = 0; r < h; r++) {
    const row = lines[r]
    for (let c = 0; c < w; c++) {
      const ch = row[c] || " "
      if (ch === "P") player = { r, c }
      else if (ch === "B") box = { r, c }
    }
  }
  return { width: w, height: h, player, box }
}

/** Render the entire grid from state (full re-render) and update the win message. */
function render() {
  gridEl.style.gridTemplateColumns = `repeat(${initial.width}, var(--cell-size))`
  gridEl.innerHTML = ""
  for (let r = 0; r < initial.height; r++) {
    for (let c = 0; c < initial.width; c++) {
      const ch = LEVEL[r]?.[c] ?? " "
      const isWall = ch === "#"
      const isTarget = ch === "T"
      const isPlayer = samePosition({ r, c }, state.player)
      const isBox = samePosition({ r, c }, state.box)

      const cell = document.createElement("div")
      cell.className = `cell ${isWall ? "wall" : "floor"}${isTarget && !isBox ? " target" : ""}`
      cell.setAttribute("role", "gridcell")
      if (isPlayer || isBox) {
        const ent = document.createElement("span")
        ent.className = `entity ${isPlayer ? "player" : "box"}${isBox && isTarget ? " on-target" : ""}`
        ent.textContent = isPlayer ? "🧍" : "📦"
        cell.appendChild(ent)
      }
      if (isBox && isTarget) {
        cell.classList.add("box-on-target")
      }
      gridEl.appendChild(cell)
    }
  }
  msgEl.textContent = isWin() ? "You win!" : ""
  movesEl.textContent = `Moves: ${state.moved}`
}

/** Handle keyboard input (R resets; movement locks after win). */
function onKeyPress(e) {
  const k = e.key.toLowerCase()
  if (k === "r" && !(e.metaKey || e.ctrlKey || e.altKey)) { e.preventDefault(); reset(); return }
  if (isWin()) return // lock movement after win
  if (["arrowup"].includes(k)) { e.preventDefault(); tryMove(-1, 0) }
  else if (["arrowdown"].includes(k)) { e.preventDefault(); tryMove(1, 0) }
  else if (["arrowleft"].includes(k)) { e.preventDefault(); tryMove(0, -1) }
  else if (["arrowright"].includes(k)) { e.preventDefault(); tryMove(0, 1) }
}

/** Try to move the player by (dr, dc), pushing the box if possible. */
function tryMove(dr, dc) {
  const next = { r: state.player.r + dr, c: state.player.c + dc }
  if ((LEVEL[next.r]?.[next.c] ?? " ") === "#") return

  if (samePosition(next, state.box)) {
    const beyond = { r: state.box.r + dr, c: state.box.c + dc }
    if ((LEVEL[beyond.r]?.[beyond.c] ?? " ") === "#") return
    state.box = beyond
    state.player = next
    state.moved++
  } else {
    state.player = next
    state.moved++
  }

  render()
}

function isWin() {
  const ch = LEVEL[state.box.r]?.[state.box.c] ?? " "
  return ch === "T"
}

/** Convenience: compare two grid positions. */
function samePosition(a, b) {
  return a && b && a.r === b.r && a.c === b.c
}

function reset() {
  state.player = { ...initial.player }
  state.box = { ...initial.box }
  state.moved = 0
  render()
}
