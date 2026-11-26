import {
  parseSudokuGrid,
  stringifySudokuGrid,
  SUDOKU_CELLS,
} from 'src/services/sudoku/format.utils';
import { createSeededRandom as seededRandom } from 'src/services/sudoku/random.utils';
import {
  countSudokuSolutions,
  hasUniqueSudokuSolution,
  isSudokuConflictFree,
  isSudokuSolved,
  solveSudoku,
} from 'src/services/sudoku/solver.utils';
import { describe, expect, it } from 'vitest';

const EASY = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
const EASY_SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
// Known hard puzzle with a unique solution (needs real search, not just singles).
const HARD = '..............3.85..1.2.......5.7.....4...1...9.......5......73..2.1........4...9';
// Blanking every 1 and 2 of a solved grid leaves at least two solutions: swapping the two digits
// everywhere gives another valid grid.
const AMBIGUOUS = EASY_SOLUTION.replace(/[12]/g, '.');

function grid(text: string) {
  const parsed = parseSudokuGrid(text);
  if (!parsed) throw new Error('bad test grid');
  return parsed;
}

describe('sudoku format', () => {
  it('round-trips a grid and accepts the usual empty markers and whitespace', () => {
    expect(stringifySudokuGrid(grid(EASY))).toBe(EASY);
    expect(parseSudokuGrid(EASY.replace(/\./g, '0'))).toEqual(grid(EASY));
    const lines = EASY.match(/.{9}/g)!.join('\n');
    expect(parseSudokuGrid(lines)).toEqual(grid(EASY));
  });

  it('rejects the wrong length and unknown characters', () => {
    expect(parseSudokuGrid(EASY.slice(1))).toBeNull();
    expect(parseSudokuGrid('x'.repeat(SUDOKU_CELLS))).toBeNull();
    expect(parseSudokuGrid('')).toBeNull();
  });
});

describe('sudoku solver', () => {
  it('solves an easy puzzle to its known solution', () => {
    expect(stringifySudokuGrid(solveSudoku(grid(EASY))!)).toBe(EASY_SOLUTION);
  });

  it('solves a hard puzzle that needs search', () => {
    const solution = solveSudoku(grid(HARD));
    expect(solution).not.toBeNull();
    expect(isSudokuSolved(solution!)).toBe(true);
    // The solution keeps every given.
    grid(HARD).forEach((value, i) => value !== 0 && expect(solution![i]).toBe(value));
  });

  it('does not mutate its input', () => {
    const input = grid(EASY);
    const copy = [...input];
    solveSudoku(input);
    expect(input).toEqual(copy);
  });

  it('returns the grid itself when it is already solved', () => {
    const solved = grid(EASY_SOLUTION);
    expect(solveSudoku(solved)).toEqual(solved);
  });

  it('returns null for contradictory givens', () => {
    const bad = grid(EASY);
    bad[2] = 5; // 5 already sits in the first row
    expect(solveSudoku(bad)).toBeNull();
    expect(countSudokuSolutions(bad)).toBe(0);
  });

  it('returns null for a grid with no solution even though the givens do not clash', () => {
    // Row 0 uses 1-8, so cell (0,8) needs a 9, but a 9 in its column blocks it.
    const stuck = grid('12345678.' + '.'.repeat(8) + '9' + '.'.repeat(63));
    expect(isSudokuConflictFree(stuck)).toBe(true);
    expect(solveSudoku(stuck)).toBeNull();
  });

  it('returns null for malformed input', () => {
    expect(solveSudoku([1, 2, 3])).toBeNull();
    expect(solveSudoku(new Array(SUDOKU_CELLS).fill(10))).toBeNull();
    expect(solveSudoku(new Array(SUDOKU_CELLS).fill(1.5))).toBeNull();
  });
});

describe('sudoku solution counting', () => {
  it('counts one solution for a unique puzzle', () => {
    expect(countSudokuSolutions(grid(EASY))).toBe(1);
    expect(hasUniqueSudokuSolution(grid(EASY))).toBe(true);
  });

  it('stops at the limit for an ambiguous puzzle', () => {
    expect(countSudokuSolutions(grid(AMBIGUOUS), 2)).toBe(2);
    expect(hasUniqueSudokuSolution(grid(AMBIGUOUS))).toBe(false);
  });

  it('caps the count of an empty grid at the limit', () => {
    expect(countSudokuSolutions(new Array(SUDOKU_CELLS).fill(0), 5)).toBe(5);
  });
});

describe('sudoku random completion', () => {
  it('fills an empty grid with a valid solution', () => {
    const solution = solveSudoku(new Array(SUDOKU_CELLS).fill(0), { random: seededRandom(1) });
    expect(solution).not.toBeNull();
    expect(isSudokuSolved(solution!)).toBe(true);
  });

  it('is reproducible for the same seed and differs between seeds', () => {
    const empty = new Array(SUDOKU_CELLS).fill(0);
    const a = solveSudoku(empty, { random: seededRandom(7) });
    const b = solveSudoku(empty, { random: seededRandom(7) });
    const c = solveSudoku(empty, { random: seededRandom(8) });
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
});

describe('sudoku validity checks', () => {
  it('detects conflicts in a row, a column and a box', () => {
    const row = new Array(SUDOKU_CELLS).fill(0);
    row[0] = row[8] = 4;
    const column = new Array(SUDOKU_CELLS).fill(0);
    column[0] = column[72] = 4;
    const box = new Array(SUDOKU_CELLS).fill(0);
    box[0] = box[20] = 4;
    for (const bad of [row, column, box]) expect(isSudokuConflictFree(bad)).toBe(false);
    expect(isSudokuConflictFree(grid(EASY))).toBe(true);
  });

  it('only calls a full, conflict-free grid solved', () => {
    expect(isSudokuSolved(grid(EASY_SOLUTION))).toBe(true);
    expect(isSudokuSolved(grid(EASY))).toBe(false);
    const broken = grid(EASY_SOLUTION);
    broken[0] = broken[1];
    expect(isSudokuSolved(broken)).toBe(false);
  });
});
