/* eslint-disable no-console -- command-line script */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { DATA_DIR, isEntry, mulberry32, parseNumber, playGame, TPlayer } from './common';
import { equallyGood } from './opening-book';
import { makeEnginePlayer, PiskvorkEngine } from './piskvork';

/**
 * How a strong player beats the Hell level: a stronger Rapfi moves first against the Hell level as
 * the site plays it on the weakest device (the opening book, then Rapfi with the classical
 * evaluation, 2 s a move, 1 thread). The attacker opens in the middle and picks at random among
 * its near-best moves for its first `--explore` moves, so the games cover the openings a person
 * could choose; after that it plays its best move.
 *
 *   nice node --import tsx scripts/caro-hell/hell-attack.ts --games 150 --workers 3
 *
 * Every game is appended to ml-data/caro-hell/attack/games.jsonl with the source of each Hell move
 * (book or engine) and the attacker's own score before each of its moves; running again adds games
 * until `--games` are stored. `hell-attack-report.ts` turns the file into the guide's numbers.
 */

const SIZE = 20;
const CENTER = (SIZE / 2) * SIZE + SIZE / 2;

export type TAttackGame = {
  moves: Array<number>;
  winner: number;
  /** By ply: 'book' or 'engine' for the Hell level's moves, null for the attacker's. */
  sources: Array<string | null>;
  /** By ply: the attacker's score (its own view) when it chose that move; null for the Hell level. */
  scores: Array<number | null>;
  mates: Array<boolean | null>;
};

export const ATTACK_FILE = join(DATA_DIR, 'attack', 'games.jsonl');

export function readAttackGames(file = ATTACK_FILE): Array<TAttackGame> {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TAttackGame);
}

async function main() {
  const { values } = parseArgs({
    options: {
      games: { type: 'string', default: '150' },
      workers: { type: 'string', default: '3' },
      'attacker-time': { type: 'string', default: '4000' },
      'defender-time': { type: 'string', default: '2000' },
      explore: { type: 'string', default: '3' },
      margin: { type: 'string', default: '40' },
      seed: { type: 'string', default: '1' },
    },
  });
  const total = parseNumber(values.games, 150);
  const explore = parseNumber(values.explore, 3);
  const margin = parseNumber(values.margin, 40);
  const seed = parseNumber(values.seed, 1);
  const attackerTime = parseNumber(values['attacker-time'], 4_000);
  const defenderTime = parseNumber(values['defender-time'], 2_000);
  mkdirSync(dirname(ATTACK_FILE), { recursive: true });
  const stored = readAttackGames().length;
  console.log(
    `[attack] ${stored}/${total} games stored; Rapfi ${attackerTime} ms attacks the Hell level (book + Rapfi classical ${defenderTime} ms, 1 thread)`
  );

  let next = stored;
  let wins = 0;
  let played = 0;
  await Promise.all(
    Array.from({ length: parseNumber(values.workers, 3) }, async () => {
      const engine = new PiskvorkEngine('rapfi-classical');
      await engine.start(SIZE, 'blockOpponent', attackerTime, 1);
      const hell = await makeEnginePlayer(
        'rapfi-classical-book',
        SIZE,
        'blockOpponent',
        defenderTime,
        1
      );
      for (let index = next++; index < total; index = next++) {
        const random = mulberry32(seed * 100_003 + index);
        const sources: Array<string | null> = [];
        const scores: Array<number | null> = [];
        const mates: Array<boolean | null> = [];
        const attacker: TPlayer = async ({ moves }) => {
          const ply = moves.length;
          if (ply == 0) {
            [sources[0], scores[0], mates[0]] = [null, 0, false];
            return { move: CENTER };
          }
          const own = ply / 2;
          const scored = await engine.nbest(moves, SIZE, 0, own <= explore ? 4 : 1);
          const choices = own <= explore ? equallyGood(scored, margin) : [scored[0].move];
          const move = choices[Math.floor(random() * choices.length)];
          const chosen = scored.find((option) => option.move == move) ?? scored[0];
          [sources[ply], scores[ply], mates[ply]] = [null, chosen.score, chosen.isMate];
          return { move };
        };
        const defender: TPlayer = async (state) => {
          const choice = await hell.player(state);
          [sources[state.moves.length], scores[state.moves.length], mates[state.moves.length]] = [
            choice.source ?? null,
            null,
            null,
          ];
          return choice;
        };
        let game: Awaited<ReturnType<typeof playGame>>;
        try {
          game = await playGame({ 0: attacker, 1: defender }, SIZE, 'blockOpponent');
        } catch (error) {
          // A stuck engine ends this worker; the others carry on.
          console.log(`[attack] game ${index + 1} failed: ${String(error)}`);
          break;
        }
        const record: TAttackGame = {
          moves: game.moves,
          winner: game.winner,
          sources,
          scores,
          mates,
        };
        appendFileSync(ATTACK_FILE, JSON.stringify(record) + '\n');
        played++;
        if (game.winner == 0) wins++;
        const outcome =
          game.winner == 0 ? 'attacker wins' : game.winner == 1 ? 'HELL WINS' : 'draw';
        console.log(
          `[attack] game ${index + 1}/${total}: ${outcome} in ${game.moves.length} plies (book ${sources.filter((s) => s == 'book').length} moves) — attacker ${wins}/${played} this run`
        );
      }
      engine.stop();
      hell.stop();
    })
  );
  process.exit(0);
}

if (isEntry(import.meta.url)) await main();
