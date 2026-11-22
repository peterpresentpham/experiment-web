import { describe, expect, it } from 'vitest';
import { migratePikachuState } from 'src/states/pikachu.state';

const metadata = {
  numberOfRows: 2,
  numberOfColumns: 2,
  numberOfLines: 2,
  round: 1,
  roundList: ['normal'],
  randomRoundListIndex: -1,
  gameType: 'normal',
};

describe('migratePikachuState', () => {
  it('moves a game saved with the old built-in set to the default set and keeps its board', () => {
    const board = [
      [1, 90],
      [90, 1],
    ];
    const state = migratePikachuState(
      { metadata: { ...metadata, imgType: 'internal' }, board, suggestion: [] },
      1
    );
    expect(state.metadata.imgType).toBe('magic');
    expect(state.board).toEqual(board);
  });

  it('drops a board that uses pieces from the old 1025-piece set', () => {
    const state = migratePikachuState(
      {
        metadata: { ...metadata, imgType: 'external' },
        board: [
          [500, 3],
          [3, 500],
        ],
        suggestion: [{ x: 0, y: 0 }],
      },
      1
    );
    expect(state.metadata.imgType).toBe('magic');
    expect(state.board).toEqual([]);
    expect(state.suggestion).toEqual([]);
  });

  it('keeps a current save as it is', () => {
    const saved = {
      metadata: { ...metadata, imgType: 'vietnamese-food' },
      board: [],
      suggestion: [],
    };
    expect(migratePikachuState(saved, 2)).toEqual(saved);
  });
});
