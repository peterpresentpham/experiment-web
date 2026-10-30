'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { PIKACHU_PIECE_SIZE } from 'src/configs/pikachu.constance';
import useFitBoard from 'src/hooks/useFitBoard';
import useAssetsPreLoader from 'src/hooks/useAssetsPreLoader';
import useEnableSoundtrack from 'src/hooks/useEnableSoundtrack';
import { PikachuMachineContext, usePikachuSend } from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { PikachuMachineEvent, PikachuMachineState } from 'src/types/pikachu.type';
import HeaderConfig from './HeaderConfig';
import PikachuBoard from './PikachuBoard';

function PikachuViewLayout() {
  const hasLoadedSaveRef = useRef(false);
  const {
    board,
    metadata: { numberOfColumns, numberOfRows },
  } = usePikachuStore();
  const send = usePikachuSend();
  const isInitial = PikachuMachineContext.useSelector(
    (snapshot) => snapshot.value === PikachuMachineState.INITIAL
  );
  useEnableSoundtrack();
  const assets = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => i + 1).map((i) => {
      return `/pikachu/piece${i}.png`;
    });
  }, []);
  useAssetsPreLoader(assets);

  const { ref: boardContainerRef, size } = useFitBoard(
    useCallback(
      (width, height) => {
        const columnSize = width / (numberOfColumns + 2);
        const rowSize = height / (numberOfRows + 2);
        return Math.min(columnSize, rowSize, PIKACHU_PIECE_SIZE);
      },
      [numberOfColumns, numberOfRows]
    ),
    PIKACHU_PIECE_SIZE
  );

  useEffect(() => {
    if (hasLoadedSaveRef.current) return;
    if (board.length === 0) return;
    if (!isInitial) return;

    hasLoadedSaveRef.current = true;
    send({ type: PikachuMachineEvent.LOAD_SAVE_GAME });
  }, [board.length, send, isInitial]);

  return (
    <div className="container flex flex-1 flex-col gap-3">
      <HeaderConfig />
      <div
        ref={boardContainerRef}
        className="flex min-h-72 min-w-0 flex-1 items-center justify-center overflow-hidden"
      >
        {!isInitial && <PikachuBoard size={size} />}
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
