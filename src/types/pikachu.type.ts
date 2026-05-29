import { TPosition, TVector } from './global';

export type TPikachuImg = 'internal' | 'external';
export type TPikachuGame = 'normal' | 'customBoard' | 'randomBoard' | 'blind';

export type TBasePikachu = {
  numberOfRows: number;
  numberOfColumns: number;
  board: Array<Array<number>>;
};

export type TFindPath = TBasePikachu & {
  sourcePiece: TPosition;
  targetPiece: TPosition;
  numberOfLines: number;
};

export type TFindPathWithoutTarget = TBasePikachu & {
  numberOfLines: number;
};

export type TPikachuNewBoard = {
  numberOfRows: number;
  numberOfColumns: number;
  numTypes: number;
};

export type TPikachuTransform =
  | 'normal'
  | 'fallDown'
  | 'fallUp'
  | 'shiftLeft'
  | 'shiftRight'
  | 'splitHorizontally'
  | 'mergeHorizontally'
  | 'splitVertically'
  | 'mergeVertically'
  | 'shiftUpLeft'
  | 'shiftDownLeft'
  | 'shiftUpRight'
  | 'shiftDownRight'
  | 'spreadOut'
  | 'collapseToCenter';

export type TPerformFormat = {
  board: Array<Array<number>>;
  vector: TVector;
  space: [TPosition, TPosition];
};

export type TPerformTransform = TPerformFormat & {
  moves: Array<TPosition>;
};

export type TMoveParams = TBasePikachu & {
  moves: Array<TPosition>;
};

export enum PikachuMachineState {
  INITIAL = 'initial',
  PLAYING = 'playing',
  OUT_OF_MOVE = 'out-of-move',
  ENDED = 'ended',
}

export enum PikachuMachineEvent {
  CREATE = 'create',
  LOAD_SAVE_GAME = 'load-save-game',
  CHANGE = 'change',
  OUT_OF_MOVE = 'out-of-move',
  MOVE = 'move',
  RESET_SELECTION = 'reset-selection',
  SHOW_HINT = 'show-hint',
  WIN = 'win',
}

export type TPikachuCreateEvent = {
  type: PikachuMachineEvent.CREATE;
  mode: 'newGame' | 'nextRound';
};
export type TPikachuMoveEvent = {
  type: PikachuMachineEvent.MOVE;
  position: TPosition;
};
export type TPikachuEvent =
  | TPikachuCreateEvent
  | { type: PikachuMachineEvent.CHANGE }
  | TPikachuMoveEvent
  | { type: PikachuMachineEvent.RESET_SELECTION }
  | { type: PikachuMachineEvent.SHOW_HINT }
  | { type: PikachuMachineEvent.OUT_OF_MOVE }
  | { type: PikachuMachineEvent.LOAD_SAVE_GAME }
  | { type: PikachuMachineEvent.WIN };

export type TPikachuContext = {
  position?: TPosition;
  selectedPath: Array<TPosition>;
  randomCounter: number;
  hintRunning: boolean;
};
