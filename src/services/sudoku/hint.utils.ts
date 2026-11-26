import { TSudokuGrid, TSudokuHint, TSudokuStep } from 'src/types/sudoku.type';
import { SUDOKU_CELLS } from './format.utils';
import { applyStep, createCandidates, findNextStep } from './techniques.utils';
import { popCount } from './units.utils';

/**
 * Builds a hint for the grid in play. Wrong entries come first, since no technique is sound on a
 * board with a mistake. Otherwise the hint is the chain of steps up to the next digit a person can
 * place: any eliminations that make it possible, then the placement. When no technique applies the
 * hint reveals the empty cell with the fewest candidates from the solution.
 */
export function getSudokuHint(
  values: TSudokuGrid,
  givens: TSudokuGrid,
  solution: TSudokuGrid
): TSudokuHint | null {
  const mistakes: number[] = [];
  for (let cell = 0; cell < SUDOKU_CELLS; cell++)
    if (givens[cell] === 0 && values[cell] !== 0 && values[cell] !== solution[cell])
      mistakes.push(cell);
  if (mistakes.length > 0) return { type: 'mistake', cells: mistakes };

  if (values.every((value, cell) => value === solution[cell])) return null;

  const state = createCandidates(values);
  const steps: TSudokuStep[] = [];
  for (;;) {
    const step = findNextStep(state);
    if (!step) break;
    steps.push(step);
    if (step.placement) return { type: 'steps', steps };
    applyStep(state, step);
  }

  let best = -1;
  for (let cell = 0; cell < SUDOKU_CELLS; cell++) {
    if (values[cell] !== 0) continue;
    if (best === -1 || popCount(state.masks[cell]) < popCount(state.masks[best])) best = cell;
  }
  return { type: 'reveal', cell: best, digit: solution[best] };
}
