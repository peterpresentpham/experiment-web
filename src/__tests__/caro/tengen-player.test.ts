import { beforeEach, describe, expect, it, vi } from 'vitest';

// The hell level's engines, as the worker would have them: Rapfi may still be downloading.
type TFakeRapfi = { think: () => Promise<number>; isBroken: () => boolean };
const rapfi = { state: undefined as TFakeRapfi | null | undefined };
const working = (move: number): TFakeRapfi => ({
  think: () => Promise.resolve(move),
  isBroken: () => false,
});
const tengenThink = vi.fn(() => 113);
vi.mock('src/services/caro-rapfi/browser', () => ({
  readyRapfi: () => rapfi.state,
  rapfiLoadState: () => 'ready',
  // A download that never ends here: a move that waited for it would time out.
  getRapfi: () =>
    rapfi.state === undefined ? new Promise(() => {}) : Promise.resolve(rapfi.state),
  preloadRapfiCaroNetwork: () => Promise.resolve(null),
  takeRapfiTrace: () => [],
}));
vi.mock('src/services/caro-tengen/browser', () => ({
  getTengen: () => Promise.resolve({ think: tengenThink }),
  getOpeningBook: () => Promise.resolve(new Map()),
  tengenLoadState: () => 'ready',
  readyTengen: () => undefined,
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
    expect(await findTengenMove(request, new Map())).toEqual({ location: 113, source: 'tengen' });
    expect(tengenThink).toHaveBeenCalledTimes(1);
  });

  it('plays Rapfi once it is ready', async () => {
    rapfi.state = working(97);
    expect(await findTengenMove(request, new Map())).toEqual({ location: 97, source: 'rapfi' });
    expect(tengenThink).not.toHaveBeenCalled();
  });

  it('hurries Tengen on a move Rapfi failed, after the player already waited', async () => {
    rapfi.state = {
      think: () => Promise.reject(new Error('rapfi: no answer in time')),
      isBroken: () => false,
    };
    vi.spyOn(console, 'error').mockImplementationOnce(() => {});
    expect(await findTengenMove(request, new Map())).toEqual({ location: 113, source: 'tengen' });
    expect(tengenThink).toHaveBeenCalledWith(expect.anything(), { optimumMs: 800, hardMs: 1_200 });
  });

  it('plays Tengen once Rapfi has stopped answering', async () => {
    const think = vi.fn(() => Promise.resolve(97));
    rapfi.state = { think, isBroken: () => true };
    expect(await findTengenMove(request, new Map())).toEqual({ location: 113, source: 'tengen' });
    expect(think).not.toHaveBeenCalled();
  });

  it('answers with the hard search, not the network, when Tengen has no answer', async () => {
    rapfi.state = null;
    tengenThink.mockImplementationOnce(() => {
      throw new Error('tengen: illegal position');
    });
    vi.spyOn(console, 'error').mockImplementationOnce(() => {});
    const found = await findTengenMove(request, new Map());
    expect(found?.source).toBe('search');
    expect(found?.location).toBeGreaterThanOrEqual(0);
    // Tengen offering a move that lost here before: the same.
    tengenThink.mockImplementationOnce(() => 112);
    expect((await findTengenMove(request, new Map()))?.source).toBe('search');
  });

  it('plays Tengen where Rapfi cannot run', async () => {
    rapfi.state = null;
    expect(await findTengenMove(request, new Map())).toEqual({ location: 113, source: 'tengen' });
  });
});

describe('warmUpTengen', () => {
  it('reports each engine as it finishes loading', async () => {
    rapfi.state = working(97);
    const seen: Array<unknown> = [];
    expect(await warmUpTengen('blockOpponent', (engines) => seen.push(engines))).toBe(true);
    expect(seen[0]).toEqual({ rapfi: 'loading', tengen: 'loading' });
    expect(seen.at(-1)).toEqual({ rapfi: 'ready', tengen: 'ready' });
    expect(seen).toHaveLength(3);
  });

  it('reports a Rapfi that stopped answering as failed', async () => {
    rapfi.state = { ...working(97), isBroken: () => true };
    const seen: Array<unknown> = [];
    await warmUpTengen('blockOpponent', (engines) => seen.push(engines));
    expect(seen.at(-1)).toEqual({ rapfi: 'failed', tengen: 'ready' });
  });

  it('reports Rapfi as unavailable where it cannot run', async () => {
    rapfi.state = null;
    const seen: Array<unknown> = [];
    await warmUpTengen('non-blockOpponent', (engines) => seen.push(engines));
    expect(seen.at(-1)).toEqual({ rapfi: 'failed', tengen: 'ready' });
  });
});
