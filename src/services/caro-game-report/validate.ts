import { checkWin } from 'src/services/caro.utils';
import { TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';

/** Which part of the hell level chose a machine move. */
export type TCaroMoveSource = 'lesson' | 'book' | 'rapfi' | 'tengen' | 'search' | 'network';
const SOURCES: Array<TCaroMoveSource> = ['lesson', 'book', 'rapfi', 'tengen', 'search', 'network'];

/** The kind of device, the only thing about it that is kept (not the browser or its version). */
export type TCaroDevice = 'ios' | 'android' | 'desktop';
const DEVICES: Array<TCaroDevice> = ['ios', 'android', 'desktop'];

/** How long one machine move took, as the player waited for it. */
export type TCaroMoveTiming = {
  /** Index of the move in `moves`. */
  at: number;
  ms: number;
  source: TCaroMoveSource;
  /** Whether the previous game was still being analysed in the background meanwhile. */
  learning: boolean;
};

/** Where the time went at the hell level, to find what makes a move slow on players' devices. */
export type TCaroGameTiming = {
  device: TCaroDevice;
  /** Search threads the engines run. */
  threads: number;
  /** Milliseconds from picking the level until each engine was ready, -1 when it failed. */
  loaded: { tengen?: number; rapfi?: number };
  moves: Array<TCaroMoveTiming>;
  /** An unfinished game: how long the machine's unanswered move had waited when it was sent. */
  waitingMs?: number;
};

/**
 * A hell-level game as the browser reports it (src/app/api/caro/games), kept to find where the
 * machine still goes wrong or is slow. Only the game and its timing: nothing about the player.
 */
export type TCaroGameReport = {
  version: 1;
  size: TCaroSizeBoard;
  winMode: TCaroWinMode;
  /** The player the machine played for. */
  machineTurn: TTurn;
  /** The player of the first move; the moves alternate from there. */
  firstTurn: TTurn;
  moves: Array<number>;
  /**
   * 0 or 1 when someone won, -1 for a draw, null for a game left unfinished while a machine move
   * was slow (sent only with its timing).
   */
  winner: TTurn | -1 | null;
  timing?: TCaroGameTiming;
};

/** The hell level plays an engine on these boards (3x3 plays like Hard and is not reported). */
const SIZES: Array<TCaroSizeBoard> = [10, 15, 20];
const WIN_MODES: Array<TCaroWinMode> = ['blockOpponent', 'non-blockOpponent'];

const isTurn = (value: unknown): value is TTurn => value === 0 || value === 1;

// An hour: anything longer is no measurement.
const MAX_MS = 3_600_000;
const isMs = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0 && (value as number) <= MAX_MS;
const isLoadMs = (value: unknown): value is number | undefined =>
  value === undefined || value === -1 || isMs(value);

/**
 * The timing, or null when it is not one the app could have measured for these moves: each
 * entry at a machine move, in order.
 */
function parseTiming(
  value: unknown,
  moves: Array<number>,
  firstTurn: TTurn,
  machineTurn: TTurn
): TCaroGameTiming | null {
  if (typeof value != 'object' || value == null) return null;
  const { device, threads, loaded, moves: timings, waitingMs } = value as Record<string, unknown>;
  if (!DEVICES.includes(device as TCaroDevice)) return null;
  if (!Number.isInteger(threads) || (threads as number) < 1 || (threads as number) > 16)
    return null;
  if (typeof loaded != 'object' || loaded == null) return null;
  const { tengen, rapfi } = loaded as Record<string, unknown>;
  if (!isLoadMs(tengen) || !isLoadMs(rapfi)) return null;
  if (waitingMs !== undefined && !isMs(waitingMs)) return null;
  if (!Array.isArray(timings) || timings.length > moves.length) return null;
  const parsed: Array<TCaroMoveTiming> = [];
  for (const timing of timings as Array<unknown>) {
    if (typeof timing != 'object' || timing == null) return null;
    const { at, ms, source, learning } = timing as Record<string, unknown>;
    if (!Number.isInteger(at) || (at as number) < 0 || (at as number) >= moves.length) return null;
    if ((firstTurn + (at as number)) % 2 != machineTurn) return null;
    if (parsed.length > 0 && (at as number) <= parsed[parsed.length - 1].at) return null;
    if (!isMs(ms) || !SOURCES.includes(source as TCaroMoveSource)) return null;
    if (typeof learning != 'boolean') return null;
    parsed.push({ at: at as number, ms, source: source as TCaroMoveSource, learning });
  }
  return {
    device: device as TCaroDevice,
    threads: threads as number,
    loaded: {
      ...(tengen !== undefined && { tengen }),
      ...(rapfi !== undefined && { rapfi }),
    },
    moves: parsed,
    ...(waitingMs !== undefined && { waitingMs }),
  };
}

/**
 * The report, or null unless it is a real game: legal moves on an empty board, nobody winning
 * before the last move, and the claimed winner the one the board shows (nobody yet in an
 * unfinished game). Anyone can post to the route, so nothing is stored that the app could not
 * have played.
 */
export function parseCaroGameReport(value: unknown): TCaroGameReport | null {
  if (typeof value != 'object' || value == null) return null;
  const report = value as Record<string, unknown>;
  const { size, winMode, machineTurn, firstTurn, moves, winner, timing } = report;
  if (report.version !== 1) return null;
  if (!SIZES.includes(size as TCaroSizeBoard)) return null;
  if (!WIN_MODES.includes(winMode as TCaroWinMode)) return null;
  if (!isTurn(machineTurn) || !isTurn(firstTurn)) return null;
  if (!(winner === -1 || winner === null || isTurn(winner))) return null;
  const boardSize = size as TCaroSizeBoard;
  const area = boardSize * boardSize;
  // An unfinished game may have stopped before the machine's first move.
  const minMoves = winner === null ? 0 : 1;
  if (!Array.isArray(moves) || moves.length < minMoves || moves.length > area) return null;

  const steps: { [location: number]: TTurn } = {};
  let won = false;
  for (const [index, location] of moves.entries()) {
    if (won) return null;
    if (!Number.isInteger(location) || location < 0 || location >= area) return null;
    if (steps[location] != undefined) return null;
    const turn = ((firstTurn + index) % 2) as TTurn;
    steps[location] = turn;
    const { winMode: lines } = checkWin(
      { steps, currentStep: location, currentPlayer: turn, size: boardSize },
      winMode as TCaroWinMode
    );
    won = lines.length > 0;
  }
  const lastTurn = ((firstTurn + moves.length - 1) % 2) as TTurn;
  if (winner === null || winner == -1 ? won : !won || winner != lastTurn) return null;

  const parsedTiming =
    timing === undefined ? undefined : parseTiming(timing, moves, firstTurn, machineTurn);
  // An unfinished game is only kept for its timing; a bad timing on a finished one is dropped.
  if (winner === null && !parsedTiming) return null;

  return {
    version: 1,
    size: boardSize,
    winMode: winMode as TCaroWinMode,
    machineTurn,
    firstTurn,
    moves: moves as Array<number>,
    winner,
    ...(parsedTiming && { timing: parsedTiming }),
  };
}
