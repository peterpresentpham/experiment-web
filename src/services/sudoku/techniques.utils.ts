import {
  TSudokuDifficulty,
  TSudokuGrid,
  TSudokuStep,
  TSudokuTechnique,
} from 'src/types/sudoku.type';
import { SUDOKU_CELLS, SUDOKU_SIZE } from './format.utils';
import {
  boxOf,
  columnOf,
  digitBit,
  digitsOf,
  popCount,
  rowOf,
  SUDOKU_BOXES,
  SUDOKU_COLUMNS,
  SUDOKU_PEERS,
  SUDOKU_ROWS,
  SUDOKU_UNITS,
} from './units.utils';

const ALL_DIGITS = (1 << SUDOKU_SIZE) - 1;

/** How hard each technique is: the hardest one a puzzle needs sets its difficulty. */
export const SUDOKU_TECHNIQUE_TIER: Record<TSudokuTechnique, 1 | 2 | 3> = {
  nakedSingle: 1,
  hiddenSingle: 1,
  nakedPair: 2,
  nakedTriple: 3,
  hiddenPair: 3,
  pointing: 2,
  claiming: 2,
  xWing: 3,
  yWing: 3,
};

/** The candidates of every empty cell as bitmasks (0 for a filled cell) next to the digits. */
export type TSudokuCandidates = { values: number[]; masks: number[] };

export function createCandidates(grid: TSudokuGrid): TSudokuCandidates {
  const values = [...grid];
  const masks = values.map(() => ALL_DIGITS);
  for (let cell = 0; cell < SUDOKU_CELLS; cell++) {
    if (values[cell] === 0) continue;
    masks[cell] = 0;
    for (const peer of SUDOKU_PEERS[cell]) masks[peer] &= ~digitBit(values[cell]);
  }
  return { values, masks };
}

export function applyStep(state: TSudokuCandidates, step: TSudokuStep) {
  if (step.placement) {
    const { cell, digit } = step.placement;
    state.values[cell] = digit;
    state.masks[cell] = 0;
    for (const peer of SUDOKU_PEERS[cell]) state.masks[peer] &= ~digitBit(digit);
    return;
  }
  for (const { cell, digits } of step.eliminations)
    for (const digit of digits) state.masks[cell] &= ~digitBit(digit);
}

type TFinder = (state: TSudokuCandidates) => TSudokuStep | null;

const nakedSingle: TFinder = ({ masks }) => {
  for (let cell = 0; cell < SUDOKU_CELLS; cell++) {
    if (popCount(masks[cell]) !== 1) continue;
    const [digit] = digitsOf(masks[cell]);
    return {
      technique: 'nakedSingle',
      placement: { cell, digit },
      eliminations: [],
      cells: [cell],
      digits: [digit],
    };
  }
  return null;
};

const hiddenSingle: TFinder = ({ masks }) => {
  for (const unit of SUDOKU_UNITS) {
    for (let digit = 1; digit <= SUDOKU_SIZE; digit++) {
      const spots = unit.cells.filter((cell) => masks[cell] & digitBit(digit));
      if (spots.length !== 1) continue;
      return {
        technique: 'hiddenSingle',
        placement: { cell: spots[0], digit },
        eliminations: [],
        cells: [spots[0]],
        digits: [digit],
        unit: { kind: unit.kind, index: unit.index },
      };
    }
  }
  return null;
};

const nakedPair: TFinder = ({ masks }) => {
  for (const unit of SUDOKU_UNITS) {
    const pairCells = unit.cells.filter((cell) => popCount(masks[cell]) === 2);
    for (let a = 0; a < pairCells.length; a++) {
      for (let b = a + 1; b < pairCells.length; b++) {
        if (masks[pairCells[a]] !== masks[pairCells[b]]) continue;
        const pairMask = masks[pairCells[a]];
        const eliminations = unit.cells
          .filter(
            (cell) => cell !== pairCells[a] && cell !== pairCells[b] && masks[cell] & pairMask
          )
          .map((cell) => ({ cell, digits: digitsOf(masks[cell] & pairMask) }));
        if (eliminations.length === 0) continue;
        return {
          technique: 'nakedPair',
          eliminations,
          cells: [pairCells[a], pairCells[b]],
          digits: digitsOf(pairMask),
          unit: { kind: unit.kind, index: unit.index },
        };
      }
    }
  }
  return null;
};

/** Naked triple: three cells whose candidates together are only three digits own those digits. */
const nakedTriple: TFinder = ({ masks }) => {
  for (const unit of SUDOKU_UNITS) {
    const open = unit.cells.filter(
      (cell) => popCount(masks[cell]) >= 2 && popCount(masks[cell]) <= 3
    );
    for (let a = 0; a < open.length; a++) {
      for (let b = a + 1; b < open.length; b++) {
        for (let c = b + 1; c < open.length; c++) {
          const union = masks[open[a]] | masks[open[b]] | masks[open[c]];
          if (popCount(union) !== 3) continue;
          const trio = [open[a], open[b], open[c]];
          const eliminations = unit.cells
            .filter((cell) => !trio.includes(cell) && masks[cell] & union)
            .map((cell) => ({ cell, digits: digitsOf(masks[cell] & union) }));
          if (eliminations.length === 0) continue;
          return {
            technique: 'nakedTriple',
            eliminations,
            cells: trio,
            digits: digitsOf(union),
            unit: { kind: unit.kind, index: unit.index },
          };
        }
      }
    }
  }
  return null;
};

/** Hidden pair: two digits that fit only the same two cells of a unit claim those cells. */
const hiddenPair: TFinder = ({ masks }) => {
  for (const unit of SUDOKU_UNITS) {
    const spots = Array.from({ length: SUDOKU_SIZE }, (_, i) =>
      unit.cells.filter((cell) => masks[cell] & digitBit(i + 1))
    );
    for (let a = 1; a <= SUDOKU_SIZE; a++) {
      if (spots[a - 1].length !== 2) continue;
      for (let b = a + 1; b <= SUDOKU_SIZE; b++) {
        const [first, second] = spots[a - 1];
        if (spots[b - 1].length !== 2 || spots[b - 1][0] !== first || spots[b - 1][1] !== second)
          continue;
        const keep = digitBit(a) | digitBit(b);
        const eliminations = [first, second]
          .filter((cell) => masks[cell] & ~keep)
          .map((cell) => ({ cell, digits: digitsOf(masks[cell] & ~keep) }));
        if (eliminations.length === 0) continue;
        return {
          technique: 'hiddenPair',
          eliminations,
          cells: [first, second],
          digits: [a, b],
          unit: { kind: unit.kind, index: unit.index },
        };
      }
    }
  }
  return null;
};

/** Pointing: a digit confined to one line inside a box leaves the rest of that line. */
const pointing: TFinder = ({ masks }) => {
  for (const box of SUDOKU_BOXES) {
    for (let digit = 1; digit <= SUDOKU_SIZE; digit++) {
      const spots = box.cells.filter((cell) => masks[cell] & digitBit(digit));
      if (spots.length < 2) continue;
      const lines =
        new Set(spots.map(rowOf)).size === 1
          ? SUDOKU_ROWS[rowOf(spots[0])]
          : new Set(spots.map(columnOf)).size === 1
            ? SUDOKU_COLUMNS[columnOf(spots[0])]
            : null;
      if (!lines) continue;
      const eliminations = lines.cells
        .filter((cell) => boxOf(cell) !== box.index && masks[cell] & digitBit(digit))
        .map((cell) => ({ cell, digits: [digit] }));
      if (eliminations.length === 0) continue;
      return {
        technique: 'pointing',
        eliminations,
        cells: spots,
        digits: [digit],
        unit: { kind: box.kind, index: box.index },
      };
    }
  }
  return null;
};

/** Claiming: a digit confined to one box inside a line leaves the rest of that box. */
const claiming: TFinder = ({ masks }) => {
  for (const line of [...SUDOKU_ROWS, ...SUDOKU_COLUMNS]) {
    for (let digit = 1; digit <= SUDOKU_SIZE; digit++) {
      const spots = line.cells.filter((cell) => masks[cell] & digitBit(digit));
      if (spots.length < 2 || new Set(spots.map(boxOf)).size !== 1) continue;
      const box = SUDOKU_BOXES[boxOf(spots[0])];
      const eliminations = box.cells
        .filter((cell) => !line.cells.includes(cell) && masks[cell] & digitBit(digit))
        .map((cell) => ({ cell, digits: [digit] }));
      if (eliminations.length === 0) continue;
      return {
        technique: 'claiming',
        eliminations,
        cells: spots,
        digits: [digit],
        unit: { kind: line.kind, index: line.index },
      };
    }
  }
  return null;
};

/** X-Wing: a digit sits in the same two columns of two rows (or the reverse) and leaves the rest. */
const xWing: TFinder = ({ masks }) => {
  for (const [lines, crossLines, crossOf] of [
    [SUDOKU_ROWS, SUDOKU_COLUMNS, columnOf],
    [SUDOKU_COLUMNS, SUDOKU_ROWS, rowOf],
  ] as const) {
    for (let digit = 1; digit <= SUDOKU_SIZE; digit++) {
      const spotsByLine = lines.map((line) =>
        line.cells.filter((cell) => masks[cell] & digitBit(digit))
      );
      for (let a = 0; a < lines.length; a++) {
        if (spotsByLine[a].length !== 2) continue;
        for (let b = a + 1; b < lines.length; b++) {
          if (spotsByLine[b].length !== 2) continue;
          const [first, second] = spotsByLine[a].map(crossOf);
          if (crossOf(spotsByLine[b][0]) !== first || crossOf(spotsByLine[b][1]) !== second)
            continue;
          const eliminations = [first, second].flatMap((cross) =>
            crossLines[cross].cells
              .filter(
                (cell) =>
                  lines[a].cells.includes(cell) === false &&
                  lines[b].cells.includes(cell) === false &&
                  masks[cell] & digitBit(digit)
              )
              .map((cell) => ({ cell, digits: [digit] }))
          );
          if (eliminations.length === 0) continue;
          return {
            technique: 'xWing',
            eliminations,
            cells: [...spotsByLine[a], ...spotsByLine[b]],
            digits: [digit],
          };
        }
      }
    }
  }
  return null;
};

/**
 * Y-Wing: a pivot with candidates AB sees two pincers AC and BC. Whatever the pivot is, one pincer
 * becomes C, so any cell that sees both pincers cannot be C.
 */
const yWing: TFinder = ({ masks }) => {
  for (let pivot = 0; pivot < SUDOKU_CELLS; pivot++) {
    if (popCount(masks[pivot]) !== 2) continue;
    const [a, b] = digitsOf(masks[pivot]);
    const pairPeers = SUDOKU_PEERS[pivot].filter((cell) => popCount(masks[cell]) === 2);
    for (const first of pairPeers) {
      const firstDigits = digitsOf(masks[first]);
      if (!firstDigits.includes(a) || firstDigits.includes(b)) continue;
      const c = firstDigits.find((digit) => digit !== a)!;
      for (const second of pairPeers) {
        if (masks[second] !== digitBit(b) + digitBit(c)) continue;
        const eliminations = SUDOKU_PEERS[first]
          .filter(
            (cell) =>
              cell !== pivot && SUDOKU_PEERS[second].includes(cell) && masks[cell] & digitBit(c)
          )
          .map((cell) => ({ cell, digits: [c] }));
        if (eliminations.length === 0) continue;
        return {
          technique: 'yWing',
          eliminations,
          cells: [pivot, first, second],
          digits: [a, b, c],
        };
      }
    }
  }
  return null;
};

/** Tried in this order, so the simplest applicable technique always explains a step. */
const FINDERS: TFinder[] = [
  nakedSingle,
  hiddenSingle,
  nakedPair,
  pointing,
  claiming,
  nakedTriple,
  hiddenPair,
  xWing,
  yWing,
];

/** The next step a person could take from the given candidates, or null when none applies. */
export function findNextStep(state: TSudokuCandidates): TSudokuStep | null {
  // A filled-in contradiction (a cell with no candidates) means no technique can help.
  for (let cell = 0; cell < SUDOKU_CELLS; cell++)
    if (state.values[cell] === 0 && state.masks[cell] === 0) return null;
  for (const finder of FINDERS) {
    const step = finder(state);
    if (step) return step;
  }
  return null;
}

export type TSudokuTechniqueSolve = {
  solved: boolean;
  /** The hardest tier used; 0 when the grid needed no step. */
  hardestTier: number;
  steps: TSudokuStep[];
};

/** Solves with the techniques above only, never guessing, and reports the hardest one needed. */
export function solveWithTechniques(grid: TSudokuGrid, maxTier = 3): TSudokuTechniqueSolve {
  const state = createCandidates(grid);
  const steps: TSudokuStep[] = [];
  let hardestTier = 0;
  for (;;) {
    if (state.values.every((value) => value !== 0)) return { solved: true, hardestTier, steps };
    const step = findNextStep(state);
    if (!step) return { solved: false, hardestTier, steps };
    const tier = SUDOKU_TECHNIQUE_TIER[step.technique];
    if (tier > maxTier) return { solved: false, hardestTier, steps };
    hardestTier = Math.max(hardestTier, tier);
    applyStep(state, step);
    steps.push(step);
  }
}

/** Grades a puzzle by the hardest technique it needs; one that needs a guess is `expert`. */
export function gradeSudoku(grid: TSudokuGrid): TSudokuDifficulty {
  const { solved, hardestTier } = solveWithTechniques(grid);
  if (!solved) return 'expert';
  return hardestTier <= 1 ? 'easy' : hardestTier === 2 ? 'medium' : 'hard';
}
