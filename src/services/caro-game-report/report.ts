import { TGameRecord } from 'src/services/caro-machine/experience';
import { tengenThreads } from 'src/services/caro-tengen/engine';
import { TTurn } from 'src/types/caro.type';
import { TCaroDevice, TCaroGameReport, TCaroGameTiming } from './validate';

export function toCaroGameReport(
  record: TGameRecord,
  winner: number | null,
  timing?: TCaroGameTiming
): TCaroGameReport {
  const moves = record.moves.map((move) => move.location);
  return {
    version: 1,
    size: record.size as TCaroGameReport['size'],
    winMode: record.winMode,
    machineTurn: record.machineTurn,
    // An empty unfinished game was waiting for the machine's opening move.
    firstTurn: record.moves[0]?.turn ?? record.machineTurn,
    moves,
    winner: winner == null ? null : winner < 0 ? -1 : (winner as TTurn),
    // Entries for moves taken back are dropped.
    ...(timing && {
      timing: { ...timing, moves: timing.moves.filter((m) => m.at < moves.length) },
    }),
  };
}

/** The device kind and the engines' thread count, as the machine worker works them out. */
export function caroDeviceInfo(): Pick<TCaroGameTiming, 'device' | 'threads'> {
  const { userAgent, maxTouchPoints = 0, hardwareConcurrency } = navigator;
  const device: TCaroDevice =
    /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
      ? 'ios'
      : /Android/.test(userAgent)
        ? 'android'
        : 'desktop';
  const threads = tengenThreads({
    isolated: self.crossOriginIsolated && typeof SharedArrayBuffer != 'undefined',
    cores: hardwareConcurrency,
    userAgent,
    maxTouchPoints,
  });
  return { device, threads };
}

/**
 * Sends a hell-level game to /api/caro/games, in production builds only (development keeps its
 * own, fuller log: src/services/caro-dev-log.ts). Fire and forget: a failure only loses the
 * report. `winner` is null for a game left unfinished during a slow move.
 */
export function reportCaroGame(
  record: TGameRecord,
  winner: number | null,
  timing?: TCaroGameTiming
) {
  if (process.env.NODE_ENV !== 'production') return;
  if (record.moves.length == 0 && winner != null) return;
  fetch('/api/caro/games', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(toCaroGameReport(record, winner, timing)),
    // The player may be leaving the page.
    keepalive: true,
  }).catch(() => {});
}
