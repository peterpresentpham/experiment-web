'use client';

import { AnimatePresence, motion } from 'motion/react';
import { ComponentProps, memo, useMemo } from 'react';
import GameWinLines from 'src/components/games/GameWinLines';
import { cn } from 'src/lib/utils';
import { TCaroGame, TTurn, TWinState } from 'src/types/caro.type';

interface TCaroCellProps extends ComponentProps<'div'> {
  location: number;
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
        'text-orange-400 font-bold',
        winTypes && 'bg-orange-400/10 relative',
        gameType === 'normal' ? 'hover:bg-orange-400/20!' : 'hover:bg-background/60',
        isCurrent && 'bg-orange-400/20!'
      );
    }

    // Player 1 (O) styling
    if (turn === 1) {
      return cn(
        baseClasses,
        'text-blue-400 font-bold',
        winTypes && 'bg-blue-400/10 relative',
        gameType === 'normal' ? 'hover:bg-blue-400/20!' : 'hover:bg-background/60',
        isCurrent && 'bg-blue-400/20!'
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
      className={cellClassName}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.7,
        border: '0.5px solid var(--border)',
      }}
      onClick={() => onMove(location)}
    >
      <AnimatePresence mode="wait">
        {icon && (
          <motion.span
            key={icon}
            initial={{ scale: 0, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="flex h-full w-full items-center justify-center"
          >
            {icon}
          </motion.span>
        )}
      </AnimatePresence>
      <GameWinLines turn={turn} winTypes={winTypes} />
    </div>
  );
}

export default memo(CaroCell);
