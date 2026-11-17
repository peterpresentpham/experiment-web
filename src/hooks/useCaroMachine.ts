'use client';

import { useEffect, useRef } from 'react';
import { soundtrack } from 'src/services/soundtrack';
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

/** Plays the machine's moves in machine play mode, using a Web Worker for the search. */
export default function useCaroMachine({ isOver, move }: TParams) {
  const playMode = useCaroStore((state) => state.metadata.playMode);
  const machineTurn = useCaroStore((state) => state.metadata.machineTurn);
  const machineLevel = useCaroStore((state) => state.metadata.machineLevel);
  const size = useCaroStore((state) => state.metadata.size);
  const winMode = useCaroStore((state) => state.metadata.winMode);
  const turn = useCaroStore((state) => state.turn);
  const stepCount = useCaroStore((state) => state.stepsOrder.length);
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  const isMachineMode = playMode == 'machine';
  const isMachineTurn = isMachineMode && turn == machineTurn && !isOver;

  useEffect(() => {
    if (!isMachineMode) return;
    const worker = new Worker(new URL('../workers/caro-machine.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [isMachineMode]);

  useEffect(() => {
    const worker = workerRef.current;
    if (!isMachineTurn || !worker) return;

    const id = ++requestIdRef.current;
    const startedAt = performance.now();
    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Responses to an older position (after undo or a new game) carry a stale id and are dropped.
    worker.onmessage = (event: MessageEvent<TCaroMachineWorkerResponse>) => {
      const { id: responseId, location } = event.data;
      if (isCancelled || responseId != id || location < 0) return;
      const wait = Math.max(0, MIN_THINKING_MS - (performance.now() - startedAt));
      timer = setTimeout(() => {
        if (isCancelled) return;
        soundtrack.play({ type: TSound.CLICK });
        move(location);
      }, wait);
    };

    const request: TCaroMachineWorkerRequest = {
      id,
      steps: useCaroStore.getState().steps,
      size,
      winMode,
      turn: machineTurn,
      level: machineLevel,
    };
    worker.postMessage(request);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isMachineTurn, stepCount, size, winMode, machineTurn, machineLevel, move]);

  return { isMachineTurn };
}
