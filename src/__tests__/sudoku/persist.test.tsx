// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { LocaleProvider } from 'src/i18n/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EASY_PUZZLE, EASY_SOLUTION, grid } from './helpers';

const { generate } = vi.hoisted(() => {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    },
  });
  return { generate: vi.fn() };
});
vi.mock('src/services/sudoku/generator-client', () => ({ generateSudokuInWorker: generate }));
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
afterEach(cleanup);

describe('Sudoku reload', () => {
  it('keeps the saved game instead of generating a new one', async () => {
    const puzzle = {
      puzzle: grid(EASY_PUZZLE),
      solution: grid(EASY_SOLUTION),
      difficulty: 'easy',
    } as const;
    generate.mockResolvedValue(puzzle);
    const { default: SudokuView } = await import('src/views/SudokuView');
    const { useSudokuStore } = await import('src/states/sudoku.state');
    // First visit: nothing saved, so a game is generated.
    const first = render(
      <LocaleProvider locale="en">
        <SudokuView />
      </LocaleProvider>
    );
    await waitFor(() => expect(useSudokuStore.getState().status).toBe('playing'));
    useSudokuStore.getState().fn.select(2);
    useSudokuStore.getState().fn.input(4);
    expect(generate).toHaveBeenCalledTimes(1);
    first.unmount();

    // A reload: fresh module graph, same storage.
    vi.resetModules();
    const { default: View2 } = await import('src/views/SudokuView');
    render(
      <LocaleProvider locale="en">
        <View2 />
      </LocaleProvider>
    );
    await new Promise((r) => setTimeout(r, 50));
    expect(generate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Row 1, column 3, 4' })).toBeDefined();
  });
});
