import type { TAlgSource } from 'src/configs/rubikAlgOptions.config';
import type { CubeImage } from 'src/configs/rubikGuide.config';

/**
 * Cases for solving the white face fast: cross edges straight onto the bottom (no daisy) and
 * first-layer corners with short inserts instead of repeating the sexy move.
 *
 * The target slot is always front-bottom (DF) for edges and front-right-bottom (DFR) for
 * corners. The first algorithm is the main one; any others solve the same case. Each algorithm
 * is written `alg@source` (see `TAlgSource`). Every case
 * leaves the other cross edges (and, for corners, the other bottom corners) untouched, which
 * `src/__tests__/lib/cube.test.ts` checks.
 */
export type TFirstLayerCase = {
  id: string;
  algs: Array<string>;
  /** Where each algorithm in `algs` was found, same order. */
  sources: Array<TAlgSource>;
  image: Omit<CubeImage, 'caption'>;
};

function parse(entries: Array<string>) {
  const pairs = entries.map((e) => e.split('@') as [string, TAlgSource]);
  return { algs: pairs.map((p) => p[0]), sources: pairs.map((p) => p[1]) };
}

const edge = (id: string, entries: Array<string>): TFirstLayerCase => {
  const { algs, sources } = parse(entries);
  return { id, algs, sources, image: { kind: 'iso', alg: algs[0], mask: 'cross' } };
};

// `view` turns the picture so a left-slot case shows its left face (the camera sees U, F, R).
const corner = (id: string, entries: Array<string>, view?: string): TFirstLayerCase => {
  const { algs, sources } = parse(entries);
  return { id, algs, sources, image: { kind: 'iso', alg: algs[0], mask: 'firstLayer', view } };
};

export const CROSS_EDGE_CASES: Array<TFirstLayerCase> = [
  edge('topWhiteUp', ['F2@ruwix']),
  edge('topWhiteFront', ["U' R' F R@ruwix", "U L F' L'@derived"]),
  edge('middleWhiteSide', ['F@derived']),
  edge('middleWhiteFront', ["D R' D'@derived"]),
  edge('bottomFlipped', ["F' D R' D'@cubeskills"]),
  edge('bottomWrongSlot', ['R2 U F2@derived']),
];

export const CORNER_CASES: Array<TFirstLayerCase> = [
  corner('whiteRight', ["R U R'@twistyGuide", "U' F' U F@derived"]),
  corner('whiteFront', ["F' U' F@twistyGuide", "U R U' R'@gan"]),
  corner('whiteUp', [
    "R U2 R' U' R U R'@derived",
    "R U' R' U2 R U R'@twistyGuide",
    "F' U2 F U F' U' F@derived",
  ]),
  corner('stuckWhiteRight', ["R U R' U' R U R'@derived"]),
  corner('stuckWhiteFront', ["R U' R' U R U' R'@derived"]),
];

/** Same cases for the front-left slot, so you never need a y rotation. */
export const LEFT_CORNER_CASES: Array<TFirstLayerCase> = [
  corner('leftWhiteLeft', ["L' U' L@derived"], "y'"),
  corner('leftWhiteFront', ["F U F'@derived", "U' L' U L@gan"], "y'"),
  corner('leftWhiteUp', ["L' U2 L U L' U' L@derived"], "y'"),
];
