import { CARO_DEV_LOG } from 'src/services/caro-dev-log';
import { tengenThreads } from 'src/services/caro-tengen/engine';
import { loadRapfi, TRapfi, TRapfiCaroNetwork, TRapfiFactory } from './engine';

/** Browser (worker) side of Rapfi: loads the WebAssembly build from /engines/rapfi once. */

const BASE_URL = '/engines/rapfi/';
// Our blocked-ends network (~12 MB), fetched only by players of that rule.
const CARO_URL = '/models/caro-rapfi/';

let loading: Promise<TRapfi | null> | undefined;
// What `loading` settled to; undefined while it is still loading.
let loaded: TRapfi | null | undefined;
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
      loadCaroNetwork: preloadRapfiCaroNetwork,
      onMessage: CARO_DEV_LOG ? recordTrace : undefined,
    });
  })()
    .catch((error) => {
      console.error('[caro] Rapfi could not start', error);
      return null;
    })
    .then((engine) => (loaded = engine));
  return loading;
}

/**
 * The engine if it has finished loading (null where it cannot run), or undefined while it is
 * still loading; starts loading it. Its files are about 10 MB, a minute on a slow connection, so
 * the hell level does not wait for them: Tengen plays until Rapfi is ready.
 */
export function readyRapfi() {
  void getRapfi();
  return loaded;
}
