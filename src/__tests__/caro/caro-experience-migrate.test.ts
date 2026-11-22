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

  it('starts every older save over and retires the personal network', async () => {
    for (const version of [1, 2]) {
      expect(await migrate(saved, version)).toEqual({
        entries: [],
        lastGame: '',
        hellGames: [],
        hellTrainedGames: 0,
        epoch: 2,
      });
    }
  });

  it('keeps a current save', async () => {
    expect(await migrate(saved, 3)).toEqual(saved);
  });
});
