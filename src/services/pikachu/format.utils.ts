import { TPosition } from 'src/types/global';
import { TBasePikachu, TPikachuTransform } from 'src/types/pikachu.type';
import type { TSpaceConfig } from './board-ops.utils';
import { boardOpConfigs } from './board-ops.utils';
import { isInSpace, moveAnUnit } from './transform.utils';

function performFormat(board: Array<Array<number>>, spaceConfigs: Array<TSpaceConfig>) {
  for (const { space, vector } of spaceConfigs) {
    const emptyCells: Array<TPosition> = [];
    for (let i = space[0][0]; i <= space[1][0]; i++) {
      for (let j = space[0][1]; j <= space[1][1]; j++) {
        if (board[i][j] === 0) emptyCells.push([i, j]);
      }
    }

    const visitedMove: Record<string, boolean> = {};
    for (const piece of emptyCells) {
      const key = `${piece[0]}_${piece[1]}`;
      if (visitedMove[key]) continue;
      visitedMove[key] = true;

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

export function pikachuBoardFormat(params: TBasePikachu, type: TPikachuTransform) {
  if (type === 'normal') return;

  const { board, numberOfRows, numberOfColumns } = params;
  const traverse = (inner: {
    board: Array<Array<number>>;
    numberOfRows: number;
    numberOfColumns: number;
    spaceConfigs: Array<TSpaceConfig>;
  }) => {
    performFormat(inner.board, inner.spaceConfigs);
  };

  boardOpConfigs[type]({ board, numberOfRows, numberOfColumns }, traverse);
}
