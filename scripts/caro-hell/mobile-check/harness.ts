/* eslint-disable no-console -- command-line script */
import { execSync } from 'node:child_process';
import { Browser, BrowserContext, chromium, devices, Page, Worker } from 'playwright-core';

/**
 * Shared parts of the mobile checks (docs/plans/caro-mobile-risks.md): a Chrome page on the caro
 * hell level, seeded with a fresh game, with the machine's workers, network and reports observed.
 */

export const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export type TProfile = 'android' | 'iphone' | 'desktop';
export type TNetwork = 'none' | '3g';

const DEVICES: Record<TProfile, object> = {
  android: devices['Pixel 7'],
  // Chrome with an iPhone's user agent and screen: the app's one-thread path, not Safari.
  iphone: devices['iPhone 13'],
  desktop: { viewport: { width: 1280, height: 800 } },
};

const NETWORKS = {
  '3g': {
    offline: false,
    latency: 150,
    downloadThroughput: 1.6e6 / 8,
    uploadThroughput: 0.75e6 / 8,
  },
};

export type TGameOptions = {
  url: string;
  profile: TProfile;
  network?: TNetwork;
  size?: 15 | 20;
  level?: 'hell' | 'hard';
  /** The machine plays the first move. */
  machineFirst?: boolean;
  /** Extra Chrome flags, e.g. a remote debugging port. */
  args?: Array<string>;
  /** Installs request routes before the page loads. */
  routes?: (context: BrowserContext) => Promise<void>;
  /** Runs on the blank page before the game loads. */
  beforeLoad?: (page: Page) => Promise<void>;
};

export type TReport = {
  winner: number | null;
  timing?: { moves: Array<{ at: number; ms: number; source: string }> };
};

export type TSession = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  started: number;
  /** Seconds since the page was opened, for log lines. */
  t: () => string;
  workers: Set<Worker>;
  maxWorkers: { value: number };
  /** Requests for the network the hell level falls back to. */
  networkRequests: { value: number };
  reports: Array<TReport>;
  reloads: { value: number };
  close: () => Promise<void>;
};

export async function openGame(options: TGameOptions): Promise<TSession> {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: options.args,
  });
  const context = await browser.newContext({ ...DEVICES[options.profile] });
  const metadata = {
    playMode: 'machine',
    gameType: 'normal',
    winMode: 'blockOpponent',
    isOverride: false,
    size: options.size ?? 15,
    maxNumberOfBlindError: 5,
    preWinner: 0,
    machineLevel: options.level ?? 'hell',
    machineTurn: options.machineFirst ? 0 : 1,
  };
  await context.addInitScript((metadata) => {
    // Main-thread blocking: the longest task the page itself ran (read and reset by `uiLag`).
    // A late timer would also count waits for the CPU, which the efficiency-core setup makes
    // long for any page.
    const self = window as unknown as { __lag: number };
    self.__lag = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) self.__lag = Math.max(self.__lag, entry.duration);
    }).observe({ type: 'longtask', buffered: false });
    // Seeded once a tab: a reload keeps the game it had.
    if (sessionStorage.getItem('check-seeded')) return;
    sessionStorage.setItem('check-seeded', '1');
    const state = {
      metadata,
      steps: {},
      stepsOrder: [],
      turn: 0,
      numberOfBlindError: { 0: 0, 1: 0 },
    };
    localStorage.setItem('experiment.caro', JSON.stringify({ version: 1.5, state }));
  }, metadata);

  const reports: Array<TReport> = [];
  await context.route('**/api/caro/games', async (route) => {
    reports.push(JSON.parse(route.request().postData() ?? '{}') as TReport);
    await route.fulfill({ status: 204 });
  });
  await options.routes?.(context);

  const page = await context.newPage();
  const started = Date.now();
  const t = () => `${((Date.now() - started) / 1000).toFixed(1)}s`;
  if (options.network && options.network != 'none') {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.emulateNetworkConditions', NETWORKS[options.network]);
  }
  const workers = new Set<Worker>();
  const maxWorkers = { value: 0 };
  page.on('worker', (worker) => {
    workers.add(worker);
    maxWorkers.value = Math.max(maxWorkers.value, workers.size);
    worker.on('close', () => workers.delete(worker));
  });
  const networkRequests = { value: 0 };
  page.on('request', (request) => {
    if (request.url().includes('/models/caro-hell/')) networkRequests.value++;
  });
  // Full page loads after the first: reloads (navigations inside the page do not count).
  const reloads = { value: -1 };
  page.on('domcontentloaded', () => reloads.value++);
  await options.beforeLoad?.(page);
  await page.goto(`${options.url}/vi/caro`);
  await cells(page).nth(0).waitFor({ timeout: 120_000 });
  return {
    browser,
    context,
    page,
    started,
    t,
    workers,
    maxWorkers,
    networkRequests,
    reports,
    reloads,
    close: () => browser.close(),
  };
}

export const cells = (page: Page) => page.locator('div[role="button"][aria-label]');
export const stones = (page: Page) => page.locator('div[role="button"][aria-label] > span').count();

/** The status line and the engine badge, as one string. */
export async function header(page: Page) {
  return (
    await page
      .locator('[aria-live="polite"]')
      .allTextContents()
      .catch(() => [])
  ).join('|');
}
export const isOver = async (page: Page) => /thắng|Hòa/.test(await header(page));
export const engineBadge = async (page: Page) =>
  (await header(page)).match(
    /Đang tải engine…|Đang tải Rapfi…|Rapfi|Tengen|Không có engine/
  )?.[0] ?? '';
export const isBrokenNoticeShown = (page: Page) =>
  page.getByRole('alert').filter({ hasText: 'Máy không đi được' }).isVisible();

/** Waits until the board has `count` stones; the milliseconds it took, or null on a timeout. */
export async function waitStones(page: Page, count: number, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if ((await stones(page).catch(() => 0)) >= count) return Date.now() - start;
    if (await isOver(page).catch(() => false)) return Date.now() - start;
    await page.waitForTimeout(100);
  }
  return null;
}

// Moves far from the centre leave the opening book, so the engines have to answer.
const ORDER = [16, 0, 14, 28, 42, 210, 224, 196, 182, 2, 4, 6, 8, 10, 12];

/** Plays the player's next move; the milliseconds until the machine answered, or null. */
export async function playMove(page: Page, timeoutMs = 60_000) {
  const free = await page.$$eval('div[role="button"][aria-label]', (elements) =>
    elements.map((element) => element.querySelector('span') == null)
  );
  const target = ORDER.find((index) => free[index]) ?? free.findIndex(Boolean);
  const before = await stones(page);
  await cells(page).nth(target).click({ timeout: 10_000 });
  return waitStones(page, before + 2, timeoutMs);
}

export async function newGame(page: Page) {
  await page.getByRole('button', { name: 'Ván mới' }).first().click();
  await page.waitForTimeout(500);
}

/** Plays until the game is over; every machine answer time, in milliseconds (null: none). */
export async function playGame(page: Page, maxMoves = 60) {
  const times: Array<number | null> = [];
  for (let move = 0; move < maxMoves && !(await isOver(page)); move++) {
    times.push(await playMove(page));
    if (times.at(-1) == null) break;
  }
  return times;
}

/** The longest task the page ran on its main thread since the last call, in milliseconds. */
export function uiLag(page: Page) {
  return page.evaluate(() => {
    const self = window as unknown as { __lag: number };
    const lag = self.__lag;
    self.__lag = 0;
    return Math.round(lag);
  });
}

/**
 * Total CPU time so far of this check's renderers (the page and its workers), in seconds, from
 * `ps`. Chrome's own processes are left out: their housekeeping is not the app's.
 */
function chromeCpuSeconds() {
  return execSync('ps -A -o time=,command=')
    .toString()
    .split('\n')
    .filter(
      (row) => row.includes('playwright_chromiumdev_profile') && row.includes('--type=renderer')
    )
    .reduce((sum, row) => {
      // [[dd-]hh:]mm:ss.cc
      const time = row.trim().split(/\s+/)[0].replace('-', ':').split(':').map(Number);
      return sum + time.reduce((total, part) => total * 60 + part, 0);
    }, 0);
}

/**
 * CPU the page and its workers use over the next `windowMs` (% of one core). `ps`'s own %cpu is a
 * decaying average, still high long after a busy minute.
 */
export async function chromeCpu(windowMs = 5_000) {
  const before = chromeCpuSeconds();
  await new Promise((resolve) => setTimeout(resolve, windowMs));
  return Math.round(((chromeCpuSeconds() - before) / (windowMs / 1_000)) * 100);
}

export type TResult = { id: string; passed: boolean | null; detail: string };

export function result(id: string, passed: boolean | null, detail: string): TResult {
  const label = passed == null ? 'BỎ QUA' : passed ? 'ĐẠT' : 'TRƯỢT';
  console.log(`[${id}] ${label}: ${detail}`);
  return { id, passed, detail };
}

/** A raw CDP connection to the whole browser, for what Playwright does not reach (workers). */
export async function browserCdp(port: number) {
  const version = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()) as {
    webSocketDebuggerUrl: string;
  };
  const socket = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  let nextId = 0;
  const pending = new Map<number, (value: unknown) => void>();
  type TEvent = { method: string; params: Record<string, unknown>; sessionId?: string };
  const listeners: Array<(event: TEvent) => void> = [];
  socket.onmessage = (message) => {
    const data = JSON.parse(String(message.data)) as { id?: number; result?: unknown } & TEvent;
    if (data.id != undefined) pending.get(data.id)?.(data.result);
    else listeners.forEach((listener) => listener(data));
  };
  function send<T>(method: string, params: object = {}, sessionId?: string) {
    const id = ++nextId;
    socket.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise<T>((resolve) => pending.set(id, (value) => resolve(value as T)));
  }
  return {
    send,
    on: (listener: (event: TEvent) => void) => listeners.push(listener),
    close: () => socket.close(),
  };
}

/**
 * Blocks every script the page's workers load themselves (Playwright's routes only see the
 * page's requests; a worker has no Fetch domain, so they fail as blocked rather than 404) for
 * workers started while `isBlocking()` holds: a tab of an old build after a deploy.
 */
export async function blockWorkerScripts(port: number, pageUrl: string, isBlocking: () => boolean) {
  const cdp = await browserCdp(port);
  const blocked = { value: 0 };
  cdp.on((event) => {
    if (event.method != 'Target.attachedToTarget') return;
    const sessionId = event.params.sessionId as string;
    const info = event.params.targetInfo as { type: string };
    if (info.type != 'worker') return;
    const block = isBlocking();
    if (block) blocked.value++;
    void cdp
      .send('Network.enable', {}, sessionId)
      .then(() =>
        cdp.send(
          'Network.setBlockedURLs',
          { urls: block ? ['*/_next/static/chunks/*'] : [] },
          sessionId
        )
      )
      .then(() => cdp.send('Runtime.runIfWaitingForDebugger', {}, sessionId));
  });
  const { targetInfos } = await cdp.send<{
    targetInfos: Array<{ targetId: string; type: string; url: string }>;
  }>('Target.getTargets');
  const target = targetInfos.find((info) => info.type == 'page' && info.url.startsWith(pageUrl));
  if (!target) throw new Error(`no page at ${pageUrl}`);
  const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true,
  });
  // Workers started from now on wait until their requests are intercepted.
  await cdp.send(
    'Target.setAutoAttach',
    { autoAttach: true, waitForDebuggerOnStart: true, flatten: true },
    sessionId
  );
  return { blocked, close: cdp.close };
}

/**
 * Runs in each worker before its own code: remembers every WebAssembly memory it makes, and the
 * time Tengen is given for each search.
 */
const TRACK_MEMORIES = `(() => {
  const memories = (self.__memories = []);
  const Memory = WebAssembly.Memory;
  WebAssembly.Memory = function (descriptor) {
    const memory = new Memory(descriptor);
    memories.push(memory);
    return memory;
  };
  WebAssembly.Memory.prototype = Memory.prototype;
  // Tengen's time for each search: [optimumMs, hardMs].
  const thinks = (self.__thinks = []);
  const keep = (result) => {
    const instance = result.instance ?? result;
    const exports = instance.exports;
    for (const value of Object.values(exports))
      if (value instanceof Memory && !memories.includes(value)) memories.push(value);
    if (typeof exports.tg_think_dynamic != 'function') return result;
    // Instance exports are frozen: hand back a copy with the search wrapped.
    const wrapped = Object.assign({}, exports, {
      tg_think_dynamic: (optimumMs, hardMs, depth) => {
        thinks.push([optimumMs, hardMs]);
        return exports.tg_think_dynamic(optimumMs, hardMs, depth);
      },
    });
    const copy = { exports: wrapped };
    return result.instance ? { module: result.module, instance: copy } : copy;
  };
  for (const name of ['instantiate', 'instantiateStreaming']) {
    const original = WebAssembly[name];
    WebAssembly[name] = (...args) => original(...args).then(keep);
  }
})()`;

/**
 * Tracks the WebAssembly memories of the page's workers (the engines' search tables live there,
 * out of reach of `measureUserAgentSpecificMemory`, which gives up on workers blocked in a wait).
 * `measure()` gives each memory of the workers still running and their sum, in MB.
 */
export async function trackWorkers(port: number, pageUrl: string) {
  const cdp = await browserCdp(port);
  const workers = new Set<string>();
  cdp.on((event) => {
    if (event.method == 'Target.detachedFromTarget')
      workers.delete(event.params.sessionId as string);
    if (event.method != 'Target.attachedToTarget') return;
    const sessionId = event.params.sessionId as string;
    const info = event.params.targetInfo as { type: string };
    if (info.type != 'worker') return;
    workers.add(sessionId);
    void cdp
      .send('Runtime.evaluate', { expression: TRACK_MEMORIES }, sessionId)
      .then(() =>
        cdp.send(
          'Target.setAutoAttach',
          { autoAttach: true, waitForDebuggerOnStart: true, flatten: true },
          sessionId
        )
      )
      .then(() => cdp.send('Runtime.runIfWaitingForDebugger', {}, sessionId));
  });
  const { targetInfos } = await cdp.send<{
    targetInfos: Array<{ targetId: string; type: string; url: string }>;
  }>('Target.getTargets');
  const target = targetInfos.find((info) => info.type == 'page' && info.url.startsWith(pageUrl));
  if (!target) throw new Error(`no page at ${pageUrl}`);
  const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true,
  });
  await cdp.send(
    'Target.setAutoAttach',
    { autoAttach: true, waitForDebuggerOnStart: true, flatten: true },
    sessionId
  );

  async function measure() {
    // A shared memory is counted in the worker that made it (the others get it in a message);
    // workers blocked in a wait do not answer and made none.
    const sizes: Array<Array<number>> = [];
    for (const session of workers) {
      const reply = await Promise.race([
        cdp.send<{ result?: { value?: Array<number> } }>(
          'Runtime.evaluate',
          {
            expression: '(self.__memories ?? []).map((m) => m.buffer.byteLength)',
            returnByValue: true,
          },
          session
        ),
        new Promise<undefined>((resolve) => setTimeout(resolve, 2_000)),
      ]);
      sizes.push(reply?.result?.value ?? []);
    }
    const memories = sizes.flat().map((bytes) => Math.round(bytes / 2 ** 20));
    return { total: memories.reduce((sum, mb) => sum + mb, 0), memories };
  }
  /** Every Tengen search's [optimumMs, hardMs] so far. */
  async function tengenTimings() {
    const all: Array<[number, number]> = [];
    for (const session of workers) {
      const reply = await Promise.race([
        cdp.send<{ result?: { value?: Array<[number, number]> } }>(
          'Runtime.evaluate',
          { expression: 'self.__thinks ?? []', returnByValue: true },
          session
        ),
        new Promise<undefined>((resolve) => setTimeout(resolve, 2_000)),
      ]);
      all.push(...(reply?.result?.value ?? []));
    }
    return all;
  }
  return { measure, tengenTimings, close: cdp.close };
}
