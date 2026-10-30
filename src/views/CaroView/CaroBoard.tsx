'use client';

import { ComponentProps, useCallback, useEffect, useMemo, useRef } from 'react';
import useFitBoard from 'src/hooks/useFitBoard';
import { MAX_CARO_BOARD_SIZE } from 'src/configs/constance';
import { useCaroStateContext } from 'src/context/caro-state.context';
import { cn } from 'src/lib/utils';
import { soundtrack } from 'src/services/soundtrack';
import { useCaroStore } from 'src/states/caro.state';
import { TSound } from 'src/types/global';
import CaroCell from './CaroCell';
import HeaderConfig from './HeaderConfig';

export default function CaroBoard(props: ComponentProps<'div'>) {
  const caroRef = useRef<HTMLDivElement | null>(null);
  const boardSize = useCaroStore((state) => state.metadata.size);
  const gameType = useCaroStore((state) => state.metadata.gameType);
  const numberOfBlindError = useCaroStore((state) => state.numberOfBlindError);
  const isBlindForceOver = useCaroStore((state) => state.isBlindForceOver);
  const steps = useCaroStore((state) => state.steps);
  const lastStep = useCaroStore((state) => state.stepsOrder.at(-1));
  const winState = useCaroStore((state) => state.winState);
  const {
    shouldDisableBoard,
    fn: { move },
  } = useCaroStateContext();

  const errorCount = numberOfBlindError[0] + numberOfBlindError[1];

  const { ref, size } = useFitBoard(
    useCallback(
      (width, height) => {
        const column = (width - boardSize - 1) / boardSize;
        const row = (height - boardSize - 1) / boardSize;
        return Math.min(column, row, MAX_CARO_BOARD_SIZE);
      },
      [boardSize]
    )
  );

  // Reads the latest state at click time so the callback stays stable and memoized cells skip renders.
  const onMove = useCallback(
    (location: number) => {
      const { metadata, steps, turn, winState, isBlindForceOver, fn } = useCaroStore.getState();
      const isOver = winState != undefined || isBlindForceOver;
      const isOccupied = steps[location] != undefined;
      const isBlocked = isOver || shouldDisableBoard;

      if (metadata.gameType == 'blind' && isOccupied && !isBlocked)
        fn.countNumberOfBlindError(turn);

      const canMove = !isBlocked && (metadata.isOverride ? steps[location] != turn : !isOccupied);
      if (canMove) {
        soundtrack.play({ type: TSound.CLICK });
        move(location);
      } else soundtrack.play({ type: TSound.ERROR });
    },
    [move, shouldDisableBoard]
  );

  const locations = useMemo(() => {
    return Array.from({ length: boardSize * boardSize }, (_, index) => index);
  }, [boardSize]);

  useEffect(() => {
    if (errorCount > 0 && gameType == 'blind') {
      const el = caroRef.current;
      if (!el) return;

      el.classList.remove('shake-animation');
      void el.offsetWidth;
      el.classList.add('shake-animation');

      const handle = () => el.classList.remove('shake-animation');
      el.addEventListener('animationend', handle);
      return () => el.removeEventListener('animationend', handle);
    }
  }, [errorCount, gameType]);

  const isWin = winState != undefined || isBlindForceOver;

  return (
    <div {...props} className={cn('flex flex-col gap-3', props.className)}>
      <HeaderConfig />
      <div
        ref={ref}
        className="flex min-h-72 min-w-0 flex-1 items-center justify-center overflow-hidden"
      >
        {size > 0 && (
          <div
            ref={caroRef}
            style={{
              width: boardSize * size + boardSize + 1,
              height: boardSize * size + boardSize + 1,
            }}
            className="bg-border flex flex-wrap gap-px overflow-hidden rounded-lg border"
          >
            {locations.map((location) => {
              const _turn = steps[location];
              const _winTypes = winState?.locations?.[location];
              const isCurrent = lastStep === location;

              return (
                <CaroCell
                  key={location}
                  location={location}
                  boardSize={boardSize}
                  size={size}
                  turn={_turn}
                  winTypes={_winTypes}
                  gameType={gameType}
                  isCurrent={isCurrent}
                  isWin={isWin}
                  isBlindForceOver={isBlindForceOver}
                  shouldDisableBoard={shouldDisableBoard}
                  onMove={onMove}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
