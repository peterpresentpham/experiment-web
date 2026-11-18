import { TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';
import { MachineBoard, opponentOf } from '../caro-machine/board';
import { lookupExperience, TExperienceBook, toStone } from '../caro-machine/experience';
import { CELL_FLAG } from '../caro-machine/pattern';
import { analyzePosition } from '../caro-machine/search';
import { findThreatWin } from '../caro-machine/threat';
import { runMcts, THellEvaluator } from './mcts';

export type THellRequest = {
  steps: { [location: number]: TTurn };
  size: TCaroSizeBoard;
  winMode: TCaroWinMode;
  turn: TTurn;
  timeLimitMs?: number;
  book?: TExperienceBook;
};

export type THellSearchConfig = { batchSize: number; maxSimulations: number };

const HELL_TIME_LIMIT_MS = 2_500;
// Hard-level search used when the network's choices all fail the safety check.
const FALLBACK_SEARCH = { maxDepth: 20, timeLimitMs: 1_000, beamWidth: 14, useThreatSearch: true };

/**
 * Picks the hell-level move: learned lessons first, then the forcing tactics the classic engine
 * proves exactly, then the network-guided tree search. The search's favourite is only played
 * if it does not hand the opponent a continuous-four win.
 */
export function findHellMove(
  request: THellRequest,
  evaluate: THellEvaluator,
  config: THellSearchConfig
) {
  const { steps, size, winMode, turn, book } = request;
  const startedAt = performance.now();
  const timeLimit = request.timeLimitMs ?? HELL_TIME_LIMIT_MS;
  const side = toStone(turn);
  const opponent = opponentOf(side);

  const board = new MachineBoard(size, winMode);
  for (const [location, owner] of Object.entries(steps))
    board.place(Number(location), toStone(owner));
  if (board.stones.length >= board.area) return -1;

  const learned = book && lookupExperience(book, board, side);
  if (learned?.best != undefined && board.cells[learned.best] == 0) return learned.best;

  const candidates = board.scoreCandidates(side);
  const win = candidates.find((candidate) => candidate.attackFlags & CELL_FLAG.FIVE);
  if (win) return win.index;
  const blocks = candidates.filter((candidate) => candidate.defenseFlags & CELL_FLAG.FIVE);
  if (blocks.length > 0) return blocks[0].index;
  const vcf = findThreatWin(board, side, {
    mode: 'vcf',
    depth: 14,
    budget: 40_000,
    deadline: startedAt + timeLimit * 0.15,
  });
  if (vcf >= 0 && !learned?.avoid.has(vcf)) return vcf;

  const result = runMcts(board, side, evaluate, {
    maxSimulations: config.maxSimulations,
    batchSize: config.batchSize,
    deadline: startedAt + timeLimit * 0.85,
    exclude: learned?.avoid,
  });

  // Safety net: the most visited move that leaves the opponent without a forced four sequence.
  const safetyDeadline = startedAt + timeLimit;
  for (const { move } of result.moves.slice(0, 5)) {
    board.place(move, side);
    const isUnsafe =
      findThreatWin(board, opponent, {
        mode: 'vcf',
        depth: 12,
        budget: 20_000,
        deadline: safetyDeadline,
      }) >= 0;
    board.undo();
    if (!isUnsafe) return move;
  }

  return analyzePosition(board, side, FALLBACK_SEARCH, learned?.avoid).move;
}
