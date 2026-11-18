import { checkWin } from 'src/services/caro.utils';
import {
  TCaroGame,
  TCaroMachineLevel,
  TCaroSizeBoard,
  TCaroWinMode,
  TPlayMode,
  TTurn,
  TWinState,
} from 'src/types/caro.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type TCaroMetadataType = {
  playMode: TPlayMode;
  gameType: TCaroGame;
  winMode: TCaroWinMode;
  isOverride: boolean;
  size: TCaroSizeBoard;
  maxNumberOfBlindError: number;
  preWinner: number;
  machineLevel: TCaroMachineLevel;
  /** The player the machine controls in machine play mode. */
  machineTurn: TTurn;
};

const DEFAULT_METADATA: TCaroMetadataType = {
  playMode: 'machine',
  gameType: 'normal',
  winMode: 'blockOpponent',
  isOverride: false,
  size: 10,
  maxNumberOfBlindError: 5,
  preWinner: 0,
  machineLevel: 'hard',
  machineTurn: 1,
};

type TCaroStateType = {
  metadata: TCaroMetadataType;
  numberOfBlindError: { 0: number; 1: number };
  isBlindForceOver: boolean;
  turn: TTurn;
  steps: { [key: number]: TTurn };
  stepsOrder: Array<number>;
  winState?: TWinState;
  fn: {
    move: (location: number) => void;
    undo: () => void;
    reset: (turn?: TTurn) => void;
    countNumberOfBlindError: (turn: TTurn) => void;
    setMetadata: (metadata: Partial<TCaroMetadataType>) => void;
  };
};

export const useCaroStore = create<
  TCaroStateType,
  [['zustand/persist', unknown], ['zustand/immer', unknown]]
>(
  persist(
    immer((set) => {
      return {
        metadata: DEFAULT_METADATA,
        numberOfBlindError: { 0: 0, 1: 0 },
        isBlindForceOver: false,
        turn: 0,
        steps: {},
        stepsOrder: [],
        fn: {
          move: (location) => {
            set((state) => {
              state.steps[location] = state.turn;
              state.stepsOrder.push(location);

              const { size, winMode } = state.metadata;
              const _winState = checkWin(
                { steps: state.steps, currentStep: location, currentPlayer: state.turn, size },
                winMode
              );
              if (_winState.winMode.length > 0) {
                state.winState = _winState;
              } else state.turn = (1 - state.turn) as TTurn;
            });
          },
          undo: () => {
            set((state) => {
              const len = state.stepsOrder.length;
              if (len > 1) {
                let currentStep = state.stepsOrder[len - 1];
                delete state.steps[currentStep];
                state.stepsOrder.pop();

                currentStep = state.stepsOrder[len - 2];
                delete state.steps[currentStep];
                state.stepsOrder.pop();
              }
            });
          },
          reset: (turn) => {
            set((state) => {
              state.numberOfBlindError = { 0: 0, 1: 0 };
              if (turn != undefined) state.turn = turn;
              state.metadata.preWinner = state.turn;
              state.steps = {};
              state.stepsOrder = [];
              state.winState = undefined;
              state.isBlindForceOver = false;
            });
          },
          countNumberOfBlindError: (turn: TTurn) => {
            set((state) => {
              const currentErrors = state.numberOfBlindError[turn];
              state.numberOfBlindError[turn] = currentErrors + 1;
              if (state.numberOfBlindError[turn] > state.metadata.maxNumberOfBlindError) {
                state.isBlindForceOver = true;
                state.turn = (1 - state.turn) as TTurn;
              }
            });
          },
          setMetadata: (metadata: Partial<TCaroMetadataType>) => {
            set((state) => {
              state.metadata = { ...state.metadata, ...metadata };
            });
          },
        },
      };
    }),
    {
      name: 'experiment.caro',
      version: 1.2,
      migrate(persistedState, version) {
        const state = persistedState as TCaroStateType;
        // 1.2 made "hard machine" the default, so saved games move to it with a fresh board.
        if (version < 1.2)
          return {
            ...state,
            metadata: {
              ...DEFAULT_METADATA,
              ...state.metadata,
              playMode: DEFAULT_METADATA.playMode,
              machineLevel: DEFAULT_METADATA.machineLevel,
              machineTurn: DEFAULT_METADATA.machineTurn,
              // Override is not available against the machine.
              isOverride: false,
              preWinner: 0,
            },
            numberOfBlindError: { 0: 0, 1: 0 },
            isBlindForceOver: false,
            turn: 0,
            steps: {},
            stepsOrder: [],
            winState: undefined,
          };
        return state;
      },
      partialize: (state) => {
        const { fn, ...rest } = state;
        if (rest.metadata.playMode == 'online') {
          const metadata: TCaroMetadataType = {
            ...rest.metadata,
            playMode: 'offline',
            preWinner: 0,
          };
          return {
            ...rest,
            metadata,
            isBlindForceOver: false,
            turn: 0,
            steps: {},
            stepsOrder: [],
            winState: undefined,
          };
        } else return rest;
      },
    }
  )
);
