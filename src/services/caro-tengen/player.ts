import type { TCaroMoveSource } from 'src/services/caro-game-report/validate';
import { TCaroHellEngines, TCaroWinMode } from 'src/types/caro.type';
import { findMachineMove, TCaroMachineRequest } from '../caro-machine';
import { MachineBoard } from '../caro-machine/board';
import { lookupExperience, TExperienceBook, toStone } from '../caro-machine/experience';
import { logCaroEvent } from 'src/services/caro-dev-log';
import {
  getRapfi,
  preloadRapfiCaroNetwork,
  rapfiLoadState,
  readyRapfi,
  takeRapfiTrace,
} from 'src/services/caro-rapfi/browser';
import { getOpeningBook, getTengen, readyTengen, tengenLoadState } from './browser';
import { TTengenTiming } from './engine';
import { findBookMove } from './opening-book';

/** Tengen's time for a move Rapfi gave up on, after the player already waited for Rapfi. */
const HURRIED_TIMING: TTengenTiming = { optimumMs: 800, hardMs: 1_200 };

/**
 * The hell level's first choice: lessons from earlier losses, then the opening book, then the
 * engine, which searches around the moves that lost here before: Rapfi (stronger in both rules),
 * or Tengen when Rapfi cannot run or is still downloading (a small engine, ready in a moment, so
 * the first moves never wait for Rapfi's files), and the hard search when Tengen has no answer
 * (every move it could play lost before, or it failed). Returns null only when no engine runs
 * here, so the caller falls back to the network. A location of -1 means the board is full.
 */
export async function findTengenMove(
  request: Omit<TCaroMachineRequest, 'level'>,
  book: TExperienceBook
): Promise<{ location: number; source: TCaroMoveSource } | null> {
  const { steps, size, winMode, turn } = request;
  const started = performance.now();
  const board = new MachineBoard(size, winMode);
  for (const [location, owner] of Object.entries(steps))
    board.place(Number(location), toStone(owner));
  if (board.stones.length >= board.area) return { location: -1, source: 'tengen' };

  const learned = lookupExperience(book, board, toStone(turn));
  // Development log: which part chose the move.
  const log = (source: string, location: number | null, extra: Record<string, unknown> = {}) =>
    logCaroEvent({
      type: 'move',
      source,
      location,
      ms: Math.round(performance.now() - started),
      size,
      winMode,
      turn,
      stones: Object.keys(steps).length,
      steps,
      avoid: learned?.avoid ? [...learned.avoid] : [],
      ...extra,
    });
  if (learned?.best != undefined && board.cells[learned.best] == 0) {
    log('lesson', learned.best);
    return { location: learned.best, source: 'lesson' };
  }

  // A book move that lost here before is skipped, like any other.
  const bookMove = findBookMove(await getOpeningBook(), { ...request, avoid: learned?.avoid });
  if (bookMove != undefined) {
    log('book', bookMove);
    return { location: bookMove, source: 'book' };
  }

  const rapfi = readyRapfi();
  if (rapfi === undefined) log('rapfi-loading', null);
  // Set when Rapfi took this move's time and failed: the player has waited already.
  let isHurried = false;
  if (rapfi && !rapfi.isBroken()) {
    try {
      const move = await rapfi.think({ steps, size, winMode, turn, exclude: learned?.avoid });
      if (board.cells[move] == 0 && !learned?.avoid.has(move)) {
        log('rapfi', move, { rapfi: takeRapfiTrace() });
        return { location: move, source: 'rapfi' };
      }
      log('rapfi-rejected', move, { rapfi: takeRapfiTrace() });
    } catch (error) {
      console.error('[caro] Rapfi failed on this position', error);
      log('rapfi-error', null, { error: String(error), rapfi: takeRapfiTrace() });
      isHurried = true;
    }
  }

  const engine = await getTengen();
  if (!engine) {
    log('no-engine', null);
    return null;
  }
  // A running engine that has no answer here: the hard search answers at once, where the network
  // would first have to download TensorFlow.js and its weights.
  const search = () => {
    const location = findMachineMove({ ...request, level: 'hard', book });
    log('search', location);
    return { location, source: 'search' as const };
  };
  let move: number;
  try {
    move = engine.think(
      { steps, size, winMode, turn, exclude: learned?.avoid },
      isHurried ? HURRIED_TIMING : undefined
    );
  } catch (error) {
    console.error('[caro] Tengen failed on this position', error);
    log('tengen-error', null, { error: String(error) });
    return search();
  }
  if (move < 0 || board.cells[move] != 0 || learned?.avoid.has(move)) {
    log('tengen-rejected', move);
    return search();
  }
  log('tengen', move);
  return { location: move, source: 'tengen' };
}

let remeasured = false;

/**
 * Measures Tengen's speed again, once, after its first move: called once that move is sent, while
 * the player thinks. Its first measurement ran while the page was still starting.
 */
export function remeasureTengenOnce() {
  const engine = readyTengen();
  if (remeasured || !engine) return;
  remeasured = true;
  engine.remeasure();
}

/**
 * The engines' state now, which changes after the warm-up too: a failed download that a later
 * move retried, Rapfi giving up on a move and then answering late.
 */
export function engineLoads(): TCaroHellEngines {
  return { rapfi: rapfiLoadState(), tengen: tengenLoadState() };
}

/**
 * Starts loading the engine (and, for the blocked-ends rule, its opening book and Rapfi's
 * network) before the first move.
 */
export async function warmUpTengen(
  winMode: TCaroWinMode,
  /** Called with the engines' state at the start and whenever one of them finishes loading. */
  onEngines: (engines: TCaroHellEngines) => void = () => {}
) {
  if (winMode == 'blockOpponent') {
    void getOpeningBook();
    preloadRapfiCaroNetwork().catch(() => {});
  }
  const engines: TCaroHellEngines = { rapfi: 'loading', tengen: 'loading' };
  onEngines({ ...engines });
  const settle = (name: keyof TCaroHellEngines) => (engine: object | null) => {
    engines[name] = engine ? 'ready' : 'failed';
    onEngines({ ...engines });
    return engine != null;
  };
  const [rapfi, tengen] = await Promise.all([
    // A Rapfi that already stopped answering (a warm-up for another rule) counts as failed.
    getRapfi().then((rapfi) => settle('rapfi')(rapfi?.isBroken() ? null : rapfi)),
    getTengen().then(settle('tengen')),
  ]);
  return rapfi || tengen;
}
