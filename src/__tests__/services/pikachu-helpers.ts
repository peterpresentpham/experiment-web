import { TPosition, TVector } from 'src/types/global';

export type TBoard = Array<Array<number>>;

/** Deterministic PRNG so failures can be reproduced from the seed. */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Wraps a raw grid with the empty border row/column the game always keeps around the board. */
export function withBorder(raw: TBoard): TBoard {
  const columns = raw[0].length;
  return [
    Array(columns + 2).fill(0),
    ...raw.map((row) => [0, ...row, 0]),
    Array(columns + 2).fill(0),
  ];
}

export function randomBoard(
  random: () => number,
  rows: number,
  columns: number,
  options: { types: number; emptyRate: number }
): TBoard {
  const raw = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () =>
      random() < options.emptyRate ? 0 : 1 + Math.floor(random() * options.types)
    )
  );
  return withBorder(raw);
}

export function cloneBoard(board: TBoard): TBoard {
  return board.map((row) => row.slice());
}

export function filledCells(board: TBoard, rows: number, columns: number): Array<TPosition> {
  const cells: Array<TPosition> = [];
  for (let r = 1; r <= rows; r++)
    for (let c = 1; c <= columns; c++) if (board[r][c] > 0) cells.push([r, c]);
  return cells;
}

const DIRECTIONS: Array<TVector> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * Reference solver: minimum number of turns of a path from `source` to `target` through empty
 * cells (including the border), or Infinity. Plain 0-1 BFS over (cell, direction) states.
 */
export function minTurns(board: TBoard, source: TPosition, target: TPosition) {
  const height = board.length;
  const width = board[0].length;
  const best = new Map<string, number>();
  const deque: Array<[number, number, number, number]> = [];
  for (let d = 0; d < 4; d++) deque.push([source[0], source[1], d, 0]);

  while (deque.length > 0) {
    const [r, c, d, turns] = deque.shift()!;
    const nr = r + DIRECTIONS[d][0];
    const nc = c + DIRECTIONS[d][1];
    if (nr < 0 || nc < 0 || nr >= height || nc >= width) continue;
    if (nr == target[0] && nc == target[1]) return turns;
    if (board[nr][nc] != 0) continue;
    for (let nd = 0; nd < 4; nd++) {
      const nextTurns = turns + (nd == d ? 0 : 1);
      const key = `${nr}_${nc}_${nd}`;
      if ((best.get(key) ?? Infinity) <= nextTurns) continue;
      best.set(key, nextTurns);
      if (nd == d) deque.unshift([nr, nc, nd, nextTurns]);
      else deque.push([nr, nc, nd, nextTurns]);
    }
  }
  return Infinity;
}

/**
 * Checks that `path` is a real connection: it starts and ends on the given pieces, every segment
 * is straight and runs over empty cells only, and it turns at most `maxTurns` times.
 */
export function assertValidPath(
  board: TBoard,
  path: Array<TPosition>,
  maxTurns: number,
  ends?: [TPosition, TPosition]
) {
  const first = path[0];
  const last = path[path.length - 1];
  if (ends) {
    if (first[0] != ends[0][0] || first[1] != ends[0][1]) throw new Error('wrong start');
    if (last[0] != ends[1][0] || last[1] != ends[1][1]) throw new Error('wrong end');
  }
  if (board[first[0]][first[1]] == 0 || board[first[0]][first[1]] != board[last[0]][last[1]])
    throw new Error('ends are not a matching pair');
  if (first[0] == last[0] && first[1] == last[1]) throw new Error('path connects a cell to itself');

  let turns = 0;
  let previousDirection: string | undefined;
  for (let i = 1; i < path.length; i++) {
    const [r0, c0] = path[i - 1];
    const [r1, c1] = path[i];
    if (r0 != r1 && c0 != c1) throw new Error('segment is not straight');
    if (r0 == r1 && c0 == c1) continue;
    const dr = Math.sign(r1 - r0);
    const dc = Math.sign(c1 - c0);
    const direction = `${dr}_${dc}`;
    if (previousDirection != undefined && previousDirection != direction) turns++;
    previousDirection = direction;
    for (let r = r0 + dr, c = c0 + dc; r != r1 || c != c1; r += dr, c += dc) {
      if (board[r][c] != 0) throw new Error(`segment crosses a piece at ${r},${c}`);
    }
  }
  if (turns > maxTurns) throw new Error(`path turns ${turns} times`);
}

/** Every line of a space, as cell lists ordered along `vector` from the first cell in the space. */
export function linesOfSpace(space: [TPosition, TPosition], vector: TVector) {
  const isInside = ([r, c]: TPosition) =>
    r >= space[0][0] && r <= space[1][0] && c >= space[0][1] && c <= space[1][1];
  const lines: Array<Array<TPosition>> = [];
  for (let r = space[0][0]; r <= space[1][0]; r++) {
    for (let c = space[0][1]; c <= space[1][1]; c++) {
      if (isInside([r - vector[0], c - vector[1]])) continue;
      const line: Array<TPosition> = [];
      for (
        let cell: TPosition = [r, c];
        isInside(cell);
        cell = [cell[0] + vector[0], cell[1] + vector[1]]
      )
        line.push(cell);
      lines.push(line);
    }
  }
  return lines;
}

/** Moves the non-empty values of `values[from..]` to the front of that range, keeping order. */
export function compactFrom(values: Array<number>, from: number) {
  const kept = values.slice(from).filter((value) => value > 0);
  return [...values.slice(0, from), ...kept, ...Array(values.length - from - kept.length).fill(0)];
}
