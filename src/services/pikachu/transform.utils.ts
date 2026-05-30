import { TPosition, TVector } from 'src/types/global';
import { TMoveParams, TPikachuTransform } from 'src/types/pikachu.type';
import type { TSpaceConfig } from './board-ops.utils';
import { boardOpConfigs } from './board-ops.utils';

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

function performTransform(
  board: Array<Array<number>>,
  moves: Array<TPosition>,
  spaceConfigs: Array<TSpaceConfig>
) {
  for (const { space, vector } of spaceConfigs) {
    const inSpaceMoves = moves.filter((move) => isInSpace(move, space));
    for (const move of inSpaceMoves) {
      board[move[0]][move[1]] = 0;
    }

    const visitedMove: Record<string, boolean> = {};
    for (const move of inSpaceMoves) {
      const key = `${move[0]}_${move[1]}`;
      if (visitedMove[key]) continue;
      visitedMove[key] = true;

      let pointer1 = move;
      let pointer2 = moveAnUnit(pointer1, vector);

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

function normalTransform(params: TMoveParams) {
  const { board, moves } = params;
  for (const move of moves) {
    board[move[0]][move[1]] = 0;
  }
}

export function pikachuBoardTransform(params: TMoveParams, type: TPikachuTransform) {
  if (type === 'normal') {
    normalTransform(params);
    return;
  }

  const { board, moves, numberOfRows, numberOfColumns } = params;
  const traverse = (inner: {
    board: Array<Array<number>>;
    numberOfRows: number;
    numberOfColumns: number;
    spaceConfigs: Array<TSpaceConfig>;
  }) => {
    performTransform(inner.board, moves, inner.spaceConfigs);
  };

  boardOpConfigs[type]({ board, numberOfRows, numberOfColumns }, traverse);
}
