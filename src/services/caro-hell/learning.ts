import type { TCaroDevice } from 'src/services/caro-game-report/validate';
import { TCaroHellEngines } from 'src/types/caro.type';

/** The analysis of a finished game on a desktop: one core, at most this long. */
export const LEARN_TIME_BUDGET_MS = 30_000;
/** On a phone the same analysis heats it up and slows down everything else on it. */
export const MOBILE_LEARN_TIME_BUDGET_MS = 10_000;

export type THellLearningPlan = {
  /**
   * Whether to fine-tune the TensorFlow.js network on the game. It only plays when neither
   * engine can, and fine-tuning loads TensorFlow.js and trains on the GPU (WebGL): on a phone
   * that made the whole device lag after every game, for a network that was never used.
   */
  fineTune: boolean;
  /** Time for looking for the losing move and missed wins (the lessons the engines use). */
  budgetMs: number;
};

export function hellLearningPlan(
  engines: TCaroHellEngines | null,
  device: TCaroDevice
): THellLearningPlan {
  return {
    fineTune: engines != null && engines.rapfi == 'failed' && engines.tengen == 'failed',
    budgetMs: device == 'desktop' ? LEARN_TIME_BUDGET_MS : MOBILE_LEARN_TIME_BUDGET_MS,
  };
}
