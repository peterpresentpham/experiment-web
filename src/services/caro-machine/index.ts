import { TCaroMachineLevel, TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';
import { MachineBoard, TStone } from './board';
import { CELL_FLAG } from './pattern';
import { searchBestMove, TSearchOptions } from './search';
import { findTicTacToeMove } from './tic-tac-toe';

export type TCaroMachineRequest = {
  steps: { [location: number]: TTurn };
  size: TCaroSizeBoard;
  winMode: TCaroWinMode;
  /** The player the machine moves for. */
  turn: TTurn;
  level: TCaroMachineLevel;
  /** Overrides the level's thinking time; mainly for tests. */
  timeLimitMs?: number;
  random?: () => number;
};

const SEARCH_BY_LEVEL: Record<Exclude<TCaroMachineLevel, 'easy'>, TSearchOptions> = {
  medium: { maxDepth: 4, timeLimitMs: 600, beamWidth: 10, useThreatSearch: false },
  hard: { maxDepth: 20, timeLimitMs: 1_800, beamWidth: 14, useThreatSearch: true },
};

const EASY_TOP_MOVES = 4;
const EASY_DEFENSE_WEIGHT = 0.6;

function toStone(turn: TTurn): TStone {
  return turn == 0 ? 1 : 2;
}

// Easy: always takes a win and blocks a five, otherwise picks loosely among good-looking moves,
// so it regularly misses open threes.
function findEasyMove(board: MachineBoard, side: TStone, random: () => number) {
  const candidates = board.scoreCandidates(side);
  const win = candidates.find((candidate) => candidate.attackFlags & CELL_FLAG.FIVE);
  if (win) return win.index;
  const block = candidates.find((candidate) => candidate.defenseFlags & CELL_FLAG.FIVE);
  if (block) return block.index;

  const ranked = candidates
    .map((candidate) => ({
      index: candidate.index,
      score: (candidate.attack + candidate.defense * EASY_DEFENSE_WEIGHT) * (0.5 + random()),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, EASY_TOP_MOVES);
  return ranked[Math.floor(random() * ranked.length)].index;
}

/**
 * Picks the machine's next move for the given position.
 * Returns -1 when the board has no empty cell left.
 */
export function findMachineMove(request: TCaroMachineRequest) {
  const { steps, size, winMode, turn, level, timeLimitMs, random = Math.random } = request;
  const side = toStone(turn);

  if (size == 3) {
    const cells = new Int8Array(9);
    for (const [location, owner] of Object.entries(steps)) cells[Number(location)] = toStone(owner);
    return findTicTacToeMove(cells, side, level, random);
  }

  const board = new MachineBoard(size, winMode);
  for (const [location, owner] of Object.entries(steps))
    board.place(Number(location), toStone(owner));
  if (board.stones.length >= board.area) return -1;

  if (level == 'easy') return findEasyMove(board, side, random);
  const options = SEARCH_BY_LEVEL[level];
  return searchBestMove(board, side, {
    ...options,
    timeLimitMs: timeLimitMs ?? options.timeLimitMs,
  });
}
