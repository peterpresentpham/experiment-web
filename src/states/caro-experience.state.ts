import { MAX_REPLAY_GAMES, THellGame } from 'src/services/caro-hell/encode';
import { mergeExperience, TExperienceEntry } from 'src/services/caro-machine/experience';
import { TCaroHellEngines } from 'src/types/caro.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TEntries = Array<[string, TExperienceEntry]>;

/** Whether a trained hell model is deployed; unknown until the hell level is first used. */
export type THellModelStatus = 'unknown' | 'ready' | 'missing';

interface TCaroExperienceStateType {
  /** The machine's book of lessons from lost games, kept in this browser only. */
  entries: TEntries;
  /** A finished game is being analysed in the background. */
  isLearning: boolean;
  /** Moves of the last analysed game, so a reload does not analyse it twice. */
  lastGame: string;
  /** Recent hell-level games, replayed during fine-tuning so older lessons are not forgotten. */
  hellGames: Array<THellGame>;
  /** Hell games the network has been fine-tuned on in this browser. */
  hellTrainedGames: number;
  /** Bumped by "clear memory"; the personal network copy is keyed by it, so it starts over. */
  epoch: number;
  hellModel: THellModelStatus;
  /** Loading state of the hell level's engines; null until the level first warms them up. */
  hellEngines: TCaroHellEngines | null;
  /** The machine could not move even after its worker was restarted and the page reloaded. */
  isMachineBroken: boolean;
  fn: {
    /** Saves what was learned from `game` and marks that game as done. */
    finishLearning: (game: string, entries: TEntries) => void;
    /** Records a hell game the network was just fine-tuned on. */
    addHellGame: (game: THellGame) => void;
    setLearning: (isLearning: boolean) => void;
    setHellModel: (status: THellModelStatus) => void;
    setHellEngines: (engines: TCaroHellEngines) => void;
    setMachineBroken: (isMachineBroken: boolean) => void;
    clear: () => void;
  };
}

export const useCaroExperienceStore = create<TCaroExperienceStateType>()(
  persist(
    (set, get) => ({
      entries: [],
      isLearning: false,
      lastGame: '',
      hellGames: [],
      hellTrainedGames: 0,
      epoch: 0,
      hellModel: 'unknown',
      hellEngines: null,
      isMachineBroken: false,
      fn: {
        finishLearning: (game, entries) => {
          if (entries.length == 0) return set({ lastGame: game });
          const book = mergeExperience(new Map(get().entries), entries);
          set({ entries: [...book], lastGame: game });
        },
        addHellGame: (game) =>
          set((state) => ({
            hellGames: [...state.hellGames, game].slice(-MAX_REPLAY_GAMES),
            hellTrainedGames: state.hellTrainedGames + 1,
          })),
        setLearning: (isLearning) => set({ isLearning }),
        setHellModel: (hellModel) => set({ hellModel }),
        setHellEngines: (hellEngines) => set({ hellEngines }),
        setMachineBroken: (isMachineBroken) => set({ isMachineBroken }),
        clear: () =>
          set((state) => ({
            entries: [],
            lastGame: '',
            hellGames: [],
            hellTrainedGames: 0,
            epoch: state.epoch + 1,
          })),
      },
    }),
    {
      name: 'experiment.caro.experience',
      version: 3,
      // Version 3 starts every player over, as "clear memory" does: lessons and games from before
      // the blocked-ends rule fix are dropped, and the bumped epoch retires the personal network.
      migrate: (persisted, version) => {
        const state = persisted as Pick<
          TCaroExperienceStateType,
          'entries' | 'lastGame' | 'hellGames' | 'hellTrainedGames' | 'epoch'
        >;
        if (version >= 3) return state;
        return {
          entries: [],
          lastGame: '',
          hellGames: [],
          hellTrainedGames: 0,
          epoch: (state.epoch ?? 0) + 1,
        };
      },
      partialize: (state) => ({
        entries: state.entries,
        lastGame: state.lastGame,
        hellGames: state.hellGames,
        hellTrainedGames: state.hellTrainedGames,
        epoch: state.epoch,
      }),
    }
  )
);
