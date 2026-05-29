import { checkWin } from 'src/services/connect4.utils';
import { TCaroGame, TConnect4WinStateType, TPlayMode, TTurn } from 'src/types/caro.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type TConnect4MetadataType = {
  numberOfRows: number;
  numberOfColumns: number;
  playMode: TPlayMode;
  gameType: TCaroGame;
  status: 'playing' | 'win';
  maxNumberOfBlindError: number;
};

type TConnect4Type = {
  metadata: TConnect4MetadataType;
  numberOfBlindError: { 0: number; 1: number };
  isBlindForceOver: boolean;
  turn: TTurn;
  steps: { [column: number]: Array<TTurn> };
  stepsOrder: Array<number>;
  winState?: TConnect4WinStateType;
  fn: {
    move: (column: number) => void;
    undo: () => void;
    reset: (turn?: TTurn) => void;
    countNumberOfBlindError: (turn: TTurn) => void;
    setMetadata: (metadata: Partial<TConnect4MetadataType>) => void;
  };
};

export const useConnect4Store = create<
  TConnect4Type,
  [['zustand/persist', unknown], ['zustand/immer', unknown]]
>(
  persist(
    immer((set) => {
      return {
        metadata: {
          numberOfRows: 6,
          numberOfColumns: 7,
          playMode: 'offline',
          gameType: 'normal',
          status: 'playing',
          maxNumberOfBlindError: 3,
          isSound: true,
        },
        numberOfBlindError: { 0: 0, 1: 0 },
        isBlindForceOver: false,
        turn: 0,
        steps: {},
        stepsOrder: [],
        fn: {
          move: (column: number) => {
            set((state) => {
              if (!state.steps[column]) state.steps[column] = [];
              state.steps[column].push(state.turn);
              state.stepsOrder.push(column);
              const _winState = checkWin({
                steps: state.steps,
                currentColumn: column,
                currentPlayer: state.turn,
                numberOfRows: state.metadata.numberOfRows,
                numberOfColumns: state.metadata.numberOfColumns,
              });
              if (_winState.winMode.length > 0) {
                state.winState = _winState;
                state.metadata.status = 'win';
              } else state.turn = (1 - state.turn) as TTurn;
            });
          },
          undo: () => {
            set((state) => {
              const len = state.stepsOrder.length;
              if (len > 1) {
                let currentColumn = state.stepsOrder[len - 1];
                state.steps[currentColumn].pop();
                state.stepsOrder.pop();

                currentColumn = state.stepsOrder[len - 2];
                state.steps[currentColumn].pop();
                state.stepsOrder.pop();
              }
            });
          },
          reset: (turn) => {
            set((state) => {
              state.metadata.status = 'playing';
              if (turn != undefined) state.turn = turn;
              state.steps = {};
              state.stepsOrder = [];
              state.winState = undefined;
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
          setMetadata: (
            metadata: Partial<Omit<TConnect4MetadataType, 'numberOfRows' | 'numberOfColumns'>>
          ) => {
            set((state) => {
              state.metadata = { ...state.metadata, ...metadata };
            });
          },
        },
      };
    }),
    {
      name: 'experiment.connect4',
      version: 1.0,
      migrate(persistedState, version) {
        if (version < 1.0) return { ...(persistedState as TConnect4Type) };
        return persistedState;
      },
      partialize: (state) => {
        const { fn, ...rest } = state;
        return rest;
      },
    }
  )
);
