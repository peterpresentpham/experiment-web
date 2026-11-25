import { Face, FACES } from './cube';
import type { TFacelets } from './facelets';

/**
 * Sticker colours from camera pictures. Lighting changes what "red" looks like, so stickers are
 * not compared with fixed colours: each face's centre, taken under the same light, is the
 * reference for its colour. Every colour is on exactly 9 stickers, which settles most stickers
 * whose colour alone is ambiguous (red and orange under warm light).
 */

export type TRgb = [number, number, number];
type TLab = [number, number, number];

/** sRGB (0-255) to CIE Lab (D65), where distances follow how different colours look. */
export function rgbToLab([r, g, b]: TRgb): TLab {
  const linear = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [lr, lg, lb] = [linear(r), linear(g), linear(b)];
  const x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
  const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  const z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (t * 24389) / 27 / 116 + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/**
 * How different two sticker colours look. A dim sticker loses lightness and colourfulness
 * (chroma) but keeps its hue, so both count half and hue counts fully: a dark orange stays nearer
 * orange than red.
 */
function distance(a: TLab, b: TLab) {
  const chromaA = Math.hypot(a[1], a[2]);
  const chromaB = Math.hypot(b[1], b[2]);
  const chroma = chromaA - chromaB;
  const hue = Math.sqrt(Math.max(0, (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 - chroma ** 2));
  return Math.hypot((a[0] - b[0]) * 0.5, chroma * 0.5, hue);
}

/**
 * The colour of one sticker: the per-channel median of the pixels in the middle of its cell, so a
 * glare spot or the black border does not shift it. `data` is RGBA, as canvas ImageData holds it.
 */
export function sampleCell(
  image: { data: ArrayLike<number>; width: number },
  x: number,
  y: number,
  size: number
): TRgb {
  const margin = Math.floor(size / 4);
  const channels: [Array<number>, Array<number>, Array<number>] = [[], [], []];
  for (let row = y + margin; row < y + size - margin; row++)
    for (let column = x + margin; column < x + size - margin; column++) {
      const offset = (Math.floor(row) * image.width + Math.floor(column)) * 4;
      for (let k = 0; k < 3; k++) channels[k].push(image.data[offset + k]);
    }
  return channels.map((values) => {
    values.sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)] ?? 0;
  }) as TRgb;
}

/** The 9 stickers of a 3x3 grid of `size` pixels at (x, y), row by row. */
export function sampleFace(
  image: { data: ArrayLike<number>; width: number },
  x: number,
  y: number,
  size: number
): Array<TRgb> {
  const cell = size / 3;
  return Array.from({ length: 9 }, (_, index) =>
    sampleCell(image, x + (index % 3) * cell, y + Math.floor(index / 3) * cell, cell)
  );
}

export type TScanResult = {
  facelets: TFacelets;
  /** Stickers whose colour was a close call, to check by eye. */
  uncertain: Array<{ face: Face; index: number }>;
};

const ROUNDS = 4;
/** A sticker is a close call when its second-best colour is nearly as near as the one it got. */
const CLOSE_CALL = 1.35;

/**
 * Colours for 54 sampled stickers (each face's samples row by row, as `sampleFace` returns them).
 * Each sticker goes to the nearest colour that still has room (9 stickers each, nearest pairs
 * first); the colour references then move to the mean of their stickers, a few rounds.
 */
export function classifyStickers(samples: Record<Face, Array<TRgb>>): TScanResult {
  const stickers = FACES.flatMap((face) =>
    samples[face].map((rgb, index) => ({ face, index, lab: rgbToLab(rgb) }))
  );
  let references = new Map<Face, TLab>(FACES.map((face) => [face, rgbToLab(samples[face][4])]));
  let assigned = new Map<number, Face>();

  for (let round = 0; round < ROUNDS; round++) {
    assigned = new Map();
    const room = new Map<Face, number>(FACES.map((face) => [face, 9]));
    // Centres are their own face's colour by definition.
    stickers.forEach((sticker, i) => {
      if (sticker.index != 4) return;
      assigned.set(i, sticker.face);
      room.set(sticker.face, room.get(sticker.face)! - 1);
    });
    const pairs = stickers
      .flatMap((sticker, i) =>
        sticker.index == 4
          ? []
          : FACES.map((color) => ({ i, color, d: distance(sticker.lab, references.get(color)!) }))
      )
      .sort((a, b) => a.d - b.d);
    for (const { i, color } of pairs) {
      if (assigned.has(i) || room.get(color) == 0) continue;
      assigned.set(i, color);
      room.set(color, room.get(color)! - 1);
    }
    references = new Map(
      FACES.map((color) => {
        const members = stickers.filter((_, i) => assigned.get(i) == color);
        const mean = [0, 1, 2].map(
          (k) => members.reduce((sum, member) => sum + member.lab[k], 0) / members.length
        ) as TLab;
        return [color, mean];
      })
    );
  }

  const facelets = Object.fromEntries(FACES.map((face) => [face, Array<Face>(9)])) as TFacelets;
  const uncertain: TScanResult['uncertain'] = [];
  stickers.forEach((sticker, i) => {
    const color = assigned.get(i)!;
    facelets[sticker.face][sticker.index] = color;
    if (sticker.index == 4) return;
    const own = distance(sticker.lab, references.get(color)!);
    const other = Math.min(
      ...FACES.filter((face) => face != color).map((face) =>
        distance(sticker.lab, references.get(face)!)
      )
    );
    if (other < own * CLOSE_CALL) uncertain.push({ face: sticker.face, index: sticker.index });
  });
  return { facelets, uncertain };
}

/**
 * Where the on-screen 3x3 guide falls in a camera frame. The preview fills a square with the
 * frame's middle square (object-fit: cover) and draws the guide over `fraction` of it, centred.
 */
export function guideRegion(width: number, height: number, fraction: number) {
  const size = Math.min(width, height) * fraction;
  return { x: (width - size) / 2, y: (height - size) / 2, size };
}
