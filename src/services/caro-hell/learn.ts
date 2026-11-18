import * as tf from '@tensorflow/tfjs-core';
import * as tfl from '@tensorflow/tfjs-layers';
import { MachineBoard } from '../caro-machine/board';
import { lookupExperience, TExperienceBook, toStone } from '../caro-machine/experience';
import { samplesFromGame, THellGame, THellSample, turnAt } from './encode';
import { THellLoss, trainStep } from './model';

export type TFineTuneOptions = {
  steps: number;
  batchSize: number;
  learningRate: number;
  random: () => number;
};

/** Small, careful updates: a handful of games must not wipe out what the base model knows. */
export const ONLINE_FINE_TUNE: Omit<TFineTuneOptions, 'random'> = {
  steps: 24,
  batchSize: 32,
  learningRate: 1e-4,
};

/** Better moves the experience book knows for the machine's plies of this game. */
export function lessonsForGame(game: THellGame, machineTurn: number, book: TExperienceBook) {
  const lessons = new Map<number, number>();
  if (book.size == 0) return lessons;
  const board = new MachineBoard(game.size, game.winMode);
  game.moves.forEach((move, ply) => {
    const turn = turnAt(ply);
    if (turn == machineTurn) {
      const learned = lookupExperience(book, board, toStone(turn));
      if (learned?.best != undefined && learned.best != move) lessons.set(ply, learned.best);
    }
    board.place(move, toStone(turn));
  });
  return lessons;
}

function pick<T>(items: Array<T>, count: number, random: () => number) {
  return Array.from({ length: count }, () => items[Math.floor(random() * items.length)]);
}

/**
 * Fine-tunes the model on a freshly finished game. Every symmetry of the new game is used, and
 * half of each batch comes from earlier games of the same board size so older lessons stay.
 * Policy targets: the winner's moves and the lessons; value targets: every position.
 */
export function fineTuneOnGame(
  model: tfl.LayersModel,
  game: THellGame,
  context: { lessons: Map<number, number>; replay: Array<THellGame> },
  options: TFineTuneOptions
): Array<THellLoss> {
  const fresh: Array<THellSample> = [];
  for (let transform = 0; transform < 8; transform++) {
    fresh.push(
      ...samplesFromGame(game, { transform, learnPolicy: 'winner', lessons: context.lessons })
    );
  }
  const older = context.replay
    .filter((item) => item.size == game.size)
    .flatMap((item) =>
      samplesFromGame(item, { transform: Math.floor(options.random() * 8), learnPolicy: 'winner' })
    );
  if (fresh.length == 0) return [];

  const optimizer = tf.train.adam(options.learningRate);
  const losses: Array<THellLoss> = [];
  for (let step = 0; step < options.steps; step++) {
    const half = older.length > 0 ? Math.floor(options.batchSize / 2) : options.batchSize;
    const batch = [
      ...pick(fresh, half, options.random),
      ...(older.length > 0 ? pick(older, options.batchSize - half, options.random) : []),
    ];
    losses.push(trainStep(model, optimizer, batch));
  }
  optimizer.dispose();
  return losses;
}
