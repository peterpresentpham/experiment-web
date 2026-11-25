import { Face, FACES } from 'src/lib/cube/cube';
import { classifyStickers, sampleCell, TRgb } from 'src/lib/cube/color-scan';
import { faceletsFromAlg, randomScramble } from 'src/lib/cube/facelets';
import { describe, expect, it } from 'vitest';

// Typical sticker colours (the guide's colour scheme: U yellow, F green, R orange).
const STICKERS: Record<Face, TRgb> = {
  U: [255, 213, 0],
  D: [255, 255, 255],
  F: [0, 155, 72],
  B: [0, 70, 173],
  R: [255, 88, 0],
  L: [183, 18, 52],
};

function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/** What a camera might see: each face lit differently, a warm light, sensor noise. */
function photograph(alg: string, random: () => number, warmth: number) {
  const facelets = faceletsFromAlg(alg);
  const samples = Object.fromEntries(
    FACES.map((face) => {
      const light = 0.55 + random() * 0.45;
      const tint = [1, 1 - warmth * 0.5, 1 - warmth];
      const colors = facelets[face].map((color) =>
        STICKERS[color].map((value, k) =>
          Math.max(0, Math.min(255, value * light * tint[k] + (random() - 0.5) * 24))
        )
      );
      return [face, colors];
    })
  ) as Record<Face, Array<TRgb>>;
  return { facelets, samples };
}

describe('sticker colours from pictures', () => {
  it('recognises scrambled cubes under uneven, warm light', () => {
    const random = seeded(11);
    for (let i = 0; i < 40; i++) {
      const alg = randomScramble(25, random);
      const { facelets, samples } = photograph(alg, random, (i % 4) * 0.12);
      expect(classifyStickers(samples).facelets, alg).toEqual(facelets);
    }
  });

  it('gives every colour exactly 9 stickers', () => {
    const random = seeded(3);
    const { samples } = photograph(randomScramble(25, random), random, 0.4);
    const { facelets } = classifyStickers(samples);
    for (const color of FACES)
      expect(FACES.flatMap((face) => facelets[face]).filter((c) => c == color)).toHaveLength(9);
  });

  it('flags stickers between two colours', () => {
    const { samples } = photograph('', seeded(5), 0);
    // A sticker halfway between red and orange.
    samples.F[0] = [219, 53, 26];
    expect(classifyStickers(samples).uncertain).toContainEqual({ face: 'F', index: 0 });
  });

  it('samples the middle of a cell, ignoring a glare spot', () => {
    const width = 30;
    const data = new Uint8ClampedArray(width * width * 4);
    for (let i = 0; i < width * width; i++) data.set([200, 20, 40, 255], i * 4);
    // Glare: a few white pixels in the middle.
    for (const i of [15 * width + 15, 15 * width + 16, 16 * width + 15])
      data.set([255, 255, 255, 255], i * 4);
    expect(sampleCell({ data, width }, 0, 0, width)).toEqual([200, 20, 40]);
  });
});
