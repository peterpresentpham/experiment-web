import * as tfl from '@tensorflow/tfjs-layers';
import { findMachineMove, TCaroMachineRequest } from '../caro-machine';
import { TExperienceBook, TGameRecord } from '../caro-machine/experience';
import { THellGame } from './encode';
import { fineTuneOnGame, lessonsForGame, ONLINE_FINE_TUNE } from './learn';
import { findHellMove } from './player';
import {
  createHellEvaluator,
  hellSearchConfig,
  loadHellModel,
  saveLocalHellModel,
} from './runtime';

/** Worker-side entry points of the hell level, imported on demand by the caro worker. */

let cached: { epoch: number; model: Promise<tfl.LayersModel | null> } | undefined;

function getModel(epoch: number) {
  if (!cached || cached.epoch != epoch) {
    void cached?.model.then((model) => model?.dispose());
    cached = { epoch, model: loadHellModel(epoch).catch(() => null) };
  }
  return cached.model;
}

/** Drops the cached model so the next move loads the freshly fine-tuned copy. */
export function resetHellModel() {
  void cached?.model.then((model) => model?.dispose());
  cached = undefined;
}

/** Loads the model ahead of the first move; returns whether a trained model exists. */
export async function warmUpHell(epoch: number) {
  return (await getModel(epoch)) != null;
}

/** Without a trained model the hell level plays the hard search, so it is never a pushover. */
export async function findHellLevelMove(
  request: Omit<TCaroMachineRequest, 'level'>,
  epoch: number,
  book: TExperienceBook
) {
  const model = await getModel(epoch);
  if (!model)
    return { location: findMachineMove({ ...request, level: 'hard', book }), available: false };
  const location = findHellMove(
    { ...request, book },
    createHellEvaluator(model),
    await hellSearchConfig()
  );
  return { location, available: true };
}

/**
 * Fine-tunes this browser's copy of the network on a finished game and saves it.
 * Returns the game as stored for future replay, or null when there is no model to train.
 */
export async function learnHellGame(
  record: TGameRecord,
  winner: number,
  context: { book: TExperienceBook; replay: Array<THellGame>; epoch: number }
): Promise<THellGame | null> {
  // A separate instance: the learner worker must not share weights with a playing worker.
  const model = await loadHellModel(context.epoch).catch(() => null);
  if (!model) return null;
  const game: THellGame = {
    size: record.size,
    winMode: record.winMode,
    moves: record.moves.map((move) => move.location),
    winner,
  };
  try {
    const lessons = lessonsForGame(game, record.machineTurn, context.book);
    fineTuneOnGame(
      model,
      game,
      { lessons, replay: context.replay },
      { ...ONLINE_FINE_TUNE, random: Math.random }
    );
    return (await saveLocalHellModel(model, context.epoch)) ? game : null;
  } finally {
    model.dispose();
  }
}
