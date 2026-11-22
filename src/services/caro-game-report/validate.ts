import { checkWin } from 'src/services/caro.utils';
import { TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';

/**
 * A finished hell-level game as the browser reports it (src/app/api/caro/games), kept to find
 * where the machine still goes wrong. Only the game itself: nothing about the player.
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
  /** 0 or 1 when someone won, -1 for a draw. */
  winner: TTurn | -1;
};

/** The hell level plays an engine on these boards (3x3 plays like Hard and is not reported). */
const SIZES: Array<TCaroSizeBoard> = [10, 15, 20];
const WIN_MODES: Array<TCaroWinMode> = ['blockOpponent', 'non-blockOpponent'];

const isTurn = (value: unknown): value is TTurn => value === 0 || value === 1;

/**
 * The report, or null unless it is a real game: legal moves on an empty board, nobody winning
 * before the last move, and the claimed winner the one the board shows. Anyone can post to the
 * route, so nothing is stored that the app could not have played.
 */
export function parseCaroGameReport(value: unknown): TCaroGameReport | null {
  if (typeof value != 'object' || value == null) return null;
  const report = value as Record<string, unknown>;
  const { size, winMode, machineTurn, firstTurn, moves, winner } = report;
  if (report.version !== 1) return null;
  if (!SIZES.includes(size as TCaroSizeBoard)) return null;
  if (!WIN_MODES.includes(winMode as TCaroWinMode)) return null;
  if (!isTurn(machineTurn) || !isTurn(firstTurn)) return null;
  if (!(winner === -1 || isTurn(winner))) return null;
  const boardSize = size as TCaroSizeBoard;
  const area = boardSize * boardSize;
  if (!Array.isArray(moves) || moves.length == 0 || moves.length > area) return null;

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
  if (winner == -1 ? won : !won || winner != lastTurn) return null;

  return {
    version: 1,
    size: boardSize,
    winMode: winMode as TCaroWinMode,
    machineTurn,
    firstTurn,
    moves: moves as Array<number>,
    winner,
  };
}
