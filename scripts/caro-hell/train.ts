/* eslint-disable no-console -- command-line script */
import * as tf from '@tensorflow/tfjs-core';
import * as tfl from '@tensorflow/tfjs-layers';
import { parseArgs } from 'node:util';
import { sampleAtPly, THellGame } from 'src/services/caro-hell/encode';
import { createHellModel, trainStep } from 'src/services/caro-hell/model';
import {
  hasModel,
  initBackend,
  isEntry,
  loadModel,
  MODEL_DIR,
  parseNumber,
  readGames,
  saveModel,
} from './common';

/**
 * One-off training on recorded games, written to public/models/caro-hell. For long runs that
 * can be stopped and resumed, use `pnpm hell:run` instead.
 *
 *   pnpm hell:train --steps 20000
 */

export type TTrainOptions = {
  /** Total steps of the schedule; training runs from `startStep` up to this. */
  steps: number;
  startStep?: number;
  batchSize: number;
  learningRate: number;
  /** Only the most recent games are used; older self-play data comes from weaker models. */
  window: number;
  logEvery?: number;
  /** Reuse an optimizer (restored from a checkpoint) instead of a fresh one. */
  optimizer?: tf.Optimizer;
  /** Called after every step; may pause (to throttle) or save a checkpoint. */
  afterStep?: (step: number, stepMs: number) => Promise<void>;
  /** Checked before every step; training returns early when it says so. */
  shouldStop?: () => boolean;
};

/** Cosine decay down to 10% of the starting rate. */
export function learningRateAt(step: number, steps: number, base: number) {
  const progress = Math.min(1, (step - 1) / steps);
  return base * (0.1 + 0.9 * 0.5 * (1 + Math.cos(Math.PI * progress)));
}

/**
 * Random positions, grouped by board size so each batch has a single tensor shape.
 * Returns the last completed step.
 */
export async function trainOnGames(
  model: tfl.LayersModel,
  allGames: Array<THellGame>,
  options: TTrainOptions
) {
  const games = allGames.slice(-options.window).filter((game) => game.moves.length > 0);
  const bySize = new Map<number, Array<THellGame>>();
  for (const game of games) bySize.set(game.size, [...(bySize.get(game.size) ?? []), game]);
  const sizes = [...bySize.keys()];
  // Board sizes are drawn in proportion to how many positions they hold.
  const positions = sizes.map((size) =>
    bySize.get(size)!.reduce((sum, game) => sum + game.moves.length, 0)
  );
  const totalPositions = positions.reduce((sum, count) => sum + count, 0);
  if (totalPositions == 0) throw new Error('No training positions found');

  const optimizer = options.optimizer ?? tf.train.adam(options.learningRate);
  let averages: { policy: number; value: number } | undefined;
  let step = options.startStep ?? 0;
  const startedAt = Date.now();
  const firstStep = step;

  while (step < options.steps && !options.shouldStop?.()) {
    step++;
    const stepStartedAt = performance.now();
    (optimizer as unknown as { learningRate: number }).learningRate = learningRateAt(
      step,
      options.steps,
      options.learningRate
    );

    let pick = Math.random() * totalPositions;
    let sizeIndex = 0;
    while (pick > positions[sizeIndex] && sizeIndex < sizes.length - 1) {
      pick -= positions[sizeIndex++];
    }
    const pool = bySize.get(sizes[sizeIndex])!;
    const batch = Array.from({ length: options.batchSize }, () => {
      const game = pool[Math.floor(Math.random() * pool.length)];
      const ply = Math.floor(Math.random() * game.moves.length);
      return sampleAtPly(game, ply, Math.floor(Math.random() * 8));
    });
    const loss = trainStep(model, optimizer, batch);
    averages = averages
      ? {
          policy: averages.policy * 0.98 + loss.policy * 0.02,
          value: averages.value * 0.98 + loss.value * 0.02,
        }
      : { policy: loss.policy, value: loss.value };

    if (step % (options.logEvery ?? 100) == 0) {
      const perStep = (Date.now() - startedAt) / (step - firstStep);
      const eta = ((options.steps - step) * perStep) / 60_000;
      console.log(
        `[train] step ${step}/${options.steps} policy ${averages.policy.toFixed(3)} value ${averages.value.toFixed(3)} (${perStep.toFixed(0)} ms/step, ~${eta.toFixed(0)} min left)`
      );
    }
    await options.afterStep?.(step, performance.now() - stepStartedAt);
  }
  if (!options.optimizer) optimizer.dispose();
  return step;
}

async function main() {
  const { values } = parseArgs({
    options: {
      data: { type: 'string', default: 'teacher' },
      steps: { type: 'string', default: '20000' },
      batch: { type: 'string', default: '128' },
      lr: { type: 'string', default: '1e-3' },
      window: { type: 'string', default: '1000000' },
      fresh: { type: 'boolean', default: false },
    },
  });
  console.log(`[train] backend: ${await initBackend()}`);
  const games = readGames(values.data!.split(','));
  console.log(`[train] ${games.length} games from "${values.data}"`);

  const isFresh = values.fresh || !hasModel();
  const model = isFresh ? createHellModel() : await loadModel();
  console.log(
    `[train] ${isFresh ? 'new model' : `continuing from ${MODEL_DIR}`}, ${model.countParams()} parameters`
  );
  await trainOnGames(model, games, {
    steps: parseNumber(values.steps, 20_000),
    batchSize: parseNumber(values.batch, 128),
    learningRate: parseNumber(values.lr, 1e-3),
    window: parseNumber(values.window, 1_000_000),
    afterStep: async (step) => {
      if (step % 500 == 0) await saveModel(model);
    },
  });
  await saveModel(model);
  console.log(`[train] saved to ${MODEL_DIR}`);
}

if (isEntry(import.meta.url)) await main();
