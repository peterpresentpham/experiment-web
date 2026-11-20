/* eslint-disable no-console -- command-line script */
import { ChildProcess, spawn } from 'node:child_process';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { parseArgs } from 'node:util';
import { TCaroWinMode, TTurn } from 'src/types/caro.type';
import { hardPlayer, hellPlayer, runArena } from './arena';
import { initBackend, loadModel, parseNumber, ROOT, TPlayer } from './common';

/**
 * Measures external Gomocup engines (Piskvork protocol) against our players.
 *
 *   node --import tsx scripts/caro-hell/engine-match.ts --a tengen --b hell --mode block --games 20
 *
 * Engines are looked up in ml-data/engines/bin/<name>/ (built locally, see the build notes).
 */

const BIN_DIR = join(ROOT, 'ml-data/engines/bin');

type TEngineName = 'tengen' | 'rapfi' | 'rapfi-classical';

const ENGINES: Record<TEngineName, { dir: string; file: string; args: Array<string> }> = {
  tengen: { dir: 'tengen', file: 'pbrain-tengen', args: [] },
  rapfi: { dir: 'rapfi', file: 'pbrain-rapfi', args: ['--config', 'config.toml'] },
  'rapfi-classical': {
    dir: 'rapfi',
    file: 'pbrain-rapfi',
    args: ['--config', 'config-classical.toml'],
  },
};

/**
 * Piskvork rule numbers: 0 is freestyle (five or more wins, our "not blocked" mode); 8 is
 * freestyle caro (a five blocked at both ends does not win, our default mode).
 */
const RULES: Record<TCaroWinMode, number> = { 'non-blockOpponent': 0, blockOpponent: 8 };

class PiskvorkEngine {
  private child: ChildProcess;
  private lines: Array<string> = [];
  private waiting?: () => void;

  constructor(name: TEngineName) {
    const { dir, file, args } = ENGINES[name];
    this.child = spawn(join(BIN_DIR, dir, file), args, {
      cwd: join(BIN_DIR, dir),
      stdio: ['pipe', 'pipe', 'inherit'],
    });
    createInterface({ input: this.child.stdout! }).on('line', (line) => {
      this.lines.push(line.trim());
      this.waiting?.();
    });
    process.once('exit', () => this.child.kill());
  }

  private send(...lines: Array<string>) {
    this.child.stdin!.write(lines.join('\n') + '\n');
  }

  private async readUntil(match: (line: string) => boolean) {
    for (;;) {
      const index = this.lines.findIndex(match);
      if (index >= 0) {
        const [line] = this.lines.splice(0, index + 1).slice(-1);
        return line;
      }
      if (this.child.exitCode != null) throw new Error('engine exited');
      await new Promise<void>((resolve) => (this.waiting = resolve));
    }
  }

  async start(size: number, winMode: TCaroWinMode, turnMs: number, threads: number) {
    this.send(`START ${size}`);
    const reply = await this.readUntil((line) => line == 'OK' || line.startsWith('ERROR'));
    if (reply != 'OK') throw new Error(reply);
    this.send(
      `INFO rule ${RULES[winMode]}`,
      `INFO timeout_turn ${turnMs}`,
      'INFO timeout_match 0',
      // One thread is a browser without SharedArrayBuffer: the conservative case.
      `INFO thread_num ${threads}`,
      `INFO max_memory ${512 * 1024 * 1024}`
    );
  }

  /** The whole position each turn (BOARD), so the engine never drifts from our board. */
  async move(moves: Array<number>, size: number, turn: TTurn) {
    const stones = moves.map((location, index) => {
      const x = location % size;
      const y = Math.floor(location / size);
      return `${x},${y},${index % 2 == turn ? 1 : 2}`;
    });
    this.send('BOARD', ...stones, 'DONE');
    const reply = await this.readUntil((line) => /^\d+,\d+$/.test(line));
    const [x, y] = reply.split(',').map(Number);
    const move = y * size + x;
    // An illegal answer would silently end the game as a draw; make it loud instead.
    if (moves.includes(move) || x >= size || y >= size) throw new Error(`illegal move ${reply}`);
    return move;
  }

  stop() {
    this.send('END');
    this.child.kill();
  }
}

async function makePlayer(name: string, winMode: TCaroWinMode, timeMs: number, threads: number) {
  if (name == 'hell') {
    await initBackend();
    return { player: hellPlayer(await loadModel(), 2_500), stop: () => {} };
  }
  if (name == 'hard') return { player: hardPlayer(1_800), stop: () => {} };
  const engine = new PiskvorkEngine(name as TEngineName);
  await engine.start(15, winMode, timeMs, threads);
  const player: TPlayer = async ({ moves, size, turn }) => ({
    move: await engine.move(moves, size, turn),
  });
  return { player, stop: () => engine.stop() };
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
