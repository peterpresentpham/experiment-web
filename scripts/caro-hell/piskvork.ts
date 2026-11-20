import { ChildProcess, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
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

export type TEngineName = 'tengen' | 'rapfi' | 'rapfi-classical';

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
export const RULES: Record<TCaroWinMode, number> = { 'non-blockOpponent': 0, blockOpponent: 8 };

export class PiskvorkEngine {
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

export const OPENING_BOOK_FILE = join(ROOT, 'public/models/caro-book/opening-block.json');

/**
 * A player backed by an engine process. "tengen-book" is Tengen behind the hell level's opening
 * book, as the browser plays it.
 */
export async function makeEnginePlayer(
  name: string,
  size: TCaroSizeBoard,
  winMode: TCaroWinMode,
  timeMs: number,
  threads: number
) {
  const withBook = name == 'tengen-book';
  const book: TOpeningBook = withBook
    ? parseOpeningBook(JSON.parse(readFileSync(OPENING_BOOK_FILE, 'utf8')) as TOpeningBookFile)
    : new Map();
  const engine = new PiskvorkEngine((withBook ? 'tengen' : name) as TEngineName);
  await engine.start(size, winMode, timeMs, threads);
  const player: TPlayer = async ({ steps, moves, size, turn }) => {
    const bookMove = withBook ? findBookMove(book, { steps, size, winMode, turn }) : undefined;
    return { move: bookMove ?? (await engine.move(moves, size, turn)) };
  };
  return { player, stop: () => engine.stop() };
}
