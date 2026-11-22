import { TCaroWinMode } from 'src/types/caro.type';

/**
 * Shape a single stone forms along one line, from weakest to strongest.
 * The shape is always evaluated as if the player had just placed a stone on the center cell.
 */
export const PATTERN = {
  NONE: 0,
  ONE: 1,
  TWO: 2,
  THREE: 3,
  OPEN_THREE: 4,
  FOUR: 5,
  OPEN_FOUR: 6,
  FIVE: 7,
} as const;

/** Bit flags summarising what a move on a cell creates across all four lines. */
export const CELL_FLAG = {
  /** Completes a winning line. */
  FIVE: 1,
  /** Open four or double four: cannot be stopped with a single block. */
  WIN_THREAT: 2,
  /** At least one line becomes a four, so the opponent is forced to answer. */
  FOUR: 4,
  /** At least one line becomes an open three. */
  OPEN_THREE: 8,
  /** Four-three or double open three. */
  DOUBLE_THREAT: 16,
} as const;

export const CELL_SCORE = {
  FIVE: 10_000_000,
  WIN_THREAT: 1_000_000,
  FOUR_THREE: 100_000,
  DOUBLE_THREE: 50_000,
} as const;

const LINE_SCORE: Record<number, number> = {
  [PATTERN.NONE]: 0,
  [PATTERN.ONE]: 4,
  [PATTERN.TWO]: 30,
  [PATTERN.THREE]: 150,
  [PATTERN.OPEN_THREE]: 1_000,
  [PATTERN.FOUR]: 1_500,
};

// Window cell codes, relative to the evaluated player. WALL is outside the board.
const EMPTY = 0;
const OWN = 1;
const OPPONENT = 2;
const WALL = 3;

/** The window covers five cells on each side of the center: enough for a five plus its end cells. */
export const LINE_RADIUS = 5;
const WINDOW = LINE_RADIUS * 2 + 1;
const CENTER = LINE_RADIUS;
const UNKNOWN = 255;

// Ten 2-bit cells around the center give 4^10 possible windows; classified lazily and cached.
const caches: Partial<Record<TCaroWinMode, Uint8Array>> = {};

function getCache(winMode: TCaroWinMode) {
  let cache = caches[winMode];
  if (!cache) {
    cache = new Uint8Array(1 << 20).fill(UNKNOWN);
    caches[winMode] = cache;
  }
  return cache;
}

/**
 * Encodes a line window into the cache key. `cells` lists the ten neighbours from the farthest
 * left to the farthest right, skipping the center, using the EMPTY/OWN/OPPONENT/WALL codes.
 */
export function encodeLine(cells: ArrayLike<number>) {
  let code = 0;
  for (let i = 0; i < WINDOW - 1; i++) code |= cells[i] << (i * 2);
  return code;
}

function decodeLine(code: number) {
  const line = new Int8Array(WINDOW);
  let rest = code;
  for (let i = 0; i < WINDOW; i++) {
    if (i == CENTER) {
      line[i] = OWN;
      continue;
    }
    line[i] = rest & 3;
    rest >>= 2;
  }
  return line;
}

// Mirrors checkWin: the run through the center must reach five, and with the blockOpponent rule
// a run capped by opponent stones on both ends does not count. The board edge never blocks.
function isFive(line: Int8Array, blockRule: boolean) {
  let left = CENTER;
  while (left > 0 && line[left - 1] == OWN) left--;
  let right = CENTER;
  while (right < WINDOW - 1 && line[right + 1] == OWN) right++;
  if (right - left + 1 < 5) return false;
  if (!blockRule) return true;
  const leftEnd = left > 0 ? line[left - 1] : EMPTY;
  const rightEnd = right < WINDOW - 1 ? line[right + 1] : EMPTY;
  return !(leftEnd == OPPONENT && rightEnd == OPPONENT);
}

function countFiveSpots(line: Int8Array, blockRule: boolean) {
  let count = 0;
  for (let i = 0; i < WINDOW; i++) {
    if (line[i] != EMPTY) continue;
    line[i] = OWN;
    if (isFive(line, blockRule)) count++;
    line[i] = EMPTY;
  }
  return count;
}

/**
 * Whether a line with five spots is an open four: no single opponent stone stops every five.
 * Counting spots is not enough with the blockOpponent rule, where a stone just past a run caps
 * it at both ends: in `_XXXX_O` an opponent stone on the left spot also blocks the right five.
 */
function isOpenFour(line: Int8Array, blockRule: boolean) {
  const spots = countFiveSpots(line, blockRule);
  if (!blockRule || spots < 2) return spots >= 2;
  for (let i = 0; i < WINDOW; i++) {
    if (line[i] != EMPTY) continue;
    line[i] = OPPONENT;
    const left = countFiveSpots(line, blockRule);
    line[i] = EMPTY;
    if (left == 0) return false;
  }
  return true;
}

function classify(line: Int8Array, blockRule: boolean) {
  if (isFive(line, blockRule)) return PATTERN.FIVE;

  if (countFiveSpots(line, blockRule) > 0)
    return isOpenFour(line, blockRule) ? PATTERN.OPEN_FOUR : PATTERN.FOUR;

  let hasThree = false;
  for (let i = 0; i < WINDOW; i++) {
    if (line[i] != EMPTY) continue;
    line[i] = OWN;
    const spots = countFiveSpots(line, blockRule);
    const isOpen = spots > 0 && isOpenFour(line, blockRule);
    line[i] = EMPTY;
    if (isOpen) return PATTERN.OPEN_THREE;
    if (spots > 0) hasThree = true;
  }
  if (hasThree) return PATTERN.THREE;

  // Weak shapes: count own stones in the best five-cell window that can still become a five.
  let best = 0;
  for (let start = CENTER - 4; start <= CENTER; start++) {
    let own = 0;
    let isAlive = true;
    for (let i = start; i < start + 5; i++) {
      if (line[i] == OPPONENT || line[i] == WALL) {
        isAlive = false;
        break;
      }
      if (line[i] == OWN) own++;
    }
    if (isAlive) best = Math.max(best, own);
  }
  if (best >= 2) return PATTERN.TWO;
  if (best == 1) return PATTERN.ONE;
  return PATTERN.NONE;
}

export function getPattern(code: number, winMode: TCaroWinMode) {
  const cache = getCache(winMode);
  let pattern = cache[code];
  if (pattern == UNKNOWN) {
    pattern = classify(decodeLine(code), winMode == 'blockOpponent');
    cache[code] = pattern;
  }
  return pattern;
}

/**
 * Combines the four line patterns of a cell into one heuristic score, and writes the threat
 * flags into `out.flags`.
 */
export function combinePatterns(patterns: ArrayLike<number>, out: { flags: number }) {
  let fives = 0;
  let openFours = 0;
  let fours = 0;
  let openThrees = 0;
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const pattern = patterns[i];
    if (pattern == PATTERN.FIVE) fives++;
    else if (pattern == PATTERN.OPEN_FOUR) openFours++;
    else if (pattern == PATTERN.FOUR) fours++;
    else if (pattern == PATTERN.OPEN_THREE) openThrees++;
    sum += LINE_SCORE[pattern] ?? 0;
  }

  let flags = 0;
  if (fives > 0) flags |= CELL_FLAG.FIVE;
  if (openFours > 0 || fours >= 2) flags |= CELL_FLAG.WIN_THREAT;
  if (openFours + fours > 0) flags |= CELL_FLAG.FOUR;
  if (openThrees > 0) flags |= CELL_FLAG.OPEN_THREE;
  if ((fours > 0 && openThrees > 0) || openThrees >= 2) flags |= CELL_FLAG.DOUBLE_THREAT;
  out.flags = flags;

  if (fives > 0) return CELL_SCORE.FIVE;
  if (openFours > 0 || fours >= 2) return CELL_SCORE.WIN_THREAT;
  if (fours > 0 && openThrees > 0) return CELL_SCORE.FOUR_THREE;
  if (openThrees >= 2) return CELL_SCORE.DOUBLE_THREE;
  return sum;
}
