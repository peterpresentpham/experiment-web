import { cube3x3x3 } from 'cubing/puzzles';
import {
  faceletsFromAlg,
  faceletsToPattern,
  isSolvedFacelets,
  randomScramble,
  solvedFacelets,
  TFacelets,
} from 'src/lib/cube/facelets';
import { solveFacelets } from 'src/lib/cube/solver';
import { describe, expect, it } from 'vitest';

const ALGS = [
  'R',
  'U',
  'F',
  "R U R' U'",
  "F R U' R' U' R U R' F' R U R' U' R' F R F'",
  "D2 B L' F2 U R2 D' L B2 U' F R' D L2 B'",
];

const clone = (facelets: TFacelets) =>
  Object.fromEntries(
    Object.entries(facelets).map(([face, colors]) => [face, [...colors]])
  ) as TFacelets;

describe('facelets to cubing.js pattern', () => {
  it('matches cubing.js for the same moves', async () => {
    const kpuzzle = await cube3x3x3.kpuzzle();
    for (const alg of ALGS) {
      const result = faceletsToPattern(faceletsFromAlg(alg));
      expect(result.ok, alg).toBe(true);
      if (!result.ok) continue;
      const expected = kpuzzle.defaultPattern().applyAlg(alg).patternData;
      expect(result.data.EDGES, alg).toEqual(expected.EDGES);
      expect(result.data.CORNERS, alg).toEqual(expected.CORNERS);
    }
  });

  it('reports wrong colour counts and moved centres', () => {
    const facelets = clone(solvedFacelets());
    facelets.F[0] = 'R';
    const result = faceletsToPattern(facelets);
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          { kind: 'colorCount', color: 'R', count: 10 },
          { kind: 'colorCount', color: 'F', count: 8 },
        ])
      );

    const centers = clone(solvedFacelets());
    [centers.F[4], centers.R[4]] = ['R', 'F'];
    const moved = faceletsToPattern(centers);
    expect(!moved.ok && moved.errors[0].kind).toBe('center');
  });

  it('reports a twisted corner, a flipped edge and two swapped pieces', () => {
    const twisted = clone(solvedFacelets());
    // The UFR corner: U sticker 8, F sticker 2, R sticker 0; turn its colours once.
    [twisted.U[8], twisted.F[2], twisted.R[0]] = ['R', 'U', 'F'];
    const twist = faceletsToPattern(twisted);
    expect(!twist.ok && twist.errors).toEqual([{ kind: 'cornerTwist' }]);

    const flipped = clone(solvedFacelets());
    // The UF edge: U sticker 7, F sticker 1.
    [flipped.U[7], flipped.F[1]] = ['F', 'U'];
    const flip = faceletsToPattern(flipped);
    expect(!flip.ok && flip.errors).toEqual([{ kind: 'edgeFlip' }]);

    const swapped = clone(solvedFacelets());
    // Swap the UF and UR edges.
    [swapped.F[1], swapped.R[1]] = ['R', 'F'];
    const swap = faceletsToPattern(swapped);
    expect(!swap.ok && swap.errors).toEqual([{ kind: 'parity' }]);
  });

  it('reports colours no piece has, and a piece twice', () => {
    const facelets = clone(solvedFacelets());
    // The UF edge shows yellow and white, which no edge has; F loses green to D.
    [facelets.F[1], facelets.D[1]] = ['D', 'F'];
    const result = faceletsToPattern(facelets);
    expect(!result.ok && result.errors.map((error) => error.kind)).toContain('invalidPiece');
  });
});

describe('solving painted facelets', () => {
  it('finds a solution that solves the scramble', async () => {
    const random = (() => {
      let seed = 7;
      return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    })();
    for (let i = 0; i < 3; i++) {
      const scramble = randomScramble(25, random);
      const result = solveFacelets(faceletsFromAlg(scramble));
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(result.alg.split(' ').length).toBeLessThanOrEqual(24);
      expect(isSolvedFacelets(faceletsFromAlg(`${scramble} ${result.alg}`))).toBe(true);
    }
  });

  it('solves nothing on a solved cube, and reports an impossible one', async () => {
    expect(solveFacelets(solvedFacelets())).toEqual({ ok: true, alg: '' });
    const flipped = clone(solvedFacelets());
    [flipped.U[7], flipped.F[1]] = ['F', 'U'];
    expect(solveFacelets(flipped)).toEqual({ ok: false, errors: [{ kind: 'edgeFlip' }] });
  });
});
