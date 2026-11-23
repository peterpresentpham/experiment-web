import { CARO_DEV_LOG } from 'src/services/caro-dev-log';
import { tengenThreads } from 'src/services/caro-tengen/engine';
import { createRetryingLoad } from 'src/services/caro-tengen/retrying-load';
import { loadRapfi, TRapfi, TRapfiCaroNetwork, TRapfiFactory } from './engine';

/** Browser (worker) side of Rapfi: loads the WebAssembly build from /engines/rapfi once. */

const BASE_URL = '/engines/rapfi/';
// Our blocked-ends network (~12 MB), fetched only by players of that rule.
const CARO_URL = '/models/caro-rapfi/';

let caroNetwork: Promise<TRapfiCaroNetwork> | undefined;

// Development log: Rapfi's search report and weight loads since the last call.
let trace: Array<string> = [];
/** Returns and clears what Rapfi reported since the last call (always empty in production). */
export function takeRapfiTrace() {
  const lines = trace;
  trace = [];
  return lines;
}
function recordTrace(line: string) {
  if (/^MESSAGE (Speed|Bestline)|load weight|Evaluator|ERROR/.test(line)) trace.push(line);
  // Only the latest depth report and best line matter; keep the list short.
  if (trace.length > 12) trace.splice(0, trace.length - 12);
}

async function fetchBytes(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Whether the blocked-ends network is used. Off while it is retrained: the shipped one (iteration
 * 0) learned from games of the engine before its caro rule fix, and on the fixed engine it loses to
 * the classical evaluation (-107 Elo, see docs/plans/caro-tengen-roadmap.md). Turn it back on with
 * a network that beats the classical evaluation.
 */
const CARO_NETWORK_ENABLED = false;

/**
 * Starts downloading the blocked-ends network, once; the engine awaits it on its first game.
 * Resolves to null (classical evaluation) while the network is turned off.
 */
export function preloadRapfiCaroNetwork(): Promise<TRapfiCaroNetwork | null> {
  if (!CARO_NETWORK_ENABLED) return Promise.resolve(null);
  caroNetwork ??= Promise.all([
    fetchBytes(`${CARO_URL}config.toml`),
    fetchBytes(`${CARO_URL}caro.bin.lz4`),
  ]).then(([config, network]) => ({ config, network }));
  // Forget a failed download, so the engine fetches it again when its first game asks for it.
  caroNetwork.catch(() => (caroNetwork = undefined));
  return caroNetwork;
}

// The smallest module with a SIMD instruction (as wasm-feature-detect checks it).
const SIMD_PROBE = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15,
  253, 98, 11,
]);

// Browsers may keep a failed import() of a URL as failed: a retry asks for another URL.
let imports = 0;

const rapfi = createRetryingLoad<TRapfi>(
  async () => {
    if (typeof WebAssembly != 'object') return null;
    // Both builds need SIMD. Without it the browser can never run them: checked here, so the
    // 10 MB of files are not downloaded again and again for nothing.
    if (!WebAssembly.validate(SIMD_PROBE)) return null;
    const isolated = self.crossOriginIsolated && typeof SharedArrayBuffer != 'undefined';
    const threads = tengenThreads({
      isolated,
      cores: navigator.hardwareConcurrency,
      userAgent: navigator.userAgent,
      maxTouchPoints: navigator.maxTouchPoints ?? 0,
    });
    const build = threads > 1 ? 'rapfi-multi-simd128' : 'rapfi-single-simd128';
    imports++;
    const url = `${BASE_URL}${build}.js${imports > 1 ? `?retry=${imports}` : ''}`;
    // A file served from public/, not a module of the app: the bundler must leave it alone.
    const { default: factory } = (await import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ url
    )) as { default: TRapfiFactory };
    return loadRapfi(factory, {
      threads,
      // Both builds share one copy of the networks.
      locateFile: (file) => BASE_URL + (file.endsWith('.data') ? 'rapfi.data' : file),
      loadCaroNetwork: preloadRapfiCaroNetwork,
      onMessage: CARO_DEV_LOG ? recordTrace : undefined,
    });
  },
  { name: 'Rapfi' }
);

/**
 * The engine, or null where it cannot run or its download failed (the caller falls back to
 * Tengen; a failed download is tried again on the next call). The multi-threaded build needs
 * cross-origin isolation for shared memory; both builds need WebAssembly SIMD.
 */
export const getRapfi = rapfi.get;

/**
 * The engine if it has finished loading (null where it cannot run), or undefined while it is
 * still loading; starts (or retries) loading it. Its files are about 10 MB, a minute on a slow
 * connection, so the hell level does not wait for them: Tengen plays until Rapfi is ready.
 */
export function readyRapfi() {
  void rapfi.get();
  return rapfi.peek();
}

/** Whether the engine is loading, ready, unavailable, or owes a late answer (see TRapfi). */
export function rapfiLoadState() {
  const state = rapfi.state();
  return state == 'ready' && rapfi.peek()?.isBroken() ? 'failed' : state;
}
