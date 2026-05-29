import {
  TCaroGame,
  TCaroMessage,
  TCaroSizeBoard,
  TCaroWinMode,
  TCaroWin,
  TTurn,
  TWinState,
} from 'src/types/caro.type';

type TBlockMode = 'opposite' | 'wall' | undefined;

type TParamsType = {
  steps: { [key: number]: TTurn };
  currentStep: number;
  currentPlayer: TTurn;
  size: TCaroSizeBoard;
};

type TSideReturnType = {
  cells: Array<number>;
  blockMode: TBlockMode;
};

function caroCheck(
  params: TParamsType,
  stepShouldByCheckFunc: (params: TParamsType) => number,
  checkingStepFunc: (params: TParamsType, checkingStep: number) => number
): TSideReturnType {
  const { steps, currentStep, currentPlayer } = params;
  const stepsShouldBeCheck = stepShouldByCheckFunc(params);
  let checkingStep = currentStep;
  let counter = 0;
  const result: Array<number> = [];
  let blockMode: TBlockMode = undefined;
  while (stepsShouldBeCheck > counter) {
    checkingStep = checkingStepFunc(params, checkingStep);
    if (steps[checkingStep] == currentPlayer) {
      counter++;
      result.push(checkingStep);
    } else {
      if (steps[checkingStep] != undefined) blockMode = 'opposite';
      break;
    }
  }
  if (counter >= stepsShouldBeCheck) blockMode = 'wall';
  return { cells: result, blockMode };
}

function checkTopLeftDiagonal(params: TParamsType) {
  return caroCheck(
    params,
    ({ currentStep, size }) => Math.min(currentStep % size, Math.floor(currentStep / size)),
    ({ size }, checkingStep) => checkingStep - (size + 1)
  );
}

function checkTopVertical(params: TParamsType) {
  return caroCheck(
    params,
    ({ currentStep, size }) => Math.floor(currentStep / size),
    ({ size }, checkingStep) => checkingStep - size
  );
}

function checkTopRightDiagonal(params: TParamsType) {
  return caroCheck(
    params,
    ({ currentStep, size }) =>
      Math.min(size - (currentStep % size) - 1, Math.floor(currentStep / size)),
    ({ size }, checkingStep) => checkingStep - size + 1
  );
}

function checkBottomLeftDiagonal(params: TParamsType) {
  return caroCheck(
    params,
    ({ currentStep, size }) =>
      Math.min(currentStep % size, size - Math.floor(currentStep / size) - 1),
    ({ size }, checkingStep) => checkingStep + size - 1
  );
}

function checkBottomVertical(params: TParamsType) {
  return caroCheck(
    params,
    ({ currentStep, size }) => size - Math.floor(currentStep / size) - 1,
    ({ size }, checkingStep) => checkingStep + size
  );
}

function checkBottomRightDiagonal(params: TParamsType) {
  return caroCheck(
    params,
    ({ currentStep, size }) =>
      Math.min(size - (currentStep % size) - 1, size - Math.floor(currentStep / size) - 1),
    ({ size }, checkingStep) => checkingStep + size + 1
  );
}

function checkLeftHorizontal(params: TParamsType) {
  return caroCheck(
    params,
    ({ currentStep, size }) => currentStep % size,
    (_, checkingStep) => checkingStep - 1
  );
}

function checkRightHorizontal(params: TParamsType) {
  return caroCheck(
    params,
    ({ currentStep, size }) => size - (currentStep % size) - 1,
    (_, checkingStep) => checkingStep + 1
  );
}

const config: Record<
  TCaroWin,
  {
    side1Func: (params: TParamsType) => TSideReturnType;
    side2Func: (params: TParamsType) => TSideReturnType;
  }
> = {
  leftDiagonal: { side1Func: checkTopLeftDiagonal, side2Func: checkBottomRightDiagonal },
  rightDiagonal: { side1Func: checkTopRightDiagonal, side2Func: checkBottomLeftDiagonal },
  vertical: { side1Func: checkTopVertical, side2Func: checkBottomVertical },
  horizontal: { side1Func: checkLeftHorizontal, side2Func: checkRightHorizontal },
};

function _analyticStep(
  type: TCaroWin,
  params: TParamsType,
  winMode: TCaroWinMode,
  sizeForWin: number
) {
  const side1 = config[type].side1Func(params);
  const side2 = config[type].side2Func(params);
  const _len = side1.cells.length + side2.cells.length;
  const isBlock =
    side1.blockMode == 'opposite' && side2.blockMode == 'opposite' && winMode == 'blockOpponent';
  const isWin = _len >= sizeForWin && !isBlock;
  return { isWin, arr: side1.cells.concat(side2.cells) };
}

/**
 * Checks if the current move results in a win condition.
 *
 * This function analyzes all four possible win directions (left diagonal, right diagonal,
 * vertical, and horizontal) from the current step position. It counts consecutive pieces
 * in each direction and determines if they meet the win condition (4 in a row for boards > 3x3,
 * 2 in a row for 3x3 boards).
 *
 * @param params - Object containing the game state:
 *   - steps: Map of board positions to player turns
 *   - currentStep: The location of the most recent move
 *   - currentPlayer: The player who made the current move
 *   - size: The board size (3, 10, or 15)
 * @param winConfigMode - Win mode configuration:
 *   - 'blockOpponent': Win is blocked if opponent pieces are on both ends
 *   - 'non-blockOpponent': Win is not blocked by opponent pieces
 * @returns TWinState object containing:
 *   - winMode: Array of win types achieved (e.g., ['horizontal', 'vertical'])
 *   - locations: Map of winning cell locations to their win types
 */
export function checkWin(params: TParamsType, winConfigMode: TCaroWinMode): TWinState {
  const _sizeForWin = params.size > 3 ? 4 : 2;
  const leftDiagonal = _analyticStep('leftDiagonal', params, winConfigMode, _sizeForWin);
  const rightDiagonal = _analyticStep('rightDiagonal', params, winConfigMode, _sizeForWin);
  const vertical = _analyticStep('vertical', params, winConfigMode, _sizeForWin);
  const horizontal = _analyticStep('horizontal', params, winConfigMode, _sizeForWin);
  const { currentStep } = params;
  const locations: TWinState['locations'] = {};

  const winMode: Array<TCaroWin> = [];
  if (leftDiagonal.isWin) {
    winMode.push('leftDiagonal');
    for (const _location of leftDiagonal.arr.concat(currentStep)) {
      if (!locations[_location]) locations[_location] = {};
      locations[_location]['leftDiagonal'] = true;
    }
  }
  if (rightDiagonal.isWin) {
    winMode.push('rightDiagonal');
    for (const _location of rightDiagonal.arr.concat(currentStep)) {
      if (!locations[_location]) locations[_location] = {};
      locations[_location]['rightDiagonal'] = true;
    }
  }
  if (vertical.isWin) {
    winMode.push('vertical');
    for (const _location of vertical.arr.concat(currentStep)) {
      if (!locations[_location]) locations[_location] = {};
      locations[_location]['vertical'] = true;
    }
  }
  if (horizontal.isWin) {
    winMode.push('horizontal');
    for (const _location of horizontal.arr.concat(currentStep)) {
      if (!locations[_location]) locations[_location] = {};
      locations[_location]['horizontal'] = true;
    }
  }

  return { locations, winMode };
}

export function createCaroMessage(type: TCaroMessage, ...message: Array<string | number>) {
  return `${type}_${message.join('_')}`;
}

export type TSyncReturnType = {
  size: TCaroSizeBoard;
  gameType: TCaroGame;
  isOverride: boolean;
};

export function decodeCaroMessage(message: string) {
  const [type, ...restMessage] = message.split('_');
  const realType = type as TCaroMessage;
  if (realType == 'chat') return { type: realType, message: restMessage[0] };
  else if (realType == 'move') return { type: realType, message: parseInt(restMessage[0]) };
  else if (realType == 'sync')
    return {
      type: realType,
      message: {
        size: restMessage[0] as unknown as TCaroSizeBoard,
        gameType: restMessage[1] as TCaroGame,
        isOverride: restMessage[2] == '0' ? false : true,
      },
    };
  else if (realType == 'newGame' || realType == 'undo') return { type: realType, message: null };
}
