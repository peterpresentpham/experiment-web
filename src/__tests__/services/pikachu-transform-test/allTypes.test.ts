import { pikachuRoundTransformations } from 'src/configs/pikachu.constance';
import PikachuService from 'src/services/pikachu';
import { boardOpConfigs, TSpaceConfig } from 'src/services/pikachu/board-ops.utils';
import { TPosition } from 'src/types/global';
import { TPikachuTransform } from 'src/types/pikachu.type';
import { describe, expect, it } from 'vitest';
import {
  cloneBoard,
  compactFrom,
  filledCells,
  linesOfSpace,
  randomBoard,
  seeded,
  TBoard,
  withBorder,
} from '../pikachu-helpers';

function spacesOf(type: TPikachuTransform, rows: number, columns: number) {
  let spaces: Array<TSpaceConfig> = [];
  boardOpConfigs[type]({ board: [], numberOfRows: rows, numberOfColumns: columns }, (params) => {
    spaces = params.spaceConfigs;
  });
  return spaces;
}

/**
 * Reference behaviour of a transform: inside every space, each line that contains a removed
 * cell is compacted against the direction of the vector, starting from its first removed cell.
 * Cells before that point and lines without a removed cell keep their content.
 */
function referenceTransform(
  board: TBoard,
  moves: Array<TPosition>,
  type: TPikachuTransform,
  rows: number,
  columns: number
) {
  const result = cloneBoard(board);
  for (const [r, c] of moves) result[r][c] = 0;
  if (type == 'normal') return result;

  for (const { space, vector } of spacesOf(type, rows, columns)) {
    for (const line of linesOfSpace(space, vector)) {
      const firstRemoved = line.findIndex(([r, c]) =>
        moves.some((move) => move[0] == r && move[1] == c)
      );
      if (firstRemoved < 0) continue;
      const values = compactFrom(
        line.map(([r, c]) => result[r][c]),
        firstRemoved
      );
      line.forEach(([r, c], index) => (result[r][c] = values[index]));
    }
  }
  return result;
}

/** Reference behaviour of a format: every line of every space is fully compacted. */
function referenceFormat(board: TBoard, type: TPikachuTransform, rows: number, columns: number) {
  const result = cloneBoard(board);
  if (type == 'normal') return result;
  for (const { space, vector } of spacesOf(type, rows, columns)) {
    for (const line of linesOfSpace(space, vector)) {
      const values = compactFrom(
        line.map(([r, c]) => result[r][c]),
        0
      );
      line.forEach(([r, c], index) => (result[r][c] = values[index]));
    }
  }
  return result;
}

function pickPair(random: () => number, board: TBoard, rows: number, columns: number) {
  const cells = filledCells(board, rows, columns);
  const first = cells.splice(Math.floor(random() * cells.length), 1)[0];
  const second = cells[Math.floor(random() * cells.length)];
  // Random order on purpose: the game passes the pair in click order.
  return random() < 0.5 ? [first, second] : [second, first];
}

const SIZES: Array<[number, number]> = [
  [4, 6],
  [5, 7],
  [6, 9],
  [9, 16],
];

describe('pikachu transform: every round type', () => {
  it.each(pikachuRoundTransformations)('%s matches the reference on random boards', (type) => {
    const random = seeded(type.length * 131);
    for (const [rows, columns] of SIZES) {
      for (let round = 0; round < 40; round++) {
        const board = randomBoard(random, rows, columns, { types: 9, emptyRate: 0.25 });
        if (filledCells(board, rows, columns).length < 2) continue;
        const moves = pickPair(random, board, rows, columns);
        const expected = referenceTransform(board, moves, type, rows, columns);

        PikachuService.transform(
          { board, moves, numberOfRows: rows, numberOfColumns: columns },
          type
        );
        expect(board, `${type} ${rows}x${columns} round ${round}`).toEqual(expected);
      }
    }
  });

  it.each(pikachuRoundTransformations)('%s keeps every other piece and the border', (type) => {
    const random = seeded(type.length * 17 + 3);
    const [rows, columns] = [6, 9];
    const board = randomBoard(random, rows, columns, { types: 5, emptyRate: 0.2 });
    const moves = pickPair(random, board, rows, columns);
    const before = filledCells(board, rows, columns)
      .filter(([r, c]) => !moves.some((move) => move[0] == r && move[1] == c))
      .map(([r, c]) => board[r][c])
      .sort();

    PikachuService.transform({ board, moves, numberOfRows: rows, numberOfColumns: columns }, type);
    const after = filledCells(board, rows, columns)
      .map(([r, c]) => board[r][c])
      .sort();
    expect(after).toEqual(before);
    expect(board[0].every((value) => value == 0)).toBe(true);
    expect(board[rows + 1].every((value) => value == 0)).toBe(true);
    expect(board.every((row) => row[0] == 0 && row[columns + 1] == 0)).toBe(true);
  });
});

describe('pikachu transform: diagonal and quadrant types', () => {
  const full = () =>
    withBorder([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
    ]);

  it('shiftUpLeft pulls the diagonal up and to the left', () => {
    const board = full();
    PikachuService.transform(
      { board, moves: [[1, 1]], numberOfRows: 4, numberOfColumns: 4 },
      'shiftUpLeft'
    );
    expect(board.slice(1, 5).map((row) => row.slice(1, 5))).toEqual([
      [6, 2, 3, 4],
      [5, 11, 7, 8],
      [9, 10, 16, 12],
      [13, 14, 15, 0],
    ]);
  });

  it('shiftDownRight pulls the diagonal down and to the right', () => {
    const board = full();
    PikachuService.transform(
      { board, moves: [[4, 4]], numberOfRows: 4, numberOfColumns: 4 },
      'shiftDownRight'
    );
    expect(board.slice(1, 5).map((row) => row.slice(1, 5))).toEqual([
      [0, 2, 3, 4],
      [5, 1, 7, 8],
      [9, 10, 6, 12],
      [13, 14, 15, 11],
    ]);
  });

  it('spreadOut moves each quadrant towards its own corner', () => {
    const board = full();
    PikachuService.transform(
      {
        board,
        moves: [
          [1, 1],
          [4, 4],
        ],
        numberOfRows: 4,
        numberOfColumns: 4,
      },
      'spreadOut'
    );
    expect(board.slice(1, 5).map((row) => row.slice(1, 5))).toEqual([
      [6, 2, 3, 4],
      [5, 0, 7, 8],
      [9, 10, 0, 12],
      [13, 14, 15, 11],
    ]);
  });

  it('collapseToCenter moves each quadrant towards the middle', () => {
    const board = full();
    PikachuService.transform(
      {
        board,
        moves: [
          [2, 2],
          [3, 3],
        ],
        numberOfRows: 4,
        numberOfColumns: 4,
      },
      'collapseToCenter'
    );
    expect(board.slice(1, 5).map((row) => row.slice(1, 5))).toEqual([
      [0, 2, 3, 4],
      [5, 1, 7, 8],
      [9, 10, 16, 12],
      [13, 14, 15, 0],
    ]);
  });
});

describe('pikachu format: every round type', () => {
  it.each(pikachuRoundTransformations)('%s compacts every line of every space', (type) => {
    const random = seeded(type.length * 7 + 11);
    for (const [rows, columns] of SIZES) {
      for (let round = 0; round < 30; round++) {
        const board = randomBoard(random, rows, columns, { types: 9, emptyRate: 0.4 });
        const expected = referenceFormat(board, type, rows, columns);
        PikachuService.format({ board, numberOfRows: rows, numberOfColumns: columns }, type);
        expect(board, `${type} ${rows}x${columns} round ${round}`).toEqual(expected);
      }
    }
  });

  it('is idempotent', () => {
    const random = seeded(5);
    for (const type of pikachuRoundTransformations) {
      const board = randomBoard(random, 6, 9, { types: 9, emptyRate: 0.4 });
      PikachuService.format({ board, numberOfRows: 6, numberOfColumns: 9 }, type);
      const once = cloneBoard(board);
      PikachuService.format({ board, numberOfRows: 6, numberOfColumns: 9 }, type);
      expect(board, type).toEqual(once);
    }
  });
});
