/* eslint-disable no-console -- command-line script */
import { parseArgs } from 'node:util';
import { TCaroSizeBoard, TCaroWinMode } from 'src/types/caro.type';
import { parseNumber, playGame, TPlayer } from './common';
import { makeEnginePlayer } from './piskvork';

/**
 * Measures how well an engine defends when it moves second, as the hell level does against a
 * player who starts. The attacker is Tengen with more time; its first `--random` moves are random
 * cells near the stones (as a person might open), so games differ.
 *
 *   node --import tsx scripts/caro-hell/defense-match.ts --defender tengen-book --games 40
 *
 * Reports the defender's non-loss rate (with a 95% interval) and how long it lasted.
 */

function randomNearby(moves: ReadonlyArray<number>, size: number, radius: number) {
  const center = Math.floor(size / 2);
  if (moves.length == 0) {
    const row = center + Math.floor(Math.random() * 3) - 1;
    const column = center + Math.floor(Math.random() * 3) - 1;
    return row * size + column;
  }
  const taken = new Set(moves);
  const cells = new Set<number>();
  for (const move of moves) {
    const [row, column] = [Math.floor(move / size), move % size];
    for (let dr = -radius; dr <= radius; dr++)
      for (let dc = -radius; dc <= radius; dc++) {
        const [r, c] = [row + dr, column + dc];
        if (r >= 0 && c >= 0 && r < size && c < size && !taken.has(r * size + c))
          cells.add(r * size + c);
      }
  }
  const options = [...cells];
  return options[Math.floor(Math.random() * options.length)];
}

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
        threads
      );
      const opening: TPlayer = async (state) => {
        const own = Math.ceil(state.moves.length / 2);
        if (own < randomMoves) return { move: randomNearby(state.moves, state.size, 2) };
        return attacker.player(state);
      };
      for (let index = next++; index < games; index = next++) {
        const game = await playGame({ 0: opening, 1: defender.player }, size, winMode);
        results.push({ winner: game.winner, plies: game.moves.length });
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
