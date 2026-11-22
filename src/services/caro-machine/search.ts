import { MachineBoard, opponentOf, TCandidate, TStone } from './board';
import { CELL_FLAG } from './pattern';
import { findThreatWin, hasVcf } from './threat';

export type TSearchOptions = {
  maxDepth: number;
  timeLimitMs: number;
  /** How many of the best-ordered moves are searched at the root; deeper plies search fewer. */
  beamWidth: number;
  /** Enables VCF/VCT at the root and VCF probes at the leaves. */
  useThreatSearch: boolean;
  /** Node budgets for the root threat searches; larger when analysing a lost game. */
  vcfBudget?: number;
  vctBudget?: number;
  /** Searches forced replies too, so the result carries a real score instead of returning at once. */
  searchForced?: boolean;
};

export type TAnalysis = {
  /** -1 when no playable move is left. */
  move: number;
  /** Positive is good for the side to move; see `isLosingScore` and `isWinningScore`. */
  score: number;
};

const WIN_SCORE = 1_000_000_000;
const WIN_BOUND = WIN_SCORE - 1_000;

/** The side to move loses against best play, as far as the search could prove. */
export function isLosingScore(score: number) {
  return score <= -WIN_BOUND;
}

export function isWinningScore(score: number) {
  return score >= WIN_BOUND;
}
// Keeps one huge threat from drowning the rest of the static evaluation.
const EVAL_CELL_CAP = 50_000;
const MAX_FORCED_PLY = 40;
const MIN_BEAM_WIDTH = 5;

const TT_SIZE = 1 << 18;
const TT_MASK = TT_SIZE - 1;
const TT_EXACT = 1;
const TT_LOWER = 2;
const TT_UPPER = 3;

class SearchTimeout extends Error {}

type TSearchContext = {
  board: MachineBoard;
  options: TSearchOptions;
  deadline: number;
  nodes: number;
  ttCheck: Int32Array;
  ttScore: Int32Array;
  ttDepth: Int8Array;
  ttFlag: Int8Array;
  ttMove: Int16Array;
};

type TMovePlan =
  | { kind: 'win'; index: number; plies: number }
  | { kind: 'loss'; index: number }
  | { kind: 'moves'; moves: Array<TCandidate>; isForced: boolean };

function byPriority(a: TCandidate, b: TCandidate) {
  return b.attack + b.defense - (a.attack + a.defense);
}

/**
 * Applies the forcing rules of the game before any searching:
 * win now, block a five, finish with an unstoppable four, or answer an open three.
 */
function planMoves(
  board: MachineBoard,
  side: TStone,
  candidates: Array<TCandidate>,
  beamWidth: number
): TMovePlan {
  const opponentFives: Array<TCandidate> = [];
  let ownWinThreat: TCandidate | undefined;
  let opponentHasFour = false;
  let opponentHasWinThreat = false;

  for (const candidate of candidates) {
    if (candidate.attackFlags & CELL_FLAG.FIVE)
      return { kind: 'win', index: candidate.index, plies: 1 };
    if (candidate.defenseFlags & CELL_FLAG.FIVE) opponentFives.push(candidate);
    if (candidate.defenseFlags & CELL_FLAG.FOUR) opponentHasFour = true;
    if (candidate.defenseFlags & CELL_FLAG.WIN_THREAT) opponentHasWinThreat = true;
    if (candidate.attackFlags & CELL_FLAG.WIN_THREAT) {
      if (!ownWinThreat || candidate.attack > ownWinThreat.attack) ownWinThreat = candidate;
    }
  }

  if (opponentFives.length > 0) {
    const fives = opponentFives.map((candidate) => candidate.index);
    const defences = new Set(board.fiveDefences(side, fives));
    if (defences.size == 0) return { kind: 'loss', index: fives[0] };
    // Defences touch the opponent's run, so they are candidates (unless excluded at the root).
    const moves = candidates.filter((candidate) => defences.has(candidate.index));
    if (moves.length == 0) return { kind: 'loss', index: fives[0] };
    return { kind: 'moves', moves: moves.sort(byPriority), isForced: true };
  }
  // An open four only wins for sure when the opponent has no fours to interject.
  if (ownWinThreat && !opponentHasFour) return { kind: 'win', index: ownWinThreat.index, plies: 3 };

  let moves = candidates;
  if (opponentHasWinThreat) {
    // Under blockOpponent a stone a few cells out can also defend (see stopsWinThreats).
    const threats =
      board.winMode == 'blockOpponent'
        ? candidates
            .filter((candidate) => candidate.defenseFlags & CELL_FLAG.WIN_THREAT)
            .map((candidate) => candidate.index)
        : [];
    moves = candidates.filter(
      (candidate) =>
        candidate.defenseFlags & (CELL_FLAG.WIN_THREAT | CELL_FLAG.FOUR) ||
        candidate.attackFlags & CELL_FLAG.FOUR ||
        (threats.length > 0 && board.stopsWinThreats(candidate.index, side, threats))
    );
  }
  moves = [...moves].sort(byPriority).slice(0, beamWidth);
  return { kind: 'moves', moves, isForced: false };
}

function evaluate(candidates: Array<TCandidate>) {
  let score = 0;
  for (const candidate of candidates) {
    score += Math.min(candidate.attack, EVAL_CELL_CAP) - Math.min(candidate.defense, EVAL_CELL_CAP);
  }
  return score;
}

// Win scores are stored relative to the node so they stay valid when reached at another ply.
function toTableScore(score: number, ply: number) {
  if (score >= WIN_BOUND) return score + ply;
  if (score <= -WIN_BOUND) return score - ply;
  return score;
}

function fromTableScore(score: number, ply: number) {
  if (score >= WIN_BOUND) return score - ply;
  if (score <= -WIN_BOUND) return score + ply;
  return score;
}

function beamAt(context: TSearchContext, ply: number) {
  return Math.max(MIN_BEAM_WIDTH, context.options.beamWidth - ply * 2);
}

function storeTable(
  context: TSearchContext,
  depth: number,
  ply: number,
  score: number,
  flag: number,
  move: number
) {
  const slot = context.board.hash & TT_MASK;
  context.ttCheck[slot] = context.board.hashCheck;
  context.ttScore[slot] = toTableScore(score, ply);
  context.ttDepth[slot] = depth;
  context.ttFlag[slot] = flag;
  context.ttMove[slot] = move;
}

function negamax(
  context: TSearchContext,
  side: TStone,
  depth: number,
  alphaStart: number,
  beta: number,
  ply: number
): number {
  context.nodes++;
  if ((context.nodes & 255) == 0 && performance.now() > context.deadline) {
    throw new SearchTimeout();
  }

  const { board, options } = context;
  const candidates = board.scoreCandidates(side);
  if (candidates.length == 0) return 0;

  const plan = planMoves(board, side, candidates, beamAt(context, ply));
  if (plan.kind == 'win') return WIN_SCORE - ply - plan.plies;
  if (plan.kind == 'loss') return -(WIN_SCORE - ply - 2);

  const isExtended = plan.isForced && ply < MAX_FORCED_PLY;
  if (depth <= 0 && !isExtended) {
    const canProbe =
      options.useThreatSearch &&
      candidates.some((candidate) => candidate.attackFlags & CELL_FLAG.FOUR);
    if (canProbe && hasVcf(board, side, 6, 40)) return WIN_SCORE - ply - 5;
    return evaluate(candidates);
  }

  let alpha = alphaStart;
  let betaBound = beta;
  let tableMove = -1;
  const slot = board.hash & TT_MASK;
  if (context.ttFlag[slot] != 0 && context.ttCheck[slot] == board.hashCheck) {
    tableMove = context.ttMove[slot];
    if (context.ttDepth[slot] >= depth) {
      const score = fromTableScore(context.ttScore[slot], ply);
      const flag = context.ttFlag[slot];
      if (flag == TT_EXACT) return score;
      if (flag == TT_LOWER) alpha = Math.max(alpha, score);
      else if (flag == TT_UPPER) betaBound = Math.min(betaBound, score);
      if (alpha >= betaBound) return score;
    }
  }

  const moves = plan.moves;
  const tableIndex = moves.findIndex((move) => move.index == tableMove);
  if (tableIndex > 0) moves.unshift(...moves.splice(tableIndex, 1));

  const opponent = opponentOf(side);
  const nextDepth = isExtended ? depth : depth - 1;
  let best = -Infinity;
  let bestMove = moves[0].index;
  for (const move of moves) {
    board.place(move.index, side);
    // A timeout leaves the board dirty on purpose: the whole search is discarded in that case.
    const score = -negamax(context, opponent, nextDepth, -betaBound, -alpha, ply + 1);
    board.undo();
    if (score > best) {
      best = score;
      bestMove = move.index;
    }
    if (best > alpha) alpha = best;
    if (alpha >= betaBound) break;
  }

  const flag = best <= alphaStart ? TT_UPPER : best >= betaBound ? TT_LOWER : TT_EXACT;
  storeTable(context, depth, ply, best, flag, bestMove);
  return best;
}

function searchRoot(
  context: TSearchContext,
  side: TStone,
  depth: number,
  moves: Array<TCandidate>
) {
  const { board } = context;
  const opponent = opponentOf(side);
  let alpha = -Infinity;
  let bestMove = moves[0].index;
  for (const move of moves) {
    board.place(move.index, side);
    const score = -negamax(context, opponent, depth - 1, -Infinity, -alpha, 1);
    board.undo();
    if (score > alpha) {
      alpha = score;
      bestMove = move.index;
    }
  }
  return { move: bestMove, score: alpha };
}

/**
 * Analyses the position for `side` with iterative-deepening alpha-beta, backed by threat search.
 * Moves in `exclude` are never chosen: they are moves the machine has already lost with here.
 */
export function analyzePosition(
  board: MachineBoard,
  side: TStone,
  options: TSearchOptions,
  exclude?: ReadonlySet<number>
): TAnalysis {
  const startedAt = performance.now();
  const deadline = startedAt + options.timeLimitMs;
  const isAllowed = (index: number) => !exclude?.has(index);
  const candidates = board.scoreCandidates(side).filter((candidate) => isAllowed(candidate.index));
  if (candidates.length == 0) return { move: -1, score: -WIN_SCORE };

  const plan = planMoves(board, side, candidates, options.beamWidth + 6);
  if (plan.kind == 'win') return { move: plan.index, score: WIN_SCORE - plan.plies };
  if (plan.kind == 'loss') return { move: plan.index, score: -(WIN_SCORE - 2) };
  if (plan.isForced && !options.searchForced) return { move: plan.moves[0].index, score: 0 };

  if (options.useThreatSearch) {
    // A failed VCT costs the full budget, so it is kept small to leave time for alpha-beta.
    const vcf = findThreatWin(board, side, {
      mode: 'vcf',
      depth: 12,
      budget: options.vcfBudget ?? 20_000,
      deadline: startedAt + options.timeLimitMs * 0.1,
    });
    if (vcf >= 0 && isAllowed(vcf)) return { move: vcf, score: WIN_SCORE - 20 };
    const vct = findThreatWin(board, side, {
      mode: 'vct',
      depth: 6,
      budget: options.vctBudget ?? 6_000,
      deadline: startedAt + options.timeLimitMs * 0.25,
    });
    if (vct >= 0 && isAllowed(vct)) return { move: vct, score: WIN_SCORE - 40 };
  }

  const context: TSearchContext = {
    board,
    options,
    deadline,
    nodes: 0,
    ttCheck: new Int32Array(TT_SIZE),
    ttScore: new Int32Array(TT_SIZE),
    ttDepth: new Int8Array(TT_SIZE),
    ttFlag: new Int8Array(TT_SIZE),
    ttMove: new Int16Array(TT_SIZE),
  };

  const heuristicMove = plan.moves[0].index;
  const rootMoves = [...plan.moves];
  let bestMove = heuristicMove;
  let bestScore = 0;
  for (let depth = 1; depth <= options.maxDepth; depth++) {
    try {
      const result = searchRoot(context, side, depth, rootMoves);
      bestMove = result.move;
      bestScore = result.score;
    } catch (error) {
      if (error instanceof SearchTimeout) break;
      throw error;
    }
    const bestIndex = rootMoves.findIndex((move) => move.index == bestMove);
    rootMoves.unshift(...rootMoves.splice(bestIndex, 1));
    if (Math.abs(bestScore) >= WIN_BOUND || performance.now() > deadline) break;
  }

  // When every move loses against perfect play, the most natural-looking defence is preferred.
  if (bestScore <= -WIN_BOUND) return { move: heuristicMove, score: bestScore };
  return { move: bestMove, score: bestScore };
}

/** Picks a move for `side`; -1 when the board is full. */
export function searchBestMove(board: MachineBoard, side: TStone, options: TSearchOptions) {
  return analyzePosition(board, side, options).move;
}
