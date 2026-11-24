export type TChessColor = 'w' | 'b';

export type TChessPieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

/** Algebraic square name, e.g. `e4`. */
export type TChessSquare = string;

/** A piece with a stable identity, so the 3D board can animate it from square to square. */
export type TChessPiece = {
  id: string;
  type: TChessPieceType;
  color: TChessColor;
  square: TChessSquare;
};

/** One position of a lesson line: where every live piece stands after a move. */
export type TChessFrame = {
  pieces: Array<TChessPiece>;
  /** Squares of the move that led here (empty for the starting frame). */
  lastMove: Array<TChessSquare>;
  /** SAN of the move that led here (empty for the starting frame). */
  san: string;
  /** Square of the king in check, if any. */
  check: TChessSquare | null;
};

/** A lesson example: a start position, the moves to play and what to highlight. */
export type TChessExample = {
  id: string;
  fen: string;
  /** Moves in SAN, played from `fen`. May be empty for a static position. */
  moves: Array<string>;
  /** Show the legal moves of the piece on this square in the starting frame. */
  showMovesFrom?: TChessSquare;
  /** Squares to mark in every frame (the targets of a fork, the pinned piece, ...). */
  marks?: Array<TChessSquare>;
};
