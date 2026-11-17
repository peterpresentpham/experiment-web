import { CubeState, Face, Sticker, Vec } from './cube';

const STICKER_COLORS: Record<Face, string> = {
  U: '#FFD500',
  D: '#FFFFFF',
  F: '#009B48',
  B: '#0046AD',
  R: '#FF5800',
  L: '#B71234',
};
const MASK_COLOR = '#8B8F98';
export const BODY_COLOR = '#16181d';

const zeros = (v: Vec) => v.filter((c) => c === 0).length;
const isCenter = (s: Sticker) => zeros(s.home) === 2;
const isEdge = (s: Sticker) => zeros(s.home) === 1;
const isCorner = (s: Sticker) => zeros(s.home) === 0;

/**
 * Masks decide which stickers keep their colour (true) and which turn grey.
 * They follow the piece (its home position), like VisualCube stage masks.
 */
const MASKS = {
  none: () => true,
  centers: (s: Sticker) => isCenter(s),
  cross: (s: Sticker) => isCenter(s) || (isEdge(s) && s.home[1] === -1),
  firstLayer: (s: Sticker) => isCenter(s) || s.home[1] === -1,
  f2l: (s: Sticker) => isCenter(s) || s.home[1] <= 0,
  /** Only yellow (U-coloured) stickers show: used for orientation views. */
  oll: (s: Sticker) => s.color === 'U' || s.home[1] <= 0,
  /** Yellow cross: only yellow stickers of edges and the centre show. */
  eo: (s: Sticker) => (s.color === 'U' && !isCorner(s)) || s.home[1] <= 0,
  llEdges: (s: Sticker) => !isCorner(s) || s.home[1] <= 0,
  llCorners: (s: Sticker) => !isEdge(s) || s.home[1] <= 0,
} satisfies Record<string, (s: Sticker) => boolean>;

export type MaskName = keyof typeof MASKS;

export function stickerFill(s: Sticker, mask: MaskName): string {
  return MASKS[mask](s) ? STICKER_COLORS[s.color] : MASK_COLOR;
}

type Arrow = { from: [number, number]; to: [number, number]; both: boolean };

/** Arrows for last-layer pieces that are not at home (used by PLL diagrams). */
export function llArrows(state: CubeState): Array<Arrow> {
  const moves: Array<{ from: [number, number]; to: [number, number] }> = [];
  for (const x of [-1, 0, 1]) {
    for (const z of [-1, 0, 1]) {
      if (x === 0 && z === 0) continue;
      const s = state.find((st) => st.pos[0] === x && st.pos[1] === 1 && st.pos[2] === z);
      if (!s) continue;
      const to: [number, number] = [s.home[0], s.home[2]];
      if (s.home[1] === 1 && (to[0] !== x || to[1] !== z)) moves.push({ from: [x, z], to });
    }
  }
  const key = (a: [number, number], b: [number, number]) => `${a}>${b}`;
  const set = new Set(moves.map((m) => key(m.from, m.to)));
  const seen = new Set<string>();
  const arrows: Array<Arrow> = [];
  for (const m of moves) {
    if (seen.has(key(m.from, m.to))) continue;
    const both = set.has(key(m.to, m.from));
    if (both) seen.add(key(m.to, m.from));
    arrows.push({ ...m, both });
  }
  return arrows;
}
