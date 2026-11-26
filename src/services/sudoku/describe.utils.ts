import { TSudokuExplainContext } from 'src/i18n/messages/sudoku';
import { TSudokuStep } from 'src/types/sudoku.type';
import { columnOf, rowOf } from './units.utils';

/** Names a cell by its row and column, 1-based: `R3C4`. */
export function sudokuCellName(cell: number) {
  return `R${rowOf(cell) + 1}C${columnOf(cell) + 1}`;
}

/** Turns a step into the values its explanation text can mention. */
export function describeSudokuStep(
  step: TSudokuStep,
  unitName: (kind: 'row' | 'column' | 'box', index: number) => string
): TSudokuExplainContext {
  return {
    cell: step.placement ? sudokuCellName(step.placement.cell) : '',
    digit: step.placement?.digit ?? step.digits[0],
    cells: step.cells.map(sudokuCellName),
    digits: step.digits,
    unit: step.unit ? unitName(step.unit.kind, step.unit.index + 1) : '',
    removed: step.eliminations
      .map(({ cell, digits }) => `${sudokuCellName(cell)}: ${digits.join(', ')}`)
      .join('; '),
  };
}
