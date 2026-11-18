import * as tfl from '@tensorflow/tfjs-layers';
import { runMcts } from 'src/services/caro-hell/mcts';
import { createHellEvaluator } from 'src/services/caro-hell/model';
import { MachineBoard } from 'src/services/caro-machine/board';
import { toStone } from 'src/services/caro-machine/experience';
import { hardPlayer } from './arena';
import { TPlayer } from './common';

/**
 * Stage 2, reinforcement learning (AlphaZero loop, driven by `pnpm hell:run`): the network plays
 * itself with tree search and later trains on the search's visit counts and the results.
 */

/** Self-play player: explores with root noise and samples moves early in the game. */
export function selfPlayer(
  model: tfl.LayersModel,
  simulations: number,
  temperaturePlies: number
): TPlayer {
  const evaluate = createHellEvaluator(model);
  return ({ steps, moves, size, winMode, turn }) => {
    const board = new MachineBoard(size, winMode);
    for (const [location, owner] of Object.entries(steps))
      board.place(Number(location), toStone(owner));
    const result = runMcts(board, toStone(turn), evaluate, {
      maxSimulations: simulations,
      deadline: Infinity,
      batchSize: 8,
      dirichlet: { alpha: 0.15, weight: 0.25, random: Math.random },
    });
    // Decided by the forcing rules: let the tactical engine finish the game.
    if (result.moves.length == 0) return hardPlayer(200)({ steps, moves, size, winMode, turn });

    const total = result.moves.reduce((sum, item) => sum + item.visits, 0) || 1;
    const policy = result.moves.map((item) => [item.move, item.visits / total] as [number, number]);
    let move = result.moves[0].move;
    if (moves.length < temperaturePlies) {
      let pick = Math.random();
      for (const [cell, probability] of policy) {
        pick -= probability;
        if (pick <= 0) {
          move = cell;
          break;
        }
      }
    }
    return { move, policy };
  };
}
