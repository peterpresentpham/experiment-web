import { TSudokuBoardState, TSudokuGrid } from 'src/types/sudoku.type';
import { SUDOKU_CELLS, SUDOKU_SIZE } from './format.utils';
import { createCandidates } from './techniques.utils';
import { digitBit, SUDOKU_PEERS } from './units.utils';

export function createBoardState(puzzle: TSudokuGrid): TSudokuBoardState {
  return { values: [...puzzle], notes: new Array<number>(SUDOKU_CELLS).fill(0) };
}

/** Puts a digit in a cell, clears its notes and drops the digit from the notes of its peers. */
export function placeDigit(
  state: TSudokuBoardState,
  givens: TSudokuGrid,
  cell: number,
  digit: number
): TSudokuBoardState {
  if (givens[cell] !== 0 || state.values[cell] === digit) return state;
  const values = [...state.values];
  const notes = [...state.notes];
  values[cell] = digit;
  notes[cell] = 0;
  for (const peer of SUDOKU_PEERS[cell]) notes[peer] &= ~digitBit(digit);
  return { values, notes };
}

/** Flips a pencil mark. Marks only exist on an empty cell, so a filled cell is left alone. */
export function toggleNote(
  state: TSudokuBoardState,
  givens: TSudokuGrid,
  cell: number,
  digit: number
): TSudokuBoardState {
  if (givens[cell] !== 0 || state.values[cell] !== 0) return state;
  const notes = [...state.notes];
  notes[cell] ^= digitBit(digit);
  return { values: state.values, notes };
}

/** Clears a cell's digit and notes. A given or an already empty cell is left alone. */
export function eraseCell(
  state: TSudokuBoardState,
  givens: TSudokuGrid,
  cell: number
): TSudokuBoardState {
  if (givens[cell] !== 0 || (state.values[cell] === 0 && state.notes[cell] === 0)) return state;
  const values = [...state.values];
  const notes = [...state.notes];
  values[cell] = 0;
  notes[cell] = 0;
  return { values, notes };
}

/** Fills the notes of every empty cell with the digits its row, column and box still allow. */
export function fillAllNotes(state: TSudokuBoardState): TSudokuBoardState {
  const { masks } = createCandidates(state.values);
  return { values: state.values, notes: masks };
}

/** The cells whose digit repeats in their row, column or box. */
export function findConflicts(values: TSudokuGrid): Set<number> {
  const conflicts = new Set<number>();
  for (let cell = 0; cell < SUDOKU_CELLS; cell++) {
    if (values[cell] === 0) continue;
    if (SUDOKU_PEERS[cell].some((peer) => values[peer] === values[cell])) conflicts.add(cell);
  }
  return conflicts;
}

/** How many times each digit is on the board, indexed by digit (index 0 is unused). */
export function countDigits(values: TSudokuGrid): number[] {
  const counts = new Array<number>(SUDOKU_SIZE + 1).fill(0);
  for (const value of values) counts[value]++;
  return counts;
}

export function isSudokuComplete(values: TSudokuGrid, solution: TSudokuGrid) {
  return values.length === solution.length && values.every((value, i) => value === solution[i]);
}

/** A local calendar date as `YYYY-MM-DD`, the key of the daily puzzle. */
export function dailyKey(date: Date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Formats seconds as `m:ss`, or `h:mm:ss` from one hour on. */
export function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}
