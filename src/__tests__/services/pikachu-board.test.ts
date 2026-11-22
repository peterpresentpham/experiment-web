import { pikachuRoundTransformations } from 'src/configs/pikachu.constance';
import PikachuService from 'src/services/pikachu';
import { _refineNumTypes } from 'src/services/pikachu/board.utils';
import { getRoundTransform, hasPieces } from 'src/services/pikachu/round.utils';
import { describe, expect, it } from 'vitest';
import { assertValidPath, filledCells, TBoard, withBorder } from './pikachu-helpers';

function countByValue(board: TBoard, rows: number, columns: number) {
  const counts = new Map<number, number>();
  for (const [r, c] of filledCells(board, rows, columns))
    counts.set(board[r][c], (counts.get(board[r][c]) ?? 0) + 1);
  return counts;
}

function expectBorderEmpty(board: TBoard, rows: number, columns: number) {
  expect(board).toHaveLength(rows + 2);
  for (const row of board) expect(row).toHaveLength(columns + 2);
  expect(board[0].every((value) => value == 0)).toBe(true);
  expect(board[rows + 1].every((value) => value == 0)).toBe(true);
  expect(board.every((row) => row[0] == 0 && row[columns + 1] == 0)).toBe(true);
}

describe('pikachu _refineNumTypes', () => {
  it('keeps the number of types between one and the available types and pairs', () => {
    for (let halfCells = 1; halfCells <= 80; halfCells++) {
      for (const numTypes of [1, 5, 10, 36, 90, 1025]) {
        const value = _refineNumTypes(halfCells, numTypes);
        expect(value, `${halfCells}/${numTypes}`).toBeGreaterThanOrEqual(1);
        expect(value, `${halfCells}/${numTypes}`).toBeLessThanOrEqual(
          Math.min(numTypes, halfCells)
        );
      }
    }
  });
});

describe('pikachu createNewBoard', () => {
  it.each([
    [4, 6, 90],
    [6, 9, 90],
    [9, 16, 90],
    [9, 16, 1025],
    [4, 6, 10],
  ])('%ix%i with %i types builds a playable board', (rows, columns, numTypes) => {
    const { board, path } = PikachuService.createNewBoard({
      numberOfRows: rows,
      numberOfColumns: columns,
      numberOfLines: 2,
      numTypes,
    });
    expectBorderEmpty(board, rows, columns);
    expect(filledCells(board, rows, columns)).toHaveLength(rows * columns);
    for (const [value, count] of countByValue(board, rows, columns)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(numTypes);
      expect(count % 2).toBe(0);
    }
    expect(path).toBeTruthy();
    assertValidPath(board, path, 2);
  });
});

describe('pikachu changeBoard', () => {
  it('reshuffles pieces in place and always leaves a move', () => {
    const currentBoard = withBorder([
      [1, 2, 0, 3],
      [2, 0, 0, 1],
      [3, 4, 4, 0],
    ]);
    for (let attempt = 0; attempt < 20; attempt++) {
      const { board, path } = PikachuService.changeBoard({
        currentBoard,
        numberOfRows: 3,
        numberOfColumns: 4,
        numberOfLines: 2,
        numTypes: 90,
      });
      expectBorderEmpty(board, 3, 4);
      for (let r = 1; r <= 3; r++)
        for (let c = 1; c <= 4; c++) expect(board[r][c] > 0).toBe(currentBoard[r][c] > 0);
      for (const count of countByValue(board, 3, 4).values()) expect(count % 2).toBe(0);
      assertValidPath(board, path, 2);
    }
  });

  it('returns immediately for a board without pieces', () => {
    const currentBoard = withBorder([
      [0, 0, 0],
      [0, 0, 0],
    ]);
    const { board, path } = PikachuService.changeBoard({
      currentBoard,
      numberOfRows: 2,
      numberOfColumns: 3,
      numberOfLines: 2,
      numTypes: 90,
    });
    expect(board).toEqual(currentBoard);
    expect(board).not.toBe(currentBoard);
    expect(path).toEqual([]);
  });
});

describe('pikachu round helpers', () => {
  const base = {
    gameType: 'normal' as const,
    roundList: pikachuRoundTransformations,
    round: 1,
    randomRoundListIndex: -1,
  };

  it('picks the transform of the current round or the random index', () => {
    expect(getRoundTransform({ ...base, round: 3 })).toBe(pikachuRoundTransformations[2]);
    expect(getRoundTransform({ ...base, gameType: 'randomBoard', randomRoundListIndex: 5 })).toBe(
      pikachuRoundTransformations[5]
    );
  });

  it('falls back when the round list was shortened or emptied', () => {
    expect(getRoundTransform({ ...base, roundList: ['fallUp', 'shiftLeft'], round: 7 })).toBe(
      'fallUp'
    );
    expect(getRoundTransform({ ...base, gameType: 'randomBoard' })).toBe('normal');
    expect(getRoundTransform({ ...base, roundList: [] })).toBe('normal');
  });

  it('detects whether any piece is left', () => {
    expect(hasPieces(withBorder([[0, 0]]))).toBe(false);
    expect(hasPieces(withBorder([[0, 3]]))).toBe(true);
    expect(hasPieces([])).toBe(false);
  });
});
