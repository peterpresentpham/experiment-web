import { describe, expect, it } from 'vitest';
import { nextMoveIndex, stepOrigin } from 'src/lib/cube/twisty-timeline';

// Three moves of 1 s each.
const TIMES = { starts: [0, 1_000, 2_000], ends: [1_000, 2_000, 3_000] };

describe('nextMoveIndex', () => {
  it('counts the finished moves, a move ending exactly now included', () => {
    expect(nextMoveIndex(TIMES, 0)).toBe(0);
    expect(nextMoveIndex(TIMES, 500)).toBe(0);
    expect(nextMoveIndex(TIMES, 1_000)).toBe(1);
    expect(nextMoveIndex(TIMES, 3_000)).toBe(3);
  });
});

describe('stepOrigin', () => {
  it('steps from where the cube is between moves', () => {
    expect(stepOrigin(TIMES, 1_000, 1)).toBe(1_000);
    expect(stepOrigin(TIMES, 1_000, -1)).toBe(1_000);
  });

  it('finishes or undoes a move still playing, so a quick second press is not lost', () => {
    expect(stepOrigin(TIMES, 1_400, 1)).toBe(2_000);
    expect(stepOrigin(TIMES, 1_400, -1)).toBe(1_000);
  });

  it('leaves the end alone', () => {
    expect(stepOrigin(TIMES, 3_000, 1)).toBe(3_000);
  });
});
