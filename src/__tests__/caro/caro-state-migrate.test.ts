// @vitest-environment jsdom
// The persist middleware only attaches its API when browser storage exists.
import { useCaroStore } from 'src/states/caro.state';
import { describe, expect, it } from 'vitest';

const migrate = useCaroStore.persist.getOptions().migrate!;

function savedGame(metadata: object) {
  return {
    metadata: { playMode: 'offline', gameType: 'normal', winMode: 'blockOpponent', ...metadata },
    numberOfBlindError: { 0: 1, 1: 0 },
    isBlindForceOver: false,
    turn: 1,
    steps: { 112: 0 },
    stepsOrder: [112],
    winState: undefined,
  };
}

describe('caro store migration', () => {
  it('starts every older save over: default settings and an empty board', () => {
    for (const version of [1.1, 1.3, 1.4]) {
      const state = migrate(
        savedGame({ playMode: 'offline', machineLevel: 'easy', size: 15 }),
        version
      ) as ReturnType<typeof useCaroStore.getState>;
      expect(state.metadata).toMatchObject({
        playMode: 'machine',
        machineLevel: 'hell',
        size: 20,
        machineTurn: 1,
      });
      expect(state.steps).toEqual({});
      expect(state.stepsOrder).toEqual([]);
      expect(state.turn).toBe(0);
      expect(state.numberOfBlindError).toEqual({ 0: 0, 1: 0 });
    }
  });

  it('leaves a current save alone', () => {
    const saved = savedGame({ size: 10 });
    expect(migrate(saved, 1.5)).toBe(saved);
  });
});
