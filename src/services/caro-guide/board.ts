import { checkWin } from 'src/services/caro.utils';
import type { TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';

/**
 * Positions for the caro guide. Cells are named like a chessboard, a column letter then a row
 * number counted from the top (`h8` is the middle of a 15x15 board), so the text can point at
 * them and the diagrams print the same labels on their edges.
 */

export type TGuideStone = 'x' | 'o';

/** A lesson example: stones already on the board, then moves played in turn. */
export type TCaroGuideExample = {
  size: TCaroSizeBoard;
  winMode: TCaroWinMode;
  x: Array<string>;
  o: Array<string>;
  moves: Array<string>;
  /** Who plays `moves[0]`; the sides then alternate. */
  first: TGuideStone;
  /** Cells to ring in every frame: the points the text talks about. */
  marks?: Array<string>;
};

export type TGuideFrame = {
  stones: Map<number, TGuideStone>;
  /** Move numbers (1-based) of the stones played so far, by cell. */
  numbers: Map<number, number>;
  last: number | null;
  /** Cells of a winning line made by the last move. */
  win: Array<number>;
};

const COLUMNS = 'abcdefghijklmnopqrst';

export function columnName(column: number) {
  return COLUMNS[column];
}

export function cellName(index: number, size: number) {
  return `${COLUMNS[index % size]}${Math.floor(index / size) + 1}`;
}

export function parseCell(name: string, size: number) {
  const column = COLUMNS.indexOf(name[0]);
  const row = Number(name.slice(1)) - 1;
  if (column < 0 || column >= size || !(row >= 0 && row < size))
    throw new Error(`caro guide: no cell ${name} on a ${size}x${size} board`);
  return row * size + column;
}

const turnOf = (stone: TGuideStone): TTurn => (stone == 'x' ? 0 : 1);

/** Steps in the shape the game's win check reads: cell → side (X is 0, O is 1). */
export function toSteps(stones: Map<number, TGuideStone>) {
  const steps: { [location: number]: TTurn } = {};
  for (const [cell, stone] of stones) steps[cell] = turnOf(stone);
  return steps;
}

/** Whether the stone on `cell` makes a winning line, by the game's own rule check. */
export function winningLine(
  stones: Map<number, TGuideStone>,
  cell: number,
  size: TCaroSizeBoard,
  winMode: TCaroWinMode
) {
  const stone = stones.get(cell);
  if (!stone) return [];
  const result = checkWin(
    { steps: toSteps(stones), currentStep: cell, currentPlayer: turnOf(stone), size },
    winMode
  );
  return result.winMode.length > 0 ? Object.keys(result.locations).map(Number) : [];
}

/** Empty cells where `stone` would complete a winning line: one is a four, two an open four. */
export function fiveSpots(
  stones: Map<number, TGuideStone>,
  stone: TGuideStone,
  size: TCaroSizeBoard,
  winMode: TCaroWinMode
) {
  const spots: Array<number> = [];
  for (let cell = 0; cell < size * size; cell++) {
    if (stones.has(cell)) continue;
    const next = new Map(stones).set(cell, stone);
    if (winningLine(next, cell, size, winMode).length > 0) spots.push(cell);
  }
  return spots;
}

/** The starting stones of an example. */
export function setupStones(example: TCaroGuideExample) {
  const stones = new Map<number, TGuideStone>();
  for (const name of example.x) stones.set(parseCell(name, example.size), 'x');
  for (const name of example.o) stones.set(parseCell(name, example.size), 'o');
  return stones;
}

/** Who plays move `index` (0-based) of an example. */
export function moverOf(example: TCaroGuideExample, index: number): TGuideStone {
  const other: TGuideStone = example.first == 'x' ? 'o' : 'x';
  return index % 2 == 0 ? example.first : other;
}

/** Every position of an example: the setup, then one frame after each move. */
export function buildFrames(example: TCaroGuideExample): Array<TGuideFrame> {
  let stones = setupStones(example);
  let numbers = new Map<number, number>();
  const frames: Array<TGuideFrame> = [{ stones, numbers, last: null, win: [] }];
  example.moves.forEach((name, index) => {
    const cell = parseCell(name, example.size);
    if (stones.has(cell)) throw new Error(`caro guide: ${name} is already taken`);
    stones = new Map(stones).set(cell, moverOf(example, index));
    numbers = new Map(numbers).set(cell, index + 1);
    const win = winningLine(stones, cell, example.size, example.winMode);
    frames.push({ stones, numbers, last: cell, win });
  });
  return frames;
}

/**
 * The part of the board a diagram shows: every stone and mark plus a margin, at least `minimum`
 * cells wide, kept square and inside the board.
 */
export function viewWindow(example: TCaroGuideExample, margin = 2, minimum = 9) {
  const { size } = example;
  const cells = [...example.x, ...example.o, ...example.moves, ...(example.marks ?? [])].map(
    (name) => parseCell(name, size)
  );
  const rows = cells.map((cell) => Math.floor(cell / size));
  const columns = cells.map((cell) => cell % size);
  const span = (values: Array<number>) => [Math.min(...values), Math.max(...values)];
  const [top, bottom] = span(rows);
  const [left, right] = span(columns);
  const side = Math.min(
    size,
    Math.max(minimum, bottom - top + 1 + margin * 2, right - left + 1 + margin * 2)
  );
  const start = (low: number, high: number) => {
    const centred = Math.round((low + high) / 2 - (side - 1) / 2);
    return Math.max(0, Math.min(size - side, centred));
  };
  return { row: start(top, bottom), column: start(left, right), side };
}
