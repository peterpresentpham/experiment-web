/* eslint-disable no-console -- command-line script */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  openingKey,
  parseOpeningBook,
  TOpeningBook,
  TOpeningBookFile,
} from 'src/services/caro-tengen/opening-book';
import { TTurn } from 'src/types/caro.type';
import { isEntry, parseNumber, ROOT } from './common';
import { PiskvorkEngine, TEngineName, TScoredMove } from './piskvork';

/**
 * Builds the hell level's opening book (blocked-ends rule) with a long native search of Rapfi
 * with the browser's caro network (`--engine tengen` or `rapfi-classical` for the others).
 *
 *   nice node --import tsx scripts/caro-hell/opening-book.ts --depth 3 --radius 2 --time 5000
 *
 * Walks the openings from the empty board, with the machine moving first and second: the
 * opponent may play any cell within `radius` of a stone, the machine plays the engine's choice.
 * Every machine-to-move position up to the machine's `depth`-th move gets an entry. With Rapfi,
 * an entry also keeps the other moves of a multi-PV search scoring within `margin` of the best
 * (one is picked at random in play), and the walk goes on from each of them.
 *
 * Resumable: entries already in the output file are reused when it was built by the same engine,
 * so a rerun (or a deeper one) only searches new positions.
 */

/** Positions are laid out around the middle of a 20x20 board, far from its edges. */
const BOARD = 20;
const CENTER = BOARD / 2;

type TMoves = Array<[number, number]>;

/** Moves kept per entry at most, from a multi-PV search of this many lines. */
const CHOICES = 3;

function bookKey(moves: TMoves) {
  return openingKey(
    moves.map(([row, column], index) => ({ row, column, own: index % 2 == moves.length % 2 }))
  );
}

/**
 * The search's choice and the other moves scoring within `margin` of it. Only the choice when it
 * found a forced win or loss: a mate is not to be traded for a merely good move, and a lost
 * position has nothing to vary.
 */
export function equallyGood(scored: Array<TScoredMove>, margin: number) {
  const [best, ...rest] = scored;
  if (best.isMate) return [best.move];
  return [best, ...rest.filter((move) => !move.isMate && move.score >= best.score - margin)]
    .slice(0, CHOICES)
    .map((move) => move.move);
}

async function main() {
  const { values } = parseArgs({
    options: {
      engine: { type: 'string', default: 'rapfi-caro' },
      margin: { type: 'string', default: '20' },
      depth: { type: 'string', default: '3' },
      radius: { type: 'string', default: '2' },
      time: { type: 'string', default: '10000' },
      threads: { type: 'string', default: '2' },
      workers: { type: 'string', default: '4' },
      out: { type: 'string', default: 'public/models/caro-book/opening-block.json' },
    },
  });
  const engineName = values.engine as TEngineName;
  const depth = parseNumber(values.depth, 3);
  const radius = parseNumber(values.radius, 2);
  const timeMs = parseNumber(values.time, 10_000);
  const threads = parseNumber(values.threads, 2);
  const workers = parseNumber(values.workers, 4);
  // Evaluation units of the side to move (Rapfi and Tengen: 200 per logistic unit).
  const margin = parseNumber(values.margin, 20);
  const multiPv = engineName.startsWith('rapfi');
  const out = join(ROOT, values.out);

  const previous = existsSync(out)
    ? parseOpeningBook(JSON.parse(readFileSync(out, 'utf8')) as TOpeningBookFile)
    : undefined;
  const previousEngine = existsSync(out)
    ? (JSON.parse(readFileSync(out, 'utf8')) as TOpeningBookFile).meta?.engine
    : undefined;
  const entries: TOpeningBook = previous && previousEngine == engineName ? previous : new Map();
  const save = () => {
    mkdirSync(dirname(out), { recursive: true });
    const file: TOpeningBookFile = {
      version: 2,
      winMode: 'blockOpponent',
      meta: { engine: engineName, timeMs, threads, depth, radius, margin },
      entries: Object.fromEntries(entries),
    };
    writeFileSync(out, JSON.stringify(file) + '\n');
  };

  const engines = await Promise.all(
    Array.from({ length: workers }, async () => {
      const engine = new PiskvorkEngine(engineName);
      await engine.start(BOARD, 'blockOpponent', timeMs, threads);
      return engine;
    })
  );

  /** The machine's moves in a position, from the book or from a search. */
  async function machineMoves(moves: TMoves, engine: PiskvorkEngine): Promise<TMoves> {
    if (moves.length == 0) return [[CENTER, CENTER]];
    const { key, toReal, toCanonical } = bookKey(moves);
    const known = entries.get(key);
    if (known) return known.map(([row, column]) => toReal(row, column));
    const locations = moves.map(([row, column]) => row * BOARD + column);
    const turn = (moves.length % 2) as TTurn;
    const chosen = multiPv
      ? equallyGood(await engine.nbest(locations, BOARD, turn, CHOICES), margin)
      : [await engine.move(locations, BOARD, turn)];
    const found: TMoves = chosen.map((location) => [
      Math.floor(location / BOARD),
      location % BOARD,
    ]);
    entries.set(
      key,
      found.map(([row, column]) => toCanonical(row, column))
    );
    return found;
  }

  // Machine first: the empty board; machine second: one opponent stone (any cell is the same).
  let level: Array<TMoves> = [[], [[CENTER, CENTER]]];
  for (let ply = 0; ply < depth; ply++) {
    const known = level.filter((moves) => moves.length == 0 || entries.has(bookKey(moves).key));
    console.log(
      `[book] machine move ${ply + 1}/${depth}: ${level.length} positions, ${known.length} known, ${timeMs} ms x ${threads} threads x ${workers} engines`
    );
    const replies: Array<Array<TMoves>> = new Array(level.length);
    let next = 0;
    let done = 0;
    const startedAt = Date.now();
    await Promise.all(
      engines.map(async (engine) => {
        for (let index = next++; index < level.length; index = next++) {
          const moves = level[index];
          const found = await machineMoves(moves, engine);
          replies[index] = found.map((move) => [...moves, move]);
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
    for (const moves of replies.flat()) {
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

  const varied = [...entries.values()].filter((moves) => moves.length > 1).length;
  console.log(`[book] done: ${entries.size} entries (${varied} with a choice) in ${values.out}`);
  for (const engine of engines) engine.stop();
  process.exit(0);
}

if (isEntry(import.meta.url)) await main();
