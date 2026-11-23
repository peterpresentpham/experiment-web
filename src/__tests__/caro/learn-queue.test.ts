import { createLearnQueue, TLearnRun } from 'src/services/caro-machine/learn-queue';
import { describe, expect, it, vi } from 'vitest';

function setup(maxWaiting = 2) {
  const runs: Array<{ job: number; finish: () => void; stop: ReturnType<typeof vi.fn> }> = [];
  const busy: Array<boolean> = [];
  const queue = createLearnQueue<number>(
    (job): TLearnRun => {
      let finish = () => {};
      const done = new Promise<void>((resolve) => (finish = resolve));
      const stop = vi.fn();
      runs.push({ job, finish, stop });
      return { done, stop };
    },
    { maxWaiting, onBusyChange: (isBusy) => busy.push(isBusy) }
  );
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
  return { queue, runs, busy, settle };
}

describe('createLearnQueue', () => {
  it('studies one game at a time, in order', async () => {
    const { queue, runs, busy, settle } = setup();
    queue.push(1);
    queue.push(2);
    queue.push(3);
    expect(runs.map((run) => run.job)).toEqual([1]);
    runs[0].finish();
    await settle();
    expect(runs.map((run) => run.job)).toEqual([1, 2]);
    runs[1].finish();
    await settle();
    runs[2].finish();
    await settle();
    expect(runs.map((run) => run.job)).toEqual([1, 2, 3]);
    expect(busy.at(-1)).toBe(false);
  });

  it('drops the oldest waiting game past the limit', async () => {
    const { queue, runs, settle } = setup(2);
    for (const job of [1, 2, 3, 4]) queue.push(job);
    runs[0].finish();
    await settle();
    runs[1].finish();
    await settle();
    expect(runs.map((run) => run.job)).toEqual([1, 3, 4]);
  });

  it('stops the running game and forgets the rest when cleared', async () => {
    const { queue, runs, busy, settle } = setup();
    queue.push(1);
    queue.push(2);
    queue.clear();
    expect(runs[0].stop).toHaveBeenCalled();
    runs[0].finish();
    await settle();
    expect(runs).toHaveLength(1);
    expect(busy.at(-1)).toBe(false);
  });
});
