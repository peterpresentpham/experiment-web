import { describe, expect, it } from 'vitest';
import { checkWin } from 'src/services/caro.utils';
import { TCaroSizeBoard, TTurn } from 'src/types/caro.type';

type TSteps = { [key: number]: TTurn };

function place(size: TCaroSizeBoard, cells: Array<[number, number, TTurn]>) {
  const steps: TSteps = {};
  for (const [row, column, turn] of cells) steps[row * size + column] = turn;
  return steps;
}

function play(
  size: TCaroSizeBoard,
  steps: TSteps,
  row: number,
  column: number,
  mode: 'blockOpponent' | 'non-blockOpponent' = 'blockOpponent'
) {
  const currentStep = row * size + column;
  const currentPlayer = steps[currentStep];
  return checkWin({ steps, currentStep, currentPlayer, size }, mode);
}

describe('caro checkWin', () => {
  it('needs five in a row on boards larger than 3x3', () => {
    const four = place(
      10,
      [0, 1, 2, 3].map((c) => [0, c, 0] as [number, number, TTurn])
    );
    expect(play(10, four, 0, 3).winMode).toEqual([]);

    const five = place(
      10,
      [0, 1, 2, 3, 4].map((c) => [0, c, 0] as [number, number, TTurn])
    );
    const result = play(10, five, 0, 4);
    expect(result.winMode).toEqual(['horizontal']);
    expect(
      Object.keys(result.locations)
        .map(Number)
        .sort((a, b) => a - b)
    ).toEqual([0, 1, 2, 3, 4]);
  });

  it('needs three in a row on a 3x3 board', () => {
    const two = place(3, [
      [0, 0, 1],
      [1, 1, 1],
    ]);
    expect(play(3, two, 1, 1).winMode).toEqual([]);
    const three = place(3, [
      [0, 0, 1],
      [1, 1, 1],
      [2, 2, 1],
    ]);
    expect(play(3, three, 1, 1).winMode).toEqual(['leftDiagonal']);
  });

  it('detects vertical and right diagonal lines', () => {
    const vertical = place(
      10,
      [0, 1, 2, 3, 4].map((r) => [r, 5, 1] as [number, number, TTurn])
    );
    expect(play(10, vertical, 2, 5).winMode).toEqual(['vertical']);
    const diagonal = place(
      10,
      [0, 1, 2, 3, 4].map((i) => [i, 9 - i, 0] as [number, number, TTurn])
    );
    expect(play(10, diagonal, 2, 7).winMode).toEqual(['rightDiagonal']);
  });

  it('reports every line completed by one move', () => {
    const cells: Array<[number, number, TTurn]> = [];
    for (let i = 1; i <= 4; i++) {
      cells.push([5, 5 + i, 0], [5 + i, 5, 0]);
    }
    cells.push([5, 5, 0]);
    const result = play(15, place(15, cells), 5, 5);
    expect(result.winMode.sort()).toEqual(['horizontal', 'vertical']);
    expect(result.locations[5 * 15 + 5]).toEqual({ horizontal: true, vertical: true });
  });

  it('stays inside the board edges', () => {
    // Row 0 ends at column 9, index 10 is the next row and must not wrap around.
    const wrap = place(10, [
      [0, 7, 0],
      [0, 8, 0],
      [0, 9, 0],
      [1, 0, 0],
      [1, 1, 0],
    ]);
    expect(play(10, wrap, 0, 9).winMode).toEqual([]);
  });

  it('is blocked only when both ends are the opponent in blockOpponent mode', () => {
    const cells: Array<[number, number, TTurn]> = [
      [0, 0, 1],
      [0, 1, 0],
      [0, 2, 0],
      [0, 3, 0],
      [0, 4, 0],
      [0, 5, 0],
      [0, 6, 1],
    ];
    const steps = place(10, cells);
    expect(play(10, steps, 0, 3, 'blockOpponent').winMode).toEqual([]);
    expect(play(10, steps, 0, 3, 'non-blockOpponent').winMode).toEqual(['horizontal']);

    const oneEnd = place(10, cells.slice(0, 6));
    expect(play(10, oneEnd, 0, 3, 'blockOpponent').winMode).toEqual(['horizontal']);
  });
});
