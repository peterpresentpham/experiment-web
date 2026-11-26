/* eslint-disable no-console -- command-line script */
import { appendFileSync, mkdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { parseArgs } from 'node:util';
import { TCaroSizeBoard, TCaroWinMode } from 'src/types/caro.type';
import { DATA_DIR, parseNumber, playGame, randomNearby, TPlayer } from './common';
import { makeEnginePlayer, OPENING_BOOK_FILE } from './piskvork';

/**
 * Measures how well an engine defends when it moves second, as the hell level does against a
 * player who starts. The attacker is Tengen with more time; its first `--random` moves are random
 * cells near the stones (as a person might open), so games differ.
 *
 *   node --import tsx scripts/caro-hell/defense-match.ts --defender tengen-book --games 40
 *
 * The blocked-ends hell level as the browser plays it is `--defender rapfi-classical-book
 * --attacker rapfi-classical --size 20` (`rapfi-caro` adds the caro network, which the browser has
 * switched off); `--book` swaps in another opening book file to compare two books.
 *
 * Reports the defender's non-loss rate (with a 95% interval) and how long it lasted. Lost games
 * are appended to ml-data/caro-hell/defense/<defender>-<book>.jsonl with which moves came from
 * the book, and printed with the defender's last book move (where a book mistake would be).
 */

/** Wilson score interval for a proportion. */
function wilson(successes: number, total: number) {
  if (total == 0) return [0, 0];
  const z = 1.96;
  const p = successes / total;
  const denominator = 1 + (z * z) / total;
  const center = (p + (z * z) / (2 * total)) / denominator;
  const margin =
    (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) / denominator;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

async function main() {
  const { values } = parseArgs({
    options: {
      defender: { type: 'string', default: 'tengen' },
      attacker: { type: 'string', default: 'tengen' },
      'defender-time': { type: 'string', default: '1000' },
      'attacker-time': { type: 'string', default: '4000' },
      threads: { type: 'string', default: '1' },
      random: { type: 'string', default: '2' },
      size: { type: 'string', default: '15' },
      games: { type: 'string', default: '40' },
      workers: { type: 'string', default: '4' },
      book: { type: 'string', default: OPENING_BOOK_FILE },
    },
  });
  const winMode: TCaroWinMode = 'blockOpponent';
  const size = parseNumber(values.size, 15) as TCaroSizeBoard;
  const games = parseNumber(values.games, 40);
  const randomMoves = parseNumber(values.random, 2);
  const threads = parseNumber(values.threads, 1);
  const defenderTime = parseNumber(values['defender-time'], 1_000);
  const attackerTime = parseNumber(values['attacker-time'], 4_000);
  console.log(
    `[defense] ${values.defender} (${defenderTime} ms) defends against ${values.attacker} (${attackerTime} ms), ${size}x${size}, ${games} games, ${randomMoves} random attacker moves`
  );

  const bookName = values.defender.endsWith('-book') ? basename(values.book, '.json') : 'no-book';
  const lostFile = join(DATA_DIR, 'defense', `${values.defender}-${bookName}.jsonl`);
  const results: Array<{ winner: number; plies: number }> = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: parseNumber(values.workers, 4) }, async () => {
      const attacker = await makeEnginePlayer(
        values.attacker,
        size,
        winMode,
        attackerTime,
        threads
      );
      const defender = await makeEnginePlayer(
        values.defender,
        size,
        winMode,
        defenderTime,
        threads,
        values.book
      );
      // The defender's move sources this game, by ply (null for the attacker's moves).
      let sources: Array<string | null> = [];
      const defend: TPlayer = async (state) => {
        const choice = await defender.player(state);
        sources[state.moves.length] = choice.source ?? null;
        return choice;
      };
      const opening: TPlayer = async (state) => {
        const own = Math.ceil(state.moves.length / 2);
        if (own < randomMoves) return { move: randomNearby(state.moves, state.size, 2) };
        return attacker.player(state);
      };
      for (let index = next++; index < games; index = next++) {
        sources = [];
        let game: Awaited<ReturnType<typeof playGame>>;
        try {
          game = await playGame({ 0: opening, 1: defend }, size, winMode);
        } catch (error) {
          // A stuck or failing engine ends this worker; the others carry on.
          console.log(`[defense] game ${index + 1} failed: ${String(error)}`);
          break;
        }
        results.push({ winner: game.winner, plies: game.moves.length });
        if (game.winner == 0) {
          const lastBook = sources.lastIndexOf('book');
          const coordinates = game.moves.map((move) => `${move % size},${Math.floor(move / size)}`);
          mkdirSync(join(DATA_DIR, 'defense'), { recursive: true });
          appendFileSync(lostFile, JSON.stringify({ size, moves: game.moves, sources }) + '\n');
          console.log(
            `[defense]   lost: ${coordinates.slice(0, 10).join(' ')} … last book move ${lastBook >= 0 ? lastBook + 1 : '-'}`
          );
        }
        const outcome = game.winner == 1 ? 'defender wins' : game.winner == 0 ? 'loss' : 'draw';
        console.log(
          `[defense] game ${results.length}/${games}: ${outcome} (${game.moves.length} plies)`
        );
      }
      attacker.stop();
      defender.stop();
    })
  );

  const wins = results.filter((result) => result.winner == 1).length;
  const draws = results.filter((result) => result.winner < 0).length;
  const notLost = wins + draws;
  const [low, high] = wilson(notLost, results.length);
  const lost = results.filter((result) => result.winner == 0);
  const averagePlies = lost.reduce((sum, result) => sum + result.plies, 0) / (lost.length || 1);
  console.log(
    `[defense] RESULT ${values.defender}: W${wins} D${draws} L${lost.length}, not lost ${((notLost / results.length) * 100).toFixed(0)}% (95%: ${(low * 100).toFixed(0)}–${(high * 100).toFixed(0)}%), lost games lasted ${averagePlies.toFixed(1)} plies on average`
  );
  process.exit(0);
}

await main();
