import {
  hellLearningPlan,
  LEARN_TIME_BUDGET_MS,
  MOBILE_LEARN_TIME_BUDGET_MS,
} from 'src/services/caro-hell/learning';
import { describe, expect, it } from 'vitest';

describe('hellLearningPlan', () => {
  it('skips fine-tuning the network while an engine plays', () => {
    expect(hellLearningPlan({ rapfi: 'ready', tengen: 'ready' }, 'android').fineTune).toBe(false);
    expect(hellLearningPlan({ rapfi: 'failed', tengen: 'ready' }, 'desktop').fineTune).toBe(false);
    expect(hellLearningPlan({ rapfi: 'loading', tengen: 'failed' }, 'ios').fineTune).toBe(false);
    // Not known yet: the engines were never asked for, so the network did not play either.
    expect(hellLearningPlan(null, 'desktop').fineTune).toBe(false);
  });

  it('fine-tunes the network when it is what plays', () => {
    expect(hellLearningPlan({ rapfi: 'failed', tengen: 'failed' }, 'desktop').fineTune).toBe(true);
  });

  it('gives a phone a shorter analysis', () => {
    expect(hellLearningPlan(null, 'desktop').budgetMs).toBe(LEARN_TIME_BUDGET_MS);
    expect(hellLearningPlan(null, 'android').budgetMs).toBe(MOBILE_LEARN_TIME_BUDGET_MS);
    expect(hellLearningPlan(null, 'ios').budgetMs).toBe(MOBILE_LEARN_TIME_BUDGET_MS);
  });
});
