import { TCaroHellEngines } from 'src/types/caro.type';
import { caroDeviceInfo } from './report';
import { TCaroGameTiming, TCaroMoveTiming } from './validate';

/** A hell-level game left while a machine move took this long is reported unfinished. */
export const SLOW_MOVE_MS = 10_000;

/** What the hell level's timing report is built from, kept across renders and games. */
export type TTimingLog = {
  /** When the level was first picked, for the engines' load times. */
  loadSince: number | null;
  loaded: TCaroGameTiming['loaded'];
  /** Machine moves of this game, by move index. */
  moves: Map<number, TCaroMoveTiming>;
  /** When the unanswered machine move was asked for. */
  waitingSince: number | null;
  /** The position last reported unfinished, so leaving twice sends it once. */
  reported: string;
};

export function createTimingLog(): TTimingLog {
  return { loadSince: null, loaded: {}, moves: new Map(), waitingSince: null, reported: '' };
}

/** Notes when each engine first finished loading (or failed), from the worker's report. */
export function recordEngineLoads(log: TTimingLog, engines: TCaroHellEngines, now: number) {
  for (const name of ['tengen', 'rapfi'] as const) {
    const state = engines[name];
    if (state == 'loading' || log.loaded[name] !== undefined || log.loadSince == null) continue;
    log.loaded[name] = state == 'failed' ? -1 : Math.round(now - log.loadSince);
  }
}

/** How long the slowest move of this game made the player wait so far, the unanswered one too. */
export function slowestWaitMs(log: TTimingLog, now: number) {
  const waiting = log.waitingSince == null ? 0 : now - log.waitingSince;
  return Math.max(waiting, ...[...log.moves.values()].map((move) => move.ms));
}

export function timingOf(log: TTimingLog, waitingMs?: number): TCaroGameTiming {
  return {
    ...caroDeviceInfo(),
    loaded: { ...log.loaded },
    moves: [...log.moves.values()].sort((a, b) => a.at - b.at),
    ...(waitingMs !== undefined && { waitingMs: Math.round(waitingMs) }),
  };
}
