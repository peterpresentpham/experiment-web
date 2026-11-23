'use client';

import { RefObject, useEffect, useRef } from 'react';
import { caroDeviceInfo, reportCaroGame } from 'src/services/caro-game-report/report';
import { timingOf, TTimingLog } from 'src/services/caro-game-report/timing-log';
import { hellLearningPlan } from 'src/services/caro-hell/learning';
import { TGameRecord } from 'src/services/caro-machine/experience';
import { createLearnQueue, TLearnQueue } from 'src/services/caro-machine/learn-queue';
import { useCaroExperienceStore } from 'src/states/caro-experience.state';
import { useCaroStore } from 'src/states/caro.state';
import { TCaroMachineLevel } from 'src/types/caro.type';
import {
  createMachineWorker,
  postToMachine as post,
  TCaroMachineWorkerResponse,
} from 'src/services/caro-machine/worker-client';

// Games finished while one is being analysed wait; past this many the oldest is not analysed.
const MAX_WAITING_GAMES = 2;
// Far past the analysis budget plus a fine-tune: a learner still silent then is given up on.
const LEARNER_TIMEOUT_MS = 120_000;

type TLearnJob = {
  game: string;
  record: TGameRecord;
  winner: number;
  level: TCaroMachineLevel;
};

type TParams = {
  /** The game is over and worth studying. */
  isFinished: boolean;
  /** The playing worker, told to drop old network weights after a fine-tune. */
  workerRef: RefObject<Worker | null>;
  timingRef: RefObject<TTimingLog>;
};

/** Studies one finished game in its own worker; resolves when its lessons are saved. */
function runLearner(job: TLearnJob, workerRef: RefObject<Worker | null>) {
  const experience = useCaroExperienceStore.getState();
  const learner = createMachineWorker();
  const done = new Promise<void>((resolve) => {
    learner.onmessage = (event: MessageEvent<TCaroMachineWorkerResponse>) => {
      if (event.data.type != 'learned') return;
      const { entries, hellGame } = event.data;
      const { fn } = useCaroExperienceStore.getState();
      fn.finishLearning(job.game, entries);
      if (hellGame) {
        fn.addHellGame(hellGame);
        // The playing worker still holds the old weights in memory.
        if (workerRef.current) post(workerRef.current, { type: 'reload-model' });
      }
      resolve();
    };
    learner.onerror = () => resolve();
    // The queue must not wait forever on a learner that never answers.
    setTimeout(resolve, LEARNER_TIMEOUT_MS);
  }).finally(() => learner.terminate());

  post(learner, { type: 'book', entries: experience.entries });
  const plan = hellLearningPlan(experience.hellEngines, caroDeviceInfo().device);
  post(learner, {
    type: 'learn',
    // Only the hell level fine-tunes a network; the analysis budget applies to every level.
    fineTune: job.level == 'hell' && plan.fineTune,
    budgetMs: plan.budgetMs,
    record: job.record,
    level: job.level,
    winner: job.winner,
    epoch: experience.epoch,
    replay: experience.hellGames,
  });
  return { done, stop: () => learner.terminate() };
}

/**
 * Every finished game is studied: losses for the losing move, wins and draws for close calls; at
 * the hell level, where the network plays, it is fine-tuned too. The analysis runs in its own
 * worker, one game at a time, and survives a new game. A hell-level game is also reported.
 */
export default function useCaroLearning({ isFinished, workerRef, timingRef }: TParams) {
  const queueRef = useRef<TLearnQueue<TLearnJob> | null>(null);
  const learningGameRef = useRef('');

  useEffect(() => {
    const queue = createLearnQueue<TLearnJob>((job) => runLearner(job, workerRef), {
      maxWaiting: MAX_WAITING_GAMES,
      onBusyChange: (isBusy) => useCaroExperienceStore.getState().fn.setLearning(isBusy),
    });
    queueRef.current = queue;
    return () => {
      queue.clear();
      queueRef.current = null;
    };
  }, [workerRef]);

  useEffect(() => {
    if (!isFinished) return;
    const { steps, stepsOrder, turn, winState, metadata } = useCaroStore.getState();
    const { size, winMode, machineTurn, machineLevel } = metadata;
    const game = `${size}:${winMode}:${machineTurn}:${stepsOrder.join(',')}`;
    // `lastGame` is only saved once the analysis is done, so a reload mid-way analyses it again.
    if (useCaroExperienceStore.getState().lastGame == game || learningGameRef.current == game)
      return;
    learningGameRef.current = game;

    const record: TGameRecord = {
      size,
      winMode,
      machineTurn,
      moves: stepsOrder.map((location) => ({ location, turn: steps[location] })),
    };
    // On a win the store keeps the winner as `turn`.
    const winner = winState ? turn : -1;
    if (machineLevel == 'hell') reportCaroGame(record, winner, timingOf(timingRef.current));
    queueRef.current?.push({ game, record, winner, level: machineLevel });
  }, [isFinished, timingRef]);
}
