// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LocaleProvider } from 'src/i18n/client';
import { useSudokuStore } from 'src/states/sudoku.state';
import SudokuBoard from 'src/views/SudokuView/SudokuBoard';
import SudokuControls from 'src/views/SudokuView/SudokuControls';
import SudokuHintPanel from 'src/views/SudokuView/SudokuHintPanel';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { EASY_PUZZLE, EASY_SOLUTION, grid } from './helpers';

// Node ships its own half-working `localStorage` global that shadows jsdom's; the persisted store
// needs a working one before it is created.
vi.hoisted(() => {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
      removeItem: (key: string) => void data.delete(key),
      clear: () => data.clear(),
    },
  });
});

const puzzle = {
  puzzle: grid(EASY_PUZZLE),
  solution: grid(EASY_SOLUTION),
  difficulty: 'easy',
} as const;
const EMPTY = puzzle.puzzle.indexOf(0);

beforeAll(() => {
  // jsdom has no layout engine and no ResizeObserver.
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  useSudokuStore
    .getState()
    .fn.start(puzzle, { difficulty: 'easy', mode: 'random', dailyDate: null });
});
afterEach(cleanup);

function renderGame() {
  return render(
    <LocaleProvider locale="en">
      <SudokuBoard />
      <SudokuControls />
      <SudokuHintPanel />
    </LocaleProvider>
  );
}

describe('Sudoku UI', () => {
  it('renders 81 cells and labels givens and empty cells', () => {
    renderGame();
    expect(screen.getAllByRole('button', { pressed: false }).length).toBeGreaterThanOrEqual(81);
    expect(screen.getByRole('button', { name: 'Row 1, column 1, 5, given' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Row 1, column 3, empty' })).toBeDefined();
  });

  it('fills the selected cell from the digit pad', () => {
    renderGame();
    fireEvent.click(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    fireEvent.click(screen.getByRole('button', { name: /^4, \d left$/ }));
    expect(useSudokuStore.getState().board.values[EMPTY]).toBe(4);
    expect(screen.getByRole('button', { name: 'Row 1, column 3, 4' })).toBeDefined();
  });

  it('shows pencil notes in note mode', () => {
    renderGame();
    fireEvent.click(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    fireEvent.click(screen.getByRole('button', { name: 'Notes' }));
    fireEvent.click(screen.getByRole('button', { name: /^2, \d left$/ }));
    expect(screen.getByRole('button', { name: 'Row 1, column 3, empty, notes 2' })).toBeDefined();
  });

  it('explains a hint and dismisses it', () => {
    renderGame();
    fireEvent.click(screen.getByRole('button', { name: 'Hint' }));
    expect(screen.getByRole('heading', { name: 'Hint' })).toBeDefined();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('heading', { name: 'Hint' })).toBeNull();
  });

  it('disables the controls once the game is won', () => {
    const almost = [...puzzle.solution];
    almost[EMPTY] = 0;
    useSudokuStore
      .getState()
      .fn.start(
        { ...puzzle, puzzle: almost },
        { difficulty: 'easy', mode: 'random', dailyDate: null }
      );
    renderGame();
    fireEvent.click(screen.getByRole('button', { name: 'Row 1, column 3, empty' }));
    fireEvent.click(screen.getByRole('button', { name: /^4, \d left$/ }));
    expect(useSudokuStore.getState().status).toBe('won');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Hint' }).disabled).toBe(true);
  });
});
