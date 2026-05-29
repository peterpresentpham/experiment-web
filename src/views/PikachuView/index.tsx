'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PIKACHU_PIECE_SIZE } from 'src/configs/pikachu.constance';
import useAssetsPreLoader from 'src/hooks/useAssetsPreLoader';
import useEnableSoundtrack from 'src/hooks/useEnableSoundtrack';
import {
  PikachuMachineContext,
  usePikachuStateMachine,
} from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { PikachuMachineEvent, PikachuMachineState } from 'src/types/pikachu.type';
import HeaderConfig from './HeaderConfig';
import PikachuBoard from './PikachuBoard';

function PikachuViewLayout() {
  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedSaveRef = useRef(false);
  const [size, setSize] = useState(PIKACHU_PIECE_SIZE);
  const {
    board,
    metadata: { numberOfColumns, numberOfRows },
  } = usePikachuStore();
  const { state, send } = usePikachuStateMachine();
  useEnableSoundtrack();
  const assets = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => i + 1).map((i) => {
      return `/pikachu/piece${i}.png`;
    });
  }, []);
  useAssetsPreLoader(assets);

  useLayoutEffect(() => {
    if (!boardContainerRef.current) return;
    let frameId: number | null = null;

    const measure = () => {
      if (!boardContainerRef.current) return;
      const { width, height } = boardContainerRef.current.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const columnSize = width / (numberOfColumns + 2);
      const rowSize = height / (numberOfRows + 2);
      const nextSize = Math.min(columnSize, rowSize, PIKACHU_PIECE_SIZE);
      setSize((prevSize) => (Math.abs(prevSize - nextSize) < 0.5 ? prevSize : nextSize));
    };

    frameId = requestAnimationFrame(measure);

    const observer = new ResizeObserver(() => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    });
    observer.observe(boardContainerRef.current);

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [numberOfColumns, numberOfRows]);

  useEffect(() => {
    if (hasLoadedSaveRef.current) return;
    if (board.length === 0) return;
    if (state.value !== PikachuMachineState.INITIAL) return;

    hasLoadedSaveRef.current = true;
    send({ type: PikachuMachineEvent.LOAD_SAVE_GAME });
  }, [board.length, send, state.value]);

  return (
    <div className="relative container flex h-full w-full max-w-6xl flex-1 flex-col gap-4 overflow-hidden rounded-[26px] px-4 pt-2 pb-6">
      <div className="pointer-events-none absolute -top-24 right-10 h-48 w-48 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-300/20" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-sky-300/20 blur-[80px] dark:bg-sky-400/10" />
      <HeaderConfig />
      <div
        ref={boardContainerRef}
        className="flex min-h-0 w-full flex-1 items-center justify-center"
      >
        {state.value != PikachuMachineState.INITIAL && <PikachuBoard size={size} />}
      </div>
    </div>
  );
}

export default function PikachuView() {
  return (
    <PikachuMachineContext.Provider>
      <PikachuViewLayout />
    </PikachuMachineContext.Provider>
  );
}
