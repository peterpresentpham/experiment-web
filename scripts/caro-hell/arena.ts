/* eslint-disable no-console -- command-line script */
import * as tfl from '@tensorflow/tfjs-layers';
import { parseArgs } from 'node:util';
import { createHellEvaluator } from 'src/services/caro-hell/model';
import { findHellMove } from 'src/services/caro-hell/player';
import { findMachineMove } from 'src/services/caro-machine';
import { TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';
import {
  initBackend,
  isEntry,
  loadModel,
  parseNumber,
  playGame,
  randomOpening,
  TPlayer,
} from './common';

/**
 * Measures playing strength: the hell player against the hard engine (or two networks against
 * each other). Colours alternate and every pair of games shares a random opening.
 *
 *   pnpm hell:arena --games 40 --time 2500
 */

export type TArenaResult = { wins: number; losses: number; draws: number; score: number };

export function hellPlayer(model: tfl.LayersModel, timeMs: number): TPlayer {
  const evaluate = createHellEvaluator(model);
  return ({ steps, size, winMode, turn }) => ({
    move: findHellMove({ steps, size, winMode, turn, timeLimitMs: timeMs }, evaluate, {
      batchSize: 8,
      maxSimulations: 100_000,
    }),
  });
}

export function hardPlayer(timeMs: number): TPlayer {
  return ({ steps, size, winMode, turn }) => ({
    move: findMachineMove({ steps, size, winMode, turn, level: 'hard', timeLimitMs: timeMs }),
  });
}

/** Plays `games` games between `challenger` and `opponent`; score counts a draw as half. */
export async function runArena(
  challenger: TPlayer,
  opponent: TPlayer,
  games: number,
  size: TCaroSizeBoard = 15,
  log = true,
  winMode: TCaroWinMode = 'blockOpponent'
): Promise<TArenaResult> {
  const result = { wins: 0, losses: 0, draws: 0, score: 0 };
  let opening: Array<number> = [];
  for (let index = 0; index < games; index++) {
    const challengerTurn = (index % 2) as TTurn;
    if (challengerTurn == 0) opening = randomOpening(size, 2, Math.random);
    const players = { [challengerTurn]: challenger, [1 - challengerTurn]: opponent } as Record<
      TTurn,
      TPlayer
    >;
    const game = await playGame(players, size, winMode, opening);
    if (game.winner == challengerTurn) result.wins++;
    else if (game.winner < 0) result.draws++;
    else result.losses++;
    result.score = (result.wins + result.draws / 2) / (index + 1);
    if (log) {
      console.log(
        `[arena] game ${index + 1}/${games}: ${game.winner == challengerTurn ? 'win' : game.winner < 0 ? 'draw' : 'loss'} (${game.moves.length} plies) — W${result.wins} D${result.draws} L${result.losses}, score ${(result.score * 100).toFixed(0)}%`
      );
    }
  }
  return result;
}

async function main() {
  const { values } = parseArgs({
    options: {
      games: { type: 'string', default: '40' },
      time: { type: 'string', default: '2500' },
      'hard-time': { type: 'string', default: '1800' },
      size: { type: 'string', default: '15' },
    },
  });
  console.log(`[arena] backend: ${await initBackend()}`);
  const model = await loadModel();
  await runArena(
    hellPlayer(model, parseNumber(values.time, 2_500)),
    hardPlayer(parseNumber(values['hard-time'], 1_800)),
    parseNumber(values.games, 40),
    parseNumber(values.size, 15) as TCaroSizeBoard
  );
}

if (isEntry(import.meta.url)) await main();
