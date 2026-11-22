import { beforeEach, describe, expect, it, vi } from 'vitest';

// The hell level's engines, as the worker would have them: Rapfi may still be downloading.
const rapfi = { state: undefined as { think: () => Promise<number> } | null | undefined };
const tengenThink = vi.fn(() => 113);
vi.mock('src/services/caro-rapfi/browser', () => ({
  readyRapfi: () => rapfi.state,
  // A download that never ends here: a move that waited for it would time out.
  getRapfi: () =>
    rapfi.state === undefined ? new Promise(() => {}) : Promise.resolve(rapfi.state),
  preloadRapfiCaroNetwork: () => Promise.resolve(null),
  takeRapfiTrace: () => [],
}));
vi.mock('src/services/caro-tengen/browser', () => ({
  getTengen: () => Promise.resolve({ think: tengenThink }),
  getOpeningBook: () => Promise.resolve(new Map()),
}));

const { findTengenMove, warmUpTengen } = await import('src/services/caro-tengen/player');

const request = {
  steps: { 112: 0 },
  size: 15,
  winMode: 'blockOpponent',
  turn: 1,
} as const;

describe('findTengenMove', () => {
  beforeEach(() => tengenThink.mockClear());

  it('plays Tengen instead of waiting while Rapfi is still downloading', async () => {
    rapfi.state = undefined;
    expect(await findTengenMove(request, new Map())).toBe(113);
    expect(tengenThink).toHaveBeenCalledTimes(1);
  });

  it('plays Rapfi once it is ready', async () => {
    rapfi.state = { think: () => Promise.resolve(97) };
    expect(await findTengenMove(request, new Map())).toBe(97);
    expect(tengenThink).not.toHaveBeenCalled();
  });

  it('plays Tengen where Rapfi cannot run', async () => {
    rapfi.state = null;
    expect(await findTengenMove(request, new Map())).toBe(113);
  });
});

describe('warmUpTengen', () => {
  it('reports each engine as it finishes loading', async () => {
    rapfi.state = { think: () => Promise.resolve(97) };
    const seen: Array<unknown> = [];
    expect(await warmUpTengen('blockOpponent', (engines) => seen.push(engines))).toBe(true);
    expect(seen[0]).toEqual({ rapfi: 'loading', tengen: 'loading' });
    expect(seen.at(-1)).toEqual({ rapfi: 'ready', tengen: 'ready' });
    expect(seen).toHaveLength(3);
  });

  it('reports Rapfi as unavailable where it cannot run', async () => {
    rapfi.state = null;
    const seen: Array<unknown> = [];
    await warmUpTengen('non-blockOpponent', (engines) => seen.push(engines));
    expect(seen.at(-1)).toEqual({ rapfi: 'failed', tengen: 'ready' });
  });
});
