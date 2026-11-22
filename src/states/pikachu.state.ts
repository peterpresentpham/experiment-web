import {
  PIKACHU_NUM_TYPES,
  pikachuImageSets,
  pikachuRoundTransformations,
} from 'src/configs/pikachu.constance';
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
    setMetadata: (metadata: Partial<TPikachuMetadataType>) => void;
  };
};

type TPikachuSavedState = Pick<TPikachuStateType, 'metadata' | 'board' | 'suggestion'>;

/**
 * Version 2 replaced the 'internal' and 'external' (1025 Pokémon) image sets: a saved game moves to
 * the default set, and a board using pieces past the sets' range is dropped.
 */
export function migratePikachuState(persistedState: unknown, version: number) {
  const state = { ...(persistedState as TPikachuSavedState) };
  if (version < 2 && state.metadata) {
    if (!pikachuImageSets.includes(state.metadata.imgType))
      state.metadata = { ...state.metadata, imgType: 'magic' };
    if (state.board?.some((row) => row.some((value) => value > PIKACHU_NUM_TYPES))) {
      state.board = [];
      state.suggestion = [];
    }
  }
  return state as TPikachuStateType;
}

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
          imgType: 'magic',
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
              if (mode == 'newGame' || round >= roundList.length) state.metadata.round = 1;
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
      version: 2,
      migrate: migratePikachuState,
      partialize: (state) => {
        const { fn, ...rest } = state;
        return rest;
      },
    }
  )
);
