import { readFileSync } from 'node:fs';
import { CARO_EXAMPLES, TCaroExampleId } from 'src/configs/caroGuide.config';
import {
  buildFrames,
  cellName,
  fiveSpots,
  moverOf,
  parseCell,
  setupStones,
  TCaroGuideExample,
  TGuideStone,
} from 'src/services/caro-guide/board';
import { MachineBoard } from 'src/services/caro-machine/board';
import { PATTERN } from 'src/services/caro-machine/pattern';
import { findThreatWin } from 'src/services/caro-machine/threat';
import {
  findBookMove,
  parseOpeningBook,
  TOpeningBookFile,
} from 'src/services/caro-tengen/opening-book';
import type { TCaroWinMode, TTurn } from 'src/types/caro.type';
import { describe, expect, it } from 'vitest';

const HORIZONTAL = 0;
const VERTICAL = 1;

const names = (cells: Array<number>, size: number) => cells.map((cell) => cellName(cell, size));
const endOf = (id: TCaroExampleId) => buildFrames(CARO_EXAMPLES[id]).at(-1)!;

/** The machine's board for a set of stones (X is 1, O is 2). */
function machineBoard(stones: Map<number, TGuideStone>, size: number, winMode: TCaroWinMode) {
  const board = new MachineBoard(size, winMode);
  for (const [cell, stone] of stones) board.place(cell, stone == 'x' ? 1 : 2);
  return board;
}

/** The shape X's stone on `name` makes along one direction, as the machine classifies it. */
function shapeOf(
  example: TCaroGuideExample,
  name: string,
  direction: number,
  winMode: TCaroWinMode = example.winMode
) {
  const cell = parseCell(name, example.size);
  const stones = setupStones(example);
  stones.delete(cell);
  return machineBoard(stones, example.size, winMode).patternAt(cell, direction, 1);
}

const book = parseOpeningBook(
  JSON.parse(readFileSync('public/models/caro-book/opening-block.json', 'utf8')) as TOpeningBookFile
);

/** Every reply the Hell level's book can play after `moves` (null when the book has none). */
function bookReply(moves: Array<string>) {
  const steps: { [location: number]: TTurn } = {};
  moves.forEach((name, i) => (steps[parseCell(name, 20)] = (i % 2) as TTurn));
  const replies = Array.from({ length: 20 }, (_, k) =>
    findBookMove(book, { steps, size: 20, winMode: 'blockOpponent', turn: 1 }, () => k / 20)
  );
  return [
    ...new Set(replies.map((reply) => (reply == undefined ? null : cellName(reply, 20)))),
  ].sort();
}

describe('caro guide examples', () => {
  it.each(Object.entries(CARO_EXAMPLES))('%s is a legal position and line', (_, example) => {
    const frames = buildFrames(example);
    expect(frames).toHaveLength(example.moves.length + 1);
    // Only the last move may win: a game ends at its first five.
    frames.slice(0, -1).forEach((frame) => expect(frame.win).toEqual([]));
  });

  it('ends in a win where the text says so, by the side that moved last', () => {
    for (const id of [
      'five',
      'overline',
      'edgeFive',
      'fourThree',
      'doubleThree',
      'vcf',
      'realGame',
      'hellLineA',
      'hellLineB',
    ] as const) {
      const example = CARO_EXAMPLES[id];
      const end = endOf(id);
      expect(end.win.length, id).toBeGreaterThanOrEqual(5);
      expect(end.stones.get(end.last!), id).toBe(moverOf(example, example.moves.length - 1));
    }
    expect(names(endOf('realGame').win, 20).sort()).toEqual(['l6', 'm7', 'n8', 'o9', 'p10']);
    expect(names(endOf('hellLineA').win, 20).sort()).toEqual(['h9', 'i10', 'j11', 'k12', 'l13']);
    expect(names(endOf('hellLineB').win, 20).sort()).toEqual(['k12', 'l12', 'm12', 'n12', 'o12']);
  });

  it('does not count a five blocked at both ends, unless the rule is off', () => {
    const example = CARO_EXAMPLES.blockedFive;
    expect(endOf('blockedFive').win).toEqual([]);
    const free = buildFrames({ ...example, winMode: 'non-blockOpponent' }).at(-1)!;
    expect(free.win.length).toBe(5);
  });

  it('names the shapes the way the machine classifies them', () => {
    expect(shapeOf(CARO_EXAMPLES.openThree, 'i8', HORIZONTAL)).toBe(PATTERN.OPEN_THREE);
    expect(shapeOf(CARO_EXAMPLES.splitThree, 'j8', HORIZONTAL)).toBe(PATTERN.OPEN_THREE);
    expect(shapeOf(CARO_EXAMPLES.closedThree, 'i8', HORIZONTAL)).toBe(PATTERN.THREE);
    expect(shapeOf(CARO_EXAMPLES.four, 'j8', HORIZONTAL)).toBe(PATTERN.FOUR);
    expect(shapeOf(CARO_EXAMPLES.openFour, 'j8', HORIZONTAL)).toBe(PATTERN.OPEN_FOUR);
    const { four, openFour } = CARO_EXAMPLES;
    expect(names(fiveSpots(setupStones(four), 'x', 15, four.winMode), 15)).toEqual(['k8']);
    expect(names(fiveSpots(setupStones(openFour), 'x', 15, openFour.winMode), 15)).toEqual([
      'f8',
      'k8',
    ]);
  });

  it('makes the gap the strongest point of a split three', () => {
    const example = CARO_EXAMPLES.blockGap;
    const spotsAfter = (name: string) => {
      const stones = setupStones(example).set(parseCell(name, 15), 'x');
      return fiveSpots(stones, 'x', 15, example.winMode).length;
    };
    expect(spotsAfter('i8')).toBe(2);
    expect(spotsAfter('f8')).toBeLessThanOrEqual(1);
    expect(spotsAfter('k8')).toBeLessThanOrEqual(1);
  });

  it('shows a four that only looks open under the blocked-ends rule', () => {
    const example = CARO_EXAMPLES.fakeOpenFour;
    expect(shapeOf(example, 'j8', HORIZONTAL)).toBe(PATTERN.FOUR);
    expect(shapeOf(example, 'j8', HORIZONTAL, 'non-blockOpponent')).toBe(PATTERN.OPEN_FOUR);
    const [, afterBlock, end] = buildFrames(example);
    expect(fiveSpots(afterBlock.stones, 'x', 15, example.winMode)).toEqual([]);
    expect(end.win).toEqual([]);
  });

  it('makes two threats with the double-threat moves', () => {
    const fourThree = CARO_EXAMPLES.fourThree;
    expect(shapeOf({ ...fourThree, x: [...fourThree.x, 'j8'] }, 'j8', HORIZONTAL)).toBe(
      PATTERN.FOUR
    );
    expect(shapeOf({ ...fourThree, x: [...fourThree.x, 'j8'] }, 'j8', VERTICAL)).toBe(
      PATTERN.OPEN_THREE
    );
    const doubleThree = CARO_EXAMPLES.doubleThree;
    for (const direction of [HORIZONTAL, VERTICAL])
      expect(shapeOf({ ...doubleThree, x: [...doubleThree.x, 'i8'] }, 'i8', direction)).toBe(
        PATTERN.OPEN_THREE
      );
  });

  it('plays a real VCF: every X move a four, every O move the forced block', () => {
    const example = CARO_EXAMPLES.vcf;
    const frames = buildFrames(example);
    for (let i = 1; i < frames.length - 1; i += 2) {
      const spots = fiveSpots(frames[i].stones, 'x', 15, example.winMode);
      expect(spots.length, `after ${example.moves[i - 1]}`).toBeGreaterThan(0);
      expect(spots).toContain(frames[i + 1].last);
    }
    // i9 makes two fours at once.
    expect(names(fiveSpots(frames[3].stones, 'x', 15, example.winMode), 15).sort()).toEqual([
      'g7',
      'i7',
    ]);
    // The machine's own threat search finds a VCF from the start position.
    const board = machineBoard(setupStones(example), 15, example.winMode);
    const win = findThreatWin(board, 1, {
      mode: 'vcf',
      depth: 8,
      budget: 50_000,
      deadline: Infinity,
    });
    expect(win).toBeGreaterThanOrEqual(0);
  });

  it("shows the moves the Hell level's book plays", () => {
    expect(bookReply(['k11'])).toEqual(['j10']);
    expect(bookReply(['k11', 'j10', 'l10'])).toEqual(['m9']);
    // The real game: the old book answered j12 here; the rebuilt one does not.
    expect(CARO_EXAMPLES.realGame.moves.slice(0, 4)).toEqual(['k11', 'j10', 'l10', 'j12']);
  });

  it("follows the Hell level's book in the lines of how to beat it", () => {
    expect(bookReply(['k11', 'j10', 'l10', 'm9', 'i12'])).toEqual(['m11']);
    expect(bookReply(['k11', 'j10', 'm10'])).toEqual(['l11']);
    expect(bookReply(['k11', 'j10', 'm10', 'l11', 'n10'])).toContain('j9');
    expect(bookReply(['k11', 'j10', 'l11'])).toEqual(['m11']);
    expect(bookReply(['k11', 'j10', 'l9'])).toContain('m9');
    // Mirrored across the k11-j10 diagonal: l10 becomes j12 and the reply m9 becomes i13.
    expect(bookReply(['k11', 'j10', 'j12'])).toEqual(['i13']);
    // The ringed move of each example is the machine's first one after its book.
    for (const id of ['hellLineA', 'hellLineB'] as const) {
      const { moves, marks } = CARO_EXAMPLES[id];
      const ply = moves.indexOf(marks![0]);
      expect(ply % 2, id).toBe(1);
      for (let o = 1; o < ply; o += 2) expect(bookReply(moves.slice(0, o)), id).toContain(moves[o]);
      expect(bookReply(moves.slice(0, ply)), id).toEqual([null]);
    }
  });

  it('finishes the l10 example with fours, the last one double', () => {
    const example = CARO_EXAMPLES.hellLineA;
    const frames = buildFrames(example);
    const spots = (move: number) =>
      names(fiveSpots(frames[move].stones, 'x', 20, example.winMode), 20).sort();
    expect(example.moves.slice(18, 23)).toEqual(['l12', 'j12', 'l13', 'l14', 'i10']);
    expect(spots(19)).toEqual(['j12']);
    expect(spots(21)).toEqual(['l14']);
    expect(spots(23)).toEqual(['h9', 'm14']);
    const lineB = buildFrames(CARO_EXAMPLES.hellLineB);
    expect(names(fiveSpots(lineB[25].stones, 'x', 20, 'blockOpponent'), 20).sort()).toEqual([
      'k12',
      'p12',
    ]);
  });
});
