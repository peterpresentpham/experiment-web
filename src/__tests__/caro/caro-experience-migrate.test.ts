// @vitest-environment jsdom
// The persist middleware only attaches its API when browser storage exists.
import { useCaroExperienceStore } from 'src/states/caro-experience.state';
import { describe, expect, it } from 'vitest';

const migrate = useCaroExperienceStore.persist.getOptions().migrate!;

describe('caro experience migration', () => {
  const saved = {
    entries: [['key', { avoid: [1], best: 2 }]],
    lastGame: 'game',
    hellGames: [{ moves: [112] }],
    hellTrainedGames: 3,
    epoch: 1,
  };

  it('drops version 1 lessons, learned with the old blockOpponent four rule, and keeps the games', async () => {
    const state = (await migrate(saved, 1)) as typeof saved;
    expect(state.entries).toEqual([]);
    expect(state.lastGame).toBe('');
    expect(state.hellGames).toEqual(saved.hellGames);
    expect(state.hellTrainedGames).toBe(3);
  });

  it('keeps lessons from the current version', async () => {
    expect(await migrate(saved, 2)).toEqual(saved);
  });
});
