import { TGameRecord } from 'src/services/caro-machine/experience';
import { TTurn } from 'src/types/caro.type';
import { TCaroGameReport } from './validate';

export function toCaroGameReport(record: TGameRecord, winner: number): TCaroGameReport {
  return {
    version: 1,
    size: record.size as TCaroGameReport['size'],
    winMode: record.winMode,
    machineTurn: record.machineTurn,
    firstTurn: record.moves[0]?.turn ?? 0,
    moves: record.moves.map((move) => move.location),
    winner: winner < 0 ? -1 : (winner as TTurn),
  };
}

/**
 * Sends a finished hell-level game to /api/caro/games, in production builds only (development
 * keeps its own, fuller log: src/services/caro-dev-log.ts). Fire and forget: a failure only
 * loses the report.
 */
export function reportCaroGame(record: TGameRecord, winner: number) {
  if (process.env.NODE_ENV !== 'production' || record.moves.length == 0) return;
  fetch('/api/caro/games', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(toCaroGameReport(record, winner)),
    // The player may leave right after the last move.
    keepalive: true,
  }).catch(() => {});
}
