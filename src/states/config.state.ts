import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface TConfigStateType {
  isSound: boolean;
  backgroundSound: boolean;
  fn: { setIsSound: () => void; setBackgroundSound: () => void };
}

export const useConfigStore = create<
  TConfigStateType,
  [['zustand/persist', unknown], ['zustand/immer', unknown]]
>(
  persist(
    immer((set) => {
      return {
        isSound: true,
        backgroundSound: true,
        fn: {
          setIsSound: () => {
            set((state) => {
              state.isSound = !state.isSound;
            });
          },
          setBackgroundSound: () => {
            set((state) => {
              state.backgroundSound = !state.backgroundSound;
            });
          },
        },
      };
    }),
    {
      name: 'experiment.config',
      version: 1.0,
      migrate(persistedState, version) {
        if (version < 1.0) {
          return { ...(persistedState as TConfigStateType) };
        }
        return persistedState;
      },
      partialize: (state) => {
        const { fn, ...rest } = state;
        return rest;
      },
    }
  )
);
