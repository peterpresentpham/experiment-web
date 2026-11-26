import { ChildProcess, spawn } from 'node:child_process';
import { copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import {
  findBookMove,
  parseOpeningBook,
  TOpeningBook,
  TOpeningBookFile,
} from 'src/services/caro-tengen/opening-book';
import { TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';
import { ROOT, TPlayer } from './common';

/**
 * A Gomocup engine (Piskvork protocol) run as a child process. Engines are looked up in
 * ml-data/engines/bin/<name>/ (built locally).
 */

const BIN_DIR = join(ROOT, 'ml-data/engines/bin');

export type TEngineName = 'tengen' | 'rapfi' | 'rapfi-classical' | 'rapfi-caro';

const ENGINES: Record<TEngineName, { dir: string; file: string; args: Array<string> }> = {
  tengen: { dir: 'tengen', file: 'pbrain-tengen', args: [] },
  rapfi: { dir: 'rapfi', file: 'pbrain-rapfi', args: ['--config', 'config.toml'] },
  // Classical evaluation: what the browser plays in the blocked-ends rule while its caro network
  // is switched off (CARO_NETWORK_ENABLED in src/services/caro-rapfi/browser.ts).
  'rapfi-classical': {
    dir: 'rapfi',
    file: 'pbrain-rapfi',
    args: ['--config', 'config-classical.toml'],
  },
  // Rapfi with the caro network of public/models/caro-rapfi.
  'rapfi-caro': { dir: 'rapfi', file: 'pbrain-rapfi', args: ['--config', 'config-caro.toml'] },
};

/** The browser's caro network and its config, copied next to the native engine. */
function prepareCaroNetwork() {
  const from = join(ROOT, 'public/models/caro-rapfi');
  const to = join(BIN_DIR, 'rapfi');
  copyFileSync(join(from, 'config.toml'), join(to, 'config-caro.toml'));
  copyFileSync(join(from, 'caro.bin.lz4'), join(to, 'caro.bin.lz4'));
}

/** One of the best moves of a multi-PV search, with its score for the side to move. */
export type TScoredMove = { move: number; score: number; isMate: boolean };

/** Rapfi's PV coordinate (column letter, 1-based row, e.g. "K12") as a board location. */
function pvLocation(coordinate: string, size: number) {
  const match = /^([A-Z])(\d+)$/.exec(coordinate);
  if (!match) return -1;
  return (Number(match[2]) - 1) * size + (match[1].charCodeAt(0) - 65);
}

/** "-58", "+M12" or "-M7" as a number; mates are far outside the evaluation range. */
function parseScore(value: string) {
  const mate = /^([+-])M(\d+)$/.exec(value);
  if (!mate) return { score: Number(value), isMate: false };
  const distance = Number(mate[2]);
  return { score: (mate[1] == '+' ? 1 : -1) * (30_000 - distance), isMate: true };
}

/**
 * Piskvork rule numbers: 0 is freestyle (five or more wins, our "not blocked" mode); 8 is
 * freestyle caro (a five blocked at both ends does not win, our default mode).
 */
export const RULES: Record<TCaroWinMode, number> = { 'non-blockOpponent': 0, blockOpponent: 8 };

export class PiskvorkEngine {
  private child: ChildProcess;
  private lines: Array<string> = [];
  private waiting?: () => void;

  constructor(name: TEngineName) {
    const { dir, file, args } = ENGINES[name];
    if (name == 'rapfi-caro') prepareCaroNetwork();
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

  /** How long an answer may take before the engine counts as stuck: several turns. */
  private answerMs = 120_000;

  private async readUntil(match: (line: string) => boolean) {
    const deadline = Date.now() + this.answerMs;
    for (;;) {
      const index = this.lines.findIndex(match);
      if (index >= 0) {
        const [line] = this.lines.splice(0, index + 1).slice(-1);
        return line;
      }
      // An engine that rejects the position says so once and then waits for the next command.
      const error = this.lines.find((line) => line.startsWith('ERROR'));
      if (error) throw new Error(`engine: ${error}`);
      if (this.child.exitCode != null) throw new Error('engine exited');
      const left = deadline - Date.now();
      if (left <= 0) throw new Error(`engine: no answer in ${this.answerMs} ms`);
      await new Promise<void>((resolve) => {
        this.waiting = resolve;
        setTimeout(resolve, left);
      });
    }
  }

  async start(size: number, winMode: TCaroWinMode, turnMs: number, threads: number) {
    this.answerMs = turnMs * 5 + 30_000;
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

  /**
   * The `count` best moves (Rapfi's YXNBEST), best first, with their scores from the last
   * iteration that reported them. The search's own answer always comes first.
   */
  async nbest(moves: Array<number>, size: number, turn: TTurn, count: number) {
    const stones = moves.map((location, index) => {
      return `${location % size},${Math.floor(location / size)},${index % 2 == turn ? 1 : 2}`;
    });
    this.send('YXBOARD', ...stones, 'DONE', `YXNBEST ${count}`);
    const lines: Map<number, TScoredMove> = new Map();
    // A single-line search prints no numbered lines, only its iterations' "Eval".
    let lastEval = { score: 0, isMate: false };
    for (;;) {
      const line = await this.readUntil(
        (text) => /^\d+,\d+$/.test(text) || /^MESSAGE (\(\d+\)|.*\| Eval )/.test(text)
      );
      const iteration = /^MESSAGE .*\| Eval (\S+) \|/.exec(line);
      if (iteration) {
        lastEval = parseScore(iteration[1]);
        continue;
      }
      const pv = /^MESSAGE \((\d+)\) (\S+) \| \S+ \| (\S+)/.exec(line);
      if (pv) {
        const move = pvLocation(pv[3], size);
        if (move >= 0) lines.set(Number(pv[1]), { move, ...parseScore(pv[2]) });
        continue;
      }
      const [x, y] = line.split(',').map(Number);
      const answer = y * size + x;
      if (moves.includes(answer) || x >= size || y >= size) throw new Error(`illegal move ${line}`);
      const ranked = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, scored]) => scored);
      const first = ranked.find((scored) => scored.move == answer) ?? { move: answer, ...lastEval };
      const rest = ranked.filter((scored) => scored.move != answer && !moves.includes(scored.move));
      return [first, ...rest];
    }
  }

  stop() {
    this.send('END');
    this.child.kill();
  }
}

export const OPENING_BOOK_FILE = join(ROOT, 'public/models/caro-book/opening-block.json');

/**
 * A player backed by an engine process. A "-book" suffix puts the engine behind the hell level's
 * opening book (`bookFile`, the deployed one by default), as the browser plays it:
 * "rapfi-classical-book" is the blocked-ends hell level as it plays today ("rapfi-caro-book" adds
 * the caro network, which the browser has switched off), "tengen-book" its Tengen fallback.
 */
export async function makeEnginePlayer(
  name: string,
  size: TCaroSizeBoard,
  winMode: TCaroWinMode,
  timeMs: number,
  threads: number,
  bookFile = OPENING_BOOK_FILE
) {
  const withBook = name.endsWith('-book');
  const book: TOpeningBook = withBook
    ? parseOpeningBook(JSON.parse(readFileSync(bookFile, 'utf8')) as TOpeningBookFile)
    : new Map();
  const engine = new PiskvorkEngine(name.replace(/-book$/, '') as TEngineName);
  await engine.start(size, winMode, timeMs, threads);
  const player: TPlayer = async ({ steps, moves, size, turn }) => {
    const bookMove = withBook ? findBookMove(book, { steps, size, winMode, turn }) : undefined;
    if (bookMove != undefined) return { move: bookMove, source: 'book' };
    return { move: await engine.move(moves, size, turn), source: 'engine' };
  };
  return { player, stop: () => engine.stop() };
}
