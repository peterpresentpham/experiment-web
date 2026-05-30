import { TPosition, TVector } from 'src/types/global';
import { TBasePikachu, TPikachuTransform } from 'src/types/pikachu.type';

type TSpaceConfig = {
  space: [TPosition, TPosition];
  vector: TVector;
};

type TCellTraversalCallback = (
  params: TBasePikachu & { spaceConfigs: Array<TSpaceConfig> }
) => void;

function _straight(params: TBasePikachu, vector: TVector, traverse: TCellTraversalCallback): void {
  const { numberOfRows, numberOfColumns } = params;
  const space: [TPosition, TPosition] = [
    [1, 1],
    [numberOfRows, numberOfColumns],
  ];
  traverse({ ...params, spaceConfigs: [{ space, vector }] });
}

function splitHorizontally(params: TBasePikachu, traverse: TCellTraversalCallback): void {
  const { board, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  traverse({
    board,
    numberOfRows,
    numberOfColumns,
    spaceConfigs: [
      {
        vector: [1, 0],
        space: [
          [1, 1],
          [rowCenter, numberOfColumns],
        ] as [TPosition, TPosition],
      },
      {
        vector: [-1, 0],
        space: [
          [rowCenter + 1, 1],
          [numberOfRows, numberOfColumns],
        ] as [TPosition, TPosition],
      },
    ],
  });
}

function mergeHorizontally(params: TBasePikachu, traverse: TCellTraversalCallback): void {
  const { board, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  traverse({
    board,
    numberOfRows,
    numberOfColumns,
    spaceConfigs: [
      {
        vector: [-1, 0],
        space: [
          [1, 1],
          [rowCenter, numberOfColumns],
        ] as [TPosition, TPosition],
      },
      {
        vector: [1, 0],
        space: [
          [rowCenter + 1, 1],
          [numberOfRows, numberOfColumns],
        ] as [TPosition, TPosition],
      },
    ],
  });
}

function splitVertically(params: TBasePikachu, traverse: TCellTraversalCallback): void {
  const { board, numberOfRows, numberOfColumns } = params;
  const columnCenter = Math.floor(numberOfColumns / 2);
  traverse({
    board,
    numberOfRows,
    numberOfColumns,
    spaceConfigs: [
      {
        vector: [0, 1],
        space: [
          [1, 1],
          [numberOfRows, columnCenter],
        ] as [TPosition, TPosition],
      },
      {
        vector: [0, -1],
        space: [
          [1, columnCenter + 1],
          [numberOfRows, numberOfColumns],
        ] as [TPosition, TPosition],
      },
    ],
  });
}

function mergeVertically(params: TBasePikachu, traverse: TCellTraversalCallback): void {
  const { board, numberOfRows, numberOfColumns } = params;
  const columnCenter = Math.floor(numberOfColumns / 2);
  traverse({
    board,
    numberOfRows,
    numberOfColumns,
    spaceConfigs: [
      {
        vector: [0, -1],
        space: [
          [1, 1],
          [numberOfRows, columnCenter],
        ] as [TPosition, TPosition],
      },
      {
        vector: [0, 1],
        space: [
          [1, columnCenter + 1],
          [numberOfRows, numberOfColumns],
        ] as [TPosition, TPosition],
      },
    ],
  });
}

function spreadOut(params: TBasePikachu, traverse: TCellTraversalCallback): void {
  const { board, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  const columnCenter = Math.floor(numberOfColumns / 2);
  traverse({
    board,
    numberOfRows,
    numberOfColumns,
    spaceConfigs: [
      {
        vector: [1, 1],
        space: [
          [1, 1],
          [rowCenter, columnCenter],
        ] as [TPosition, TPosition],
      },
      {
        vector: [-1, 1],
        space: [
          [rowCenter + 1, 1],
          [numberOfRows, columnCenter],
        ] as [TPosition, TPosition],
      },
      {
        vector: [1, -1],
        space: [
          [1, columnCenter + 1],
          [rowCenter, numberOfColumns],
        ] as [TPosition, TPosition],
      },
      {
        vector: [-1, -1],
        space: [
          [rowCenter + 1, columnCenter + 1],
          [numberOfRows, numberOfColumns],
        ] as [TPosition, TPosition],
      },
    ],
  });
}

function collapseToCenter(params: TBasePikachu, traverse: TCellTraversalCallback): void {
  const { board, numberOfRows, numberOfColumns } = params;
  const rowCenter = Math.floor(numberOfRows / 2);
  const columnCenter = Math.floor(numberOfColumns / 2);
  traverse({
    board,
    numberOfRows,
    numberOfColumns,
    spaceConfigs: [
      {
        vector: [-1, -1],
        space: [
          [1, 1],
          [rowCenter, columnCenter],
        ] as [TPosition, TPosition],
      },
      {
        vector: [1, -1],
        space: [
          [rowCenter + 1, 1],
          [numberOfRows, columnCenter],
        ] as [TPosition, TPosition],
      },
      {
        vector: [-1, 1],
        space: [
          [1, columnCenter + 1],
          [rowCenter, numberOfColumns],
        ] as [TPosition, TPosition],
      },
      {
        vector: [1, 1],
        space: [
          [rowCenter + 1, columnCenter + 1],
          [numberOfRows, numberOfColumns],
        ] as [TPosition, TPosition],
      },
    ],
  });
}

export type TBoardOpMapping = Record<
  TPikachuTransform,
  (params: TBasePikachu, traverse: TCellTraversalCallback) => void
>;

export const boardOpConfigs: TBoardOpMapping = {
  normal: (_params, _traverse) => {},
  fallDown: (params, traverse) => _straight(params, [-1, 0], traverse),
  fallUp: (params, traverse) => _straight(params, [1, 0], traverse),
  shiftLeft: (params, traverse) => _straight(params, [0, 1], traverse),
  shiftRight: (params, traverse) => _straight(params, [0, -1], traverse),
  shiftUpLeft: (params, traverse) => _straight(params, [1, 1], traverse),
  shiftDownLeft: (params, traverse) => _straight(params, [-1, 1], traverse),
  shiftUpRight: (params, traverse) => _straight(params, [1, -1], traverse),
  shiftDownRight: (params, traverse) => _straight(params, [-1, -1], traverse),
  splitHorizontally,
  mergeHorizontally,
  splitVertically,
  mergeVertically,
  spreadOut,
  collapseToCenter,
};

export type { TCellTraversalCallback, TSpaceConfig };
