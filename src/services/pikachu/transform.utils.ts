import { TPosition, TVector } from 'src/types/global';
import { TMoveParams, TPerformTransform, TPikachuTransform } from 'src/types/pikachu.type';

export function moveAnUnit(move: TPosition, vector: TVector): TPosition {
  return [move[0] + vector[0], move[1] + vector[1]];
}

export function isInSpace(move: TPosition, space: [TPosition, TPosition]) {
  return (
    space[0][0] <= move[0] &&
    space[0][1] <= move[1] &&
    space[1][0] >= move[0] &&
    space[1][1] >= move[1]
  );
}

function performTransform(params: TPerformTransform) {
  const { board, moves, vector, space } = params;
  const inSpaceMoves = moves.filter((move) => isInSpace(move, space));
  for (const move of inSpaceMoves) {
    board[move[0]][move[1]] = 0;
  }
  const visitedMove: { [key: string]: boolean } = {};
  for (const move of inSpaceMoves) {
    const _key = `${move[0]}_${move[1]}`;
    if (!visitedMove[_key]) {
      visitedMove[_key] = true;
      let pointer1 = move;
      let pointer2 = moveAnUnit(move, vector);
      while (isInSpace(pointer2, space)) {
        visitedMove[`${pointer2[0]}_${pointer2[1]}`] = true;
        const value2 = board[pointer2[0]][pointer2[1]];
        if (value2 > 0) {
          board[pointer1[0]][pointer1[1]] = value2;
          pointer1 = moveAnUnit(pointer1, vector);
        }
        board[pointer2[0]][pointer2[1]] = 0;
        pointer2 = moveAnUnit(pointer2, vector);
      }
    }
  }
}

function normal(params: TMoveParams) {
  const { board, moves } = params;
  for (const move of moves) {
    board[move[0]][move[1]] = 0;
  }
}

function _straight(params: TMoveParams, vector: TVector) {
  const { board, moves, numberOfRows, numberOfColumns } = params;
  const space: [TPosition, TPosition] = [
    [1, 1],
    [numberOfRows, numberOfColumns],
  ];
  performTransform({ board, moves, vector, space });
}

function splitHorizontally(params: TMoveParams) {
  const { board, moves, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  performTransform({
    board,
    moves,
    vector: [1, 0],
    space: [
      [1, 1],
      [rowCenter, numberOfColumns],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [-1, 0],
    space: [
      [rowCenter + 1, 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function mergeHorizontally(params: TMoveParams) {
  const { board, moves, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  performTransform({
    board,
    moves,
    vector: [-1, 0],
    space: [
      [1, 1],
      [rowCenter, numberOfColumns],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [1, 0],
    space: [
      [rowCenter + 1, 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function splitVertically(params: TMoveParams) {
  const { board, moves, numberOfRows, numberOfColumns } = params;
  const columnCenter = Math.floor(numberOfColumns / 2);
  performTransform({
    board,
    moves,
    vector: [0, 1],
    space: [
      [1, 1],
      [numberOfRows, columnCenter],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [0, -1],
    space: [
      [1, columnCenter + 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function mergeVertically(params: TMoveParams) {
  const { board, moves, numberOfRows, numberOfColumns } = params;
  const columnCenter = Math.floor(numberOfColumns / 2);
  performTransform({
    board,
    moves,
    vector: [0, -1],
    space: [
      [1, 1],
      [numberOfRows, columnCenter],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [0, 1],
    space: [
      [1, columnCenter + 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function spreadOut(params: TMoveParams) {
  const { board, moves, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  const columnCenter = Math.floor(numberOfColumns / 2);
  performTransform({
    board,
    moves,
    vector: [1, 1],
    space: [
      [1, 1],
      [rowCenter, columnCenter],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [-1, 1],
    space: [
      [rowCenter + 1, 1],
      [numberOfRows, columnCenter],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [1, -1],
    space: [
      [1, columnCenter + 1],
      [rowCenter, numberOfColumns],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [-1, -1],
    space: [
      [rowCenter + 1, columnCenter + 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

function collapseToCenter(params: TMoveParams) {
  const { board, moves, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  const columnCenter = Math.floor(numberOfColumns / 2);
  performTransform({
    board,
    moves,
    vector: [-1, -1],
    space: [
      [1, 1],
      [rowCenter, columnCenter],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [1, -1],
    space: [
      [rowCenter + 1, 1],
      [numberOfRows, columnCenter],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [-1, 1],
    space: [
      [1, columnCenter + 1],
      [rowCenter, numberOfColumns],
    ],
  });
  performTransform({
    board,
    moves,
    vector: [1, 1],
    space: [
      [rowCenter + 1, columnCenter + 1],
      [numberOfRows, numberOfColumns],
    ],
  });
}

const configs: Record<TPikachuTransform, (params: TMoveParams) => void> = {
  normal,
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

export function pikachuBoardTransform(params: TMoveParams, type: TPikachuTransform) {
  configs[type](params);
}
