'use client';

import { useEffect, useRef, useState } from 'react';
import { reportCaroGame } from 'src/services/caro-game-report/report';
import {
  createTimingLog,
  recordEngineLoads,
  SLOW_MOVE_MS,
  slowestWaitMs,
  timingOf,
} from 'src/services/caro-game-report/timing-log';
import { TGameRecord } from 'src/services/caro-machine/experience';
import {
  machineRecovery,
  readMachineReload,
  reloadForMachine,
} from 'src/services/caro-machine/recovery';
import {
  createMachineWorker,
  postToMachine as post,
  TCaroMachineWorkerResponse,
} from 'src/services/caro-machine/worker-client';
import { soundtrack } from 'src/services/soundtrack';
import { useCaroExperienceStore } from 'src/states/caro-experience.state';
import { useCaroStore } from 'src/states/caro.state';
import { TSound } from 'src/types/global';
import useCaroLearning from './useCaroLearning';

// Easy moves are instant; a short pause makes the reply feel like a turn rather than a flicker.
const MIN_THINKING_MS = 350;

type TParams = {
  isOver: boolean;
  move: (location: number) => void;
};

/**
 * Plays the machine's moves in machine play mode, using a Web Worker for the search. A worker
 * that cannot move is restarted, then the page reloaded once (see services/caro-machine/recovery).
 */
export default function useCaroMachine({ isOver, move }: TParams) {
  const playMode = useCaroStore((state) => state.metadata.playMode);
  const machineTurn = useCaroStore((state) => state.metadata.machineTurn);
  const machineLevel = useCaroStore((state) => state.metadata.machineLevel);
  const size = useCaroStore((state) => state.metadata.size);
  const winMode = useCaroStore((state) => state.metadata.winMode);
  const turn = useCaroStore((state) => state.turn);
  const stepCount = useCaroStore((state) => state.stepsOrder.length);
  const epoch = useCaroExperienceStore((state) => state.epoch);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const timingRef = useRef(createTimingLog());
  // Bumped to replace a worker that could not move; failures count since the machine last moved.
  const [generation, setGeneration] = useState(0);
  const failuresRef = useRef(0);

  const isMachineMode = playMode == 'machine';
  const isMachineTurn = isMachineMode && turn == machineTurn && !isOver;
  const isHell = isMachineMode && machineLevel == 'hell' && size != 3;
  // The hell level's engines take hundreds of MB: leaving the level replaces the worker, which
  // frees them, rather than keeping them for a level that does not use them.
  const workerKind = !isMachineMode ? null : isHell ? 'hell' : 'search';

  useCaroLearning({
    // Easy is meant to stay beatable, and 3x3 has nothing to learn.
    isFinished: isMachineMode && machineLevel != 'easy' && size != 3 && isOver,
    workerRef,
    timingRef,
  });

  useEffect(() => {
    if (!workerKind) return;
    const worker = createMachineWorker();
    workerRef.current = worker;
    // Messages are handled in order, so the book is in place before the first move request.
    post(worker, { type: 'book', entries: useCaroExperienceStore.getState().entries });
    const unsubscribe = useCaroExperienceStore.subscribe((state, previous) => {
      if (state.entries != previous.entries) post(worker, { type: 'book', entries: state.entries });
    });

    const recover = () => {
      if (workerRef.current != worker) return;
      failuresRef.current++;
      const now = Date.now();
      const action = machineRecovery({
        failures: failuresRef.current,
        reloadedAt: readMachineReload(),
        now,
      });
      console.warn('[caro] the machine could not move:', action);
      if (action == 'restart') setGeneration((value) => value + 1);
      else if (action == 'give-up' || !reloadForMachine(now))
        useCaroExperienceStore.getState().fn.setMachineBroken(true);
    };
    const onMessage = (event: MessageEvent<TCaroMachineWorkerResponse>) => {
      const { fn } = useCaroExperienceStore.getState();
      const response = event.data;
      if (response.type == 'hell-engines') {
        fn.setHellEngines(response.engines);
        recordEngineLoads(timingRef.current, response.engines, performance.now());
      } else if (response.type == 'hell-status') {
        fn.setHellModel(response.available ? 'ready' : 'missing');
      } else if (response.type == 'move-failed') {
        if (response.id == requestIdRef.current) recover();
      } else if (response.type == 'move' && response.location >= 0) {
        failuresRef.current = 0;
        fn.setMachineBroken(false);
      }
    };
    // A worker script that no longer exists (a tab opened before a deploy) fails here.
    const onError = (event: Event) => {
      event.preventDefault();
      recover();
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    return () => {
      unsubscribe();
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      worker.terminate();
      workerRef.current = null;
    };
  }, [workerKind, generation]);

  // Loads the hell level's engine for this rule as soon as the level is picked.
  useEffect(() => {
    const worker = workerRef.current;
    if (!isHell || !worker) return;
    // Load times count from the first time the level is picked.
    timingRef.current.loadSince ??= performance.now();
    post(worker, { type: 'warm-up', epoch, winMode });
  }, [isHell, epoch, winMode, generation]);

  // Easy to hard play Tengen on boards above 3x3: its download starts when the level is picked.
  useEffect(() => {
    const worker = workerRef.current;
    if (workerKind != 'search' || size == 3 || !worker) return;
    post(worker, { type: 'preload-levels' });
  }, [workerKind, size, generation]);

  // A new position (a move, undo or new game) ends the wait of the one before; a new game (or
  // taking every move back) starts a new timing log. Runs before the move request below.
  useEffect(() => {
    const timing = timingRef.current;
    timing.waitingSince = null;
    if (stepCount == 0) timing.moves.clear();
  }, [stepCount]);

  // A player who gives up on a slow move leaves the page or puts the phone away: the game is
  // reported then, unfinished, so the slow move is seen even though the game never ends.
  useEffect(() => {
    if (!isHell) return;
    const reportIfSlow = () => {
      if (document.visibilityState != 'hidden') return;
      const timing = timingRef.current;
      const state = useCaroStore.getState();
      const { metadata, steps, stepsOrder } = state;
      const isEnded =
        Boolean(state.winState) ||
        state.isBlindForceOver ||
        stepsOrder.length >= metadata.size * metadata.size;
      const now = performance.now();
      if (isEnded || slowestWaitMs(timing, now) < SLOW_MOVE_MS) return;
      const position = `${metadata.size}:${metadata.winMode}:${stepsOrder.join(',')}`;
      if (timing.reported == position) return;
      timing.reported = position;
      const record: TGameRecord = {
        size: metadata.size,
        winMode: metadata.winMode,
        machineTurn: metadata.machineTurn,
        moves: stepsOrder.map((location) => ({ location, turn: steps[location] })),
      };
      const waitingMs = timing.waitingSince == null ? undefined : now - timing.waitingSince;
      reportCaroGame(record, null, timingOf(timing, waitingMs));
    };
    document.addEventListener('visibilitychange', reportIfSlow);
    window.addEventListener('pagehide', reportIfSlow);
    return () => {
      document.removeEventListener('visibilitychange', reportIfSlow);
      window.removeEventListener('pagehide', reportIfSlow);
    };
  }, [isHell]);

  useEffect(() => {
    const worker = workerRef.current;
    if (!isMachineTurn || !worker) return;

    const id = ++requestIdRef.current;
    const startedAt = performance.now();
    const timing = timingRef.current;
    // A restarted worker keeps the wait of the move it replaces.
    timing.waitingSince ??= startedAt;
    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Responses to an older position (after undo or a new game) carry a stale id and are dropped.
    worker.onmessage = (event: MessageEvent<TCaroMachineWorkerResponse>) => {
      const response = event.data;
      if (response.type != 'move') return;
      if (isCancelled || response.id != id || response.location < 0) return;
      const now = performance.now();
      const thinkingMs = now - startedAt;
      if (response.source)
        timing.moves.set(stepCount, {
          at: stepCount,
          ms: Math.round(now - (timing.waitingSince ?? startedAt)),
          source: response.source,
          learning: useCaroExperienceStore.getState().isLearning,
        });
      timing.waitingSince = null;
      const wait = Math.max(0, MIN_THINKING_MS - thinkingMs);
      timer = setTimeout(() => {
        if (isCancelled) return;
        soundtrack.play({ type: TSound.PLACE_OPPONENT });
        move(response.location);
      }, wait);
    };

    post(worker, {
      type: 'move',
      id,
      steps: useCaroStore.getState().steps,
      size,
      winMode,
      turn: machineTurn,
      level: machineLevel,
      epoch: useCaroExperienceStore.getState().epoch,
    });

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isMachineTurn, stepCount, size, winMode, machineTurn, machineLevel, move, generation]);

  return { isMachineTurn };
}
