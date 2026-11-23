/* eslint-disable no-console -- command-line script */
import {
  blockWorkerScripts,
  chromeCpu,
  trackWorkers,
  browserCdp,
  engineBadge,
  isBrokenNoticeShown,
  isOver,
  newGame,
  openGame,
  playGame,
  playMove,
  result,
  TProfile,
  TResult,
  uiLag,
  waitStones,
} from './harness';

/**
 * The browser checks K1-K9 of docs/plans/caro-mobile-risks.md, against a production build:
 *
 *   pnpm build && pnpm exec next start -p 3007
 *   taskpolicy -b pnpm caro:mobile-check --slow-cpu [--url http://localhost:3007] [--only K1,K3]
 *       [--baseline-url https://the-deployed-site]   (K5 compares memory with it)
 *
 * `taskpolicy -b` keeps Chrome on the efficiency cores, nearer a phone. Each check prints ĐẠT
 * (passed), TRƯỢT (failed) or BỎ QUA (skipped) with its numbers; the exit code is 1 when any
 * failed. K0 (tests, types, lint, build) runs separately. With `--slow-cpu` (see `SLOW_CPU`),
 * also run `pnpm caro:mobile-check --only K9` without `taskpolicy`.
 */

const args = process.argv.slice(2);
const option = (name: string) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};
const URL = option('url') ?? 'http://localhost:3007';
const BASELINE_URL = option('baseline-url');
const ONLY = option('only')?.split(',');
/**
 * Set when Chrome runs on the efficiency cores (`taskpolicy -b`): headless Chrome draws pages on
 * the CPU, so there any page shows long tasks. K9 then reports the interface delay without
 * judging it; run K9 alone without the flag for that.
 */
const SLOW_CPU = args.includes('--slow-cpu');
const PHONES: Array<TProfile> = ['android', 'iphone'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One K1 case: scripts of the machine's worker missing until the first reload (as when a reload
 * gets the new build), or for good. Returns the reloads, whether the machine moved, and whether
 * the player was told.
 */
async function missingScripts(where: 'bootstrap' | 'worker', untilReload: boolean) {
  const port = 9300 + Math.floor(Math.random() * 500);
  // Page loads so far, counted when each one is requested: before any of its scripts.
  let loads = 0;
  const isBlocking = () => !(untilReload && loads >= 2);
  let blocked = { value: 0 };
  let closeCdp = () => {};
  const session = await openGame({
    url: URL,
    profile: 'android',
    machineFirst: true,
    args: [`--remote-debugging-port=${port}`],
    routes: async (context) => {
      context.on('request', (request) => {
        if (request.isNavigationRequest() && request.resourceType() == 'document') loads++;
      });
      // The worker's first script, requested by the page.
      if (where == 'bootstrap')
        await context.route(/turbopack-worker/, (route) => {
          if (!isBlocking()) return route.continue();
          blocked.value++;
          return route.fulfill({ status: 404, body: '' });
        });
    },
    // The scripts the worker loads itself.
    beforeLoad:
      where == 'worker'
        ? async () => {
            const blocker = await blockWorkerScripts(port, 'about:blank', isBlocking);
            blocked = blocker.blocked;
            closeCdp = blocker.close;
          }
        : undefined,
  });
  try {
    const since = Date.now();
    while (session.reloads.value < 1 && Date.now() - since < 30_000) await sleep(100);
    const reloadMs = Date.now() - since;
    const moved = await waitStones(session.page, 1, untilReload ? 30_000 : 15_000);
    // Long enough for another reload, had the guard failed.
    if (!untilReload) await sleep(10_000);
    return {
      blocked: blocked.value,
      reloads: session.reloads.value,
      reloadMs,
      moved: moved != null && (await session.page.locator('div[role="button"] > span').count()) > 0,
      notice: await isBrokenNoticeShown(session.page),
    };
  } finally {
    closeCdp();
    await session.close();
  }
}

/** K1: a tab opened before a deploy, whose worker scripts are gone. */
async function k1(): Promise<TResult> {
  const lines: Array<string> = [];
  let passed = true;
  for (const where of ['bootstrap', 'worker'] as const) {
    const fixed = await missingScripts(where, true);
    const ok = fixed.blocked > 0 && fixed.reloads == 1 && fixed.moved && fixed.reloadMs <= 10_000;
    passed &&= ok;
    lines.push(
      `${where}: chặn ${fixed.blocked}, tải lại ${fixed.reloads} lần sau ${(fixed.reloadMs / 1000).toFixed(1)} s, máy ${fixed.moved ? 'đi được' : 'KHÔNG đi'}${ok ? '' : ' ← TRƯỢT'}`
    );
  }
  const stuck = await missingScripts('bootstrap', false);
  const ok = stuck.reloads == 1 && stuck.notice && !stuck.moved;
  passed &&= ok;
  lines.push(
    `vẫn thiếu sau khi tải lại: tải lại ${stuck.reloads} lần, thông báo ${stuck.notice ? 'có' : 'KHÔNG'}${ok ? '' : ' ← TRƯỢT'}`
  );
  return result('K1', passed, lines.join('; '));
}

/** K2: Tengen's download fails once; Rapfi never arrives. */
async function k2(): Promise<TResult> {
  let failures = 0;
  const session = await openGame({
    url: URL,
    profile: 'android',
    routes: async (context) => {
      await context.route(/tengen(-mt)?\.wasm/, (route) => {
        if (failures++ == 0) return route.fulfill({ status: 503, body: '' });
        return route.continue();
      });
      // Rapfi stays "loading": the moves are Tengen's or nobody's.
      await context.route(/rapfi\.data/, () => {});
    },
  });
  try {
    const times: Array<number | null> = [];
    for (let i = 0; i < 4; i++) times.push(await playMove(session.page, 30_000));
    const badge = await engineBadge(session.page);
    const slow = times.filter((time) => time == null || time > 10_000).length;
    return result(
      'K2',
      failures >= 2 &&
        session.networkRequests.value == 0 &&
        slow == 0 &&
        badge == 'Đang tải Rapfi…',
      `tengen tải ${failures} lần, nước (ms) ${times.join(', ')}, header "${badge}", tải mạng TF.js ${session.networkRequests.value} lần`
    );
  } finally {
    await session.close();
  }
}

/** K3: Rapfi's threads freeze mid-search (a locked phone); its late answer brings it back. */
async function k3(): Promise<TResult> {
  const port = 9300 + Math.floor(Math.random() * 500);
  const session = await openGame({
    url: URL,
    profile: 'android',
    args: [`--remote-debugging-port=${port}`],
  });
  const cdp = await browserCdp(port);
  try {
    const { page } = session;
    const readySince = Date.now();
    while ((await engineBadge(page)) != 'Rapfi' && Date.now() - readySince < 60_000) {
      if (await isOver(page)) await newGame(page);
      await playMove(page, 30_000);
    }
    if ((await engineBadge(page)) != 'Rapfi') return result('K3', null, 'Rapfi không tải xong');
    // Freeze Rapfi's own threads while it searches the next move.
    const { targetInfos } = await cdp.send<{
      targetInfos: Array<{ targetId: string; type: string; url: string }>;
    }>('Target.getTargets');
    const threads = targetInfos.filter(
      (target) => target.type == 'worker' && target.url.includes('rapfi')
    );
    if (threads.length == 0) return result('K3', null, 'không thấy luồng của Rapfi (bản 1 luồng?)');
    const sessions: Array<string> = [];
    for (const thread of threads) {
      const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', {
        targetId: thread.targetId,
        flatten: true,
      });
      await cdp.send('Debugger.enable', {}, sessionId);
      sessions.push(sessionId);
    }
    const answered = playMove(page, 30_000);
    await sleep(200);
    for (const sessionId of sessions) await cdp.send('Debugger.pause', {}, sessionId);
    await sleep(12_000);
    const duringFreeze = await engineBadge(page);
    for (const sessionId of sessions) await cdp.send('Debugger.resume', {}, sessionId);
    const frozenMoveMs = await answered;
    // The header follows after the next move.
    await sleep(3_000);
    if (!(await isOver(page))) await playMove(page, 30_000);
    if (!(await isOver(page))) await playMove(page, 30_000);
    const after = await engineBadge(page);
    return result(
      'K3',
      frozenMoveMs != null && frozenMoveMs <= 10_000 && after == 'Rapfi',
      `${threads.length} luồng Rapfi đóng băng 12 s: nước đó ${frozenMoveMs} ms, header lúc đóng băng "${duringFreeze}", sau đó "${after}"`
    );
  } finally {
    cdp.close();
    await session.close();
  }
}

/** K4: games lost in quick succession at the hard level: one analysis at a time. */
async function k4(): Promise<TResult> {
  const session = await openGame({ url: URL, profile: 'desktop', level: 'hard' });
  try {
    for (let game = 0; game < 4; game++) {
      await playGame(session.page);
      await newGame(session.page);
    }
    await sleep(2_000);
    // The playing worker and at most one learner.
    return result(
      'K4',
      session.maxWorkers.value <= 2,
      `nhiều nhất ${session.maxWorkers.value} worker cùng lúc sau 4 ván`
    );
  } finally {
    await session.close();
  }
}

async function memoryAfterTwoGames(url: string) {
  const port = 9300 + Math.floor(Math.random() * 500);
  let tracker: Awaited<ReturnType<typeof trackWorkers>> | undefined;
  const session = await openGame({
    url,
    profile: 'android',
    args: [`--remote-debugging-port=${port}`],
    beforeLoad: async () => {
      tracker = await trackWorkers(port, 'about:blank');
    },
  });
  try {
    for (let game = 0; game < 2; game++) {
      await playGame(session.page);
      await newGame(session.page);
    }
    await sleep(3_000);
    return await tracker!.measure();
  } finally {
    tracker?.close();
    await session.close();
  }
}

/** K5: the engines' WebAssembly memory on a phone after two games, against the deployed build. */
async function k5(): Promise<TResult> {
  const now = await memoryAfterTwoGames(URL);
  const parts = (memory: typeof now) => `${memory.total} MB [${memory.memories.join(' + ')}]`;
  if (!BASELINE_URL) return result('K5', null, `${parts(now)} (thiếu --baseline-url để so sánh)`);
  const before = await memoryAfterTwoGames(BASELINE_URL);
  const saved = (before.total - now.total) / before.total;
  return result(
    'K5',
    saved >= 0.3,
    `${parts(before)} → ${parts(now)} (giảm ${Math.round(saved * 100)}%)`
  );
}

/** K6: leaving the hell level frees its engines. */
async function k6(): Promise<TResult> {
  const session = await openGame({ url: URL, profile: 'desktop' });
  const { page } = session;
  try {
    const since = Date.now();
    while ((await engineBadge(page)) != 'Rapfi' && Date.now() - since < 60_000) await sleep(500);
    const before = session.workers.size;
    await page
      .getByRole('button', { name: /Đổi cài đặt/ })
      .first()
      .click();
    await page.getByRole('button', { name: 'Khó', exact: true }).click();
    await page.getByRole('button', { name: 'Lưu', exact: true }).click();
    await sleep(3_000);
    const after = session.workers.size;
    return result('K6', after <= 1 && before > after, `worker: ${before} → ${after}`);
  } finally {
    await session.close();
  }
}

/**
 * The time Tengen gave its searches (optimum ms) over a few moves, Rapfi kept from playing:
 * `rapfi` 'absent' fails its download at once, 'loading' compiles it beside Tengen's speed
 * measurement but never lets its data arrive.
 */
async function tengenTimings(rapfi: 'absent' | 'loading') {
  const port = 9300 + Math.floor(Math.random() * 500);
  let tracker: Awaited<ReturnType<typeof trackWorkers>> | undefined;
  const session = await openGame({
    url: URL,
    profile: 'desktop',
    args: [`--remote-debugging-port=${port}`],
    routes: (context) =>
      context.route(/rapfi\.data|rapfi-.*\.(js|wasm)/, (route) => {
        if (rapfi == 'absent') return route.abort();
        if (/rapfi\.data/.test(route.request().url())) return; // never answered
        return route.continue();
      }),
    beforeLoad: async () => {
      tracker = await trackWorkers(port, 'about:blank');
    },
  });
  try {
    for (let i = 0; i < 6 && !(await isOver(session.page)); i++)
      await playMove(session.page, 30_000);
    return (await tracker!.tengenTimings()).map(([optimumMs]) => optimumMs);
  } finally {
    tracker?.close();
    await session.close();
  }
}

/**
 * K7: Rapfi loading while Tengen measures its speed does not leave Tengen on a longer time.
 * Compares the time of the second search on: by then the speed was measured again (R7).
 */
async function k7(): Promise<TResult> {
  const absent = await tengenTimings('absent');
  const loading = await tengenTimings('loading');
  const settled = (times: Array<number>) => times.at(-1) ?? NaN;
  const gap = Math.abs(settled(loading) - settled(absent)) / settled(absent);
  return result(
    'K7',
    gap <= 0.2,
    `thời gian Tengen (ms) không Rapfi: ${absent.join(', ')}; Rapfi đang tải: ${loading.join(', ')}; lệch ${Math.round(gap * 100)}%`
  );
}

/** K8: nothing falls back to the TensorFlow.js network. */
async function k8(): Promise<TResult> {
  const lines: Array<string> = [];
  let passed = true;
  for (const profile of [...PHONES, 'desktop'] as const) {
    for (const size of [15, 20] as const) {
      const session = await openGame({
        url: URL,
        profile,
        size,
        network: profile == 'desktop' ? 'none' : '3g',
      });
      try {
        await playGame(session.page);
        await sleep(1_000);
        const sources = session.reports.flatMap(
          (report) => report.timing?.moves.map((move) => move.source) ?? []
        );
        const bad = session.networkRequests.value > 0 || sources.includes('network');
        passed &&= !bad;
        lines.push(
          `${profile} ${size}: ${[...new Set(sources)].join('/') || 'không có báo cáo'}${bad ? ' (MẠNG TF.js)' : ''}`
        );
      } finally {
        await session.close();
      }
    }
  }
  return result('K8', passed, lines.join('; '));
}

/** K9: everything together, per device: two games with an idle wait between them. */
async function k9(): Promise<TResult> {
  const lines: Array<string> = [];
  let passed = true;
  for (const profile of [...PHONES, 'desktop'] as const) {
    for (const machineFirst of [true, false]) {
      const session = await openGame({
        url: URL,
        profile,
        machineFirst,
        network: profile == 'desktop' ? 'none' : '3g',
      });
      const { page } = session;
      // When Rapfi's data finished downloading: it is then set up in the machine's worker.
      let rapfiDataAt = Infinity;
      page.on('requestfinished', (request) => {
        if (/rapfi\.data/.test(request.url())) rapfiDataAt = Date.now();
      });
      try {
        const first = machineFirst ? await waitStones(page, 1, 30_000) : null;
        await uiLag(page);
        const moveTimes: Array<number | null> = [];
        let afterRapfi: number | null = null;
        let lag = 0;
        for (let game = 0; game < 2; game++) {
          let wasRapfi = (await engineBadge(page)) == 'Rapfi';
          for (let move = 0; move < 60 && !(await isOver(page)); move++) {
            const startedAt = Date.now();
            const time = await playMove(page, 30_000);
            const isRapfi = (await engineBadge(page)) == 'Rapfi';
            // The move that sets Rapfi up (its data arrived meanwhile; with one thread that runs
            // in the playing worker) or is its first (starting its threads) may take longer.
            const setsUpRapfi = rapfiDataAt >= startedAt - 1_000 && rapfiDataAt <= Date.now();
            if ((isRapfi && !wasRapfi) || setsUpRapfi)
              afterRapfi = Math.max(afterRapfi ?? 0, time ?? Infinity);
            else moveTimes.push(time);
            wasRapfi = isRapfi;
            // The first reading also holds the page's start (hydration), not play.
            const moveLag = await uiLag(page);
            if (game > 0 || move > 0) lag = Math.max(lag, moveLag);
          }
          if (game == 0) {
            // The analysis of the game: CPU back to idle within 15 s, then the player waits.
            // An engine still downloading (Rapfi on 3G) is not the analysis: its loading
            // spinner alone costs headless Chrome, which draws on the CPU, about 25%.
            const endedAt = Date.now();
            while (/Đang tải/.test(await engineBadge(page)) && Date.now() - endedAt < 180_000)
              await sleep(1_000);
            await sleep(Math.max(0, 10_000 - (Date.now() - endedAt)));
            // Averaged over 15 s: any idle page (even without engines) shows short bursts of
            // timers on the efficiency cores, up to 9% over a 2.5 s window.
            const cpu = await chromeCpu(15_000);
            await sleep(machineFirst ? 20_000 : 95_000);
            lines.push(`${profile}${machineFirst ? ' máy đi trước' : ''}: CPU sau ván ${cpu}%`);
            passed &&= cpu < 5;
            await uiLag(page);
            await newGame(page);
            if (machineFirst) await waitStones(page, 1, 30_000);
          }
        }
        const slowest = Math.max(0, ...moveTimes.map((time) => time ?? Infinity));
        const ok =
          (first == null || first <= 5_000) &&
          slowest <= 5_000 &&
          (afterRapfi == null || afterRapfi <= 8_000) &&
          (SLOW_CPU || lag < 100);
        passed &&= ok;
        lines.push(
          `${profile}${machineFirst ? ' máy đi trước' : ''}: nước đầu ${first ?? '-'} ms, chậm nhất ${slowest} ms, nước đầu của Rapfi ${afterRapfi ?? '-'} ms, trễ giao diện ${lag} ms${ok ? '' : ' ← TRƯỢT'}`
        );
      } finally {
        await session.close();
      }
    }
  }
  return result('K9', passed, lines.join('; '));
}

const CHECKS: Record<string, () => Promise<TResult>> = {
  K1: k1,
  K2: k2,
  K3: k3,
  K4: k4,
  K5: k5,
  K6: k6,
  K7: k7,
  K8: k8,
  K9: k9,
};

async function main() {
  const results: Array<TResult> = [];
  for (const [id, check] of Object.entries(CHECKS)) {
    if (ONLY && !ONLY.includes(id)) continue;
    console.log(`[${id}] …`);
    results.push(
      await check().catch((error: unknown) => result(id, false, `lỗi: ${String(error)}`))
    );
  }
  const failed = results.filter((check) => check.passed === false).map((check) => check.id);
  console.log(failed.length == 0 ? 'Tất cả đạt.' : `Trượt: ${failed.join(', ')}`);
  process.exit(failed.length == 0 ? 0 : 1);
}

await main();
