import { TConnect4WinStateType, TConnect4Win, TTurn } from 'src/types/caro.type';
import { TPosition } from 'src/types/global';

type TParamsType = {
  steps: { [column: number]: Array<TTurn> };
  currentColumn: number;
  currentPlayer: TTurn;
  numberOfRows: number;
  numberOfColumns: number;
};

type TInternalParamsType = TParamsType & {
  currentRow: number;
};

function connect4Check(
  params: TInternalParamsType,
  moveCheckFn: (params: TInternalParamsType, row: number, column: number) => boolean,
  moveFn: (row: number, column: number) => [number, number]
): Array<TPosition> {
  const { steps, currentColumn, currentRow, currentPlayer } = params;
  let _currentRow = currentRow;
  let _currentColumn = currentColumn;
  const result: Array<TPosition> = [];
  while (moveCheckFn(params, _currentRow, _currentColumn)) {
    [_currentRow, _currentColumn] = moveFn(_currentRow, _currentColumn);
    const _turn = steps?.[_currentColumn]?.[_currentRow];
    if (_turn == currentPlayer) result.push([_currentRow, _currentColumn]);
    else break;
  }
  return result;
}

function checkTopLeftDiagonal(params: TInternalParamsType): Array<TPosition> {
  return connect4Check(
    params,
    ({ numberOfRows }, row, column) => row < numberOfRows && column >= 0,
    (row, column) => [row + 1, column - 1]
  );
}

function checkTopVertical(params: TInternalParamsType): Array<TPosition> {
  return connect4Check(
    params,
    ({ numberOfRows }, row, _) => row < numberOfRows,
    (row, column) => [row + 1, column]
  );
}

function checkTopRightDiagonal(params: TInternalParamsType): Array<TPosition> {
  return connect4Check(
    params,
    ({ numberOfRows, numberOfColumns }, row, column) =>
      row < numberOfRows && column < numberOfColumns,
    (row, column) => [row + 1, column + 1]
  );
}

function checkBottomLeftDiagonal(params: TInternalParamsType): Array<TPosition> {
  return connect4Check(
    params,
    (_, row, column) => row >= 0 && column >= 0,
    (row, column) => [row - 1, column - 1]
  );
}

function checkBottomVertical(params: TInternalParamsType): Array<TPosition> {
  return connect4Check(
    params,
    (_, row, __) => row >= 0,
    (row, column) => [row - 1, column]
  );
}

function checkBottomRightDiagonal(params: TInternalParamsType): Array<TPosition> {
  return connect4Check(
    params,
    ({ numberOfColumns }, row, column) => row >= 0 && column < numberOfColumns,
    (row, column) => [row - 1, column + 1]
  );
}

function checkLeftHorizontal(params: TInternalParamsType): Array<TPosition> {
  return connect4Check(
    params,
    (_, __, column) => column >= 0,
    (row, column) => [row, column - 1]
  );
}

function checkRightHorizontal(params: TInternalParamsType): Array<TPosition> {
  return connect4Check(
    params,
    ({ numberOfColumns }, __, column) => column < numberOfColumns,
    (row, column) => [row, column + 1]
  );
}

const config: Record<
  TConnect4Win,
  {
    side1Func: (params: TInternalParamsType) => Array<TPosition>;
    side2Func: (params: TInternalParamsType) => Array<TPosition>;
  }
> = {
  leftDiagonal: { side1Func: checkTopLeftDiagonal, side2Func: checkBottomRightDiagonal },
  rightDiagonal: { side1Func: checkTopRightDiagonal, side2Func: checkBottomLeftDiagonal },
  vertical: { side1Func: checkTopVertical, side2Func: checkBottomVertical },
  horizontal: { side1Func: checkLeftHorizontal, side2Func: checkRightHorizontal },
};

function _analyticStep(type: TConnect4Win, params: TInternalParamsType) {
  const side1 = config[type].side1Func(params);
  const side2 = config[type].side2Func(params);
  const _len = side1.length + side2.length;
  const isWin = _len >= 3;
  return { isWin, arr: side1.concat(side2) };
}

export function checkWin(params: TParamsType): TConnect4WinStateType {
  const { steps, currentColumn } = params;
  const currentRow = steps[currentColumn].length - 1;
  const internalParams: TInternalParamsType = { ...params, currentRow };

  const leftDiagonal = _analyticStep('leftDiagonal', internalParams);
  const rightDiagonal = _analyticStep('rightDiagonal', internalParams);
  const vertical = _analyticStep('vertical', internalParams);
  const horizontal = _analyticStep('horizontal', internalParams);
  const locations: TConnect4WinStateType['locations'] = {};

  const winMode: Array<TConnect4Win> = [];
  if (leftDiagonal.isWin) {
    winMode.push('leftDiagonal');
    for (const [row, column] of leftDiagonal.arr.concat([currentRow, currentColumn])) {
      const _key = `${row}_${column}`;
      if (!locations[_key]) locations[_key] = {};
      locations[_key]['leftDiagonal'] = true;
    }
  }
  if (rightDiagonal.isWin) {
    winMode.push('rightDiagonal');
    for (const [row, column] of rightDiagonal.arr.concat([currentRow, currentColumn])) {
      const _key = `${row}_${column}`;
      if (!locations[_key]) locations[_key] = {};
      locations[_key]['rightDiagonal'] = true;
    }
  }
  if (vertical.isWin) {
    winMode.push('vertical');
    for (const [row, column] of vertical.arr.concat([currentRow, currentColumn])) {
      const _key = `${row}_${column}`;
      if (!locations[_key]) locations[_key] = {};
      locations[_key]['vertical'] = true;
    }
  }
  if (horizontal.isWin) {
    winMode.push('horizontal');
    for (const [row, column] of horizontal.arr.concat([currentRow, currentColumn])) {
      const _key = `${row}_${column}`;
      if (!locations[_key]) locations[_key] = {};
      locations[_key]['horizontal'] = true;
    }
  }

  return { locations, winMode };
}
