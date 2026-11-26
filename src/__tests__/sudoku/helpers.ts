import { parseSudokuGrid } from 'src/services/sudoku/format.utils';

export const EASY_PUZZLE =
  '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
export const EASY_SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

export function grid(text: string) {
  const parsed = parseSudokuGrid(text);
  if (!parsed) throw new Error('bad test grid');
  return parsed;
}
