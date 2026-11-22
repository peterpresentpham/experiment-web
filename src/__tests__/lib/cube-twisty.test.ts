import { Alg } from 'cubing/alg';
import { cube3x3x3 } from 'cubing/puzzles';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { OLL_CASES, PLL_CASES } from 'src/configs/rubikLL.config';
import { TWISTY_ORIENTATION, twistyAlg, twistyMask } from 'src/lib/cube/twisty';
import { describe, expect, it } from 'vitest';

describe('twistyAlg', () => {
  it('turns bracketed AUF moves into plain moves', () => {
    expect(twistyAlg("R U R' U' [U2]")).toBe("R U R' U' U2");
  });

  it('gives cubing.js a valid algorithm for every guide algorithm', () => {
    const algs = [
      ...RUBIK_GUIDE.en.beginnerSteps.flatMap((step) => step.algs ?? []).map((a) => a.alg),
      ...OLL_CASES.flatMap((c) => c.algs),
      ...PLL_CASES.flatMap((c) => c.algs),
    ];
    for (const alg of algs) expect(() => new Alg(twistyAlg(alg)), alg).not.toThrow();
  });
});

describe('twistyMask', () => {
  it('lists every piece of each orbit', () => {
    for (const mask of [
      'cross',
      'firstLayer',
      'f2l',
      'oll',
      'eo',
      'llEdges',
      'llCorners',
    ] as const) {
      const orbits = Object.fromEntries(
        twistyMask(mask)!
          .split(',')
          .map((orbit) => orbit.split(':'))
      );
      expect(orbits.EDGES).toHaveLength(12);
      expect(orbits.CORNERS).toHaveLength(8);
      expect(orbits.CENTERS).toHaveLength(6);
    }
    expect(twistyMask('none')).toBeNull();
  });

  it('starts with yellow on top, so the white pieces the first-layer mask keeps are at the bottom', async () => {
    const kpuzzle = await cube3x3x3.kpuzzle();
    const pattern = kpuzzle.defaultPattern().applyAlg(TWISTY_ORIENTATION);
    // Centres are U L F R B D; after the rotation the yellow (D) centre is on top.
    expect(pattern.patternData.CENTERS.pieces[0]).toBe(5);
    expect(pattern.patternData.CENTERS.pieces[5]).toBe(0);
    // Green stays in front.
    expect(pattern.patternData.CENTERS.pieces[2]).toBe(2);
  });
});
