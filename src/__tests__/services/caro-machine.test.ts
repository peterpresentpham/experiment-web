import { describe, expect, it } from 'vitest';
import { checkWin } from 'src/services/caro.utils';
import { findMachineMove } from 'src/services/caro-machine';
import { encodeLine, getPattern, PATTERN } from 'src/services/caro-machine/pattern';
import { TCaroMachineLevel, TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';

type TSteps = { [key: number]: TTurn };

function place(size: TCaroSizeBoard, cells: Array<[number, number, TTurn]>) {
  const steps: TSteps = {};
  for (const [row, column, turn] of cells) steps[row * size + column] = turn;
  return steps;
}

function at(size: number, row: number, column: number) {
  return row * size + column;
}

// Deterministic random so easy-level choices are reproducible.
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2 ** 31;
    return state / 2 ** 31;
  };
}

function ask(
  steps: TSteps,
  options: Partial<{
    size: TCaroSizeBoard;
    turn: TTurn;
    level: TCaroMachineLevel;
    winMode: TCaroWinMode;
    timeLimitMs: number;
  }> = {}
) {
  return findMachineMove({
    steps,
    size: options.size ?? 15,
    turn: options.turn ?? 1,
    level: options.level ?? 'hard',
    winMode: options.winMode ?? 'blockOpponent',
    timeLimitMs: options.timeLimitMs ?? 300,
    random: seeded(7),
  });
}

// Line from far left to far right around the center: '.' empty, 'x' own, 'o' opponent, '#' wall.
function patternOf(line: string, winMode: TCaroWinMode) {
  const codes: Record<string, number> = { '.': 0, x: 1, o: 2, '#': 3 };
  const cells = line.replace(/\s/g, '').split('');
  cells.splice(5, 1);
  return getPattern(encodeLine(cells.map((cell) => codes[cell])), winMode);
}

describe('caro machine patterns', () => {
  it('classifies the basic shapes', () => {
    expect(patternOf('...xxxxx...', 'blockOpponent')).toBe(PATTERN.FIVE);
    expect(patternOf('...xxxx....', 'blockOpponent')).toBe(PATTERN.OPEN_FOUR);
    expect(patternOf('..oxxxx....', 'blockOpponent')).toBe(PATTERN.FOUR);
    expect(patternOf('...xxx.....', 'blockOpponent')).toBe(PATTERN.OPEN_THREE);
    expect(patternOf('..oxxx.....', 'blockOpponent')).toBe(PATTERN.THREE);
  });

  it('ignores fives that the blockOpponent rule makes useless', () => {
    expect(patternOf('..oxxxxxo..', 'blockOpponent')).not.toBe(PATTERN.FIVE);
    expect(patternOf('..oxxxxxo..', 'non-blockOpponent')).toBe(PATTERN.FIVE);
    // o x x _ x x o: filling the gap gives a five capped on both ends.
    expect(patternOf('.oxx.xxo...', 'blockOpponent')).toBeLessThan(PATTERN.FOUR);
    expect(patternOf('.oxx.xxo...', 'non-blockOpponent')).toBe(PATTERN.FOUR);
  });

  it('does not treat the board edge as a block', () => {
    expect(patternOf('#####xxxx.o', 'blockOpponent')).toBe(PATTERN.FOUR);
  });
});

describe('caro machine moves', () => {
  it('opens in the center of an empty board', () => {
    expect(ask({}, { turn: 0 })).toBe(at(15, 7, 7));
  });

  it.each<TCaroMachineLevel>(['easy', 'medium', 'hard'])('%s takes an immediate win', (level) => {
    const steps = place(15, [
      [7, 3, 1],
      [7, 4, 1],
      [7, 5, 1],
      [7, 6, 1],
      [8, 3, 0],
      [8, 4, 0],
      [8, 5, 0],
      [9, 9, 0],
    ]);
    expect([at(15, 7, 2), at(15, 7, 7)]).toContain(ask(steps, { level }));
  });

  it.each<TCaroMachineLevel>(['easy', 'medium', 'hard'])('%s blocks a four', (level) => {
    const steps = place(15, [
      [7, 3, 0],
      [7, 4, 0],
      [7, 5, 0],
      [7, 6, 0],
      [7, 2, 1],
      [9, 9, 1],
      [10, 10, 1],
    ]);
    expect(ask(steps, { level })).toBe(at(15, 7, 7));
  });

  it.each<TCaroMachineLevel>(['medium', 'hard'])('%s blocks an open three', (level) => {
    const steps = place(15, [
      [7, 5, 0],
      [7, 6, 0],
      [7, 7, 0],
      [3, 3, 1],
      [12, 12, 1],
    ]);
    const blocks = [at(15, 7, 3), at(15, 7, 4), at(15, 7, 8), at(15, 7, 9)];
    expect(blocks).toContain(ask(steps, { level }));
  });

  it('hard converts a sequence of fours against a hard defender', () => {
    // No single move wins yet: player 2 needs consecutive fours (e.g. (8,6) forcing (8,7),
    // then (7,6) for a double four through column 6). Player 1 defends with the hard level too.
    const steps = place(15, [
      [7, 3, 1],
      [7, 4, 1],
      [7, 5, 1],
      [7, 2, 0],
      [8, 3, 1],
      [8, 4, 1],
      [8, 5, 1],
      [8, 2, 0],
      [9, 6, 1],
      [10, 6, 1],
      [11, 6, 0],
      [6, 3, 0],
      [0, 0, 0],
      [0, 14, 0],
      [14, 0, 0],
    ]);
    let turn: TTurn = 1;
    let winner: TTurn | undefined;
    for (let moves = 0; moves < 20 && winner == undefined; moves++) {
      const move = ask(steps, { turn, level: 'hard' });
      steps[move] = turn;
      const result = checkWin(
        { steps, currentStep: move, currentPlayer: turn, size: 15 },
        'blockOpponent'
      );
      if (result.winMode.length > 0) winner = turn;
      turn = (1 - turn) as TTurn;
    }
    expect(winner).toBe(1);
  });

  it('plays the perfect 3x3 game on hard', () => {
    const steps: TSteps = {};
    let turn: TTurn = 0;
    for (let moves = 0; moves < 9; moves++) {
      const move = ask(steps, { size: 3, turn, level: 'hard' });
      steps[move] = turn;
      const result = checkWin(
        { steps, currentStep: move, currentPlayer: turn, size: 3 },
        'blockOpponent'
      );
      expect(result.winMode).toEqual([]);
      turn = (1 - turn) as TTurn;
    }
  });

  it('plays a whole 10x10 game with legal moves within the time budget', () => {
    const steps: TSteps = {};
    let turn: TTurn = 0;
    for (let moves = 0; moves < 40; moves++) {
      const startedAt = performance.now();
      const move = ask(steps, { size: 10, turn, level: turn == 0 ? 'hard' : 'medium' });
      expect(performance.now() - startedAt).toBeLessThan(1_500);
      expect(steps[move]).toBeUndefined();
      expect(move).toBeGreaterThanOrEqual(0);
      steps[move] = turn;
      const result = checkWin(
        { steps, currentStep: move, currentPlayer: turn, size: 10 },
        'blockOpponent'
      );
      if (result.winMode.length > 0) break;
      turn = (1 - turn) as TTurn;
    }
  });
});
