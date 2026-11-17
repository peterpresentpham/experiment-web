import { TCaroMachineLevel } from 'src/types/caro.type';

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Easy and medium look only two plies ahead (win or block), so forks still beat them.
const DEPTH_BY_LEVEL: Record<TCaroMachineLevel, number> = { easy: 2, medium: 2, hard: 9 };
const EASY_RANDOM_RATE = 0.35;

function isWinning(cells: Int8Array, stone: number) {
  return LINES.some((line) => line.every((cell) => cells[cell] == stone));
}

function negamax(cells: Int8Array, stone: number, depth: number, ply: number): number {
  if (depth == 0) return 0;
  let best = -Infinity;
  for (let cell = 0; cell < 9; cell++) {
    if (cells[cell] != 0) continue;
    cells[cell] = stone;
    const score = isWinning(cells, stone)
      ? 100 - ply
      : -negamax(cells, 3 - stone, depth - 1, ply + 1);
    cells[cell] = 0;
    best = Math.max(best, score);
  }
  return best == -Infinity ? 0 : best;
}

/** Exhaustive minimax for the 3x3 board; the hard level never loses. */
export function findTicTacToeMove(
  cells: Int8Array,
  stone: number,
  level: TCaroMachineLevel,
  random: () => number
) {
  const empty = Array.from(cells.keys()).filter((cell) => cells[cell] == 0);
  if (empty.length == 0) return -1;
  if (level == 'easy' && random() < EASY_RANDOM_RATE) {
    return empty[Math.floor(random() * empty.length)];
  }

  const depth = DEPTH_BY_LEVEL[level];
  let bestScore = -Infinity;
  let bestMoves: Array<number> = [];
  for (const cell of empty) {
    cells[cell] = stone;
    const score = isWinning(cells, stone) ? 100 : -negamax(cells, 3 - stone, depth - 1, 1);
    cells[cell] = 0;
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [cell];
    } else if (score == bestScore) bestMoves.push(cell);
  }
  return bestMoves[Math.floor(random() * bestMoves.length)];
}
