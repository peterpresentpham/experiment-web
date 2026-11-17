import PikachuService from 'src/services/pikachu';
import { TPosition } from 'src/types/global';
import { describe, expect, it } from 'vitest';
import {
  assertValidPath,
  filledCells,
  minTurns,
  randomBoard,
  seeded,
  TBoard,
  withBorder,
} from '../pikachu-helpers';

function find(board: TBoard, source: TPosition, target: TPosition, numberOfLines = 2) {
  return PikachuService.findPath({
    board,
    sourcePiece: source,
    targetPiece: target,
    numberOfRows: board.length - 2,
    numberOfColumns: board[0].length - 2,
    numberOfLines,
  });
}

describe('pikachu findPath', () => {
  it('connects neighbours and pieces in a clear straight line', () => {
    const board = withBorder([
      [1, 1, 0, 2],
      [3, 0, 0, 2],
    ]);
    expect(find(board, [1, 1], [1, 2])).toEqual([
      [1, 1],
      [1, 2],
    ]);
    const path = find(board, [1, 4], [2, 4]);
    expect(path).toBeDefined();
    assertValidPath(board, path!, 0);
  });

  it('turns once around a corner and twice through the border', () => {
    const board = withBorder([
      [1, 0, 0],
      [9, 9, 1],
      [2, 9, 2],
    ]);
    const corner = find(board, [1, 1], [2, 3]);
    expect(corner).toBeDefined();
    assertValidPath(board, corner!, 1, [
      [1, 1],
      [2, 3],
    ]);
    // Bottom row pieces can only meet through the border below the board.
    const border = find(board, [3, 1], [3, 3]);
    expect(border).toBeDefined();
    assertValidPath(board, border!, 2, [
      [3, 1],
      [3, 3],
    ]);
  });

  it('rejects different pieces, the same cell, and walled-in pieces', () => {
    const board = withBorder([
      [5, 5, 5],
      [5, 1, 5],
      [5, 5, 1],
    ]);
    expect(find(board, [1, 1], [2, 2])).toBeUndefined();
    expect(find(board, [1, 1], [1, 1])).toBeUndefined();
    expect(find(board, [2, 2], [3, 3])).toBeUndefined();
  });

  it('respects the number of turns allowed', () => {
    // (2,2) can only leave upwards and (3,4) can only be entered from the right border,
    // so the shortest route is up, right, down, left: three turns.
    const board = withBorder([
      [9, 0, 9, 9],
      [9, 1, 9, 0],
      [9, 9, 9, 1],
    ]);
    expect(minTurns(board, [2, 2], [3, 4])).toBe(3);
    expect(find(board, [2, 2], [3, 4], 2)).toBeUndefined();
    const path = find(board, [2, 2], [3, 4], 3);
    expect(path).toBeDefined();
    assertValidPath(board, path!, 3);
  });

  it('agrees with a reference solver on random boards', () => {
    const random = seeded(2024);
    for (let round = 0; round < 150; round++) {
      const rows = 3 + Math.floor(random() * 5);
      const columns = 3 + Math.floor(random() * 6);
      const board = randomBoard(random, rows, columns, { types: 3, emptyRate: 0.45 });
      const cells = filledCells(board, rows, columns);
      for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells.length; j++) {
          if (i == j) continue;
          const [a, b] = [cells[i], cells[j]];
          const isSame = board[a[0]][a[1]] == board[b[0]][b[1]];
          for (const lines of [2, 3]) {
            const path = find(board, a, b, lines);
            const expected = isSame && minTurns(board, a, b) <= lines;
            expect(path != undefined, `seed round ${round} ${a} -> ${b}, ${lines}`).toBe(expected);
            if (path) assertValidPath(board, path, lines, [a, b]);
          }
        }
      }
    }
  });
});

describe('pikachu findPathWithoutTarget', () => {
  it('returns undefined for an empty board and null when no pair connects', () => {
    const empty = withBorder([
      [0, 0],
      [0, 0],
    ]);
    expect(
      PikachuService.findPathWithoutTarget({
        board: empty,
        numberOfRows: 2,
        numberOfColumns: 2,
        numberOfLines: 2,
      })
    ).toBeUndefined();

    const stuck = withBorder([
      [1, 2],
      [2, 1],
    ]);
    // 1s and 2s sit on diagonals: every route is blocked by the other pair.
    expect(minTurns(stuck, [1, 1], [2, 2])).toBeGreaterThan(2);
    expect(
      PikachuService.findPathWithoutTarget({
        board: stuck,
        numberOfRows: 2,
        numberOfColumns: 2,
        numberOfLines: 2,
      })
    ).toBeNull();
  });

  it('finds a valid pair whenever the reference solver does', () => {
    const random = seeded(77);
    for (let round = 0; round < 200; round++) {
      const rows = 2 + Math.floor(random() * 5);
      const columns = 2 + Math.floor(random() * 6);
      const board = randomBoard(random, rows, columns, { types: 6, emptyRate: 0.3 });
      const cells = filledCells(board, rows, columns);
      const hasPair = cells.some((a, i) =>
        cells.some(
          (b, j) => i != j && board[a[0]][a[1]] == board[b[0]][b[1]] && minTurns(board, a, b) <= 2
        )
      );
      const path = PikachuService.findPathWithoutTarget({
        board,
        numberOfRows: rows,
        numberOfColumns: columns,
        numberOfLines: 2,
      });
      if (cells.length == 0) expect(path).toBeUndefined();
      else if (!hasPair) expect(path, `round ${round}`).toBeNull();
      else {
        expect(path, `round ${round}`).toBeTruthy();
        assertValidPath(board, path!, 2);
      }
    }
  });
});
