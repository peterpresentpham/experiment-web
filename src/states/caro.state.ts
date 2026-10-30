import { checkWin } from 'src/services/caro.utils';
import {
  TCaroGame,
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
        metadata: {
          playMode: 'offline',
          gameType: 'normal',
          winMode: 'blockOpponent',
          isOverride: false,
          size: 10,
          maxNumberOfBlindError: 5,
          preWinner: 0,
        },
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
      version: 1.0,
      migrate(persistedState, version) {
        if (version < 1.0) return { ...(persistedState as TCaroStateType) };
        return persistedState;
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
