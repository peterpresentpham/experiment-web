import { TCaroWinMode, TTurn } from 'src/types/caro.type';

/**
 * Tengen (GPL-3.0, https://github.com/SXKA/tengen, see public/engines/tengen/NOTICE.md), a
 * classical gomoku/caro engine compiled to WebAssembly, hosted inside the caro worker. It blocks
 * while it searches, which is fine off the main thread.
 *
 * With cross-origin isolation the multi-threaded build runs here and helper workers join its
 * searches through shared memory; otherwise the single-threaded build runs alone.
 */

type TExports = {
  /** Exported by the single-threaded build only; the threaded one imports it. */
  memory: WebAssembly.Memory;
  __tls_size: WebAssembly.Global;
  __tls_align: WebAssembly.Global;
  tg_set_threads(threads: number): void;
  tg_alloc(size: number, align: number): number;
  tg_new(size: number, rule: number): number;
  tg_play(x: number, y: number): number;
  tg_think(ms: number, depth: number): number;
  tg_think_dynamic(optimumMs: number, hardMs: number, depth: number): number;
  tg_set_variety(margin: number, seed: number): void;
  tg_exclude(x: number, y: number): number;
};

export type TTengenSource = {
  /** Compiles `tengen.wasm` or `tengen-mt.wasm`. */
  compile: (file: 'tengen.wasm' | 'tengen-mt.wasm') => Promise<WebAssembly.Module>;
  /** Starts a search helper thread (multi-threaded build only). */
  spawnHelper?: (setup: TTengenHelperSetup) => void;
};

export type TTengenHelperSetup = {
  module: WebAssembly.Module;
  memory: WebAssembly.Memory;
  stackTop: number;
  tls: number;
  id: number;
};

export type TTengenTiming = { optimumMs: number; hardMs: number };

export type TTengenRequest = {
  steps: { [location: number]: TTurn };
  size: number;
  winMode: TCaroWinMode;
  turn: TTurn;
  /** Locations not to play unless nothing else is left, e.g. moves that lost here before. */
  exclude?: Iterable<number>;
};

/**
 * While fewer than `TENGEN_VARIETY_PLIES` stones are down, Tengen plays a random move among those
 * scoring within `TENGEN_VARIETY` evaluation units (200 per logistic unit, so about ±2.5% win
 * rate) of the best, so a player cannot win by replaying an opening that won before. Forced wins
 * and losses are never varied. Measured in self-play: varying every move cost about 50 Elo, these
 * settings stay within a few.
 */
export const TENGEN_VARIETY = 20;
export const TENGEN_VARIETY_PLIES = 20;

export type TTengenOptions = {
  /** See `TENGEN_VARIETY`; 0 always plays the best move. */
  variety?: number;
  /** See `TENGEN_VARIETY_PLIES`. */
  varietyPlies?: number;
  /** Seeds the random choice (not 0). */
  seed?: number;
};

/** Piskvork rule numbers: freestyle, and "freestyle caro" (a five blocked at both ends does not win). */
const RULE: Record<TCaroWinMode, number> = { 'non-blockOpponent': 0, blockOpponent: 8 };

const HELPER_STACK = 2 << 20;

/** A quiet middle-game position, alternating from Black, as (x, y). */
const CALIBRATION_STONES: Array<[number, number]> = [
  [7, 7],
  [8, 7],
  [7, 9],
  [9, 8],
  [5, 8],
  [9, 6],
];
const CALIBRATION_MS = 300;

/**
 * Nodes one search should reach: what one thread of an M1 searches in about 2 s, the setting
 * that beat the trained network 15-5. Slower devices get more time, up to `MAX_HARD_MS`.
 */
export const TARGET_NODES = 2_000_000;
const OPTIMUM_MS = 1_500;
const HARD_MS = 3_000;
const MAX_OPTIMUM_MS = 2_500;
const MAX_HARD_MS = 4_000;

/**
 * Time for one move: the engine stops near `optimumMs` once its best move is stable and may use
 * up to `hardMs` while it keeps changing. A device too slow to reach `TARGET_NODES` in the
 * optimum gets proportionally more, within the caps.
 */
export function tengenTiming(nodesPerSecond: number): TTengenTiming {
  const neededMs = nodesPerSecond > 0 ? (TARGET_NODES / nodesPerSecond) * 1_000 : MAX_OPTIMUM_MS;
  const optimumMs = Math.round(Math.min(MAX_OPTIMUM_MS, Math.max(OPTIMUM_MS, neededMs)));
  const hardMs = Math.round(Math.min(MAX_HARD_MS, Math.max(HARD_MS, optimumMs * 2)));
  return { optimumMs, hardMs };
}

/**
 * Search threads: one core is left for the page, phones and tablets get at most two (heat and
 * battery), and iPhones/iPads one, since their Safari runs out of shared memory after a while.
 */
export function tengenThreads(env: {
  isolated: boolean;
  cores: number;
  userAgent: string;
  maxTouchPoints: number;
}) {
  if (!env.isolated) return 1;
  const appleMobile =
    /iPhone|iPad|iPod/.test(env.userAgent) ||
    (/Macintosh/.test(env.userAgent) && env.maxTouchPoints > 1);
  if (appleMobile) return 1;
  const mobile = /Android|Mobile/.test(env.userAgent);
  return Math.max(1, Math.min(mobile ? 2 : 4, (env.cores || 1) - 1));
}

/**
 * The stones in an order Tengen accepts, alternating from Black. Black is whoever moved first:
 * the side to move when the counts are even, its opponent when the opponent has one more stone.
 * Returns null for an impossible position.
 */
export function tengenMoveOrder(steps: { [location: number]: TTurn }, turn: TTurn) {
  const mine: Array<number> = [];
  const theirs: Array<number> = [];
  for (const [location, owner] of Object.entries(steps))
    (owner == turn ? mine : theirs).push(Number(location));
  let first: Array<number>;
  let second: Array<number>;
  if (mine.length == theirs.length) [first, second] = [mine, theirs];
  else if (theirs.length == mine.length + 1) [first, second] = [theirs, mine];
  else return null;
  const order: Array<number> = [];
  for (let i = 0; i < first.length; i++) {
    order.push(first[i]);
    if (i < second.length) order.push(second[i]);
  }
  return order;
}

export type TTengen = {
  threads: number;
  nodesPerSecond: number;
  timing: TTengenTiming;
  /** Best move as a board location, or -1 when the engine has none (game over, full board). */
  think: (request: TTengenRequest, timing?: TTengenTiming) => number;
};

export async function loadTengen(
  source: TTengenSource,
  threads: number,
  options: TTengenOptions = {}
): Promise<TTengen> {
  const useThreads = threads > 1 && source.spawnHelper != undefined;
  const wasm = await source.compile(useThreads ? 'tengen-mt.wasm' : 'tengen.wasm');
  // The threaded module imports its memory, shared so helpers can join; 256 MB holds the hash
  // table and the helpers' stacks.
  const shared = useThreads
    ? new WebAssembly.Memory({ initial: 1024, maximum: 4096, shared: true })
    : null;
  let lastInfo = { nodes: 0 };
  const instance = await WebAssembly.instantiate(wasm, {
    env: {
      ...(shared ? { memory: shared } : {}),
      tg_now: () => performance.timeOrigin + performance.now(),
      tg_info: (_depth: number, _seldepth: number, _value: number, nodes: number) => {
        lastInfo = { nodes };
      },
    },
  });
  const engine = instance.exports as unknown as TExports;
  const count = useThreads ? threads : 1;
  if (useThreads) {
    for (let id = 1; id < count; id++) {
      const stack = engine.tg_alloc(HELPER_STACK, 16);
      const tls = engine.tg_alloc(
        engine.__tls_size.value as number,
        engine.__tls_align.value as number
      );
      source.spawnHelper!({
        module: wasm,
        memory: shared!,
        stackTop: stack + HELPER_STACK,
        tls,
        id,
      });
    }
  }
  engine.tg_set_threads(count);

  // A short search of a fixed middle-game position measures this device's speed (the empty
  // board is answered almost at once, so it says nothing).
  engine.tg_new(15, RULE.blockOpponent);
  for (const [x, y] of CALIBRATION_STONES) engine.tg_play(x, y);
  const startedAt = performance.now();
  engine.tg_think(CALIBRATION_MS, 0);
  const elapsedMs = performance.now() - startedAt;
  const nodesPerSecond = elapsedMs > 0 ? (lastInfo.nodes / elapsedMs) * 1_000 : 0;
  const timing = tengenTiming(nodesPerSecond);
  // Seeded after the calibration, which must measure a plain search.
  const variety = options.variety ?? TENGEN_VARIETY;
  const varietyPlies = options.varietyPlies ?? TENGEN_VARIETY_PLIES;
  engine.tg_set_variety(0, options.seed ?? 1 + Math.random() * 2 ** 32);

  function think(request: TTengenRequest, moveTiming = timing) {
    const order = tengenMoveOrder(request.steps, request.turn);
    if (!order) throw new Error('tengen: impossible position');
    if (engine.tg_new(request.size, RULE[request.winMode]) != 0)
      throw new Error(`tengen: unsupported board size ${request.size}`);
    for (const location of order) {
      if (engine.tg_play(location % request.size, Math.floor(location / request.size)) < 0)
        throw new Error('tengen: illegal position');
    }
    engine.tg_set_variety(order.length < varietyPlies ? variety : 0, 0);
    for (const location of request.exclude ?? [])
      engine.tg_exclude(location % request.size, Math.floor(location / request.size));
    const packed = engine.tg_think_dynamic(moveTiming.optimumMs, moveTiming.hardMs, 0);
    if (packed < 0) return -1;
    return (packed >> 8) * request.size + (packed & 0xff);
  }

  return { threads: count, nodesPerSecond, timing, think };
}
