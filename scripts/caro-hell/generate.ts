/* eslint-disable no-console -- command-line script */
import { spawn } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { THellGame } from 'src/services/caro-hell/encode';
import { findMachineMove } from 'src/services/caro-machine';
import { TCaroSizeBoard, TCaroWinMode } from 'src/types/caro.type';
import {
  appendGames,
  isEntry,
  lowerPriority,
  ROOT,
  mulberry32,
  playGame,
  randomOpening,
  sleep,
  timestamp,
  TPlayer,
} from './common';

/**
 * Stage 1 data: the hard engine plays itself. Every engine move becomes a policy target and the
 * result a value target, so the network starts by imitating the classic search.
 *
 *   pnpm hell:generate --games 4000 --time 150
 */

type TJob = { timeMs: number; seed: number; rest: number };

const WORKER_FLAG = '--teacher-worker';
const GAME_PREFIX = 'GAME ';

/** Plays games until the process is killed, resting `rest` × the game's time after each. */
async function runJob({ timeMs, seed, rest }: TJob) {
  lowerPriority();
  const random = mulberry32(seed);
  for (;;) {
    const startedAt = Date.now();
    // Mostly the default 15x15 board with the Vietnamese rule; some variety for the rest.
    const size: TCaroSizeBoard = random() < 0.8 ? 15 : 10;
    const winMode: TCaroWinMode = random() < 0.8 ? 'blockOpponent' : 'non-blockOpponent';
    const opening = randomOpening(size, 2 + Math.floor(random() * 3), random);
    const engine: TPlayer = ({ steps, size, winMode, turn }) => ({
      move: findMachineMove({
        steps,
        size,
        winMode,
        turn,
        level: 'hard',
        timeLimitMs: timeMs,
        random,
      }),
    });
    const game: THellGame = await playGame({ 0: engine, 1: engine }, size, winMode, opening);
    process.stdout.write(GAME_PREFIX + JSON.stringify(game) + '\n');
    if (rest > 0) await sleep((Date.now() - startedAt) * rest);
  }
}

/**
 * Starts `threads` engine workers that keep sending finished games to `onGame` until
 * `stop()` is called (a game in progress is then discarded).
 */
export function startTeacherWorkers(options: {
  threads: number;
  timeMs: number;
  rest: number;
  onGame: (game: THellGame) => void;
}) {
  // Separate processes: Node's worker threads do not get tsx's module hooks, so they could not
  // resolve the `src/` imports.
  const children = Array.from({ length: options.threads }, (_, index) => {
    const job: TJob = {
      timeMs: options.timeMs,
      rest: options.rest,
      seed: Date.now() + index * 7919,
    };
    const args = ['--import', 'tsx', fileURLToPath(import.meta.url)];
    const child = spawn(process.execPath, [...args, WORKER_FLAG, JSON.stringify(job)], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'inherit'],
      env: { ...process.env, NODE_NO_WARNINGS: '1' },
    });
    createInterface({ input: child.stdout }).on('line', (line) => {
      if (line.startsWith(GAME_PREFIX)) options.onGame(JSON.parse(line.slice(GAME_PREFIX.length)));
    });
    return child;
  });
  const stop = () =>
    Promise.all(
      children.map(
        (child) =>
          new Promise<void>((resolve) => {
            if (child.exitCode != null) return resolve();
            child.once('exit', () => resolve());
            child.kill('SIGTERM');
          })
      )
    );
  // Never leave engine processes behind, even when the parent exits abruptly.
  process.once('exit', () => children.forEach((child) => child.kill('SIGTERM')));
  return stop;
}

async function main() {
  const { values } = parseArgs({
    options: {
      games: { type: 'string', default: '2000' },
      time: { type: 'string', default: '150' },
      workers: { type: 'string', default: String(Math.max(1, availableParallelism() - 1)) },
    },
  });
  const total = Number(values.games);
  const file = `teacher-${timestamp()}.jsonl`;
  console.log(`[generate] ${total} games, ${values.time} ms/move -> ${file}`);

  let done = 0;
  const results = { 0: 0, 1: 0, draw: 0 };
  const startedAt = Date.now();
  await new Promise<void>((resolve) => {
    const stop = startTeacherWorkers({
      threads: Math.min(total, Number(values.workers)),
      timeMs: Number(values.time),
      rest: 0,
      onGame: (game) => {
        if (done >= total) return;
        appendGames(file, [game]);
        done++;
        if (game.winner == 0) results[0]++;
        else if (game.winner == 1) results[1]++;
        else results.draw++;
        if (done % 20 == 0 || done == total) {
          const minutes = (Date.now() - startedAt) / 60_000;
          console.log(
            `[generate] ${done}/${total} games (${minutes.toFixed(1)} min) first ${results[0]} / second ${results[1]} / draw ${results.draw}`
          );
        }
        if (done == total) void stop().then(() => resolve());
      },
    });
  });
}

const workerIndex = process.argv.indexOf(WORKER_FLAG);
if (workerIndex >= 0) await runJob(JSON.parse(process.argv[workerIndex + 1]) as TJob);
else if (isEntry(import.meta.url)) await main();
