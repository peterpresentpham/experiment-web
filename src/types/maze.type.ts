export const CELL = { WALL: 1, PATH: 0 };

export type TCell = { row: number; col: number };

export type TCellState = 'default' | 'start' | 'end' | 'solution' | 'visited';

export type TMaze = number[][];

export type TMazeConfig = {
  rows: number;
  cols: number;
};

export type TMazeViewMode = 'view' | 'setStart' | 'setEnd';

export type TMazeViewState = {
  maze: TMaze;
  start: TCell | null;
  end: TCell | null;
  mode: TMazeViewMode;
  solution: TCell[] | null;
  rows: number;
  cols: number;
  error: string | null;
};
