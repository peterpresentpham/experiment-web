import { TPosition } from './global';

// The piece image set: public/pikachu-<set>/piece1.png..piece90.png.
export type TPikachuImg = 'magic' | 'vietnamese-food';
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

export type TMoveParams = TBasePikachu & {
  moves: Array<TPosition>;
};

export enum PikachuMachineState {
  INITIAL = 'initial',
  PLAYING = 'playing',
  // Two matching pieces were picked: the path is shown and the input is locked.
  MATCHED = 'matched',
  // Transient state that routes to the next state once a match has been committed.
  RESOLVING = 'resolving',
}

export enum PikachuMachineEvent {
  CREATE = 'create',
  LOAD_SAVE_GAME = 'load-save-game',
  CHANGE = 'change',
  MOVE = 'move',
  SHOW_HINT = 'show-hint',
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
  | { type: PikachuMachineEvent.SHOW_HINT }
  | { type: PikachuMachineEvent.LOAD_SAVE_GAME };

export type TMatchOutcome = 'continue' | 'outOfMove' | 'cleared';

// Result of applying a matched pair to the board; computed purely, then committed to the store.
export type TMatchResult = {
  board: Array<Array<number>>;
  suggestion?: Array<TPosition>;
  outcome: TMatchOutcome;
  randomCounter: number;
  randomRoundListIndex?: number;
};

export type TPikachuContext = {
  position?: TPosition;
  selectedPath: Array<TPosition>;
  matchedPair?: [TPosition, TPosition];
  matchResult?: TMatchResult;
  randomCounter: number;
  hintRunning: boolean;
};
