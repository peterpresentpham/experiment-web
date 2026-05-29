import { pikachuRoundTransformations } from 'src/configs/pikachu.constance';
import { getRandom } from 'src/services';
import { TPosition } from 'src/types/global';
import { TPikachuGame, TPikachuImg, TPikachuTransform } from 'src/types/pikachu.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type TPikachuMetadataType = {
  numberOfRows: number;
  numberOfColumns: number;
  numberOfLines: number;
  round: number;
  imgType: TPikachuImg;
  roundList: Array<TPikachuTransform>;
  randomRoundListIndex: number;
  gameType: TPikachuGame;
};

type TPikachuStateType = {
  metadata: TPikachuMetadataType;
  board: Array<Array<number>>;
  suggestion: Array<TPosition>;
  fn: {
    createBoard: (mode: 'newGame' | 'nextRound', board: number[][], path: TPosition[]) => void;
    changeBoard: (board: number[][], path: TPosition[]) => void;
    move: (board: Array<Array<number>>) => void;
    movePath: (board: Array<Array<number>>, path: Array<TPosition>) => void;
    moveChangeBoard: (board: Array<Array<number>>) => void;
    setMetadata: (metadata: Partial<TPikachuMetadataType>) => void;
  };
};

export const usePikachuStore = create<
  TPikachuStateType,
  [['zustand/persist', unknown], ['zustand/immer', unknown]]
>(
  persist(
    immer((set) => {
      return {
        metadata: {
          numberOfRows: 9,
          numberOfColumns: 16,
          numberOfLines: 2,
          round: 1,
          isSound: true,
          imgType: 'internal',
          roundList: pikachuRoundTransformations,
          randomRoundListIndex: -1,
          gameType: 'normal',
        },
        board: [],
        suggestion: [],
        fn: {
          createBoard: (mode: 'newGame' | 'nextRound', board: number[][], path: TPosition[]) => {
            set((state) => {
              const { roundList, round } = state.metadata;
              state.board = board;
              state.suggestion = path;
              if (mode == 'newGame' || round == roundList.length) state.metadata.round = 1;
              else {
                const round = state.metadata.round;
                state.metadata.round = round + 1;
              }
            });
          },
          changeBoard: (board: number[][], path: TPosition[]) => {
            set((state) => {
              state.board = board;
              state.suggestion = path;
            });
          },
          move: (board: Array<Array<number>>) => {
            set((state) => {
              state.board = board;
            });
          },
          movePath: (board: Array<Array<number>>, path: Array<TPosition>) => {
            set((state) => {
              state.board = board;
              state.suggestion = path;
            });
          },
          moveChangeBoard: (board: Array<Array<number>>) => {
            set((state) => {
              state.board = board;
            });
          },
          setMetadata: (metadata: Partial<TPikachuMetadataType>) => {
            set((state) => {
              state.metadata = { ...state.metadata, ...metadata };
              if (metadata.gameType == 'randomBoard')
                state.metadata.randomRoundListIndex = getRandom(state.metadata.roundList.length);
            });
          },
        },
      };
    }),
    {
      name: 'experiment.pikachu',
      version: 1.0,
      migrate(persistedState, version) {
        if (version < 1.0) return { ...(persistedState as TPikachuStateType) };
        return persistedState;
      },
      partialize: (state) => {
        const { fn, ...rest } = state;
        return rest;
      },
    }
  )
);
