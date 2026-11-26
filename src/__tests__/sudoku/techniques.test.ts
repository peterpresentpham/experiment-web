import { generateSudoku } from 'src/services/sudoku/generator.utils';
import { createSeededRandom } from 'src/services/sudoku/random.utils';
import {
  applyStep,
  createCandidates,
  findNextStep,
  gradeSudoku,
  solveWithTechniques,
} from 'src/services/sudoku/techniques.utils';
import { digitBit } from 'src/services/sudoku/units.utils';
import { TSudokuDifficulty } from 'src/types/sudoku.type';
import { describe, expect, it } from 'vitest';
import { EASY_PUZZLE, EASY_SOLUTION, grid } from './helpers';

describe('sudoku techniques', () => {
  it('solves an easy puzzle with singles only and grades it easy', () => {
    const result = solveWithTechniques(grid(EASY_PUZZLE));
    expect(result.solved).toBe(true);
    expect(result.hardestTier).toBe(1);
    expect(gradeSudoku(grid(EASY_PUZZLE))).toBe('easy');
  });

  it('needs no step for a solved grid and none can be found', () => {
    const result = solveWithTechniques(grid(EASY_SOLUTION));
    expect(result).toEqual({ solved: true, hardestTier: 0, steps: [] });
    expect(findNextStep(createCandidates(grid(EASY_SOLUTION)))).toBeNull();
  });

  it('gives up on a grid with a cell that has no candidate left', () => {
    const stuck = grid('12345678.' + '.'.repeat(8) + '9' + '.'.repeat(63));
    expect(solveWithTechniques(stuck).solved).toBe(false);
  });

  it('stops at the tier limit', () => {
    const { puzzle } = generateSudoku('medium', createSeededRandom(1));
    expect(solveWithTechniques(puzzle, 1).solved).toBe(false);
    expect(solveWithTechniques(puzzle, 2).solved).toBe(true);
  });

  // Soundness: a step must never place a wrong digit or remove the true digit of a cell. A
  // technique that fails this would give wrong hints and wrongly graded puzzles.
  it.each<TSudokuDifficulty>(['easy', 'medium', 'hard'])(
    'only takes sound steps on %s puzzles',
    (difficulty) => {
      const used = new Set<string>();
      for (const seed of [1, 2, 3, 4]) {
        const { puzzle, solution } = generateSudoku(difficulty, createSeededRandom(seed));
        const state = createCandidates(puzzle);
        for (;;) {
          const step = findNextStep(state);
          if (!step) break;
          used.add(step.technique);
          if (step.placement) expect(step.placement.digit).toBe(solution[step.placement.cell]);
          for (const { cell, digits } of step.eliminations) {
            expect(digits).not.toContain(solution[cell]);
            expect(state.masks[cell] & digits.reduce((m, d) => m | digitBit(d), 0)).not.toBe(0);
          }
          applyStep(state, step);
        }
        expect(state.values).toEqual(solution);
      }
      expect(used.size).toBeGreaterThan(0);
    }
  );

  it('uses the harder techniques somewhere across generated hard puzzles', () => {
    const used = new Set<string>();
    for (let seed = 1; seed <= 12; seed++) {
      const { puzzle } = generateSudoku('hard', createSeededRandom(seed));
      solveWithTechniques(puzzle).steps.forEach((step) => used.add(step.technique));
    }
    const advanced = ['nakedTriple', 'hiddenPair', 'xWing', 'yWing'];
    expect(advanced.some((technique) => used.has(technique))).toBe(true);
  });
});
