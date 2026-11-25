import { F2LConfig } from 'src/configs/rubik3x3.config';
import {
  CORNER_CASES,
  CROSS_EDGE_CASES,
  LEFT_CORNER_CASES,
  TFirstLayerCase,
} from 'src/configs/rubikFirstLayer.config';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { OLL_CASES, PLL_CASES } from 'src/configs/rubikLL.config';
import {
  applyAlg,
  caseFromAlg,
  CubeState,
  Face,
  invertAlg,
  parseAlg,
  readFace,
  solvedCube,
} from 'src/lib/cube/cube';
import { describe, expect, it } from 'vitest';

const SIDES: Array<Face> = ['F', 'R', 'B', 'L'];
const AUF = ['', 'U', 'U2', "U'"];

/** D face solved and the side faces solved from row `fromRow` (0 = top row) down. */
function bottomSolved(state: CubeState, fromRow: number): boolean {
  return (
    readFace(state, 'D').every((c) => c === 'D') &&
    SIDES.every((f) =>
      readFace(state, f)
        .slice(fromRow * 3)
        .every((c) => c === f)
    )
  );
}

const isSolved = (state: CubeState) =>
  bottomSolved(state, 0) && readFace(state, 'U').every((c) => c === 'U');

/** Last-layer stickers (U face plus the top row of each side) as a string. */
function lastLayer(state: CubeState, onlyYellow: boolean): string {
  const stickers = [
    readFace(state, 'U'),
    ...SIDES.map((f) => readFace(state, f).slice(0, 3)),
  ].flat();
  return stickers.map((c) => (onlyYellow ? (c === 'U' ? 'Y' : '.') : c)).join('');
}

/** Every view of a case reachable by turning U before (and for PLL, after) the algorithm. */
function caseSignatures(alg: string, onlyYellow: boolean): Set<string> {
  const signatures = new Set<string>();
  for (const pre of AUF) {
    for (const post of onlyYellow ? [''] : AUF) {
      signatures.add(lastLayer(applyAlg(caseFromAlg(`${alg} ${post}`), pre), onlyYellow));
    }
  }
  return signatures;
}

describe('cube simulator', () => {
  it('parses notation variants', () => {
    expect(parseAlg("(R U2') [x] Rw2 M'")).toEqual([
      { base: 'R', turns: 1 },
      { base: 'U', turns: -2 },
      { base: 'x', turns: 1 },
      { base: 'r', turns: 2 },
      { base: 'M', turns: -1 },
    ]);
  });

  it('returns to solved after a sequence and its inverse', () => {
    const alg = "R U R' U' r' F R F' M2 E S' x y' z2 d b' l u2";
    expect(isSolved(applyAlg(applyAlg(solvedCube(), alg), invertAlg(alg)))).toBe(true);
  });

  it('has period 6 for the sexy move', () => {
    expect(isSolved(applyAlg(solvedCube(), "R U R' U' ".repeat(6)))).toBe(true);
  });

  it('turns the front-right column up on R', () => {
    const front = readFace(applyAlg(solvedCube(), 'R'), 'F');
    expect([front[2], front[5], front[8]]).toEqual(['D', 'D', 'D']);
  });

  it('shows cases in the starting grip for algorithms with cube rotations', () => {
    // y' then a back-right insertion solves the front-right slot of the starting grip.
    const state = caseFromAlg("y' R' U' R");
    expect(readFace(state, 'F')[5]).not.toBe('F');
    expect(readFace(state, 'B')[3]).toBe('B');
  });
});

describe('OLL algorithms', () => {
  const seen: Array<[string, Set<string>]> = [];
  it.each(OLL_CASES.map((c) => [c.id, c] as const))('OLL %s', (_, c) => {
    const main = caseSignatures(c.algs[0], true);
    for (const alg of c.algs) {
      expect(bottomSolved(caseFromAlg(alg), 1), alg).toBe(true);
      const sig = caseSignatures(alg, true);
      expect(
        [...sig].some((s) => main.has(s)),
        alg
      ).toBe(true);
    }
    for (const [id, other] of seen) {
      expect(
        [...main].some((s) => other.has(s)),
        `same case as OLL ${id}`
      ).toBe(false);
    }
    seen.push([c.id, main]);
  });
});

describe('PLL algorithms', () => {
  const seen: Array<[string, Set<string>]> = [];
  it.each(PLL_CASES.map((c) => [c.id, c] as const))('%s-perm', (_, c) => {
    const main = caseSignatures(c.algs[0], false);
    for (const alg of c.algs) {
      const state = caseFromAlg(alg);
      expect(bottomSolved(state, 1), alg).toBe(true);
      expect(
        readFace(state, 'U').every((x) => x === 'U'),
        alg
      ).toBe(true);
      expect(
        [...caseSignatures(alg, false)].some((s) => main.has(s)),
        alg
      ).toBe(true);
    }
    for (const [id, other] of seen) {
      expect(
        [...main].some((s) => other.has(s)),
        `same case as ${id}`
      ).toBe(false);
    }
    seen.push([c.id, main]);
  });
});

describe('F2L algorithms', () => {
  const cases = F2LConfig.flatMap((g) =>
    g.data.flatMap((item) => item.methods.map((m) => [item.id, m]))
  );

  it.each(cases)('%s: %s only touches the front-right slot', (_, alg) => {
    // Every piece except the front-right corner/edge and the last layer must stay solved.
    const state = caseFromAlg(alg);
    const touched = new Set(
      state
        .filter(
          (s) => s.home[1] <= 0 && (s.pos.join() !== s.home.join() || s.color !== solvedColor(s))
        )
        .map((s) => s.home.join())
    );
    touched.delete('1,-1,1');
    touched.delete('1,0,1');
    expect([...touched]).toEqual([]);
  });
});

describe('beginner and 2-look algorithms', () => {
  it('keeps the first layer for middle-layer and last-layer steps', () => {
    const algs = RUBIK_GUIDE.en.beginnerSteps
      .slice(2, 6)
      .flatMap((s) => s.algs?.map((a) => a.alg) ?? []);
    for (const alg of algs) expect(bottomSolved(applyAlg(solvedCube(), alg), 2), alg).toBe(true);
  });

  it('keeps the first two layers for last-layer steps', () => {
    const algs = [
      ...RUBIK_GUIDE.en.beginnerSteps.slice(3, 6).flatMap((s) => s.algs?.map((a) => a.alg) ?? []),
      ...RUBIK_GUIDE.en.ollEdges2Look.map((a) => a.alg),
    ];
    for (const alg of algs) expect(bottomSolved(applyAlg(solvedCube(), alg), 1), alg).toBe(true);
  });
});

/** Colour a sticker shows when its piece is solved, read from the sticker's current normal. */
function solvedColor(s: CubeState[number]): Face {
  const [x, y, z] = s.normal;
  return x === 1 ? 'R' : x === -1 ? 'L' : y === 1 ? 'U' : y === -1 ? 'D' : z === 1 ? 'F' : 'B';
}

/** Where the stickers of the piece whose home is `home` are, to compare one piece in two states. */
const piecePlace = (state: CubeState, home: [number, number, number]) =>
  state
    .filter((s) => s.home.join() === home.join())
    .map((s) => `${s.color}@${s.pos}/${s.normal}`)
    .sort()
    .join(' ');

/** True when every sticker of the piece whose home is `home` sits at home with its own colour. */
function pieceSolved(state: CubeState, home: [number, number, number]): boolean {
  const solved = solvedCube();
  return state
    .filter((s) => s.home.join() === home.join())
    .every((s) =>
      solved.some(
        (o) =>
          o.pos.join() === s.pos.join() &&
          o.normal.join() === s.normal.join() &&
          o.color === s.color
      )
    );
}

describe('fast white face cases', () => {
  const crossEdges: Array<[number, number, number]> = [
    [0, -1, 1],
    [1, -1, 0],
    [0, -1, -1],
    [-1, -1, 0],
  ];
  const bottomCorners: Array<[number, number, number]> = [
    [1, -1, 1],
    [-1, -1, 1],
    [1, -1, -1],
    [-1, -1, -1],
  ];

  function check(
    cases: Array<TFirstLayerCase>,
    target: [number, number, number],
    keep: typeof crossEdges
  ) {
    for (const c of cases) {
      const state = caseFromAlg(c.algs[0]);
      expect(pieceSolved(state, target), c.id).toBe(false);
      for (const home of keep) expect(pieceSolved(state, home), `${c.id} keeps ${home}`).toBe(true);
      for (const alt of c.algs.slice(1))
        expect(piecePlace(caseFromAlg(alt), target), alt).toBe(piecePlace(state, target));
    }
  }

  it('drops each cross edge in without breaking the others', () => {
    // The wrong-slot case moves the right edge too, so only the back and left ones must stay.
    const normal = CROSS_EDGE_CASES.filter((c) => c.id !== 'bottomWrongSlot');
    check(normal, crossEdges[0], crossEdges.slice(1));
    check(
      CROSS_EDGE_CASES.filter((c) => c.id === 'bottomWrongSlot'),
      crossEdges[0],
      crossEdges.slice(2)
    );
  });

  it('inserts each corner without breaking the cross or other corners', () => {
    check(CORNER_CASES, bottomCorners[0], [...crossEdges, ...bottomCorners.slice(1)]);
    check(LEFT_CORNER_CASES, bottomCorners[1], [
      ...crossEdges,
      bottomCorners[0],
      ...bottomCorners.slice(2),
    ]);
  });
});
