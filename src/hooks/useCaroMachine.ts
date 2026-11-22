'use client';

import { useEffect, useRef } from 'react';
import { reportCaroGame } from 'src/services/caro-game-report/report';
import { TGameRecord } from 'src/services/caro-machine/experience';
import { soundtrack } from 'src/services/soundtrack';
import { useCaroExperienceStore } from 'src/states/caro-experience.state';
import { useCaroStore } from 'src/states/caro.state';
import { TSound } from 'src/types/global';
import type {
  TCaroMachineWorkerRequest,
  TCaroMachineWorkerResponse,
} from 'src/workers/caro-machine.worker';

// Easy moves are instant; a short pause makes the reply feel like a turn rather than a flicker.
const MIN_THINKING_MS = 350;

type TParams = {
  isOver: boolean;
  move: (location: number) => void;
};

function createMachineWorker() {
  return new Worker(new URL('../workers/caro-machine.worker.ts', import.meta.url), {
    type: 'module',
  });
}

function post(worker: Worker, request: TCaroMachineWorkerRequest) {
  worker.postMessage(request);
}

/**
 * Plays the machine's moves in machine play mode, using a Web Worker for the search.
 * After a loss, a second worker analyses the game and the lessons go into the experience book.
 */
export default function useCaroMachine({ isOver, move }: TParams) {
  const playMode = useCaroStore((state) => state.metadata.playMode);
  const machineTurn = useCaroStore((state) => state.metadata.machineTurn);
  const machineLevel = useCaroStore((state) => state.metadata.machineLevel);
  const size = useCaroStore((state) => state.metadata.size);
  const winMode = useCaroStore((state) => state.metadata.winMode);
  const turn = useCaroStore((state) => state.turn);
  const hasWinner = useCaroStore((state) => Boolean(state.winState));
  const stepCount = useCaroStore((state) => state.stepsOrder.length);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  const isMachineMode = playMode == 'machine';
  const isMachineTurn = isMachineMode && turn == machineTurn && !isOver;
  // Every finished game is studied: losses for the losing move, wins and draws for close calls;
  // at the hell level the network is fine-tuned on it too. Easy is meant to stay beatable.
  const canLearn = isMachineMode && machineLevel != 'easy' && size != 3;
  const isFinished = canLearn && isOver;
  const epoch = useCaroExperienceStore((state) => state.epoch);
  const isHell = isMachineMode && machineLevel == 'hell' && size != 3;

  useEffect(() => {
    if (!isMachineMode) return;
    const worker = createMachineWorker();
    workerRef.current = worker;
    // Messages are handled in order, so the book is in place before the first move request.
    post(worker, { type: 'book', entries: useCaroExperienceStore.getState().entries });
    const unsubscribe = useCaroExperienceStore.subscribe((state, previous) => {
      if (state.entries != previous.entries) post(worker, { type: 'book', entries: state.entries });
    });
    const onStatus = (event: MessageEvent<TCaroMachineWorkerResponse>) => {
      if (event.data.type != 'hell-status') return;
      useCaroExperienceStore.getState().fn.setHellModel(event.data.available ? 'ready' : 'missing');
    };
    worker.addEventListener('message', onStatus);
    return () => {
      unsubscribe();
      worker.removeEventListener('message', onStatus);
      worker.terminate();
      workerRef.current = null;
    };
  }, [isMachineMode]);

  // Loads the hell level's engine for this rule as soon as the level is picked.
  useEffect(() => {
    const worker = workerRef.current;
    if (isHell && worker) post(worker, { type: 'warm-up', epoch, winMode });
  }, [isHell, epoch, winMode]);

  useEffect(() => {
    const worker = workerRef.current;
    if (!isMachineTurn || !worker) return;

    const id = ++requestIdRef.current;
    const startedAt = performance.now();
    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Responses to an older position (after undo or a new game) carry a stale id and are dropped.
    worker.onmessage = (event: MessageEvent<TCaroMachineWorkerResponse>) => {
      const response = event.data;
      if (response.type != 'move') return;
      if (isCancelled || response.id != id || response.location < 0) return;
      const wait = Math.max(0, MIN_THINKING_MS - (performance.now() - startedAt));
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
  }, [isMachineTurn, stepCount, size, winMode, machineTurn, machineLevel, move]);

  // The analysis takes several seconds, so it runs in its own worker and survives a new game.
  const learnersRef = useRef(new Set<Worker>());
  const learningGameRef = useRef('');
  useEffect(() => {
    if (!isFinished) return;
    const { steps, stepsOrder } = useCaroStore.getState();
    const game = `${size}:${winMode}:${machineTurn}:${stepsOrder.join(',')}`;
    const experience = useCaroExperienceStore.getState();
    // `lastGame` is only saved once the analysis is done, so a reload mid-way analyses it again.
    if (experience.lastGame == game || learningGameRef.current == game) return;
    learningGameRef.current = game;

    const record: TGameRecord = {
      size,
      winMode,
      machineTurn,
      moves: stepsOrder.map((location) => ({ location, turn: steps[location] })),
    };
    // On a win the store keeps the winner as `turn`.
    const winner = hasWinner ? turn : -1;
    if (machineLevel == 'hell') reportCaroGame(record, winner);
    // Runs silently; the outcome only shows up as the lesson count in the caro settings.
    experience.fn.setLearning(true);

    const learner = createMachineWorker();
    learnersRef.current.add(learner);
    const finish = () => {
      learner.terminate();
      learnersRef.current.delete(learner);
      if (learnersRef.current.size == 0) useCaroExperienceStore.getState().fn.setLearning(false);
    };
    learner.onmessage = (event: MessageEvent<TCaroMachineWorkerResponse>) => {
      if (event.data.type != 'learned') return;
      const { entries, hellGame } = event.data;
      const { fn } = useCaroExperienceStore.getState();
      fn.finishLearning(game, entries);
      if (hellGame) {
        fn.addHellGame(hellGame);
        // The playing worker still holds the old weights in memory.
        if (workerRef.current) post(workerRef.current, { type: 'reload-model' });
      }
      finish();
    };
    learner.onerror = finish;
    post(learner, { type: 'book', entries: experience.entries });
    post(learner, {
      type: 'learn',
      record,
      level: machineLevel,
      winner,
      epoch: experience.epoch,
      replay: experience.hellGames,
    });
  }, [isFinished, hasWinner, turn, size, winMode, machineTurn, machineLevel]);

  useEffect(() => {
    const learners = learnersRef.current;
    return () => {
      learners.forEach((learner) => learner.terminate());
      learners.clear();
      useCaroExperienceStore.getState().fn.setLearning(false);
    };
  }, []);

  return { isMachineTurn };
}
