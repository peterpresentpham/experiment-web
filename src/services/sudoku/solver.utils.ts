import { TSudokuGrid, TSudokuSolveOptions } from 'src/types/sudoku.type';
import { SUDOKU_BOX_SIZE, SUDOKU_CELLS, SUDOKU_SIZE } from './format.utils';

const ALL_DIGITS = (1 << SUDOKU_SIZE) - 1;

const rowOf = (index: number) => Math.floor(index / SUDOKU_SIZE);
const columnOf = (index: number) => index % SUDOKU_SIZE;
const boxOf = (index: number) =>
  Math.floor(rowOf(index) / SUDOKU_BOX_SIZE) * SUDOKU_BOX_SIZE +
  Math.floor(columnOf(index) / SUDOKU_BOX_SIZE);

function popCount(mask: number) {
  let count = 0;
  for (let rest = mask; rest; rest &= rest - 1) count++;
  return count;
}

/**
 * Backtracking state: one bitmask per row, column and box (bit `d - 1` set when digit `d` is used),
 * so a placement costs a few bit operations and the candidates of a cell are one AND away.
 */
class SudokuSearch {
  private readonly cells: number[];
  private readonly rows = new Array<number>(SUDOKU_SIZE).fill(0);
  private readonly columns = new Array<number>(SUDOKU_SIZE).fill(0);
  private readonly boxes = new Array<number>(SUDOKU_SIZE).fill(0);
  private readonly random?: () => number;
  /** Number of solutions found so far, capped by `limit`. */
  count = 0;
  /** The first solution found. */
  firstSolution: TSudokuGrid | null = null;

  constructor(
    grid: TSudokuGrid,
    private readonly limit: number,
    options: TSudokuSolveOptions
  ) {
    this.cells = [...grid];
    this.random = options.random;
  }

  /** False when the givens already contradict each other. */
  load(): boolean {
    for (let index = 0; index < SUDOKU_CELLS; index++) {
      const digit = this.cells[index];
      if (digit === 0) continue;
      const bit = 1 << (digit - 1);
      if (this.used(index) & bit) return false;
      this.place(index, bit);
    }
    return true;
  }

  private used(index: number) {
    return this.rows[rowOf(index)] | this.columns[columnOf(index)] | this.boxes[boxOf(index)];
  }

  private place(index: number, bit: number) {
    this.rows[rowOf(index)] |= bit;
    this.columns[columnOf(index)] |= bit;
    this.boxes[boxOf(index)] |= bit;
  }

  private remove(index: number, bit: number) {
    this.rows[rowOf(index)] &= ~bit;
    this.columns[columnOf(index)] &= ~bit;
    this.boxes[boxOf(index)] &= ~bit;
  }

  /** Lists the digit bits of `mask`, shuffled when a random source was given. */
  private orderedBits(mask: number) {
    const bits: number[] = [];
    for (let rest = mask; rest; rest &= rest - 1) bits.push(rest & -rest);
    if (this.random) {
      for (let i = bits.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [bits[i], bits[j]] = [bits[j], bits[i]];
      }
    }
    return bits;
  }

  search() {
    // MRV: branch on the empty cell with the fewest candidates. A cell with none is a dead end.
    let best = -1;
    let bestMask = 0;
    let bestCount = SUDOKU_SIZE + 1;
    for (let index = 0; index < SUDOKU_CELLS; index++) {
      if (this.cells[index] !== 0) continue;
      const mask = ALL_DIGITS & ~this.used(index);
      const candidates = popCount(mask);
      if (candidates < bestCount) {
        best = index;
        bestMask = mask;
        bestCount = candidates;
        if (candidates <= 1) break;
      }
    }

    if (best === -1) {
      this.count++;
      this.firstSolution ??= [...this.cells];
      return;
    }

    for (const bit of this.orderedBits(bestMask)) {
      this.cells[best] = Math.log2(bit) + 1;
      this.place(best, bit);
      this.search();
      this.remove(best, bit);
      this.cells[best] = 0;
      if (this.count >= this.limit) return;
    }
  }
}

function runSearch(grid: TSudokuGrid, limit: number, options: TSudokuSolveOptions) {
  if (
    grid.length !== SUDOKU_CELLS ||
    grid.some((value) => !Number.isInteger(value) || value < 0 || value > 9)
  )
    return null;
  const search = new SudokuSearch(grid, limit, options);
  if (!search.load()) return null;
  search.search();
  return search;
}

/** Solves a grid and returns the first solution, or null when it has none or is malformed. */
export function solveSudoku(grid: TSudokuGrid, options: TSudokuSolveOptions = {}) {
  return runSearch(grid, 1, options)?.firstSolution ?? null;
}

/**
 * Counts solutions up to `limit`. The generator uses `limit = 2` to learn whether a puzzle is
 * unique without enumerating every solution.
 */
export function countSudokuSolutions(grid: TSudokuGrid, limit = 2) {
  return runSearch(grid, limit, {})?.count ?? 0;
}

/** True when the grid has exactly one solution. */
export function hasUniqueSudokuSolution(grid: TSudokuGrid) {
  return countSudokuSolutions(grid, 2) === 1;
}

/** True when no row, column or box repeats a digit. Empty cells are ignored. */
export function isSudokuConflictFree(grid: TSudokuGrid) {
  if (grid.length !== SUDOKU_CELLS) return false;
  const rows = new Array<number>(SUDOKU_SIZE).fill(0);
  const columns = new Array<number>(SUDOKU_SIZE).fill(0);
  const boxes = new Array<number>(SUDOKU_SIZE).fill(0);
  for (let index = 0; index < SUDOKU_CELLS; index++) {
    const digit = grid[index];
    if (digit === 0) continue;
    const bit = 1 << (digit - 1);
    if (rows[rowOf(index)] & bit || columns[columnOf(index)] & bit || boxes[boxOf(index)] & bit)
      return false;
    rows[rowOf(index)] |= bit;
    columns[columnOf(index)] |= bit;
    boxes[boxOf(index)] |= bit;
  }
  return true;
}

/** True when every cell is filled and no digit repeats. */
export function isSudokuSolved(grid: TSudokuGrid) {
  return (
    grid.length === SUDOKU_CELLS &&
    grid.every((v) => v >= 1 && v <= 9) &&
    isSudokuConflictFree(grid)
  );
}
