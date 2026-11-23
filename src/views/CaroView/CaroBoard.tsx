'use client';

import { ComponentProps, useCallback, useEffect, useMemo, useRef } from 'react';
import { MAX_CARO_BOARD_SIZE, MIN_CARO_CELL_SIZE } from 'src/configs/constance';
import { useCaroStateContext } from 'src/context/caro-state.context';
import useFitBoard from 'src/hooks/useFitBoard';
import useKeepCellInView from 'src/hooks/useKeepCellInView';
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { ref, size } = useFitBoard(
    useCallback(
      (width, height) => {
        const column = (width - boardSize - 1) / boardSize;
        const row = (height - boardSize - 1) / boardSize;
        return Math.max(MIN_CARO_CELL_SIZE, Math.min(column, row, MAX_CARO_BOARD_SIZE));
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
        // Two players on one device hear their own stone sound; otherwise this is always "you".
        const isSecond = metadata.playMode == 'offline' && turn == 1;
        soundtrack.play({ type: isSecond ? TSound.PLACE_OPPONENT : TSound.PLACE });
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
  // When the board scrolls, keep the latest move (or the centre of a new board) on screen.
  useKeepCellInView(scrollRef, size, boardSize, lastStep);

  return (
    <div {...props} className={cn('flex flex-col gap-3', props.className)}>
      <HeaderConfig />
      {/* The board is absolutely positioned so it never stretches the measured container:
          otherwise a board taller than the viewport makes the container grow, the next
          measurement keeps the oversized cells, and the bottom rows stay off screen. */}
      <div ref={ref} className="relative min-h-72 min-w-0 flex-1 overflow-hidden">
        {/* `m-auto` centres a board that fits; one that does not starts at the edge and scrolls
            (centring with justify-center would clip its top-left corner). */}
        <div ref={scrollRef} className="absolute inset-0 flex overflow-auto">
          {size > 0 && (
            <div
              ref={caroRef}
              style={{
                width: boardSize * size + boardSize + 1,
                height: boardSize * size + boardSize + 1,
              }}
              className="m-auto flex shrink-0 flex-wrap gap-px overflow-hidden rounded-lg border bg-border"
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
    </div>
  );
}
