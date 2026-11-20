/* eslint-disable no-console -- command-line script */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { openingKey, TOpeningBookFile } from 'src/services/caro-tengen/opening-book';
import { TTurn } from 'src/types/caro.type';
import { parseNumber, ROOT } from './common';
import { PiskvorkEngine } from './piskvork';

/**
 * Builds the hell level's opening book (blocked-ends rule) with a long native Tengen search.
 *
 *   node --import tsx scripts/caro-hell/opening-book.ts --depth 3 --radius 2 --time 10000
 *
 * Walks the openings from the empty board, with the machine moving first and second: the
 * opponent may play any cell within `radius` of a stone, the machine plays Tengen's choice. Every
 * machine-to-move position up to the machine's `depth`-th move gets an entry. Resumable: entries
 * already in the output file are reused, so a rerun (or a deeper one) only searches new
 * positions.
 */

/** Positions are laid out around the middle of a 20x20 board, far from its edges. */
const BOARD = 20;
const CENTER = BOARD / 2;

type TMoves = Array<[number, number]>;

function bookKey(moves: TMoves) {
  return openingKey(
    moves.map(([row, column], index) => ({ row, column, own: index % 2 == moves.length % 2 }))
  );
}

async function main() {
  const { values } = parseArgs({
    options: {
      depth: { type: 'string', default: '3' },
      radius: { type: 'string', default: '2' },
      time: { type: 'string', default: '10000' },
      threads: { type: 'string', default: '2' },
      workers: { type: 'string', default: '4' },
      out: { type: 'string', default: 'public/models/caro-book/opening-block.json' },
    },
  });
  const depth = parseNumber(values.depth, 3);
  const radius = parseNumber(values.radius, 2);
  const timeMs = parseNumber(values.time, 10_000);
  const threads = parseNumber(values.threads, 2);
  const workers = parseNumber(values.workers, 4);
  const out = join(ROOT, values.out);

  const entries: TOpeningBookFile['entries'] = existsSync(out)
    ? (JSON.parse(readFileSync(out, 'utf8')) as TOpeningBookFile).entries
    : {};
  const save = () => {
    mkdirSync(dirname(out), { recursive: true });
    const file: TOpeningBookFile = {
      version: 1,
      winMode: 'blockOpponent',
      meta: { engine: 'tengen', timeMs, threads, depth, radius },
      entries,
    };
    writeFileSync(out, JSON.stringify(file) + '\n');
  };

  const engines = await Promise.all(
    Array.from({ length: workers }, async () => {
      const engine = new PiskvorkEngine('tengen');
      await engine.start(BOARD, 'blockOpponent', timeMs, threads);
      return engine;
    })
  );

  /** The machine's move in a position, from the book or from a search. */
  async function machineMove(moves: TMoves, engine: PiskvorkEngine): Promise<[number, number]> {
    if (moves.length == 0) return [CENTER, CENTER];
    const { key, toReal, toCanonical } = bookKey(moves);
    const known = entries[key];
    if (known) return toReal(known[0], known[1]);
    const locations = moves.map(([row, column]) => row * BOARD + column);
    const location = await engine.move(locations, BOARD, (moves.length % 2) as TTurn);
    const move: [number, number] = [Math.floor(location / BOARD), location % BOARD];
    entries[key] = toCanonical(move[0], move[1]);
    return move;
  }

  // Machine first: the empty board; machine second: one opponent stone (any cell is the same).
  let level: Array<TMoves> = [[], [[CENTER, CENTER]]];
  for (let ply = 0; ply < depth; ply++) {
    const known = level.filter((moves) => moves.length == 0 || bookKey(moves).key in entries);
    console.log(
      `[book] machine move ${ply + 1}/${depth}: ${level.length} positions, ${known.length} known, ${timeMs} ms x ${threads} threads x ${workers} engines`
    );
    const replies: Array<TMoves> = new Array(level.length);
    let next = 0;
    let done = 0;
    const startedAt = Date.now();
    await Promise.all(
      engines.map(async (engine) => {
        for (let index = next++; index < level.length; index = next++) {
          const moves = level[index];
          replies[index] = [...moves, await machineMove(moves, engine)];
          done++;
          if (done % 20 == 0 || done == level.length) {
            save();
            const minutes = ((Date.now() - startedAt) / 60_000).toFixed(1);
            console.log(`[book]   ${done}/${level.length} (${minutes} min)`);
          }
        }
      })
    );
    save();
    if (ply == depth - 1) break;

    // Every opponent reply near the stones, one position per canonical key.
    const positions = new Map<string, TMoves>();
    for (const moves of replies) {
      const taken = new Set(moves.map(([row, column]) => row * BOARD + column));
      for (const [row, column] of moves)
        for (let dr = -radius; dr <= radius; dr++)
          for (let dc = -radius; dc <= radius; dc++) {
            const cell: [number, number] = [row + dr, column + dc];
            if (taken.has(cell[0] * BOARD + cell[1])) continue;
            const position: TMoves = [...moves, cell];
            positions.set(bookKey(position).key, position);
          }
    }
    level = [...positions.values()];
  }

  console.log(`[book] done: ${Object.keys(entries).length} entries in ${values.out}`);
  for (const engine of engines) engine.stop();
  process.exit(0);
}

await main();
