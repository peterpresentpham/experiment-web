import { TSudokuUnitKind } from 'src/types/sudoku.type';
import { SUDOKU_BOX_SIZE, SUDOKU_CELLS, SUDOKU_SIZE } from './format.utils';

export const rowOf = (index: number) => Math.floor(index / SUDOKU_SIZE);
export const columnOf = (index: number) => index % SUDOKU_SIZE;
export const boxOf = (index: number) =>
  Math.floor(rowOf(index) / SUDOKU_BOX_SIZE) * SUDOKU_BOX_SIZE +
  Math.floor(columnOf(index) / SUDOKU_BOX_SIZE);

export type TSudokuUnit = { kind: TSudokuUnitKind; index: number; cells: number[] };

function buildUnits() {
  const units: TSudokuUnit[] = [];
  for (let n = 0; n < SUDOKU_SIZE; n++) {
    const all = Array.from({ length: SUDOKU_CELLS }, (_, i) => i);
    units.push({ kind: 'row', index: n, cells: all.filter((i) => rowOf(i) === n) });
    units.push({ kind: 'column', index: n, cells: all.filter((i) => columnOf(i) === n) });
    units.push({ kind: 'box', index: n, cells: all.filter((i) => boxOf(i) === n) });
  }
  return units;
}

/** All 27 rows, columns and boxes. */
export const SUDOKU_UNITS = buildUnits();

export const SUDOKU_ROWS = SUDOKU_UNITS.filter((unit) => unit.kind === 'row');
export const SUDOKU_COLUMNS = SUDOKU_UNITS.filter((unit) => unit.kind === 'column');
export const SUDOKU_BOXES = SUDOKU_UNITS.filter((unit) => unit.kind === 'box');

/** For every cell, the 20 other cells that share a row, column or box with it. */
export const SUDOKU_PEERS: number[][] = Array.from({ length: SUDOKU_CELLS }, (_, index) => {
  const peers = new Set<number>();
  for (const unit of SUDOKU_UNITS)
    if (unit.cells.includes(index))
      for (const cell of unit.cells) if (cell !== index) peers.add(cell);
  return [...peers];
});

/** Lists the digits (1-9) set in a candidate bitmask. */
export function digitsOf(mask: number) {
  const digits: number[] = [];
  for (let digit = 1; digit <= SUDOKU_SIZE; digit++)
    if (mask & (1 << (digit - 1))) digits.push(digit);
  return digits;
}

export const digitBit = (digit: number) => 1 << (digit - 1);

export function popCount(mask: number) {
  let count = 0;
  for (let rest = mask; rest; rest &= rest - 1) count++;
  return count;
}
