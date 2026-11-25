/**
 * Minimal 3x3 Rubik's cube sticker simulator.
 *
 * Coordinates: x → right (R), y → up (U), z → front (F). Each cubie sits at
 * integer coords in {-1, 0, 1}; each sticker is a cubie position plus an
 * outward normal. A move rotates every sticker whose cubie lies in the
 * affected layers.
 */

export type Vec = [number, number, number];
export type Face = 'U' | 'D' | 'F' | 'B' | 'R' | 'L';

export type Sticker = {
  pos: Vec;
  normal: Vec;
  /** Face this sticker belongs to on a solved cube (decides its colour). */
  color: Face;
  /** Home cubie position, used for masks and piece tracking. */
  home: Vec;
};

export type CubeState = Array<Sticker>;

export const FACE_NORMALS: Record<Face, Vec> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
  R: [1, 0, 0],
  L: [-1, 0, 0],
};

export const FACES: Array<Face> = ['U', 'D', 'F', 'B', 'R', 'L'];

export function solvedCube(): CubeState {
  const stickers: CubeState = [];
  for (const face of FACES) {
    const n = FACE_NORMALS[face];
    const axis = n.findIndex((v) => v !== 0);
    for (const a of [-1, 0, 1]) {
      for (const b of [-1, 0, 1]) {
        const pos: Vec = [0, 0, 0];
        pos[axis] = n[axis];
        const others = [0, 1, 2].filter((i) => i !== axis);
        pos[others[0]] = a;
        pos[others[1]] = b;
        stickers.push({ pos, normal: [...n], color: face, home: [...pos] });
      }
    }
  }
  return stickers;
}

/** Rotate a vector by +90° (counter-clockwise looking from the axis tip) `times` times. */
function rotate(v: Vec, axis: 0 | 1 | 2, times: number): Vec {
  let [x, y, z] = v;
  const t = ((times % 4) + 4) % 4;
  for (let i = 0; i < t; i++) {
    if (axis === 0) [y, z] = [-z, y];
    else if (axis === 1) [z, x] = [-x, z];
    else [x, y] = [-y, x];
  }
  return [x, y, z];
}

type MoveDef = { axis: 0 | 1 | 2; layers: Array<number>; dir: 1 | -1 };

// dir: number of +90° turns for one clockwise quarter of the named move.
const MOVES: Record<string, MoveDef> = {
  R: { axis: 0, layers: [1], dir: -1 },
  L: { axis: 0, layers: [-1], dir: 1 },
  U: { axis: 1, layers: [1], dir: -1 },
  D: { axis: 1, layers: [-1], dir: 1 },
  F: { axis: 2, layers: [1], dir: -1 },
  B: { axis: 2, layers: [-1], dir: 1 },
  M: { axis: 0, layers: [0], dir: 1 },
  E: { axis: 1, layers: [0], dir: 1 },
  S: { axis: 2, layers: [0], dir: -1 },
  r: { axis: 0, layers: [0, 1], dir: -1 },
  l: { axis: 0, layers: [-1, 0], dir: 1 },
  u: { axis: 1, layers: [0, 1], dir: -1 },
  d: { axis: 1, layers: [-1, 0], dir: 1 },
  f: { axis: 2, layers: [0, 1], dir: -1 },
  b: { axis: 2, layers: [-1, 0], dir: 1 },
  x: { axis: 0, layers: [-1, 0, 1], dir: -1 },
  y: { axis: 1, layers: [-1, 0, 1], dir: -1 },
  z: { axis: 2, layers: [-1, 0, 1], dir: -1 },
};

type Move = { base: string; turns: number };

const TOKEN = /([RLUDFBMESxyzXYZrludfb])(w?)(\d*)('?)(\d*)/g;

/** Parse an algorithm string. Brackets, parentheses and spaces are ignored. */
export function parseAlg(alg: string): Array<Move> {
  const moves: Array<Move> = [];
  const clean = alg.replace(/[()[\]{}]/g, ' ');
  for (const m of clean.matchAll(TOKEN)) {
    let base = m[1];
    if ('XYZ'.includes(base)) base = base.toLowerCase();
    if (m[2] === 'w') base = base.toLowerCase();
    const amount = Number(m[3] || m[5] || 1);
    const prime = m[4] !== ''; // group 4 is the optional prime mark
    moves.push({ base, turns: prime ? -amount : amount });
  }
  return moves;
}

function formatMoves(moves: Array<Move>): string {
  return moves
    .map(({ base, turns }) => {
      const t = ((turns % 4) + 4) % 4;
      return t === 0 ? '' : t === 1 ? base : t === 2 ? `${base}2` : `${base}'`;
    })
    .filter(Boolean)
    .join(' ');
}

export function invertAlg(alg: string): string {
  return formatMoves(
    parseAlg(alg)
      .reverse()
      .map((m) => ({ base: m.base, turns: -m.turns }))
  );
}

function applyMove(state: CubeState, move: Move): CubeState {
  const def = MOVES[move.base];
  if (!def) throw new Error(`Unknown move ${move.base}`);
  const times = def.dir * move.turns;
  return state.map((s) =>
    def.layers.includes(s.pos[def.axis])
      ? { ...s, pos: rotate(s.pos, def.axis, times), normal: rotate(s.normal, def.axis, times) }
      : s
  );
}

export function applyAlg(state: CubeState, alg: string): CubeState {
  return parseAlg(alg).reduce(applyMove, state);
}

const eq = (a: Vec, b: Vec) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

function stickerAt(state: CubeState, pos: Vec, normal: Vec): Sticker {
  const s = state.find((st) => eq(st.pos, pos) && eq(st.normal, normal));
  if (!s) throw new Error(`No sticker at ${pos} / ${normal}`);
  return s;
}

/** Colour of the centre on the face pointing along `normal`. */
function centerColor(state: CubeState, normal: Vec): Face {
  return stickerAt(state, normal, normal).color;
}

/**
 * Relabel colours so every centre shows the colour of the face it sits on.
 *
 * An algorithm with a net cube rotation (y, d, x, ...) ends with the cube held
 * differently than at the start. The case it solves is the physical state
 * `inverse(alg)` gives, seen in the solver's starting grip, so we keep piece
 * positions as they are and only rename colours (a recoloured solved cube is
 * still solved). Rotating the state instead would show the case from the wrong
 * side.
 */
function normalizeOrientation(state: CubeState): CubeState {
  const rename = {} as Record<Face, Face>;
  for (const face of FACES) rename[centerColor(state, FACE_NORMALS[face])] = face;
  const recoloured = state.map((s) => ({ ...s, color: rename[s.color] }));
  // A piece's home is where its colours meet: the sum of their face normals.
  const homes = new Map<string, Vec>();
  for (const s of recoloured) {
    const key = s.pos.join();
    const home = homes.get(key) ?? [0, 0, 0];
    const n = FACE_NORMALS[s.color];
    homes.set(key, [home[0] + n[0], home[1] + n[1], home[2] + n[2]]);
  }
  return recoloured.map((s) => ({ ...s, home: homes.get(s.pos.join())! }));
}

/** State an algorithm solves: inverse of the algorithm applied to a solved cube. */
export function caseFromAlg(alg: string, setup = ''): CubeState {
  return normalizeOrientation(applyAlg(applyAlg(solvedCube(), setup), invertAlg(alg)));
}

/** How each face is laid out in the standard net, seen from outside: its up and right directions. */
const FACE_FRAMES: Record<Face, [Vec, Vec]> = {
  U: [
    [0, 0, -1],
    [1, 0, 0],
  ],
  D: [
    [0, 0, 1],
    [1, 0, 0],
  ],
  F: [
    [0, 1, 0],
    [1, 0, 0],
  ],
  B: [
    [0, 1, 0],
    [-1, 0, 0],
  ],
  R: [
    [0, 1, 0],
    [0, 0, -1],
  ],
  L: [
    [0, 1, 0],
    [0, 0, 1],
  ],
};

/** Cubie position of sticker `index` (0-8, row by row in the standard net) on `face`. */
export function faceletPosition(face: Face, index: number): Vec {
  const n = FACE_NORMALS[face];
  const [up, right] = FACE_FRAMES[face];
  const row = Math.floor(index / 3);
  const column = index % 3;
  return [0, 1, 2].map((k) => n[k] + up[k] * (1 - row) + right[k] * (column - 1)) as Vec;
}

/** Read a face as 9 colours, row by row as seen from outside (standard net orientation). */
export function readFace(state: CubeState, face: Face): Array<Face> {
  const n = FACE_NORMALS[face];
  return Array.from(
    { length: 9 },
    (_, index) => stickerAt(state, faceletPosition(face, index), n).color
  );
}
