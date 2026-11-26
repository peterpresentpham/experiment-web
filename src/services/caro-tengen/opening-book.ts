import { TCaroWinMode, TTurn } from 'src/types/caro.type';

/**
 * Opening book for the hell level, built offline by a long Rapfi search (classical evaluation)
 * (`scripts/caro-hell/opening-book.ts`).
 *
 * Positions are keyed independently of where they sit on the board and of the eight symmetries,
 * so one book serves every board size: a key lists the stones relative to their bounding box, as
 * "own" (side to move) and "other", in the transform that sorts first. That is only sound away
 * from the edges, so a position is looked up only when every stone keeps `BOOK_MARGIN` empty
 * lines to each edge. Only the blocked-ends rule has a book.
 *
 * An entry may list several moves the search found about equally good: one of them is picked at
 * random, so a player cannot win by replaying a line that beat the book before.
 */

/** Book entries: canonical key -> the moves to choose from, as [row, column] in the canonical frame. */
export type TOpeningBook = Map<string, Array<[number, number]>>;

export type TOpeningBookFile = {
  /** Version 1 has one move per entry, version 2 a list (best first). */
  version: 1 | 2;
  winMode: TCaroWinMode;
  /** How the book was built, for reference. */
  meta?: Record<string, number | string>;
  entries: Record<string, [number, number] | Array<[number, number]>>;
};

export type TBookStone = { row: number; column: number; own: boolean };

export const BOOK_MARGIN = 3;

// The eight symmetries of the plane: four rotations, each optionally mirrored.
const TRANSFORMS: Array<(row: number, column: number) => [number, number]> = [
  (r, c) => [r, c],
  (r, c) => [c, -r],
  (r, c) => [-r, -c],
  (r, c) => [-c, r],
  (r, c) => [r, -c],
  (r, c) => [-r, c],
  (r, c) => [c, r],
  (r, c) => [-c, -r],
];
// The transform that undoes each one: the two 90° rotations swap, the rest undo themselves.
const INVERSE = [0, 3, 2, 1, 4, 5, 6, 7];

/**
 * The canonical key of a position, and a function mapping a canonical [row, column] back to the
 * real board. The empty position has the key ''.
 */
export function openingKey(stones: ReadonlyArray<TBookStone>) {
  let best: { key: string; transform: number; top: number; left: number } | undefined;
  for (let transform = 0; transform < TRANSFORMS.length; transform++) {
    const moved = stones.map((stone) => {
      const [row, column] = TRANSFORMS[transform](stone.row, stone.column);
      return { row, column, own: stone.own };
    });
    const top = Math.min(...moved.map((stone) => stone.row));
    const left = Math.min(...moved.map((stone) => stone.column));
    const key = moved
      .map((stone) => [stone.row - top, stone.column - left, stone.own ? 1 : 2])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
      .map((stone) => stone.join('.'))
      .join(' ');
    if (!best || key < best.key) best = { key, transform, top, left };
  }
  const { key = '', transform = 0, top = 0, left = 0 } = best ?? {};
  const toReal = (row: number, column: number) =>
    TRANSFORMS[INVERSE[transform]](row + top, column + left);
  const toCanonical = (row: number, column: number): [number, number] => {
    const [r, c] = TRANSFORMS[transform](row, column);
    return [r - top, c - left];
  };
  return { key, toReal, toCanonical };
}

export function parseOpeningBook(file: TOpeningBookFile): TOpeningBook {
  return new Map(
    Object.entries(file.entries).map(([key, moves]) => [
      key,
      typeof moves[0] == 'number'
        ? [moves as [number, number]]
        : (moves as Array<[number, number]>),
    ])
  );
}

/**
 * The book move for this position as a board location, or undefined when the position is not in
 * the book or too close to an edge for it. The empty board opens in the centre.
 */
export function findBookMove(
  book: TOpeningBook,
  request: {
    steps: { [location: number]: TTurn };
    size: number;
    winMode: TCaroWinMode;
    turn: TTurn;
    /** Moves not to play, e.g. moves that lost here before. */
    avoid?: ReadonlySet<number>;
  },
  random: () => number = Math.random
) {
  const { steps, size, winMode, turn, avoid } = request;
  if (winMode != 'blockOpponent' || book.size == 0) return undefined;
  const stones: Array<TBookStone> = Object.entries(steps).map(([location, owner]) => ({
    row: Math.floor(Number(location) / size),
    column: Number(location) % size,
    own: owner == turn,
  }));
  if (stones.length == 0) return Math.floor(size / 2) * size + Math.floor(size / 2);
  const last = size - 1 - BOOK_MARGIN;
  const inside = (value: number) => value >= BOOK_MARGIN && value <= last;
  if (!stones.every((stone) => inside(stone.row) && inside(stone.column))) return undefined;

  const { key, toReal } = openingKey(stones);
  const choices: Array<number> = [];
  for (const move of book.get(key) ?? []) {
    const [row, column] = toReal(move[0], move[1]);
    if (row < 0 || column < 0 || row >= size || column >= size) continue;
    const location = row * size + column;
    if (steps[location] == undefined && !avoid?.has(location)) choices.push(location);
  }
  if (choices.length == 0) return undefined;
  return choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
}
