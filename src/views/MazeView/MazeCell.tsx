'use client';

import { memo } from 'react';
import { cn } from 'src/lib/utils';

interface TProps {
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isSolution: boolean;
  isClickable: boolean;
  onClick: () => void;
}

function MazeCell({ isWall, isStart, isEnd, isSolution, isClickable, onClick }: TProps) {
  return (
    <button
      type="button"
      className={cn(
        // Wall cells are thin bars; path cells are larger squares
        'border-0 p-0 transition-colors',
        isWall
          ? 'h-0.75 w-0.75 bg-zinc-800 sm:h-1 sm:w-1 md:h-1.25 md:w-1.25 dark:bg-zinc-700'
          : 'h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6',
        // Path (default)
        !isWall && !isStart && !isEnd && !isSolution && 'bg-zinc-100 dark:bg-zinc-600',
        // Start
        isStart && 'bg-emerald-500',
        // End
        isEnd && 'bg-red-500',
        // Solution
        isSolution && !isStart && !isEnd && 'bg-amber-400 dark:bg-amber-500',
        // Clickable hover
        isClickable && !isWall && 'cursor-pointer hover:opacity-80',
        // Non-clickable / wall
        (!isClickable || isWall) && 'cursor-default'
      )}
      onClick={onClick}
      aria-label={
        isStart ? 'Start' : isEnd ? 'End' : isWall ? 'Wall' : isSolution ? 'Solution path' : 'Path'
      }
    />
  );
}

export default memo(MazeCell);
