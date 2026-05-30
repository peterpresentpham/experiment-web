'use client';

import { memo, useCallback } from 'react';
import { TCell, TMaze, TMazeViewMode } from 'src/types/maze.type';
import MazeCell from './MazeCell';

interface TProps {
  maze: TMaze;
  start: TCell | null;
  end: TCell | null;
  solution: TCell[] | null;
  mode: TMazeViewMode;
  onCellClick: (cell: TCell) => void;
}

function MazeBoard({ maze, start, end, solution, mode, onCellClick }: TProps) {
  const solutionSet = new Set(solution?.map((c) => `${c.row},${c.col}`));

  const handleClick = useCallback(
    (row: number, col: number) => {
      if (mode === 'view') return;
      onCellClick({ row, col });
    },
    [mode, onCellClick]
  );

  return (
    <div
      className="inline-grid gap-0"
      style={{
        gridTemplateColumns: `repeat(${maze[0].length}, 1fr)`,
      }}
    >
      {maze.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isStart = start?.row === rowIndex && start?.col === colIndex;
          const isEnd = end?.row === rowIndex && end?.col === colIndex;
          const isSolution = solutionSet.has(`${rowIndex},${colIndex}`);

          return (
            <MazeCell
              key={`${rowIndex}-${colIndex}`}
              isWall={cell === 1}
              isStart={isStart}
              isEnd={isEnd}
              isSolution={isSolution}
              isClickable={mode !== 'view'}
              onClick={() => handleClick(rowIndex, colIndex)}
            />
          );
        })
      )}
    </div>
  );
}

export default memo(MazeBoard);
