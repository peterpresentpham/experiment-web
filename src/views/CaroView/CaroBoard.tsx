'use client';

import {
  ComponentProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(0);
  const {
    metadata: { size: boardSize, isOverride, gameType },
    numberOfBlindError,
    isBlindForceOver,
    steps,
    stepsOrder,
    winState,
    turn,
    fn: { countNumberOfBlindError },
  } = useCaroStore();
  const {
    shouldDisableBoard,
    fn: { move },
  } = useCaroStateContext();

  const errorCount = useMemo(() => {
    return numberOfBlindError[0] + numberOfBlindError[1];
  }, [numberOfBlindError]);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const measure = () => {
      if (!ref.current) return;
      const { width, height } = ref.current.getBoundingClientRect();
      const _column = (width - boardSize - 1) / boardSize;
      const _row = (height - boardSize - 1) / boardSize;
      setSize(Math.min(_column, _row, MAX_CARO_BOARD_SIZE));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [boardSize]);

  const onMove = useCallback(
    (location: number) => {
      const isWin = winState != undefined || isBlindForceOver == true;

      if (gameType == 'blind' && steps[location] != undefined) {
        countNumberOfBlindError(turn);
        soundtrack.play({ type: TSound.ERROR });
      }

      if (isOverride) {
        if (!isWin && !shouldDisableBoard && steps[location] != turn) {
          soundtrack.play({ type: TSound.CLICK });
          move(location);
        } else soundtrack.play({ type: TSound.ERROR });
      } else if (steps[location] == undefined && !isWin && !shouldDisableBoard) {
        soundtrack.play({ type: TSound.CLICK });
        move(location);
      } else soundtrack.play({ type: TSound.ERROR });
    },
    [
      countNumberOfBlindError,
      gameType,
      isBlindForceOver,
      isOverride,
      move,
      shouldDisableBoard,
      steps,
      turn,
      winState,
    ]
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

  const isWin = useMemo(() => {
    return winState != undefined || isBlindForceOver == true;
  }, [isBlindForceOver, winState]);

  return (
    <div {...props} className={cn('flex flex-col items-center gap-2', props.className)}>
      <HeaderConfig />
      <div ref={ref} className="flex h-full w-full justify-center overflow-hidden p-4">
        {size > 0 && (
          <div
            ref={caroRef}
            style={{
              width: boardSize * size + boardSize + 1,
              height: boardSize * size + boardSize + 1,
            }}
            className={cn(
              'bg-border flex flex-wrap gap-px border shadow-2xl transition-shadow duration-500',
              turn === 0 ? 'shadow-orange-400/20' : 'shadow-blue-400/20'
            )}
          >
            {locations.map((location) => {
              const _turn = steps[location];
              const _winTypes = winState?.locations?.[location];
              const isCurrent = stepsOrder.at(-1) === location;

              return (
                <CaroCell
                  key={location}
                  location={location}
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
