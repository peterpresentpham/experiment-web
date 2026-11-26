import { SUDOKU_CELLS } from 'src/services/sudoku/format.utils';
import { generateSudoku, SUDOKU_MIN_CLUES } from 'src/services/sudoku/generator.utils';
import { createSeededRandom, hashSeed } from 'src/services/sudoku/random.utils';
import {
  hasUniqueSudokuSolution,
  isSudokuSolved,
  solveSudoku,
} from 'src/services/sudoku/solver.utils';
import { gradeSudoku } from 'src/services/sudoku/techniques.utils';
import { TSudokuDifficulty } from 'src/types/sudoku.type';
import { describe, expect, it } from 'vitest';

const DIFFICULTIES: TSudokuDifficulty[] = ['easy', 'medium', 'hard', 'expert'];

describe('sudoku random utils', () => {
  it('hashes the same text to the same seed and different text to another', () => {
    expect(hashSeed('sudoku:2026-11-26:easy')).toBe(hashSeed('sudoku:2026-11-26:easy'));
    expect(hashSeed('sudoku:2026-11-26:easy')).not.toBe(hashSeed('sudoku:2026-11-26:hard'));
  });

  it('yields numbers in [0, 1)', () => {
    const random = createSeededRandom(42);
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe.each(DIFFICULTIES)('sudoku generator (%s)', (difficulty) => {
  const seeds = [1, 2, 3];

  it.each(seeds)('makes a unique, correctly graded puzzle for seed %i', (seed) => {
    const result = generateSudoku(difficulty, createSeededRandom(seed));
    expect(result.puzzle).toHaveLength(SUDOKU_CELLS);
    expect(isSudokuSolved(result.solution)).toBe(true);
    // Every given matches the solution, and the solution is the only one.
    result.puzzle.forEach((value, i) => value !== 0 && expect(value).toBe(result.solution[i]));
    expect(hasUniqueSudokuSolution(result.puzzle)).toBe(true);
    expect(solveSudoku(result.puzzle)).toEqual(result.solution);
    // The reported grade is the real one, and it is the requested one.
    expect(gradeSudoku(result.puzzle)).toBe(result.difficulty);
    expect(result.difficulty).toBe(difficulty);
    expect(result.puzzle.filter(Boolean).length).toBeGreaterThanOrEqual(
      SUDOKU_MIN_CLUES[difficulty]
    );
  });

  it('is reproducible for the same seed', () => {
    expect(generateSudoku(difficulty, createSeededRandom(9))).toEqual(
      generateSudoku(difficulty, createSeededRandom(9))
    );
  });
});

describe('sudoku generator symmetry', () => {
  it('keeps the givens symmetric around the centre', () => {
    const { puzzle } = generateSudoku('medium', createSeededRandom(5));
    for (let i = 0; i < SUDOKU_CELLS; i++)
      expect(puzzle[i] === 0).toBe(puzzle[SUDOKU_CELLS - 1 - i] === 0);
  });
});
