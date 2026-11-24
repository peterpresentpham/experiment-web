import { TCaroWinMode } from 'src/types/caro.type';
import type { TStone } from './board';

/**
 * Keys of the machine's lessons (src/services/caro-machine/experience.ts) and the mapping between
 * real cells and the key's canonical frame.
 *
 * A position away from every edge is keyed by its stones relative to their bounding box, in the
 * symmetry that sorts first, so a lesson also applies to the same shape anywhere on the board and
 * on any board size: a player shifting a winning line by a cell used to get past every lesson.
 * Near an edge, where the edge changes what the stones can do, the whole board is the key.
 */

/** Empty lines every stone must keep to each edge for the position to be keyed by its shape. */
export const SHAPE_MARGIN = 3;

// The eight symmetries of a square board: four rotations, each optionally mirrored.
const TRANSFORMS: Array<(row: number, column: number, last: number) => [number, number]> = [
  (r, c) => [r, c],
  (r, c, n) => [c, n - r],
  (r, c, n) => [n - r, n - c],
  (r, c, n) => [n - c, r],
  (r, c, n) => [r, n - c],
  (r, c, n) => [n - r, c],
  (r, c) => [c, r],
  (r, c, n) => [n - c, n - r],
];
// Index of the transform that undoes each one: the rotations by 90° swap, the rest undo themselves.
const INVERSE = [0, 3, 2, 1, 4, 5, 6, 7];

export function transformIndex(transform: number, index: number, size: number) {
  const [row, column] = TRANSFORMS[transform](Math.floor(index / size), index % size, size - 1);
  return row * size + column;
}

/**
 * A key shared by all eight symmetric versions of the position, plus the transform that maps
 * real cells to the canonical ones. The side to move is part of the key.
 */
export function positionKey(
  cells: ArrayLike<number>,
  size: number,
  winMode: TCaroWinMode,
  side: TStone
) {
  const area = size * size;
  let bestKey = '';
  let bestTransform = 0;
  const buffer = new Array<string>(area);
  for (let transform = 0; transform < TRANSFORMS.length; transform++) {
    for (let index = 0; index < area; index++) {
      buffer[transform == 0 ? index : transformIndex(transform, index, size)] = String(
        cells[index]
      );
    }
    const key = buffer.join('');
    if (transform == 0 || key < bestKey) {
      bestKey = key;
      bestTransform = transform;
    }
  }
  const prefix = `${size}${winMode == 'blockOpponent' ? 'b' : 'n'}${side}:`;
  return { key: prefix + bestKey, transform: bestTransform };
}

// The same eight symmetries around the origin, for shapes with no board of their own.
const SHAPE_TRANSFORMS: Array<(row: number, column: number) => [number, number]> = [
  (r, c) => [r, c],
  (r, c) => [c, -r],
  (r, c) => [-r, -c],
  (r, c) => [-c, r],
  (r, c) => [r, -c],
  (r, c) => [-r, c],
  (r, c) => [c, r],
  (r, c) => [-c, -r],
];

/**
 * A cell of a shape's frame as one number. Frame cells can lie outside the bounding box (a move
 * next to the stones) and be negative, so they are offset into a large grid.
 */
const SHAPE_OFFSET = 64;
const SHAPE_SPAN = 256;
const encode = (row: number, column: number) =>
  (row + SHAPE_OFFSET) * SHAPE_SPAN + (column + SHAPE_OFFSET);
const decode = (cell: number): [number, number] => [
  Math.floor(cell / SHAPE_SPAN) - SHAPE_OFFSET,
  (cell % SHAPE_SPAN) - SHAPE_OFFSET,
];

export type TExperienceFrame = {
  key: string;
  /** A real cell in the key's frame. */
  toCanonical: (index: number) => number;
  /** A frame cell on this board, or -1 when it falls off it. */
  toReal: (index: number) => number;
};

/** The lesson key of a position and the mapping between its real cells and the key's frame. */
export function experienceFrame(
  cells: ArrayLike<number>,
  size: number,
  winMode: TCaroWinMode,
  side: TStone
): TExperienceFrame {
  const stones: Array<[number, number, number]> = [];
  for (let index = 0; index < size * size; index++)
    if (cells[index] != 0) stones.push([Math.floor(index / size), index % size, cells[index]]);
  const last = size - 1 - SHAPE_MARGIN;
  const inside = (value: number) => value >= SHAPE_MARGIN && value <= last;
  if (stones.length == 0 || !stones.every(([row, column]) => inside(row) && inside(column))) {
    const { key, transform } = positionKey(cells, size, winMode, side);
    return {
      key,
      toCanonical: (index) => transformIndex(transform, index, size),
      toReal: (index) => transformIndex(INVERSE[transform], index, size),
    };
  }

  let best: { key: string; transform: number; top: number; left: number } | undefined;
  for (let transform = 0; transform < SHAPE_TRANSFORMS.length; transform++) {
    const moved = stones.map(([row, column, stone]) => [
      ...SHAPE_TRANSFORMS[transform](row, column),
      stone,
    ]);
    const top = Math.min(...moved.map((stone) => stone[0]));
    const left = Math.min(...moved.map((stone) => stone[1]));
    const key = moved
      .map(([row, column, stone]) => [row - top, column - left, stone])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
      .map((stone) => stone.join('.'))
      .join(' ');
    if (!best || key < best.key) best = { key, transform, top, left };
  }
  const { key, transform, top, left } = best!;
  // No board size in the prefix: the shape is the same on every board.
  const prefix = `s${winMode == 'blockOpponent' ? 'b' : 'n'}${side}:`;
  return {
    key: prefix + key,
    toCanonical: (index) => {
      const [row, column] = SHAPE_TRANSFORMS[transform](Math.floor(index / size), index % size);
      return encode(row - top, column - left);
    },
    toReal: (cell) => {
      const [frameRow, frameColumn] = decode(cell);
      const [row, column] = SHAPE_TRANSFORMS[INVERSE[transform]](
        frameRow + top,
        frameColumn + left
      );
      return row < 0 || column < 0 || row >= size || column >= size ? -1 : row * size + column;
    },
  };
}
