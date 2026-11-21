import { tengenThreads } from 'src/services/caro-tengen/engine';
import { loadRapfi, TRapfi, TRapfiFactory } from './engine';

/** Browser (worker) side of Rapfi: loads the WebAssembly build from /engines/rapfi once. */

const BASE_URL = '/engines/rapfi/';

let loading: Promise<TRapfi | null> | undefined;

/**
 * The engine, or null where it cannot run (the caller falls back to Tengen). The multi-threaded
 * build needs cross-origin isolation for shared memory; both builds need WebAssembly SIMD.
 */
export function getRapfi() {
  loading ??= (async () => {
    if (typeof WebAssembly != 'object') return null;
    const isolated = self.crossOriginIsolated && typeof SharedArrayBuffer != 'undefined';
    const threads = tengenThreads({
      isolated,
      cores: navigator.hardwareConcurrency,
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints ?? 0,
    });
    const build = threads > 1 ? 'rapfi-multi-simd128' : 'rapfi-single-simd128';
    const url = `${BASE_URL}${build}.js`;
    // A file served from public/, not a module of the app: the bundler must leave it alone.
    const { default: factory } = (await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ url
    )) as { default: TRapfiFactory };
    return loadRapfi(factory, {
      threads,
      // Both builds share one copy of the networks.
      locateFile: (file) => BASE_URL + (file.endsWith('.data') ? 'rapfi.data' : file),
    });
  })().catch((error) => {
    console.error('[caro] Rapfi could not start', error);
    return null;
  });
  return loading;
}
