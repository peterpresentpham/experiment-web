import { SUDOKU_CELLS } from 'src/services/sudoku/format.utils';
import {
  createBoardState,
  eraseCell,
  fillAllNotes,
  isSudokuComplete,
  placeDigit,
  toggleNote,
} from 'src/services/sudoku/game.utils';
import { getSudokuHint } from 'src/services/sudoku/hint.utils';
import {
  TSudokuBoardState,
  TSudokuDifficulty,
  TSudokuHint,
  TSudokuPuzzle,
} from 'src/types/sudoku.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type TSudokuMode = 'random' | 'daily';
export type TSudokuStatus = 'empty' | 'playing' | 'won';

const MAX_HISTORY = 300;

type TSudokuStateType = {
  difficulty: TSudokuDifficulty;
  mode: TSudokuMode;
  /** The date of a daily puzzle (`YYYY-MM-DD`); null in random mode. */
  dailyDate: string | null;
  status: TSudokuStatus;
  givens: number[];
  solution: number[];
  board: TSudokuBoardState;
  history: TSudokuBoardState[];
  future: TSudokuBoardState[];
  selected: number | null;
  noteMode: boolean;
  checkMistakes: boolean;
  elapsed: number;
  mistakes: number;
  hintsUsed: number;
  hint: TSudokuHint | null;
  /** Best time in seconds per `date:difficulty` of the daily puzzles that were solved. */
  dailyResults: Record<string, number>;
  fn: {
    start: (
      puzzle: TSudokuPuzzle,
      options: { difficulty: TSudokuDifficulty; mode: TSudokuMode; dailyDate: string | null }
    ) => void;
    setDifficulty: (difficulty: TSudokuDifficulty) => void;
    select: (cell: number | null) => void;
    moveSelection: (rowDelta: number, columnDelta: number) => void;
    toggleNoteMode: () => void;
    setCheckMistakes: (value: boolean) => void;
    input: (digit: number) => void;
    erase: () => void;
    undo: () => void;
    redo: () => void;
    autoNotes: () => void;
    requestHint: () => void;
    applyReveal: () => void;
    clearHint: () => void;
    tick: () => void;
  };
};

export function dailyResultKey(dailyDate: string, difficulty: TSudokuDifficulty) {
  return `${dailyDate}:${difficulty}`;
}

const emptyBoard = (): TSudokuBoardState => createBoardState(new Array(SUDOKU_CELLS).fill(0));

export const useSudokuStore = create<
  TSudokuStateType,
  [['zustand/persist', unknown], ['zustand/immer', unknown]]
>(
  persist(
    immer((set, get) => {
      /** Records the current board for undo and applies `next`; a no-op change is dropped. */
      function commit(
        state: TSudokuStateType,
        next: TSudokuBoardState,
        options: { wrongDigit?: boolean } = {}
      ) {
        if (next === state.board) return;
        state.history.push(state.board);
        if (state.history.length > MAX_HISTORY) state.history.shift();
        state.future = [];
        state.board = next;
        state.hint = null;
        if (options.wrongDigit) state.mistakes += 1;
        if (isSudokuComplete(next.values, state.solution)) {
          state.status = 'won';
          state.selected = null;
          if (state.mode === 'daily' && state.dailyDate) {
            const key = dailyResultKey(state.dailyDate, state.difficulty);
            const best = state.dailyResults[key];
            if (best === undefined || state.elapsed < best) state.dailyResults[key] = state.elapsed;
          }
        }
      }

      return {
        difficulty: 'easy',
        mode: 'random',
        dailyDate: null,
        status: 'empty',
        givens: new Array(SUDOKU_CELLS).fill(0),
        solution: new Array(SUDOKU_CELLS).fill(0),
        board: emptyBoard(),
        history: [],
        future: [],
        selected: null,
        noteMode: false,
        checkMistakes: true,
        elapsed: 0,
        mistakes: 0,
        hintsUsed: 0,
        hint: null,
        dailyResults: {},
        fn: {
          start: (puzzle, { difficulty, mode, dailyDate }) => {
            set((state) => {
              state.difficulty = difficulty;
              state.mode = mode;
              state.dailyDate = dailyDate;
              state.status = 'playing';
              state.givens = puzzle.puzzle;
              state.solution = puzzle.solution;
              state.board = createBoardState(puzzle.puzzle);
              state.history = [];
              state.future = [];
              state.selected = null;
              state.noteMode = false;
              state.elapsed = 0;
              state.mistakes = 0;
              state.hintsUsed = 0;
              state.hint = null;
            });
          },
          setDifficulty: (difficulty) => {
            set((state) => {
              state.difficulty = difficulty;
            });
          },
          select: (cell) => {
            set((state) => {
              state.selected = cell;
            });
          },
          moveSelection: (rowDelta, columnDelta) => {
            set((state) => {
              const current = state.selected ?? 0;
              const row = Math.min(8, Math.max(0, Math.floor(current / 9) + rowDelta));
              const column = Math.min(8, Math.max(0, (current % 9) + columnDelta));
              state.selected = row * 9 + column;
            });
          },
          toggleNoteMode: () => {
            set((state) => {
              state.noteMode = !state.noteMode;
            });
          },
          setCheckMistakes: (value) => {
            set((state) => {
              state.checkMistakes = value;
            });
          },
          input: (digit) => {
            set((state) => {
              const cell = state.selected;
              if (state.status !== 'playing' || cell === null || state.givens[cell] !== 0) return;
              if (state.noteMode) {
                commit(state, toggleNote(state.board, state.givens, cell, digit));
              } else if (state.board.values[cell] === digit) {
                // Pressing the digit that is already there clears it.
                commit(state, eraseCell(state.board, state.givens, cell));
              } else {
                commit(state, placeDigit(state.board, state.givens, cell, digit), {
                  wrongDigit: state.checkMistakes && state.solution[cell] !== digit,
                });
              }
            });
          },
          erase: () => {
            set((state) => {
              const cell = state.selected;
              if (state.status !== 'playing' || cell === null) return;
              commit(state, eraseCell(state.board, state.givens, cell));
            });
          },
          undo: () => {
            set((state) => {
              if (state.status !== 'playing') return;
              const previous = state.history.pop();
              if (!previous) return;
              state.future.push(state.board);
              state.board = previous;
              state.hint = null;
            });
          },
          redo: () => {
            set((state) => {
              if (state.status !== 'playing') return;
              const next = state.future.pop();
              if (!next) return;
              state.history.push(state.board);
              state.board = next;
              state.hint = null;
            });
          },
          autoNotes: () => {
            set((state) => {
              if (state.status !== 'playing') return;
              commit(state, fillAllNotes(state.board));
            });
          },
          requestHint: () => {
            const { status, board, givens, solution } = get();
            if (status !== 'playing') return;
            const hint = getSudokuHint(board.values, givens, solution);
            set((state) => {
              state.hint = hint;
              if (hint) state.hintsUsed += 1;
              if (hint?.type === 'steps') {
                const last = hint.steps[hint.steps.length - 1];
                state.selected = last.placement?.cell ?? state.selected;
              } else if (hint?.type === 'reveal') state.selected = hint.cell;
            });
          },
          applyReveal: () => {
            set((state) => {
              if (state.hint?.type !== 'reveal') return;
              const { cell, digit } = state.hint;
              commit(state, placeDigit(state.board, state.givens, cell, digit));
            });
          },
          clearHint: () => {
            set((state) => {
              state.hint = null;
            });
          },
          tick: () => {
            set((state) => {
              if (state.status === 'playing') state.elapsed += 1;
            });
          },
        },
      };
    }),
    {
      name: 'experiment.sudoku',
      version: 1,
      partialize: (state) => {
        const { fn, hint, ...rest } = state;
        return rest;
      },
    }
  )
);
