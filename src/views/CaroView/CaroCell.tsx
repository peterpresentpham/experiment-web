'use client';

import { ComponentProps, memo, useMemo } from 'react';
import GameWinLines from 'src/components/games/GameWinLines';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { cn } from 'src/lib/utils';
import { TCaroGame, TTurn, TWinState } from 'src/types/caro.type';

interface TCaroCellProps extends ComponentProps<'div'> {
  location: number;
  boardSize: number;
  size: number;
  turn: TTurn | undefined;
  winTypes: TWinState['locations'][number] | undefined;
  gameType: TCaroGame;
  isCurrent: boolean;
  isWin: boolean;
  isBlindForceOver: boolean;
  shouldDisableBoard: boolean;
  onMove: (location: number) => void;
}

function CaroCell(params: TCaroCellProps) {
  const {
    location,
    boardSize,
    size,
    turn,
    winTypes,
    gameType,
    isCurrent,
    isWin,
    isBlindForceOver,
    shouldDisableBoard,
    onMove,
    ...props
  } = params;
  const { cell: cellLabel } = useMessages(caroMessages);
  const icon = useMemo(() => {
    // In blind mode, only show icon if game is over or it's the last move
    if (gameType === 'blind' && !isWin && !isCurrent) {
      return '';
    }

    if (turn === 0) return 'x';
    if (turn === 1) return 'o';
    return '';
  }, [gameType, isWin, isCurrent, turn]);

  const cellClassName = useMemo(() => {
    const baseClasses = 'flex items-center justify-center transition-colors duration-200';

    // Player 0 (X) styling
    if (turn === 0) {
      return cn(
        baseClasses,
        'font-bold text-player-1',
        winTypes && 'relative bg-player-1/10',
        gameType === 'normal' ? 'hover:bg-player-1/20!' : 'hover:bg-background/60',
        isCurrent && 'bg-player-1/20!'
      );
    }

    // Player 1 (O) styling
    if (turn === 1) {
      return cn(
        baseClasses,
        'font-bold text-player-2',
        winTypes && 'relative bg-player-2/10',
        gameType === 'normal' ? 'hover:bg-player-2/20!' : 'hover:bg-background/60',
        isCurrent && 'bg-player-2/20!'
      );
    }

    // Empty cell styling
    return cn(
      baseClasses,
      'hover:bg-secondary/40',
      isWin || isBlindForceOver
        ? 'bg-background/80'
        : cn('bg-background', shouldDisableBoard ? 'cursor-default' : 'cursor-pointer')
    );
  }, [turn, winTypes, gameType, isCurrent, isWin, isBlindForceOver, shouldDisableBoard]);

  return (
    <div
      {...props}
      role="button"
      aria-label={cellLabel(
        Math.floor(location / boardSize) + 1,
        (location % boardSize) + 1,
        icon?.toUpperCase()
      )}
      aria-disabled={shouldDisableBoard || isWin || undefined}
      className={cellClassName}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.7,
      }}
      onClick={() => onMove(location)}
    >
      {icon && (
        <span
          key={icon}
          className="flex h-full w-full animate-in items-center justify-center duration-200 zoom-in-50 fade-in"
        >
          {icon}
        </span>
      )}
      <GameWinLines turn={turn} winTypes={winTypes} />
    </div>
  );
}

export default memo(CaroCell);
