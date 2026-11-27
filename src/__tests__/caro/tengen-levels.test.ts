import { MachineBoard } from 'src/services/caro-machine/board';
import { TExperienceBook } from 'src/services/caro-machine/experience';
import { experienceFrame } from 'src/services/caro-machine/experience-key';
import type { TOpeningBook } from 'src/services/caro-tengen/opening-book';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Tengen and the opening book as the worker would have them; `engine.state` null means Tengen
// cannot run in this browser.
const tengenThink = vi.fn(() => 113);
const engine = { state: { think: tengenThink } as { think: typeof tengenThink } | null };
const getOpeningBook = vi.fn(() => Promise.resolve(new Map() as TOpeningBook));
vi.mock('src/services/caro-tengen/browser', () => ({
  getTengen: () => Promise.resolve(engine.state),
  getOpeningBook: () => getOpeningBook(),
}));

const { findLevelMove, TENGEN_LEVELS } = await import('src/services/caro-tengen/levels');

// The machine (O, turn 1) answers X's first stone in the middle of a 15x15 board.
const request = { steps: { 112: 0 }, size: 15, winMode: 'blockOpponent', turn: 1 } as const;

/** A book whose lesson for `request` is to play `best`. */
function lessonBook(best: number): TExperienceBook {
  const board = new MachineBoard(15, 'blockOpponent');
  board.place(112, 1);
  const frame = experienceFrame(board.cells, 15, 'blockOpponent', 2);
  return new Map([[frame.key, { avoid: [], best: frame.toCanonical(best) }]]);
}

describe('findLevelMove', () => {
  beforeEach(() => {
    engine.state = { think: tengenThink };
    tengenThink.mockClear();
    getOpeningBook.mockClear();
  });

  it("plays Tengen with the level's depth cap, variety and time", async () => {
    for (const level of ['easy', 'medium', 'hard'] as const) {
      expect(await findLevelMove({ ...request, level }, new Map())).toEqual({
        location: 113,
        source: 'tengen',
      });
      const { timing, limits } = TENGEN_LEVELS[level];
      expect(tengenThink).toHaveBeenLastCalledWith(expect.anything(), timing, limits);
    }
  });

  it('makes each level search deeper and vary less than the one below', () => {
    const { easy, medium, hard } = TENGEN_LEVELS;
    expect(easy.limits.depth).toBeLessThan(medium.limits.depth!);
    expect(medium.limits.depth).toBeLessThan(hard.limits.depth!);
    expect(easy.limits.variety).toBeGreaterThan(medium.limits.variety!);
    expect(medium.limits.variety).toBeGreaterThan(hard.limits.variety!);
  });

  it('opens from the book on hard, on the first reply only on medium, never on easy', async () => {
    const levels = ['easy', 'medium', 'hard'] as const;
    const calls = async (steps: Record<number, 0 | 1>, turn: 0 | 1) => {
      const used = [];
      for (const level of levels) {
        getOpeningBook.mockClear();
        await findLevelMove({ ...request, steps, turn, level }, new Map());
        used.push(getOpeningBook.mock.calls.length > 0);
      }
      return used;
    };
    expect(await calls({ 112: 0 }, 1)).toEqual([false, true, true]);
    expect(await calls({ 112: 0, 113: 1, 97: 0 }, 1)).toEqual([false, false, true]);
  });

  it('keeps the lessons from lost games for the hard level', async () => {
    const book = lessonBook(96);
    expect(await findLevelMove({ ...request, level: 'hard' }, book)).toEqual({
      location: 96,
      source: 'lesson',
    });
    for (const level of ['easy', 'medium'] as const)
      expect((await findLevelMove({ ...request, level }, book)).source).toBe('tengen');
  });

  it("falls back to the level's own search when Tengen cannot run or fails", async () => {
    engine.state = null;
    const missing = await findLevelMove({ ...request, level: 'medium' }, new Map());
    expect(missing.source).toBe('search');
    expect(missing.location).not.toBe(112);

    engine.state = {
      think: vi.fn(() => {
        throw new Error('tengen: out of memory');
      }),
    };
    vi.spyOn(console, 'error').mockImplementationOnce(() => {});
    const failed = await findLevelMove({ ...request, level: 'hard' }, new Map());
    expect(failed.source).toBe('search');

    // An answer on an occupied cell is not played either.
    engine.state = { think: vi.fn(() => 112) };
    expect((await findLevelMove({ ...request, level: 'easy' }, new Map())).source).toBe('search');
  });
});
