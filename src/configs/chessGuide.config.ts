import type { TChessExample } from 'src/types/chess.type';

export const CHESS_START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// A lone white piece plus the two kings, so the highlighted squares are the piece's own moves.
const SOLO = (rank4: string) => `k7/8/8/8/${rank4}/8/8/7K w - - 0 1`;

export const CHESS_EXAMPLE_IDS = [
  'start',
  'rook',
  'bishop',
  'queen',
  'knight',
  'king',
  'pawnStart',
  'pawnCapture',
  'castling',
  'enPassant',
  'promotion',
  'check',
  'foolsMate',
  'backRank',
  'stalemate',
  'italian',
  'scholar',
  'fork',
  'pin',
  'skewer',
  'ladder',
  'opposition',
] as const;

export type TChessExampleId = (typeof CHESS_EXAMPLE_IDS)[number];

/**
 * Every example of the guide. The text of each one lives in `chessMessages.examples`, keyed by
 * the same id. `src/__tests__/chess/guide-examples.test.ts` plays all of them, so an illegal move
 * or a wrong claim (mate, stalemate) fails the build instead of reaching readers.
 */
export const CHESS_EXAMPLES: Record<TChessExampleId, TChessExample> = {
  start: { id: 'start', fen: CHESS_START_FEN, moves: [] },
  rook: { id: 'rook', fen: SOLO('3R4'), moves: [], showMovesFrom: 'd4' },
  bishop: { id: 'bishop', fen: SOLO('3B4'), moves: [], showMovesFrom: 'd4' },
  queen: { id: 'queen', fen: SOLO('3Q4'), moves: [], showMovesFrom: 'd4' },
  knight: { id: 'knight', fen: SOLO('3N4'), moves: [], showMovesFrom: 'd4' },
  king: { id: 'king', fen: 'k7/8/8/8/4K3/8/8/8 w - - 0 1', moves: [], showMovesFrom: 'e4' },
  pawnStart: {
    id: 'pawnStart',
    fen: 'k7/8/8/8/8/8/4P3/7K w - - 0 1',
    moves: [],
    showMovesFrom: 'e2',
  },
  pawnCapture: {
    id: 'pawnCapture',
    fen: 'k7/8/8/3p1p2/4P3/8/8/7K w - - 0 1',
    moves: [],
    showMovesFrom: 'e4',
  },
  castling: {
    id: 'castling',
    fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    moves: ['O-O', 'O-O-O'],
  },
  enPassant: {
    id: 'enPassant',
    fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
    moves: ['exd6'],
    marks: ['d5'],
  },
  promotion: { id: 'promotion', fen: '8/P3k3/8/8/8/8/8/4K3 w - - 0 1', moves: ['a8=Q+', 'Kd7'] },
  check: { id: 'check', fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1', moves: ['Ra8+', 'Kd7'] },
  foolsMate: { id: 'foolsMate', fen: CHESS_START_FEN, moves: ['f3', 'e5', 'g4', 'Qh4#'] },
  backRank: { id: 'backRank', fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', moves: ['Ra8#'] },
  stalemate: { id: 'stalemate', fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', moves: [] },
  italian: {
    id: 'italian',
    fen: CHESS_START_FEN,
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+'],
  },
  scholar: {
    id: 'scholar',
    fen: CHESS_START_FEN,
    moves: ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#'],
  },
  fork: {
    id: 'fork',
    fen: '4k3/1r6/8/5N2/8/8/8/4K3 w - - 0 1',
    moves: ['Nd6+', 'Kd7', 'Nxb7'],
    marks: ['e8', 'b7'],
  },
  pin: {
    id: 'pin',
    fen: CHESS_START_FEN,
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    marks: ['c6', 'e8'],
  },
  skewer: {
    id: 'skewer',
    fen: '8/8/8/q3k3/8/8/8/6KR w - - 0 1',
    moves: ['Rh5+', 'Ke6', 'Rxa5'],
    marks: ['e5', 'a5'],
  },
  ladder: { id: 'ladder', fen: '8/6k1/R7/8/8/8/8/1R2K3 w - - 0 1', moves: ['Rb7+', 'Kg8', 'Ra8#'] },
  opposition: {
    id: 'opposition',
    fen: '8/8/4k3/8/4K3/8/8/8 w - - 0 1',
    moves: [],
    marks: ['e4', 'e6'],
  },
};

export const CHESS_LEVELS = ['beginner', 'intermediate'] as const;
export type TChessLevel = (typeof CHESS_LEVELS)[number];

export type TChessSectionId =
  | 'board'
  | 'pieces'
  | 'special'
  | 'end'
  | 'values'
  | 'notation'
  | 'opening'
  | 'tactics'
  | 'mating'
  | 'endgame'
  | 'habits';

/** Sections of each level, in reading order, and the examples shown under each section. */
export const CHESS_SECTIONS: Record<
  TChessLevel,
  Array<{ id: TChessSectionId; examples: Array<TChessExampleId> }>
> = {
  beginner: [
    { id: 'board', examples: ['start'] },
    {
      id: 'pieces',
      examples: ['rook', 'bishop', 'queen', 'knight', 'king', 'pawnStart', 'pawnCapture'],
    },
    { id: 'special', examples: ['castling', 'enPassant', 'promotion'] },
    { id: 'end', examples: ['check', 'foolsMate', 'stalemate'] },
    { id: 'values', examples: [] },
    { id: 'notation', examples: [] },
  ],
  intermediate: [
    { id: 'opening', examples: ['italian', 'scholar'] },
    { id: 'tactics', examples: ['fork', 'pin', 'skewer'] },
    { id: 'mating', examples: ['backRank', 'ladder'] },
    { id: 'endgame', examples: ['opposition'] },
    { id: 'habits', examples: [] },
  ],
};

export const CHESS_BASE = '/blog/chess';
