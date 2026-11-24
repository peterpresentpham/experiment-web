import { describe, expect, it } from 'vitest';
import { CHESS_EXAMPLES } from 'src/configs/chessGuide.config';
import { buildTimeline, endStatus, legalTargets } from 'src/services/chess/timeline';

describe('chess guide examples', () => {
  it.each(Object.values(CHESS_EXAMPLES))('$id is playable', (example) => {
    const frames = buildTimeline(example.fen, example.moves);
    expect(frames).toHaveLength(example.moves.length + 1);
    if (example.showMovesFrom) {
      expect(legalTargets(example.fen, example.showMovesFrom).length).toBeGreaterThan(0);
    }
  });

  it('ends the mating lines in checkmate', () => {
    for (const id of ['foolsMate', 'backRank', 'scholar', 'ladder'] as const) {
      const { fen, moves } = CHESS_EXAMPLES[id];
      expect(endStatus(fen, moves).checkmate, id).toBe(true);
    }
  });

  it('is a stalemate for the stalemate example', () => {
    const { fen, moves } = CHESS_EXAMPLES.stalemate;
    expect(endStatus(fen, moves).stalemate).toBe(true);
  });
});

describe('buildTimeline', () => {
  it('moves the rook when castling', () => {
    const { fen } = CHESS_EXAMPLES.castling;
    const frame = buildTimeline(fen, ['O-O'])[1];
    const at = (square: string) => frame.pieces.find((p) => p.square == square)?.type;
    expect(at('g1')).toBe('k');
    expect(at('f1')).toBe('r');
    expect(at('h1')).toBeUndefined();
  });

  it('removes the pawn behind the target square on en passant', () => {
    const { fen, moves } = CHESS_EXAMPLES.enPassant;
    const last = buildTimeline(fen, moves).at(-1)!;
    expect(last.pieces.some((p) => p.square == 'd5')).toBe(false);
    expect(last.pieces.find((p) => p.square == 'd6')?.type).toBe('p');
  });

  it('keeps the pawn id and changes its type on promotion', () => {
    const { fen, moves } = CHESS_EXAMPLES.promotion;
    const [start, after] = buildTimeline(fen, moves);
    const before = start.pieces.find((p) => p.square == 'a7')!;
    const promoted = after.pieces.find((p) => p.id == before.id)!;
    expect(promoted).toMatchObject({ square: 'a8', type: 'q' });
  });

  it('marks the king in check', () => {
    const { fen, moves } = CHESS_EXAMPLES.check;
    expect(buildTimeline(fen, moves)[1].check).toBe('e8');
  });
});
