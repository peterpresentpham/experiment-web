import { TSudokuDifficulty, TSudokuGrid, TSudokuPuzzle } from 'src/types/sudoku.type';
import { SUDOKU_CELLS } from './format.utils';
import { shuffleInPlace } from './random.utils';
import { gradeSudoku, solveWithTechniques } from './techniques.utils';
import { hasUniqueSudokuSolution, solveSudoku } from './solver.utils';

const DIFFICULTY_ORDER: TSudokuDifficulty[] = ['easy', 'medium', 'hard', 'expert'];

/** Digging stops at this many givens so an easy puzzle does not turn into a sparse one. */
export const SUDOKU_MIN_CLUES: Record<TSudokuDifficulty, number> = {
  easy: 34,
  medium: 28,
  hard: 24,
  expert: 22,
};

/** The hardest technique tier a puzzle may need while digging; expert has no technique limit. */
const MAX_TIER: Record<TSudokuDifficulty, number> = { easy: 1, medium: 2, hard: 3, expert: 3 };

/** Tries per puzzle before settling for the closest difficulty found. */
const MAX_ATTEMPTS = 40;

/**
 * Removes givens in symmetric pairs (a cell and its point mirror) for as long as the puzzle stays
 * solvable within the difficulty's limits. Techniques are sound, so a puzzle they solve is unique;
 * an expert puzzle is checked for a unique solution directly.
 */
function dig(solution: TSudokuGrid, difficulty: TSudokuDifficulty, random: () => number) {
  const puzzle = [...solution];
  const half = Array.from({ length: Math.ceil(SUDOKU_CELLS / 2) }, (_, i) => i);
  let clues = SUDOKU_CELLS;

  for (const cell of shuffleInPlace(half, random)) {
    const mirror = SUDOKU_CELLS - 1 - cell;
    const removed = cell === mirror ? 1 : 2;
    if (clues - removed < SUDOKU_MIN_CLUES[difficulty]) continue;
    const keep = [puzzle[cell], puzzle[mirror]];
    puzzle[cell] = 0;
    puzzle[mirror] = 0;

    const stillValid =
      difficulty === 'expert'
        ? hasUniqueSudokuSolution(puzzle)
        : (() => {
            const result = solveWithTechniques(puzzle, MAX_TIER[difficulty]);
            return result.solved;
          })();
    if (stillValid) clues -= removed;
    else {
      puzzle[cell] = keep[0];
      puzzle[mirror] = keep[1];
    }
  }
  return puzzle;
}

/**
 * Generates a puzzle of the requested difficulty: fill a random grid, dig holes, grade the result
 * and retry until the grade matches. Falls back to the closest grade found, reported as such.
 * The same `random` sequence always produces the same puzzle, which a daily puzzle relies on.
 */
export function generateSudoku(difficulty: TSudokuDifficulty, random: () => number): TSudokuPuzzle {
  const target = DIFFICULTY_ORDER.indexOf(difficulty);
  let best: TSudokuPuzzle | null = null;
  let bestDistance = Infinity;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const solution = solveSudoku(new Array<number>(SUDOKU_CELLS).fill(0), { random });
    if (!solution) continue; // unreachable: an empty grid always has a solution
    const puzzle = dig(solution, difficulty, random);
    const graded = gradeSudoku(puzzle);
    if (graded === difficulty) return { puzzle, solution, difficulty };
    const distance = Math.abs(DIFFICULTY_ORDER.indexOf(graded) - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = { puzzle, solution, difficulty: graded };
    }
  }
  return best as TSudokuPuzzle;
}
