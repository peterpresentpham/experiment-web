import {
  countDigits,
  createBoardState,
  dailyKey,
  eraseCell,
  fillAllNotes,
  findConflicts,
  formatElapsed,
  isSudokuComplete,
  placeDigit,
  toggleNote,
} from 'src/services/sudoku/game.utils';
import { digitBit } from 'src/services/sudoku/units.utils';
import { describe, expect, it } from 'vitest';
import { EASY_PUZZLE, EASY_SOLUTION, grid } from './helpers';

const givens = grid(EASY_PUZZLE);
const solution = grid(EASY_SOLUTION);
// Row 0, column 2 is the first empty cell of the puzzle.
const EMPTY = givens.indexOf(0);

describe('sudoku board edits', () => {
  it('places a digit, clears the cell notes and the digit from its peers', () => {
    let state = createBoardState(givens);
    state = toggleNote(state, givens, EMPTY, 4);
    state = toggleNote(state, givens, 3, 4); // a peer in the same row
    state = placeDigit(state, givens, EMPTY, 4);
    expect(state.values[EMPTY]).toBe(4);
    expect(state.notes[EMPTY]).toBe(0);
    expect(state.notes[3] & digitBit(4)).toBe(0);
  });

  it('never changes a given', () => {
    const state = createBoardState(givens);
    expect(placeDigit(state, givens, 0, 9)).toBe(state);
    expect(eraseCell(state, givens, 0)).toBe(state);
    expect(toggleNote(state, givens, 0, 9)).toBe(state);
  });

  it('toggles a note on and off, and only on an empty cell', () => {
    const state = createBoardState(givens);
    const on = toggleNote(state, givens, EMPTY, 5);
    expect(on.notes[EMPTY]).toBe(digitBit(5));
    expect(toggleNote(on, givens, EMPTY, 5).notes[EMPTY]).toBe(0);
    const filled = placeDigit(state, givens, EMPTY, 4);
    expect(toggleNote(filled, givens, EMPTY, 5)).toBe(filled);
  });

  it('erases a digit and notes, and ignores an untouched cell', () => {
    const state = createBoardState(givens);
    expect(eraseCell(state, givens, EMPTY)).toBe(state);
    const filled = placeDigit(state, givens, EMPTY, 4);
    expect(eraseCell(filled, givens, EMPTY).values[EMPTY]).toBe(0);
  });

  it('does not mutate the previous state', () => {
    const state = createBoardState(givens);
    placeDigit(state, givens, EMPTY, 4);
    expect(state.values).toEqual(givens);
  });

  it('fills every empty cell with the digits it still allows', () => {
    const { notes, values } = fillAllNotes(createBoardState(givens));
    expect(values).toEqual(givens);
    givens.forEach((value, i) => {
      if (value !== 0) expect(notes[i]).toBe(0);
      else expect(notes[i] & digitBit(solution[i])).not.toBe(0);
    });
  });
});

describe('sudoku board checks', () => {
  it('finds both cells of a repeated digit', () => {
    const values = [...givens];
    values[2] = 5; // 5 is already at index 0
    expect([...findConflicts(values)].sort((a, b) => a - b)).toEqual([0, 2]);
    expect(findConflicts(givens).size).toBe(0);
  });

  it('counts digits and detects completion', () => {
    expect(countDigits(solution).slice(1)).toEqual(new Array(9).fill(9));
    expect(isSudokuComplete(solution, solution)).toBe(true);
    expect(isSudokuComplete(givens, solution)).toBe(false);
  });
});

describe('sudoku formatting', () => {
  it('formats the elapsed time', () => {
    expect(formatElapsed(0)).toBe('0:00');
    expect(formatElapsed(65)).toBe('1:05');
    expect(formatElapsed(3600)).toBe('1:00:00');
    expect(formatElapsed(3725)).toBe('1:02:05');
  });

  it('keys a daily puzzle by the local date', () => {
    expect(dailyKey(new Date(2026, 10, 6))).toBe('2026-11-06');
    expect(dailyKey(new Date(2026, 0, 31))).toBe('2026-01-31');
  });
});
