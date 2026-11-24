/* eslint-disable no-console -- command-line script */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';
import {
  findBookMove,
  parseOpeningBook,
  TOpeningBookFile,
} from 'src/services/caro-tengen/opening-book';
import { TTurn } from 'src/types/caro.type';
import { mulberry32, parseNumber, randomNearby } from './common';
import { equallyGood } from './opening-book';
import { OPENING_BOOK_FILE, PiskvorkEngine } from './piskvork';

/**
 * Measures an opening book (blocked-ends rule) where it matters: the position the machine is left
 * in when the book runs out. The player moves first, as every player who beat the machine did;
 * the machine follows the book until it has no entry. A deep Rapfi search (caro network) then
 * scores the position.
 *
 *   nice node --import tsx scripts/caro-hell/book-check.ts --book <file> --samples 100
 *
 * The player's moves are random cells near the stones (`--player random`, as a person might
 * open) or one of a Rapfi search's near-best moves (`--player strong`, looking for refutations).
 * The same seed gives the same openings for every book, as far as the books agree. Matches
 * cannot compare books: moving first wins almost every engine game under this rule.
 */

const SIZE = 20;

type TSample = { moves: Array<number>; machineScore: number; isLost: boolean; bookMoves: number };

async function main() {
  const { values } = parseArgs({
    options: {
      book: { type: 'string', default: OPENING_BOOK_FILE },
      samples: { type: 'string', default: '100' },
      player: { type: 'string', default: 'random' },
      'player-time': { type: 'string', default: '1000' },
      time: { type: 'string', default: '3000' },
      threads: { type: 'string', default: '2' },
      workers: { type: 'string', default: '2' },
      seed: { type: 'string', default: '1' },
    },
  });
  const book = parseOpeningBook(JSON.parse(readFileSync(values.book, 'utf8')) as TOpeningBookFile);
  const samples = parseNumber(values.samples, 100);
  const strong = values.player == 'strong';
  const seed = parseNumber(values.seed, 1);
  const timeMs = parseNumber(values.time, 3_000);
  console.log(
    `[book-check] ${basename(values.book)} (${book.size} entries): ${samples} openings, ${values.player} player, scored at ${timeMs} ms x ${values.threads} threads`
  );

  const results: Array<TSample> = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: parseNumber(values.workers, 2) }, async () => {
      const judge = new PiskvorkEngine('rapfi-caro');
      await judge.start(SIZE, 'blockOpponent', timeMs, parseNumber(values.threads, 2));
      const player = strong ? new PiskvorkEngine('rapfi-caro') : undefined;
      await player?.start(SIZE, 'blockOpponent', parseNumber(values['player-time'], 1_000), 1);
      for (let index = next++; index < samples; index = next++) {
        const random = mulberry32(seed * 100_003 + index);
        const moves: Array<number> = [];
        const steps: { [location: number]: TTurn } = {};
        const play = (move: number) => {
          steps[move] = (moves.length % 2) as TTurn;
          moves.push(move);
        };
        let bookMoves = 0;
        for (;;) {
          // The player (turn 0) moves, then the machine answers from the book if it can.
          const choices = player
            ? equallyGood(await player.nbest(moves, SIZE, 0, 3), 60)
            : [randomNearby(moves, SIZE, 2, random)];
          play(choices[Math.floor(random() * choices.length)]);
          const bookMove = findBookMove(
            book,
            { steps, size: SIZE, winMode: 'blockOpponent', turn: 1 },
            random
          );
          if (bookMove == undefined) break;
          play(bookMove);
          bookMoves++;
        }
        // The machine is to move: the score is its own.
        const [best] = await judge.nbest(moves, SIZE, 1, 1);
        results.push({
          moves,
          machineScore: best.score,
          isLost: best.isMate && best.score < 0,
          bookMoves,
        });
      }
      judge.stop();
      player?.stop();
    })
  );

  const lost = results.filter((result) => result.isLost);
  const scored = results.filter((result) => Math.abs(result.machineScore) < 20_000);
  const average =
    scored.reduce((sum, result) => sum + result.machineScore, 0) / (scored.length || 1);
  const sorted = scored.map((result) => result.machineScore).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const coordinate = (location: number) => `${location % SIZE},${Math.floor(location / SIZE)}`;
  for (const result of lost)
    console.log(
      `[book-check]   lost: ${result.moves.map(coordinate).join(' ')} (${result.bookMoves} book moves)`
    );
  console.log(
    `[book-check] RESULT ${basename(values.book)}: ${lost.length}/${results.length} openings already lost when the book ends, machine score average ${average.toFixed(0)}, median ${median}`
  );
  process.exit(0);
}

await main();
