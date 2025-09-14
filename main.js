"use strict"

const LEVEL = [
  "#######",
  "#.#  ##",
  "# @   #",
  "#  #  #",
  "##P#  #",
  "#######",
]

/** Parse an ASCII level into player, box, target, and a set of walls. */
function parseLevel(lines) {
  const h = lines.length
  const w = Math.max(...lines.map((l) => l.length))
  const walls = new Set()
  let player = null
  let box = null
  let target = null
  for (let r = 0; r < h; r++) {
    const row = lines[r]
    for (let c = 0; c < w; c++) {
      const ch = row[c] || " "
      const key = `${r},${c}`
      if (ch === "#") walls.add(key)
      else if (ch === ".") target = { r, c }
      else if (ch === "P") player = { r, c }
      else if (ch === "@") box = { r, c }
    }
  }
  return { width: w, height: h, walls, player, box, target }
}

function key(r, c) {
  return `${r},${c}`
}

/** Returns true if two grid positions are identical. */
function inSamePosition(a, b) {
  return a && b && a.r === b.r && a.c === b.c
}

function isWin() {
  return inSamePosition(state.box, state.target)
}

const gridEl = document.getElementById("grid")
const msgEl = document.getElementById("message")

const initial = parseLevel(LEVEL)
let state = {
  width: initial.width,
  height: initial.height,
  walls: initial.walls,
  player: { ...initial.player },
  box: { ...initial.box },
  target: { ...initial.target },
  moved: 0,
}

function reset() {
  state.player = { ...initial.player }
  state.box = { ...initial.box }
  state.moved = 0
  render()
}

/** Render the entire grid from state (full re-render) and update the win message. */
function render() {
  gridEl.style.gridTemplateColumns = `repeat(${state.width}, var(--cell-size))`
  gridEl.innerHTML = ""
  for (let r = 0; r < state.height; r++) {
    for (let c = 0; c < state.width; c++) {
      const k = key(r, c)
      const isWall = state.walls.has(k)
      const isTarget = inSamePosition({ r, c }, state.target)
      const isPlayer = inSamePosition({ r, c }, state.player)
      const isBox = inSamePosition({ r, c }, state.box)

      const cell = document.createElement("div")
      cell.className = `cell ${isWall ? "wall" : "floor"}${!isWall && isTarget ? " target" : ""}`
      cell.setAttribute("role", "gridcell")
      if (isPlayer || isBox) {
        const ent = document.createElement("span")
        ent.className = `entity ${isPlayer ? "player" : "box"}${isBox && isTarget ? " on-target" : ""}`
        cell.appendChild(ent)
      }
      gridEl.appendChild(cell)
    }
  }
  if (inSamePosition(state.box, state.target)) {
    msgEl.textContent = "You win!"
  } else {
    msgEl.textContent = ""
  }
}

/** Try to move the player by (dr, dc), pushing the box if possible. */
function tryMove(dr, dc) {
  const next = { r: state.player.r + dr, c: state.player.c + dc }
  const nextKey = key(next.r, next.c)
  if (state.walls.has(nextKey)) return

  if (inSamePosition(next, state.box)) {
    const beyond = { r: state.box.r + dr, c: state.box.c + dc }
    const beyondKey = key(beyond.r, beyond.c)
    if (state.walls.has(beyondKey)) return
    state.box = beyond
    state.player = next
    state.moved++
  } else {
    state.player = next
    state.moved++
  }

  render()
}

/** Handle keyboard input (R resets; movement locks after win). */
function onKey(e) {
  const k = e.key.toLowerCase()
  if (k === "r") { e.preventDefault(); reset(); return }
  if (isWin()) return // lock movement after win
  if (["arrowup", "w"].includes(k)) { e.preventDefault(); tryMove(-1, 0) }
  else if (["arrowdown", "s"].includes(k)) { e.preventDefault(); tryMove(1, 0) }
  else if (["arrowleft", "a"].includes(k)) { e.preventDefault(); tryMove(0, -1) }
  else if (["arrowright", "d"].includes(k)) { e.preventDefault(); tryMove(0, 1) }
}

window.addEventListener("keydown", onKey)

render()
