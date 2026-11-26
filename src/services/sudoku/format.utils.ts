import { TSudokuGrid } from 'src/types/sudoku.type';

export const SUDOKU_SIZE = 9;
export const SUDOKU_BOX_SIZE = 3;
export const SUDOKU_CELLS = SUDOKU_SIZE * SUDOKU_SIZE;

const EMPTY_CHARS = /[.0_-]/g;

/**
 * Parses an 81-character string (digits 1-9; `.`, `0`, `_` or `-` for an empty cell) into a grid.
 * Whitespace is ignored so a puzzle can be pasted as nine lines. Returns null for any other input.
 */
export function parseSudokuGrid(text: string): TSudokuGrid | null {
  const compact = text.replace(/\s+/g, '');
  if (compact.length !== SUDOKU_CELLS) return null;
  const digits = compact.replace(EMPTY_CHARS, '0');
  if (!/^[0-9]+$/.test(digits)) return null;
  return Array.from(digits, Number);
}

/** The inverse of `parseSudokuGrid`: empty cells become `.`. */
export function stringifySudokuGrid(grid: TSudokuGrid): string {
  return grid.map((value) => (value === 0 ? '.' : String(value))).join('');
}
