import {
  applyAlg,
  CubeState,
  Face,
  FACE_NORMALS,
  FACES,
  faceletPosition,
  readFace,
  solvedCube,
  Vec,
} from './cube';

/**
 * A cube described by its 54 sticker colours, as a person paints or scans it: for each face, 9
 * colours row by row in the standard net. A colour is named by the face it belongs to on the
 * solved cube held the guide's way (U yellow, F green, R orange, D white, B blue, L red), so the
 * centres always show their own face.
 */
export type TFacelets = Record<Face, Array<Face>>;

/** A sticker: its face and index (0-8) on that face. */
export type TFaceletRef = { face: Face; index: number };

export type TCubeError =
  | { kind: 'colorCount'; color: Face; count: number }
  | { kind: 'center'; stickers: Array<TFaceletRef> }
  | { kind: 'invalidPiece'; stickers: Array<TFaceletRef> }
  | { kind: 'duplicatePiece'; stickers: Array<TFaceletRef> }
  | { kind: 'cornerTwist' }
  | { kind: 'edgeFlip' }
  | { kind: 'parity' };

/**
 * Piece slots in cubing.js' KPuzzle order (its 3x3x3 definition), each named by its faces in the
 * order orientation is counted from: the first face is U or D where the slot has one.
 */
const EDGE_SLOTS: Array<[Face, Face]> = [
  ['U', 'F'],
  ['U', 'R'],
  ['U', 'B'],
  ['U', 'L'],
  ['D', 'F'],
  ['D', 'R'],
  ['D', 'B'],
  ['D', 'L'],
  ['F', 'R'],
  ['F', 'L'],
  ['B', 'R'],
  ['B', 'L'],
];
// Corner faces run clockwise around the corner, seen from outside.
const CORNER_SLOTS: Array<[Face, Face, Face]> = [
  ['U', 'F', 'R'],
  ['U', 'R', 'B'],
  ['U', 'B', 'L'],
  ['U', 'L', 'F'],
  ['D', 'R', 'F'],
  ['D', 'F', 'L'],
  ['D', 'L', 'B'],
  ['D', 'B', 'R'],
];

export function solvedFacelets(): TFacelets {
  return faceletsFromState(solvedCube());
}

export function faceletsFromState(state: CubeState): TFacelets {
  return Object.fromEntries(FACES.map((face) => [face, readFace(state, face)])) as TFacelets;
}

/** The facelets after an algorithm, from the solved cube. */
export function faceletsFromAlg(alg: string): TFacelets {
  return faceletsFromState(applyAlg(solvedCube(), alg));
}

const sameVec = (a: Vec, b: Vec) => a[0] == b[0] && a[1] == b[1] && a[2] == b[2];

/** The sticker of a piece slot on one of its faces. */
function slotSticker(faces: Array<Face>, face: Face): TFaceletRef {
  const position = faces.reduce<Vec>(
    (sum, f) => sum.map((value, k) => value + FACE_NORMALS[f][k]) as Vec,
    [0, 0, 0]
  );
  const index = [...Array(9).keys()].find((i) => sameVec(faceletPosition(face, i), position))!;
  return { face, index };
}

const EDGE_STICKERS = EDGE_SLOTS.map((faces) => faces.map((face) => slotSticker(faces, face)));
const CORNER_STICKERS = CORNER_SLOTS.map((faces) => faces.map((face) => slotSticker(faces, face)));

/** Parity of a permutation (0 even, 1 odd). */
function parity(permutation: Array<number>) {
  let result = 0;
  const seen = new Set<number>();
  for (let start = 0; start < permutation.length; start++) {
    let length = 0;
    for (let i = start; !seen.has(i); i = permutation[i]) {
      seen.add(i);
      length++;
    }
    if (length > 0) result ^= (length - 1) & 1;
  }
  return result;
}

export type TPatternData = {
  EDGES: { pieces: Array<number>; orientation: Array<number> };
  CORNERS: { pieces: Array<number>; orientation: Array<number> };
};

/**
 * The cube as cubing.js piece data (which piece sits in each slot, and how it is turned), or every
 * reason it cannot be a real cube: wrong colour counts, moved centres, colour combinations no
 * piece has, a piece twice, or a state no sequence of moves reaches (a twisted corner, a flipped
 * edge, two pieces swapped).
 */
export function faceletsToPattern(
  facelets: TFacelets
): { ok: true; data: TPatternData } | { ok: false; errors: Array<TCubeError> } {
  const errors: Array<TCubeError> = [];
  const counts = new Map<Face, number>(FACES.map((face) => [face, 0]));
  for (const face of FACES)
    for (const color of facelets[face]) counts.set(color, counts.get(color)! + 1);
  for (const [color, count] of counts)
    if (count != 9) errors.push({ kind: 'colorCount', color, count });
  const movedCenters = FACES.filter((face) => facelets[face][4] != face);
  if (movedCenters.length > 0)
    errors.push({ kind: 'center', stickers: movedCenters.map((face) => ({ face, index: 4 })) });
  if (errors.length > 0) return { ok: false, errors };

  const color = ({ face, index }: TFaceletRef) => facelets[face][index];
  const pieces = (slots: Array<Array<Face>>, stickers: Array<Array<TFaceletRef>>) => {
    const found: Array<number> = [];
    const orientation: Array<number> = [];
    stickers.forEach((refs) => {
      const colors = refs.map(color);
      let match = -1;
      let turn = 0;
      // A piece matches when its colours appear in the same cyclic order (edges: either order).
      for (let piece = 0; piece < slots.length && match < 0; piece++)
        for (let t = 0; t < colors.length; t++)
          if (slots[piece].every((face, k) => colors[(k + t) % colors.length] == face)) {
            match = piece;
            // cubing.js counts a corner's twist the other way round.
            turn = (colors.length - t) % colors.length;
            break;
          }
      if (match < 0) errors.push({ kind: 'invalidPiece', stickers: refs });
      found.push(match);
      orientation.push(turn);
    });
    // Each piece once: a second copy of a piece is reported at every slot it is in.
    for (let piece = 0; piece < slots.length; piece++) {
      const at = found.flatMap((value, slot) => (value == piece ? [slot] : []));
      if (at.length > 1)
        errors.push({ kind: 'duplicatePiece', stickers: at.flatMap((slot) => stickers[slot]) });
    }
    return { pieces: found, orientation };
  };
  const edges = pieces(EDGE_SLOTS, EDGE_STICKERS);
  const corners = pieces(CORNER_SLOTS, CORNER_STICKERS);
  if (errors.length > 0) return { ok: false, errors };

  if (corners.orientation.reduce((sum, value) => sum + value, 0) % 3 != 0)
    errors.push({ kind: 'cornerTwist' });
  if (edges.orientation.reduce((sum, value) => sum + value, 0) % 2 != 0)
    errors.push({ kind: 'edgeFlip' });
  if (parity(edges.pieces) != parity(corners.pieces)) errors.push({ kind: 'parity' });
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: { EDGES: edges, CORNERS: corners } };
}

/** Whether every face shows a single colour. */
export function isSolvedFacelets(facelets: TFacelets) {
  return FACES.every((face) => facelets[face].every((color) => color == face));
}

const SCRAMBLE_FACES: Array<Face> = ['U', 'D', 'F', 'B', 'R', 'L'];
const AXIS: Record<Face, number> = { U: 0, D: 0, F: 1, B: 1, R: 2, L: 2 };

/**
 * A random face-turn scramble of `length` moves: never the same face twice in a row, nor three
 * turns on one axis (U D U), which would cancel into fewer moves.
 */
export function randomScramble(length = 25, random = Math.random) {
  const moves: Array<Face> = [];
  const out: Array<string> = [];
  while (out.length < length) {
    const face = SCRAMBLE_FACES[Math.floor(random() * 6)];
    const [last, before] = [moves.at(-1), moves.at(-2)];
    if (face == last) continue;
    if (last && before && AXIS[face] == AXIS[last] && AXIS[last] == AXIS[before]) continue;
    moves.push(face);
    out.push(face + ['', '2', "'"][Math.floor(random() * 3)]);
  }
  return out.join(' ');
}
