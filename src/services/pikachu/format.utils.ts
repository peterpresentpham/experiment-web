import { TPosition, TVector } from 'src/types/global';
import { TBasePikachu, TPerformFormat, TPikachuTransform } from 'src/types/pikachu.type';
import { isInSpace, moveAnUnit } from './transform.utils';

function performFormat(params: TPerformFormat) {
  const { board, vector, space } = params;
  const result: Array<TPosition> = [];
  for (let i = space[0][0]; i <= space[1][0]; i++) {
    for (let j = space[0][1]; j <= space[1][1]; j++) {
      if (board[i][j] == 0) result.push([i, j]);
    }
  }
  const visitedMove: { [key: string]: boolean } = {};
  for (const piece of result) {
    const _key = `${piece[0]}_${piece[1]}`;
    if (!visitedMove[_key]) {
      visitedMove[_key] = true;
      let pointer1 = piece;
      let pointer2 = moveAnUnit(pointer1, vector);
      while (isInSpace(pointer2, space)) {
        visitedMove[`${pointer2[0]}_${pointer2[1]}`] = true;
        const value2 = board[pointer2[0]][pointer2[1]];
        if (value2 > 0) {
          board[pointer1[0]][pointer1[1]] = value2;
          pointer1 = moveAnUnit(pointer1, vector);
          board[pointer2[0]][pointer2[1]] = 0;
        }
        pointer2 = moveAnUnit(pointer2, vector);
      }
    }
  }
}

function _straight(params: TBasePikachu, vector: TVector) {
  const { board, numberOfRows, numberOfColumns } = params;
  performFormat({
    board,
    vector,
    space: [
      [1, 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function splitHorizontally(params: TBasePikachu) {
  const { board, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  performFormat({
    board,
    vector: [1, 0],
    space: [
      [1, 1],
      [rowCenter, numberOfColumns],
    ],
  });
  performFormat({
    board,
    vector: [-1, 0],
    space: [
      [rowCenter + 1, 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function mergeHorizontally(params: TBasePikachu) {
  const { board, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  performFormat({
    board,
    vector: [-1, 0],
    space: [
      [1, 1],
      [rowCenter, numberOfColumns],
    ],
  });
  performFormat({
    board,
    vector: [1, 0],
    space: [
      [rowCenter + 1, 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function splitVertically(params: TBasePikachu) {
  const { board, numberOfRows, numberOfColumns } = params;
  const columnCenter = Math.floor(numberOfColumns / 2);
  performFormat({
    board,
    vector: [0, 1],
    space: [
      [1, 1],
      [numberOfRows, columnCenter],
    ],
  });
  performFormat({
    board,
    vector: [0, -1],
    space: [
      [1, columnCenter + 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function mergeVertically(params: TBasePikachu) {
  const { board, numberOfRows, numberOfColumns } = params;
  const columnCenter = Math.floor(numberOfColumns / 2);
  performFormat({
    board,
    vector: [0, -1],
    space: [
      [1, 1],
      [numberOfRows, columnCenter],
    ],
  });
  performFormat({
    board,
    vector: [0, 1],
    space: [
      [1, columnCenter + 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function spreadOut(params: TBasePikachu) {
  const { board, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  const columnCenter = Math.floor(numberOfColumns / 2);
  performFormat({
    board,
    vector: [1, 1],
    space: [
      [1, 1],
      [rowCenter, columnCenter],
    ],
  });
  performFormat({
    board,
    vector: [-1, 1],
    space: [
      [rowCenter + 1, 1],
      [numberOfRows, columnCenter],
    ],
  });
  performFormat({
    board,
    vector: [1, -1],
    space: [
      [1, columnCenter + 1],
      [rowCenter, numberOfColumns],
    ],
  });
  performFormat({
    board,
    vector: [-1, -1],
    space: [
      [rowCenter + 1, columnCenter + 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function collapseToCenter(params: TBasePikachu) {
  const { board, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  const columnCenter = Math.floor(numberOfColumns / 2);
  performFormat({
    board,
    vector: [-1, -1],
    space: [
      [1, 1],
      [rowCenter, columnCenter],
    ],
  });
  performFormat({
    board,
    vector: [1, -1],
    space: [
      [rowCenter + 1, 1],
      [numberOfRows, columnCenter],
    ],
  });
  performFormat({
    board,
    vector: [-1, 1],
    space: [
      [1, columnCenter + 1],
      [rowCenter, numberOfColumns],
    ],
  });
  performFormat({
    board,
    vector: [1, 1],
    space: [
      [rowCenter + 1, columnCenter + 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

const configs: Record<TPikachuTransform, (params: TBasePikachu) => void> = {
  normal: () => {},
  fallDown: (params) => _straight(params, [-1, 0]),
  fallUp: (params) => _straight(params, [1, 0]),
  shiftLeft: (params) => _straight(params, [0, 1]),
  shiftRight: (params) => _straight(params, [0, -1]),
  shiftUpLeft: (params) => _straight(params, [1, 1]),
  shiftDownLeft: (params) => _straight(params, [-1, 1]),
  shiftUpRight: (params) => _straight(params, [1, -1]),
  shiftDownRight: (params) => _straight(params, [-1, -1]),
  splitHorizontally,
  mergeHorizontally,
  splitVertically,
  mergeVertically,
  spreadOut,
  collapseToCenter,
};

export function pikachuBoardFormat(params: TBasePikachu, type: TPikachuTransform) {
  configs[type](params);
}
