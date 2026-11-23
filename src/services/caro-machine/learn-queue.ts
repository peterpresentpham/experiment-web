/** A job the queue started: resolves when it is done; `stop` ends it early. */
export type TLearnRun = { done: Promise<void>; stop: () => void };

export type TLearnQueue<T> = {
  /** Adds a job; past `maxWaiting` waiting jobs the oldest is dropped (it is not learned). */
  push: (job: T) => void;
  /** Drops the waiting jobs and stops the running one. */
  clear: () => void;
};

/**
 * Runs one job at a time. The analysis of a game takes up to tens of seconds of a core: several at
 * once, after games lost in quick succession, slowed a phone down until it was hard to use.
 */
export function createLearnQueue<T>(
  run: (job: T) => TLearnRun,
  options: { maxWaiting: number; onBusyChange: (isBusy: boolean) => void }
): TLearnQueue<T> {
  let waiting: Array<T> = [];
  let running: TLearnRun | null = null;

  function next() {
    if (running) return;
    const job = waiting.shift();
    if (job === undefined) {
      options.onBusyChange(false);
      return;
    }
    options.onBusyChange(true);
    const current = run(job);
    running = current;
    void current.done
      .catch(() => {})
      .then(() => {
        // A cleared queue already moved on.
        if (running != current) return;
        running = null;
        next();
      });
  }

  return {
    push(job) {
      waiting.push(job);
      if (waiting.length > options.maxWaiting) waiting.shift();
      next();
    },
    clear() {
      waiting = [];
      const current = running;
      running = null;
      current?.stop();
      options.onBusyChange(false);
    },
  };
}
