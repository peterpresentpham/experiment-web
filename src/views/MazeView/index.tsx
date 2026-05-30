'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { generateMaze } from 'src/structure/maze/mazeGenerator';
import {
  ensureStartEndArePath,
  solveMazeBFS,
  validateMazeInput,
} from 'src/structure/maze/mazeSolver';
import { TCell, TMaze, TMazeViewMode } from 'src/types/maze.type';
import MazeBoard from './MazeBoard';
import MazeControls from './MazeControls';
import MazeLegend from './MazeLegend';

export default function MazeView() {
  const [maze, setMaze] = useState<TMaze>(() => generateMaze({ rows: 11, cols: 11 }));
  const [start, setStart] = useState<TCell | null>(null);
  const [end, setEnd] = useState<TCell | null>(null);
  const [mode, setMode] = useState<TMazeViewMode>('view');
  const [solution, setSolution] = useState<TCell[] | null>(null);
  const [rows, setRows] = useState(11);
  const [cols, setCols] = useState(11);
  const [error, setError] = useState<string | null>(null);
  const mazeRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(() => {
    setMaze(generateMaze({ rows, cols }));
    setStart(null);
    setEnd(null);
    setSolution(null);
    setError(null);
    setMode('view');
  }, [rows, cols]);

  const handleCellClick = useCallback(
    (cell: TCell) => {
      if (mode === 'setStart') {
        setStart(cell);
        setSolution(null);
        setError(null);
        setMode('view');
      } else if (mode === 'setEnd') {
        setEnd(cell);
        setSolution(null);
        setError(null);
        setMode('view');
      }
    },
    [mode]
  );

  const handleSolve = useCallback(() => {
    setSolution(null);
    setError(null);

    if (!start || !end) {
      setError('Please set both start and end positions.');
      return;
    }

    const validationError = validateMazeInput(maze, start, end);
    if (validationError) {
      setError(validationError);
      return;
    }

    const path = solveMazeBFS(maze, start, end);

    if (path) {
      setSolution(path);
    } else {
      setError('No path found between start and end.');
    }
  }, [maze, start, end]);

  const handleResetPath = useCallback(() => {
    setSolution(null);
    setError(null);
  }, []);

  // Compute working maze (start/end guaranteed to be path)
  const workingMaze = useMemo(() => {
    if (!start && !end) return maze;
    const s = start || { row: 1, col: 1 };
    const e = end || { row: maze.length - 2, col: maze[0].length - 2 };
    return ensureStartEndArePath(maze, s, e);
  }, [maze, start, end]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Maze Generator</h1>

      <MazeControls
        rows={rows}
        cols={cols}
        onRowsChange={setRows}
        onColsChange={setCols}
        onGenerate={handleGenerate}
        mode={mode}
        onModeChange={setMode}
        onSolve={handleSolve}
        onResetPath={handleResetPath}
        hasStart={!!start}
        hasEnd={!!end}
        hasSolution={!!solution}
      />

      {error && (
        <div className="w-full max-w-md rounded-md bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {start && end && solution && (
        <div className="text-muted-foreground text-sm">
          Path length: <span className="font-semibold">{solution.length - 1}</span> steps
        </div>
      )}

      <div ref={mazeRef} className="overflow-auto rounded-lg border p-4 shadow-sm">
        <MazeBoard
          maze={workingMaze}
          start={start}
          end={end}
          solution={solution}
          mode={mode}
          onCellClick={handleCellClick}
        />
      </div>

      <MazeLegend />
    </div>
  );
}
