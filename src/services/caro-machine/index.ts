import { TCaroMachineLevel, TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';
import { MachineBoard, TStone } from './board';
import {
  learnFromCloseCalls,
  learnFromLoss,
  lookupExperience,
  TExperienceBook,
  TGameRecord,
  toStone,
} from './experience';
import { CELL_FLAG } from './pattern';
import { analyzePosition, searchBestMove, TSearchOptions } from './search';
import { findThreatWin } from './threat';
import { findTicTacToeMove } from './tic-tac-toe';
import { LEARN_TIME_BUDGET_MS } from 'src/services/caro-hell/learning';

export type TCaroMachineRequest = {
  steps: { [location: number]: TTurn };
  size: TCaroSizeBoard;
  winMode: TCaroWinMode;
  /** The player the machine moves for. */
  turn: TTurn;
  level: TCaroMachineLevel;
  /** Override the level's thinking time and depth; mainly for tests. */
  timeLimitMs?: number;
  maxDepth?: number;
  random?: () => number;
  /** What the machine learned from earlier losses; used by medium and hard. */
  book?: TExperienceBook;
};

const SEARCH_BY_LEVEL: Record<'medium' | 'hard', TSearchOptions> = {
  medium: { maxDepth: 4, timeLimitMs: 600, beamWidth: 10, useThreatSearch: false },
  hard: { maxDepth: 20, timeLimitMs: 1_800, beamWidth: 14, useThreatSearch: true },
};

// Post-game analysis: far deeper than a live move, and it runs in its own worker.
const LEARN_OPTIONS: TSearchOptions = {
  maxDepth: 24,
  timeLimitMs: 4_000,
  beamWidth: 18,
  useThreatSearch: true,
  vcfBudget: 200_000,
  vctBudget: 60_000,
  searchForced: true,
};
// Per position when looking for a missed forced win; a game has a few dozen of them.
const CLOSE_CALL_PROBE_MS = 400;

const EASY_TOP_MOVES = 4;
const EASY_DEFENSE_WEIGHT = 0.6;

// The first moves are picked among near-equal options so no two games follow the same script.
const OPENING_STONES = 3;
const OPENING_TOP_MOVES = 3;
const OPENING_MIN_RATIO = 0.85;

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

function findOpeningMove(board: MachineBoard, side: TStone, random: () => number) {
  const ranked = board
    .scoreCandidates(side)
    .map((candidate) => ({ index: candidate.index, score: candidate.attack + candidate.defense }))
    .sort((a, b) => b.score - a.score);
  const top = ranked[0].score;
  const options = ranked
    .slice(0, OPENING_TOP_MOVES)
    .filter((candidate) => candidate.score >= top * OPENING_MIN_RATIO);
  return options[Math.floor(random() * options.length)].index;
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
  // Hell normally runs the neural network (src/services/caro-hell); without a trained model it
  // falls back to the hard search.
  const search = SEARCH_BY_LEVEL[level == 'hell' ? 'hard' : level];
  const options = {
    ...search,
    timeLimitMs: timeLimitMs ?? search.timeLimitMs,
    maxDepth: request.maxDepth ?? search.maxDepth,
  };

  const learned = request.book && lookupExperience(request.book, board, side);
  if (learned) {
    if (learned.best != undefined && board.cells[learned.best] == 0) return learned.best;
    const result = analyzePosition(board, side, options, learned.avoid);
    // Every move here has already lost once; fall back to the plain search.
    if (result.move >= 0) return result.move;
    return searchBestMove(board, side, options);
  }

  if (board.stones.length > 0 && board.stones.length <= OPENING_STONES)
    return findOpeningMove(board, side, random);
  return searchBestMove(board, side, options);
}

// A proven forced win for `attacker`: continuous fours first, then fours and open threes.
function hasForcedWin(board: MachineBoard, attacker: TStone, deadline: number) {
  const probeDeadline = Math.min(deadline, performance.now() + CLOSE_CALL_PROBE_MS);
  const vcf = findThreatWin(board, attacker, {
    mode: 'vcf',
    depth: 16,
    budget: 100_000,
    deadline: probeDeadline,
  });
  if (vcf >= 0) return true;
  return (
    findThreatWin(board, attacker, {
      mode: 'vct',
      depth: 8,
      budget: 30_000,
      deadline: probeDeadline,
    }) >= 0
  );
}

/**
 * Re-examines a finished game and returns the book entries to add or replace.
 * - lost: finds the move that lost the game.
 * - otherwise: finds moves after which the opponent had a forced win but missed it.
 * Takes several seconds, so it should run off the main thread and off the move worker.
 */
export function learnFromGame(
  record: TGameRecord,
  book: TExperienceBook,
  didMachineLose: boolean,
  budgetMs = LEARN_TIME_BUDGET_MS
) {
  if (record.size == 3) return [];
  const deadline = performance.now() + budgetMs;
  const analyze = (board: MachineBoard, side: TStone, exclude: ReadonlySet<number>) =>
    analyzePosition(board, side, LEARN_OPTIONS, exclude);
  if (didMachineLose) return learnFromLoss(record, book, { deadline, analyze });
  return learnFromCloseCalls(record, book, {
    deadline,
    analyze,
    hasForcedWin: (board, attacker) => hasForcedWin(board, attacker, deadline),
  });
}
