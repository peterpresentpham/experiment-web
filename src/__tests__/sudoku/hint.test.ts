import { generateSudoku } from 'src/services/sudoku/generator.utils';
import { getSudokuHint } from 'src/services/sudoku/hint.utils';
import { createSeededRandom } from 'src/services/sudoku/random.utils';
import { describe, expect, it } from 'vitest';
import { EASY_PUZZLE, EASY_SOLUTION, grid } from './helpers';

const givens = grid(EASY_PUZZLE);
const solution = grid(EASY_SOLUTION);

describe('sudoku hint', () => {
  it('explains the next placement as a chain that ends in a correct digit', () => {
    const hint = getSudokuHint(givens, givens, solution);
    expect(hint?.type).toBe('steps');
    if (hint?.type !== 'steps') return;
    const last = hint.steps[hint.steps.length - 1];
    expect(last.placement).toBeDefined();
    expect(last.placement!.digit).toBe(solution[last.placement!.cell]);
  });

  it('points at wrong entries before anything else', () => {
    const values = [...givens];
    const cell = values.findIndex((value) => value === 0);
    values[cell] = solution[cell] === 1 ? 2 : 1;
    expect(getSudokuHint(values, givens, solution)).toEqual({ type: 'mistake', cells: [cell] });
  });

  it('ignores the givens when looking for mistakes', () => {
    expect(getSudokuHint(givens, givens, solution)?.type).toBe('steps');
  });

  it('returns null for a finished board', () => {
    expect(getSudokuHint(solution, givens, solution)).toBeNull();
  });

  it('keeps hinting until the board is solved', () => {
    const values = [...givens];
    for (let guard = 0; guard < 100; guard++) {
      const hint = getSudokuHint(values, givens, solution);
      if (!hint) break;
      if (hint.type === 'steps') {
        const { cell, digit } = hint.steps[hint.steps.length - 1].placement!;
        values[cell] = digit;
      } else if (hint.type === 'reveal') values[hint.cell] = hint.digit;
      else throw new Error('unexpected mistake hint');
    }
    expect(values).toEqual(solution);
  });

  it('reveals a cell when no technique applies', () => {
    const { puzzle, solution: expertSolution } = generateSudoku('expert', createSeededRandom(1));
    const hint = getSudokuHint(puzzle, puzzle, expertSolution);
    // An expert puzzle may open with a single; walk until techniques run dry.
    const values = [...puzzle];
    let last = hint;
    for (let guard = 0; guard < 100 && last && last.type === 'steps'; guard++) {
      const { cell, digit } = last.steps[last.steps.length - 1].placement!;
      values[cell] = digit;
      last = getSudokuHint(values, puzzle, expertSolution);
    }
    expect(last?.type).toBe('reveal');
    if (last?.type === 'reveal') expect(last.digit).toBe(expertSolution[last.cell]);
  });
});
