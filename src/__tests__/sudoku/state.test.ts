import { dailyResultKey, useSudokuStore } from 'src/states/sudoku.state';
import { beforeEach, describe, expect, it } from 'vitest';
import { EASY_PUZZLE, EASY_SOLUTION, grid } from './helpers';

const puzzle = {
  puzzle: grid(EASY_PUZZLE),
  solution: grid(EASY_SOLUTION),
  difficulty: 'easy',
} as const;
const EMPTY = puzzle.puzzle.indexOf(0);
const store = () => useSudokuStore.getState();

function start(mode: 'random' | 'daily' = 'random') {
  store().fn.start(puzzle, {
    difficulty: 'easy',
    mode,
    dailyDate: mode === 'daily' ? '2026-11-26' : null,
  });
}

beforeEach(() => start());

describe('sudoku store', () => {
  it('starts a fresh playing game', () => {
    expect(store().status).toBe('playing');
    expect(store().board.values).toEqual(puzzle.puzzle);
    expect(store().history).toHaveLength(0);
    expect(store().elapsed).toBe(0);
  });

  it('places the selected digit, counts a wrong one as a mistake and undoes it', () => {
    store().fn.select(EMPTY);
    const wrong = puzzle.solution[EMPTY] === 1 ? 2 : 1;
    store().fn.input(wrong);
    expect(store().board.values[EMPTY]).toBe(wrong);
    expect(store().mistakes).toBe(1);
    store().fn.undo();
    expect(store().board.values[EMPTY]).toBe(0);
    store().fn.redo();
    expect(store().board.values[EMPTY]).toBe(wrong);
  });

  it('clears a cell when its digit is pressed again', () => {
    store().fn.select(EMPTY);
    store().fn.input(puzzle.solution[EMPTY]);
    store().fn.input(puzzle.solution[EMPTY]);
    expect(store().board.values[EMPTY]).toBe(0);
  });

  it('writes notes in note mode and leaves the digits alone', () => {
    store().fn.select(EMPTY);
    store().fn.toggleNoteMode();
    store().fn.input(3);
    expect(store().board.values[EMPTY]).toBe(0);
    expect(store().board.notes[EMPTY]).not.toBe(0);
    store().fn.toggleNoteMode();
  });

  it('ignores input on a given cell and with nothing selected', () => {
    store().fn.select(0);
    store().fn.input(9);
    expect(store().board.values[0]).toBe(puzzle.puzzle[0]);
    store().fn.select(null);
    store().fn.input(9);
    expect(store().history).toHaveLength(0);
  });

  it('moves the selection within the board', () => {
    store().fn.select(0);
    store().fn.moveSelection(-1, -1);
    expect(store().selected).toBe(0);
    store().fn.moveSelection(1, 1);
    expect(store().selected).toBe(10);
  });

  it('wins when the last digit goes in and then freezes the board', () => {
    const almost = [...puzzle.solution];
    almost[EMPTY] = 0;
    store().fn.start(
      { ...puzzle, puzzle: almost },
      { difficulty: 'easy', mode: 'random', dailyDate: null }
    );
    store().fn.select(EMPTY);
    store().fn.input(puzzle.solution[EMPTY]);
    expect(store().status).toBe('won');
    store().fn.tick();
    expect(store().elapsed).toBe(0);
    store().fn.undo();
    expect(store().board.values[EMPTY]).toBe(puzzle.solution[EMPTY]);
  });

  it('keeps the best time of a solved daily puzzle', () => {
    const almost = [...puzzle.solution];
    almost[EMPTY] = 0;
    const win = (seconds: number) => {
      store().fn.start(
        { ...puzzle, puzzle: almost },
        { difficulty: 'easy', mode: 'daily', dailyDate: '2026-11-26' }
      );
      for (let i = 0; i < seconds; i++) store().fn.tick();
      store().fn.select(EMPTY);
      store().fn.input(puzzle.solution[EMPTY]);
    };
    win(90);
    win(120);
    expect(store().dailyResults[dailyResultKey('2026-11-26', 'easy')]).toBe(90);
    win(60);
    expect(store().dailyResults[dailyResultKey('2026-11-26', 'easy')]).toBe(60);
  });

  it('counts a hint, selects its target and drops it on the next move', () => {
    store().fn.requestHint();
    expect(store().hint).not.toBeNull();
    expect(store().hintsUsed).toBe(1);
    expect(store().selected).not.toBeNull();
    store().fn.input(puzzle.solution[store().selected!]);
    expect(store().hint).toBeNull();
  });
});
