import { createRetryingLoad, LOAD_ATTEMPTS } from 'src/services/caro-tengen/retrying-load';
import { describe, expect, it, vi } from 'vitest';

const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {});

describe('createRetryingLoad', () => {
  it('tries a failed download again on the next request, and keeps a success', async () => {
    quiet();
    const load = vi
      .fn<() => Promise<string | null>>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('engine');
    const engine = createRetryingLoad(load, { name: 'test' });
    expect(engine.state()).toBe('loading');
    expect(await engine.get()).toBeNull();
    expect(engine.state()).toBe('failed');
    expect(engine.peek()).toBeNull();

    const retry = engine.get();
    expect(engine.state()).toBe('loading');
    expect(engine.peek()).toBeUndefined();
    expect(await retry).toBe('engine');
    expect(await engine.get()).toBe('engine');
    expect(engine.state()).toBe('ready');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('gives up after a few failed downloads', async () => {
    quiet();
    const load = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    const engine = createRetryingLoad(load, { name: 'test' });
    for (let i = 0; i < LOAD_ATTEMPTS + 2; i++) expect(await engine.get()).toBeNull();
    expect(load).toHaveBeenCalledTimes(LOAD_ATTEMPTS);
  });

  it('does not retry what this browser cannot run', async () => {
    quiet();
    const unsupported = vi.fn(() => Promise.resolve(null));
    const missingFeature = createRetryingLoad(unsupported, { name: 'test' });
    await missingFeature.get();
    await missingFeature.get();
    expect(unsupported).toHaveBeenCalledTimes(1);

    const broken = vi.fn(() => Promise.reject(new WebAssembly.CompileError('bad module')));
    const badModule = createRetryingLoad(broken, { name: 'test' });
    await badModule.get();
    await badModule.get();
    expect(broken).toHaveBeenCalledTimes(1);
    expect(badModule.state()).toBe('failed');
  });

  it('shares one load between callers', async () => {
    const load = vi.fn(() => Promise.resolve('engine'));
    const engine = createRetryingLoad(load, { name: 'test' });
    const [a, b] = await Promise.all([engine.get(), engine.get()]);
    expect([a, b]).toEqual(['engine', 'engine']);
    expect(load).toHaveBeenCalledTimes(1);
  });
});
