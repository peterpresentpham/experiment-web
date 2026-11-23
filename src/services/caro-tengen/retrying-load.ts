import { TCaroEngineLoad } from 'src/types/caro.type';

/** Loads attempted per session; each later request for a failed load tries again, up to this. */
export const LOAD_ATTEMPTS = 3;

export type TRetryingLoad<T> = {
  /** The value; starts (or retries) the load when there is none yet. Null when unavailable. */
  get: () => Promise<T | null>;
  /** The value without waiting: undefined while it loads (or before the first `get`). */
  peek: () => T | null | undefined;
  state: () => TCaroEngineLoad;
};

/**
 * Whether a failure means this browser cannot run the file (it will not change by retrying), as
 * opposed to a failed download: a phone that lost the network for a moment.
 */
export function isPermanentLoadError(error: unknown) {
  if (typeof WebAssembly == 'object') {
    if (error instanceof WebAssembly.CompileError || error instanceof WebAssembly.LinkError)
      return true;
  }
  // Emscripten reports a module it could not compile as an abort naming the error.
  return error instanceof Error && /CompileError|LinkError/.test(error.message);
}

/**
 * A load that keeps only a success. A failed download is tried again the next time the value
 * is asked for (a move), up to `attempts` times; a load that resolves to null (the browser lacks
 * a feature) or fails with a permanent error is not.
 */
export function createRetryingLoad<T>(
  load: () => Promise<T | null>,
  options: { name: string; attempts?: number }
): TRetryingLoad<T> {
  const attempts = options.attempts ?? LOAD_ATTEMPTS;
  let value: T | null | undefined;
  let loading: Promise<T | null> | undefined;
  let tries = 0;
  let isPermanent = false;

  function get(): Promise<T | null> {
    if (value != null) return Promise.resolve(value);
    if (loading) return loading;
    if (isPermanent || tries >= attempts) return Promise.resolve(null);
    tries++;
    loading = load()
      .then((loaded) => {
        if (loaded == null) isPermanent = true;
        return loaded;
      })
      .catch((error: unknown) => {
        isPermanent = isPermanentLoadError(error);
        console.error(`[caro] ${options.name} could not start (try ${tries})`, error);
        return null;
      })
      .then((loaded) => {
        value = loaded;
        loading = undefined;
        return loaded;
      });
    return loading;
  }

  return {
    get,
    peek: () => (loading ? undefined : value),
    state: () => (loading || value === undefined ? 'loading' : value ? 'ready' : 'failed'),
  };
}
