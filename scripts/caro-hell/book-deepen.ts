/* eslint-disable no-console -- command-line script */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  openingKey,
  parseOpeningBook,
  TOpeningBookFile,
} from 'src/services/caro-tengen/opening-book';
import { parseNumber } from './common';
import { OPENING_BOOK_FILE, PiskvorkEngine, TScoredMove } from './piskvork';

/**
 * Re-chooses the machine's early replies when it moves second (blocked-ends rule), where a
 * player who moves first and plays well wins: the book's choice there decides how hard that win
 * is to find. For every book position with `--stones` stones or fewer and the machine to move
 * second, a long multi-PV search lists candidates; each is then answered by a long search for
 * the player. Candidates the player has no forced win against come first, by the player's score;
 * forced wins after them, the longest first. The entry keeps the best and those within
 * `--margin` of it.
 *
 *   nice node --import tsx scripts/caro-hell/book-deepen.ts --stones 3
 *
 * Then run opening-book.ts again (same settings as the book): it fills in the positions the new
 * choices lead to and keeps every entry already there.
 */

const SIZE = 20;
const CENTER = SIZE / 2;

/** How bad a candidate is for the machine, from the player's reply search: lower is better. */
function badness(reply: TScoredMove) {
  // A forced win the player finds later is harder to find: longer mates rank better.
  return reply.score;
}

/**
 * The book's machine-second positions a game can reach, up to `maxStones` stones, as their keys:
 * the player's first stone, then any reply within `RADIUS` of a stone (as the book was built) to
 * each of the book's choices. Entries the walk does not reach are left out (left over from earlier
 * choices).
 */
const RADIUS = 2;
function reachable(file: TOpeningBookFile, maxStones: number) {
  const book = parseOpeningBook(file);
  const keyOf = (moves: Array<[number, number]>) =>
    openingKey(
      moves.map(([row, column], ply) => ({ row, column, own: ply % 2 == moves.length % 2 }))
    );
  const found: Array<string> = [];
  let level: Array<Array<[number, number]>> = [[[CENTER, CENTER]]];
  while (level.length > 0 && level[0].length <= maxStones) {
    const next = new Map<string, Array<[number, number]>>();
    for (const moves of level) {
      const { key, toReal } = keyOf(moves);
      const choices = book.get(key);
      if (!choices) continue;
      found.push(key);
      for (const [row, column] of choices) {
        const after: Array<[number, number]> = [...moves, toReal(row, column)];
        const taken = new Set(after.map(([r, c]) => r * SIZE + c));
        for (const [r, c] of after)
          for (let dr = -RADIUS; dr <= RADIUS; dr++)
            for (let dc = -RADIUS; dc <= RADIUS; dc++) {
              if (taken.has((r + dr) * SIZE + c + dc)) continue;
              const position: Array<[number, number]> = [...after, [r + dr, c + dc]];
              next.set(keyOf(position).key, position);
            }
      }
    }
    level = [...next.values()];
  }
  return [...new Set(found)];
}

async function main() {
  const { values } = parseArgs({
    options: {
      book: { type: 'string', default: OPENING_BOOK_FILE },
      stones: { type: 'string', default: '3' },
      candidates: { type: 'string', default: '5' },
      'wide-time': { type: 'string', default: '30000' },
      'reply-time': { type: 'string', default: '15000' },
      threads: { type: 'string', default: '4' },
      margin: { type: 'string', default: '20' },
    },
  });
  const file = JSON.parse(readFileSync(values.book, 'utf8')) as TOpeningBookFile;
  const maxStones = parseNumber(values.stones, 3);
  const margin = parseNumber(values.margin, 20);
  const threads = parseNumber(values.threads, 4);

  const positions = reachable(file, maxStones);
  console.log(
    `[deepen] ${positions.length} positions with the machine second, up to ${maxStones} stones`
  );

  const wide = new PiskvorkEngine('rapfi-caro');
  await wide.start(SIZE, 'blockOpponent', parseNumber(values['wide-time'], 30_000), threads);
  const reply = new PiskvorkEngine('rapfi-caro');
  await reply.start(SIZE, 'blockOpponent', parseNumber(values['reply-time'], 15_000), threads);

  for (const [index, key] of positions.entries()) {
    // Lay the canonical stones out around the centre, in an order alternating from the player.
    const stones = key.split(' ').map((stone) => stone.split('.').map(Number));
    const mine = stones.filter((stone) => stone[2] == 1);
    const theirs = stones.filter((stone) => stone[2] == 2);
    const order: Array<number[]> = [];
    for (let i = 0; i < theirs.length; i++) {
      order.push(theirs[i]);
      if (i < mine.length) order.push(mine[i]);
    }
    const shift = CENTER - 2;
    const moves = order.map(([row, column]) => (row + shift) * SIZE + (column + shift));
    // The stones keep their canonical layout, so the key must come out the same.
    const check = openingKey(
      moves.map((location, ply) => ({
        row: Math.floor(location / SIZE),
        column: location % SIZE,
        own: ply % 2 == 1,
      }))
    );
    if (check.key != key) throw new Error(`deepen: could not rebuild position ${key}`);

    const candidates = await wide.nbest(moves, SIZE, 1, parseNumber(values.candidates, 5));
    const judged: Array<{ move: number; badness: number; text: string }> = [];
    for (const candidate of candidates) {
      const [answer] = await reply.nbest([...moves, candidate.move], SIZE, 0, 1);
      const text = answer.isMate
        ? `player mates in ${30_000 - answer.score}`
        : `player ${answer.score}`;
      judged.push({ move: candidate.move, badness: badness(answer), text });
    }
    judged.sort((a, b) => a.badness - b.badness);
    const kept = judged.filter(
      (candidate, rank) =>
        rank == 0 || (candidate.badness < 20_000 && candidate.badness <= judged[0].badness + margin)
    );
    const before = JSON.stringify(file.entries[key]);
    file.entries[key] = kept.map((candidate) =>
      check.toCanonical(Math.floor(candidate.move / SIZE), candidate.move % SIZE)
    );
    const coordinate = (location: number) => `${location % SIZE},${Math.floor(location / SIZE)}`;
    console.log(
      `[deepen] ${index + 1}/${positions.length} ${key}: ${judged.map((candidate) => `${coordinate(candidate.move)} ${candidate.text}`).join('; ')} -> ${kept.map((candidate) => coordinate(candidate.move)).join(', ')}${before == JSON.stringify(file.entries[key]) ? '' : ' (changed)'}`
    );
    file.meta = {
      ...file.meta,
      deepened: `${maxStones} stones, ${values['wide-time']} + ${values['reply-time']} ms`,
    };
    writeFileSync(values.book, JSON.stringify(file) + '\n');
  }
  wide.stop();
  reply.stop();
  process.exit(0);
}

await main();
