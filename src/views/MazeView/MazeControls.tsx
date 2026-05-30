'use client';

import { Button } from 'src/components/shadcn/button';
import { Input } from 'src/components/shadcn/input';
import { Label } from 'src/components/shadcn/label';
import { TMazeViewMode } from 'src/types/maze.type';

interface TProps {
  rows: number;
  cols: number;
  onRowsChange: (value: number) => void;
  onColsChange: (value: number) => void;
  onGenerate: () => void;
  mode: TMazeViewMode;
  onModeChange: (mode: TMazeViewMode) => void;
  onSolve: () => void;
  onResetPath: () => void;
  hasStart: boolean;
  hasEnd: boolean;
  hasSolution: boolean;
}

export default function MazeControls({
  rows,
  cols,
  onRowsChange,
  onColsChange,
  onGenerate,
  mode,
  onModeChange,
  onSolve,
  onResetPath,
  hasStart,
  hasEnd,
  hasSolution,
}: TProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border p-4 shadow-sm">
      {/* Size controls */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="maze-rows" className="text-xs">
            Rows
          </Label>
          <Input
            id="maze-rows"
            type="number"
            min={3}
            max={51}
            step={2}
            value={rows}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 3 && val <= 51) onRowsChange(val);
            }}
            className="h-8 w-16 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="maze-cols" className="text-xs">
            Cols
          </Label>
          <Input
            id="maze-cols"
            type="number"
            min={3}
            max={51}
            step={2}
            value={cols}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 3 && val <= 51) onColsChange(val);
            }}
            className="h-8 w-16 text-sm"
          />
        </div>
        <div className="flex-1" />
        <Button size="sm" onClick={onGenerate}>
          Generate
        </Button>
      </div>

      {/* Mode selection */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={mode === 'setStart' ? 'default' : 'outline'}
          onClick={() => onModeChange(mode === 'setStart' ? 'view' : 'setStart')}
          className="text-xs"
        >
          {hasStart ? '🟩 Change Start' : '🟩 Set Start'}
        </Button>
        <Button
          size="sm"
          variant={mode === 'setEnd' ? 'default' : 'outline'}
          onClick={() => onModeChange(mode === 'setEnd' ? 'view' : 'setEnd')}
          className="text-xs"
        >
          {hasEnd ? '🟥 Change End' : '🟥 Set End'}
        </Button>

        <div className="flex-1" />

        <Button size="sm" variant="secondary" onClick={onSolve} disabled={!hasStart || !hasEnd}>
          Solve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onResetPath}
          disabled={!hasSolution}
          className="text-xs"
        >
          Reset Path
        </Button>
      </div>
    </div>
  );
}
