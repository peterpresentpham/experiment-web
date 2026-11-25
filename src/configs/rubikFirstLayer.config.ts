import type { CubeImage } from 'src/configs/rubikGuide.config';

/**
 * Cases for solving the white face fast: cross edges straight onto the bottom (no daisy) and
 * first-layer corners with short inserts instead of repeating the sexy move.
 *
 * The target slot is always front-bottom (DF) for edges and front-right-bottom (DFR) for
 * corners. The first algorithm is the main one; any others solve the same case. Every case
 * leaves the other cross edges (and, for corners, the other bottom corners) untouched, which
 * `src/__tests__/lib/cube.test.ts` checks.
 */
export type TFirstLayerCase = {
  id: string;
  algs: Array<string>;
  image: Omit<CubeImage, 'caption'>;
};

const edge = (id: string, algs: Array<string>): TFirstLayerCase => ({
  id,
  algs,
  image: { kind: 'iso', alg: algs[0], mask: 'cross' },
});

// `view` turns the picture so a left-slot case shows its left face (the camera sees U, F, R).
const corner = (id: string, algs: Array<string>, view?: string): TFirstLayerCase => ({
  id,
  algs,
  image: { kind: 'iso', alg: algs[0], mask: 'firstLayer', view },
});

export const CROSS_EDGE_CASES: Array<TFirstLayerCase> = [
  edge('topWhiteUp', ['F2']),
  edge('topWhiteFront', ["U' R' F R", "U L F' L'"]),
  edge('middleWhiteSide', ['F']),
  edge('middleWhiteFront', ["D R' D'"]),
  edge('bottomFlipped', ["F' D R' D'"]),
  edge('bottomWrongSlot', ['R2 U F2']),
];

export const CORNER_CASES: Array<TFirstLayerCase> = [
  corner('whiteRight', ["R U R'", "U' F' U F"]),
  corner('whiteFront', ["F' U' F", "U R U' R'"]),
  corner('whiteUp', ["R U2 R' U' R U R'", "F' U2 F U F' U' F"]),
  corner('stuckWhiteRight', ["R U R' U' R U R'"]),
  corner('stuckWhiteFront', ["R U' R' U R U' R'"]),
];

/** Same cases for the front-left slot, so you never need a y rotation. */
export const LEFT_CORNER_CASES: Array<TFirstLayerCase> = [
  corner('leftWhiteLeft', ["L' U' L"], "y'"),
  corner('leftWhiteFront', ["F U F'"], "y'"),
  corner('leftWhiteUp', ["L' U2 L U L' U' L"], "y'"),
];
