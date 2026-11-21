/* eslint-disable no-console -- command-line script */
import { parseArgs } from 'node:util';
import { TCaroWinMode } from 'src/types/caro.type';
import { hardPlayer, hellPlayer, runArena } from './arena';
import { initBackend, loadModel, parseNumber } from './common';
import { makeEnginePlayer } from './piskvork';

/**
 * Measures external Gomocup engines (Piskvork protocol) against our players.
 *
 *   node --import tsx scripts/caro-hell/engine-match.ts --a tengen --b hell --mode block --games 20
 *
 * Engines are looked up in ml-data/engines/bin/<name>/ (see piskvork.ts).
 */

async function makePlayer(name: string, winMode: TCaroWinMode, timeMs: number, threads: number) {
  if (name == 'hell') {
    await initBackend();
    return { player: hellPlayer(await loadModel(), 2_500), stop: () => {} };
  }
  if (name == 'hard') return { player: hardPlayer(1_800), stop: () => {} };
  return makeEnginePlayer(name, 15, winMode, timeMs, threads);
}

async function main() {
  const { values } = parseArgs({
    options: {
      a: { type: 'string', default: 'tengen' },
      b: { type: 'string', default: 'hell' },
      mode: { type: 'string', default: 'block' },
      games: { type: 'string', default: '20' },
      time: { type: 'string', default: '2000' },
      threads: { type: 'string', default: '1' },
    },
  });
  const winMode: TCaroWinMode = values.mode == 'free' ? 'non-blockOpponent' : 'blockOpponent';
  const time = parseNumber(values.time, 2_000);
  console.log(
    `[match] ${values.a} vs ${values.b}, ${winMode}, ${values.games} games, engines ${time} ms/move, ${values.threads} threads (hell 2500, hard 1800)`
  );
  const threads = parseNumber(values.threads, 1);
  const a = await makePlayer(values.a, winMode, time, threads);
  const b = await makePlayer(values.b, winMode, time, threads);
  const result = await runArena(
    a.player,
    b.player,
    parseNumber(values.games, 20),
    15,
    true,
    winMode
  );
  console.log(
    `[match] RESULT ${values.a} vs ${values.b} (${winMode}): W${result.wins} D${result.draws} L${result.losses}, score ${(result.score * 100).toFixed(0)}%`
  );
  a.stop();
  b.stop();
  process.exit(0);
}

await main();
