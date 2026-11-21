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
  it('moves a 1.3 save to the 20x20 board with a fresh game, keeping its other settings', () => {
    const state = migrate(
      savedGame({ playMode: 'machine', machineLevel: 'easy', size: 15 }),
      1.3
    ) as ReturnType<typeof useCaroStore.getState>;
    expect(state.metadata.size).toBe(20);
    expect(state.metadata.machineLevel).toBe('easy');
    expect(state.stepsOrder).toEqual([]);
    expect(state.turn).toBe(0);
  });

  it('applies every later default to an old save', () => {
    const state = migrate(savedGame({ size: 10, machineLevel: 'easy' }), 1.1) as ReturnType<
      typeof useCaroStore.getState
    >;
    expect(state.metadata.playMode).toBe('machine');
    expect(state.metadata.machineLevel).toBe('hell');
    expect(state.metadata.size).toBe(20);
  });

  it('leaves a current save alone', () => {
    const saved = savedGame({ size: 10 });
    expect(migrate(saved, 1.4)).toBe(saved);
  });
});
