import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface TConfigStateType {
  isSound: boolean;
  backgroundSound: boolean;
  // 0..1, applied on top of each sound's own level.
  effectsVolume: number;
  musicVolume: number;
  fn: {
    setIsSound: () => void;
    setBackgroundSound: () => void;
    setEffectsVolume: (volume: number) => void;
    setMusicVolume: (volume: number) => void;
  };
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
        effectsVolume: 0.8,
        musicVolume: 0.6,
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
          setEffectsVolume: (volume) => {
            set((state) => {
              state.effectsVolume = Math.min(1, Math.max(0, volume));
            });
          },
          setMusicVolume: (volume) => {
            set((state) => {
              state.musicVolume = Math.min(1, Math.max(0, volume));
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
