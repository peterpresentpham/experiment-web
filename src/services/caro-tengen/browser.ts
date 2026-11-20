import { loadTengen, TTengen, TTengenHelperSetup, tengenThreads } from './engine';

/** Browser (worker) side of Tengen: loads the WebAssembly build from /engines/tengen once. */

const BASE_URL = '/engines/tengen/';

async function compile(file: string) {
  const url = BASE_URL + file;
  try {
    return await WebAssembly.compileStreaming(fetch(url));
  } catch {
    // Servers that do not send application/wasm defeat compileStreaming.
    return WebAssembly.compile(await (await fetch(url)).arrayBuffer());
  }
}

function spawnHelper(setup: TTengenHelperSetup) {
  const helper = new Worker(new URL('../../workers/tengen-helper.worker.ts', import.meta.url), {
    type: 'module',
  });
  helper.postMessage(setup);
}

let loading: Promise<TTengen | null> | undefined;

/** The engine, or null where WebAssembly cannot run it (the caller falls back to the network). */
export function getTengen() {
  loading ??= (async () => {
    if (typeof WebAssembly != 'object') return null;
    const threads = tengenThreads({
      isolated: self.crossOriginIsolated && typeof SharedArrayBuffer != 'undefined',
      cores: navigator.hardwareConcurrency,
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints ?? 0,
    });
    try {
      return await loadTengen({ compile, spawnHelper }, threads);
    } catch (error) {
      if (threads == 1) throw error;
      // Shared memory can run short; one thread always fits.
      return loadTengen({ compile }, 1);
    }
  })().catch((error) => {
    console.error('[caro] Tengen could not start', error);
    return null;
  });
  return loading;
}
