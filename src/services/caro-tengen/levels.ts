import { findMachineMove, TCaroMachineRequest } from 'src/services/caro-machine';
import { MachineBoard } from 'src/services/caro-machine/board';
import { lookupExperience, TExperienceBook, toStone } from 'src/services/caro-machine/experience';
import type { TCaroMachineLevel } from 'src/types/caro.type';
import { getOpeningBook, getTengen } from './browser';
import { TTengenLimits, TTengenTiming } from './engine';
import { findBookMove } from './opening-book';

/**
 * The levels below hell on boards larger than 3x3: Tengen with a depth cap, so a level plays the
 * same on every device that reaches its depth in time, and more variety the lower the level.
 * Hell plays Rapfi (player.ts); 3x3 keeps its own minimax.
 *
 * Rough calibration on 15x15 with the blocked-ends rule, 20 games each against the search levels
 * this replaced: depth 1 with wide variety beat the old easy 20-0, depth 4 the old hard 17-3 and
 * depth 6 the old hard 20-0; the hell level won both games of a short test against depth 8 with
 * the book. So every level is stronger than before, and hard sits closer to hell.
 */

export type TTengenLevel = Exclude<TCaroMachineLevel, 'hell'>;

type TLevelSettings = {
  limits: TTengenLimits;
  /** Caps the time on a device too slow to reach the depth. */
  timing: TTengenTiming;
  /** The opening book answers while fewer stones than this are on the board. */
  bookStones: number;
  /** Plays the lessons from games the machine lost; lower levels must not grow stronger. */
  useLessons: boolean;
};

export const TENGEN_LEVELS: Record<TTengenLevel, TLevelSettings> = {
  easy: {
    limits: { depth: 1, variety: 200, varietyPlies: 400 },
    timing: { optimumMs: 400, hardMs: 800 },
    bookStones: 0,
    useLessons: false,
  },
  medium: {
    limits: { depth: 3, variety: 60, varietyPlies: 400 },
    timing: { optimumMs: 700, hardMs: 1_400 },
    bookStones: 2,
    useLessons: false,
  },
  hard: {
    limits: { depth: 8, variety: 20, varietyPlies: 20 },
    timing: { optimumMs: 1_500, hardMs: 3_000 },
    bookStones: Infinity,
    useLessons: true,
  },
};

/** Starts the engine's and the book's downloads as soon as a level that plays them is picked. */
export function preloadLevels() {
  void getTengen();
  void getOpeningBook();
}

export type TLevelMove = { location: number; source: 'lesson' | 'book' | 'tengen' | 'search' };

/**
 * The move of `level`: a lesson (hard only), the opening book while the level uses it, then
 * Tengen. Where Tengen cannot run or has no answer, the level's own search plays.
 */
export async function findLevelMove(
  request: Omit<TCaroMachineRequest, 'level' | 'book'> & { level: TTengenLevel },
  book: TExperienceBook,
  random: () => number = Math.random
): Promise<TLevelMove> {
  const settings = TENGEN_LEVELS[request.level];
  const { steps, size, winMode, turn } = request;
  const lessons = settings.useLessons ? book : undefined;
  const search = (): TLevelMove => ({
    location: findMachineMove({ ...request, book: lessons }),
    source: 'search',
  });

  const board = new MachineBoard(size, winMode);
  for (const [location, owner] of Object.entries(steps))
    board.place(Number(location), toStone(owner));
  if (board.stones.length >= board.area) return { location: -1, source: 'search' };

  const learned = lessons && lookupExperience(lessons, board, toStone(turn));
  if (learned?.best != undefined && board.cells[learned.best] == 0)
    return { location: learned.best, source: 'lesson' };

  if (board.stones.length < settings.bookStones) {
    const bookMove = findBookMove(
      await getOpeningBook(),
      { steps, size, winMode, turn, avoid: learned?.avoid },
      random
    );
    if (bookMove != undefined) return { location: bookMove, source: 'book' };
  }

  const engine = await getTengen();
  if (!engine) return search();
  let move: number;
  try {
    move = engine.think(
      { steps, size, winMode, turn, exclude: learned?.avoid },
      settings.timing,
      settings.limits
    );
  } catch (error) {
    console.error('[caro] Tengen failed on this position', error);
    return search();
  }
  if (move < 0 || board.cells[move] != 0 || learned?.avoid.has(move)) return search();
  return { location: move, source: 'tengen' };
}
