import { Chess } from 'chess.js';
import type { TChessFrame, TChessPiece, TChessSquare } from 'src/types/chess.type';

function piecesOf(game: Chess): Array<TChessPiece> {
  const pieces: Array<TChessPiece> = [];
  for (const row of game.board()) {
    for (const cell of row) {
      if (cell) {
        pieces.push({
          id: `${cell.color}${cell.type}-${cell.square}`,
          type: cell.type,
          color: cell.color,
          square: cell.square,
        });
      }
    }
  }
  return pieces;
}

function checkSquare(game: Chess): TChessSquare | null {
  if (!game.inCheck()) return null;
  const turn = game.turn();
  for (const row of game.board()) {
    for (const cell of row) {
      if (cell && cell.type == 'k' && cell.color == turn) return cell.square;
    }
  }
  return null;
}

/**
 * Plays `moves` (SAN) from `fen` and returns one frame per position, the start included.
 * Pieces keep their `id` across frames (a promoted pawn keeps its id and changes `type`), which
 * lets the 3D board slide a piece instead of redrawing it. Throws on an illegal move.
 */
export function buildTimeline(fen: string, moves: Array<string>): Array<TChessFrame> {
  const game = new Chess(fen);
  let pieces = piecesOf(game);
  const frames: Array<TChessFrame> = [{ pieces, lastMove: [], san: '', check: checkSquare(game) }];

  for (const san of moves) {
    const move = game.move(san);
    // En passant removes the pawn from the square behind the target, not from the target itself.
    const capturedSquare = move.isEnPassant() ? `${move.to[0]}${move.from[1]}` : move.to;
    const rookMove = castlingRookMove(move.flags, move.color);

    pieces = pieces
      .filter((piece) => !(move.captured && piece.square == capturedSquare))
      .map((piece) => {
        if (piece.square == move.from) {
          return { ...piece, type: move.promotion ?? piece.type, square: move.to };
        }
        if (rookMove && piece.square == rookMove.from) return { ...piece, square: rookMove.to };
        return piece;
      });

    frames.push({
      pieces,
      lastMove: [move.from, move.to],
      san: move.san,
      check: checkSquare(game),
    });
  }
  return frames;
}

function castlingRookMove(flags: string, color: 'w' | 'b') {
  const rank = color == 'w' ? '1' : '8';
  if (flags.includes('k')) return { from: `h${rank}`, to: `f${rank}` };
  if (flags.includes('q')) return { from: `a${rank}`, to: `d${rank}` };
  return null;
}

/** Destination squares of every legal move of the piece on `square`. */
export function legalTargets(fen: string, square: TChessSquare): Array<TChessSquare> {
  const game = new Chess(fen);
  return game.moves({ square: square as never, verbose: true }).map((move) => move.to);
}

/** Final status of a line, used by lesson examples and their tests. */
export function endStatus(fen: string, moves: Array<string>) {
  const game = new Chess(fen);
  for (const san of moves) game.move(san);
  return {
    checkmate: game.isCheckmate(),
    stalemate: game.isStalemate(),
    check: game.inCheck(),
  };
}
