/** A 9x9 grid in row-major order: 81 values, 0 for an empty cell and 1-9 for a digit. */
export type TSudokuGrid = number[];

export type TSudokuSolveOptions = {
  /**
   * Random source in [0, 1). When set, candidates are tried in a random order, which makes the
   * solver produce a random completed grid from an empty one. Without it the order is ascending.
   */
  random?: () => number;
};

export type TSudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type TSudokuPuzzle = {
  /** The givens, 0 for an empty cell. */
  puzzle: TSudokuGrid;
  solution: TSudokuGrid;
  /** The graded difficulty, which can differ from the requested one if generation fell back. */
  difficulty: TSudokuDifficulty;
};

/** Human solving techniques, easiest first. */
export type TSudokuTechnique =
  | 'nakedSingle'
  | 'hiddenSingle'
  | 'nakedPair'
  | 'nakedTriple'
  | 'hiddenPair'
  | 'pointing'
  | 'claiming'
  | 'xWing'
  | 'yWing';

export type TSudokuUnitKind = 'row' | 'column' | 'box';

export type TSudokuStep = {
  technique: TSudokuTechnique;
  /** Set when the step fills a cell. */
  placement?: { cell: number; digit: number };
  /** Candidates the step removes; empty for a placement. */
  eliminations: Array<{ cell: number; digits: number[] }>;
  /** The cells that form the pattern (the target cell for a placement). */
  cells: number[];
  /** The digits the pattern is about. */
  digits: number[];
  /** The row, column or box the pattern lives in, when there is one. */
  unit?: { kind: TSudokuUnitKind; index: number };
};

export type TSudokuHint =
  | { type: 'mistake'; cells: number[] }
  | { type: 'steps'; steps: TSudokuStep[] }
  | { type: 'reveal'; cell: number; digit: number };

/** Marks and digits of a board in play: `notes` holds a bitmask of pencil marks per cell. */
export type TSudokuBoardState = { values: number[]; notes: number[] };
