import type { MaskName } from './render';

/**
 * Settings for the cubing.js 3D player (`<twisty-player>`) that match the 2D pictures.
 *
 * cubing.js holds the cube white on top, green in front. The guide holds yellow on top, so every
 * player starts from `z2`: yellow up, green front, orange right, as in the 2D pictures.
 *
 * Stickering masks name pieces by their solved position in cubing.js' own order, so they follow
 * the pieces through the `z2` rotation:
 * - EDGES: UF UR UB UL (white) | DF DR DB DL (yellow) | FR FL BR BL (middle layer)
 * - CORNERS: UFR URB UBL ULF (white) | DRF DFL DLB DBR (yellow)
 * - CENTERS: U L F R B D
 * Characters: `-` coloured, `I` grey, `O` only the primary (yellow) sticker coloured.
 */
export const TWISTY_ORIENTATION = 'z2';

const CENTERS = 'CENTERS:------';

const TWISTY_MASKS: Record<MaskName, string | null> = {
  none: null,
  centers: `EDGES:IIIIIIIIIIII,CORNERS:IIIIIIII,${CENTERS}`,
  cross: `EDGES:----IIIIIIII,CORNERS:IIIIIIII,${CENTERS}`,
  firstLayer: `EDGES:----IIIIIIII,CORNERS:----IIII,${CENTERS}`,
  f2l: `EDGES:----IIII----,CORNERS:----IIII,${CENTERS}`,
  oll: `EDGES:----OOOO----,CORNERS:----OOOO,${CENTERS}`,
  eo: `EDGES:----OOOO----,CORNERS:----IIII,${CENTERS}`,
  llEdges: `EDGES:------------,CORNERS:----IIII,${CENTERS}`,
  llCorners: `EDGES:----IIII----,CORNERS:--------,${CENTERS}`,
};

/** The cubing.js stickering mask for a 2D picture mask, or null to colour every sticker. */
export function twistyMask(mask: MaskName = 'none') {
  return TWISTY_MASKS[mask];
}

/**
 * An algorithm in cubing.js syntax. The guide writes the final turn that aligns the last layer
 * (AUF) in brackets, `[U]`, which cubing.js would read as a commutator; it is a normal move. Some
 * algorithms are also written without spaces (`(RUR'U)`), which cubing.js rejects.
 */
export function twistyAlg(alg: string) {
  return alg
    .replace(/\[([^\],]*)\]/g, '$1')
    .replace(/([A-Za-z]w?\d*'?)/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
    .trim();
}
