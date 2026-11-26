import {
  filterCases,
  isAlgQuery,
  normalizeAlg,
  normalizeText,
  TCaseFilter,
  TSearchableCase,
} from 'src/services/rubik/search.utils';
import { describe, expect, it } from 'vitest';

const CASES: Array<TSearchableCase> = [
  {
    key: 'oll-27',
    kind: 'oll',
    set: 'core',
    texts: ['OLL 27', 'Sune', 'OCLL7', 'Corners only'],
    algs: ["R U R' U R U2' R'"],
  },
  {
    key: 'oll-30',
    kind: 'oll',
    set: 'full',
    texts: ['OLL 30', 'P shapes'],
    algs: ["F U R U2 R' U' R U2 R' U' F'"],
  },
  {
    key: 'pll-Aa',
    kind: 'pll',
    set: 'core',
    texts: ['Aa-perm', 'Corners'],
    algs: ["x R' U R' D2 R U' R' D2 R2"],
  },
  {
    key: 'f2l-1.1',
    kind: 'f2l',
    set: 'core',
    texts: ['F2L 1.1', 'Group 1'],
    algs: ["U (R U' R')"],
  },
];

const ALL: TCaseFilter = { query: '', kinds: [], set: 'full' };
const keys = (filter: Partial<TCaseFilter>) =>
  filterCases(CASES, { ...ALL, ...filter }).map((c) => c.key);

describe('normalize', () => {
  it('lowers case and drops accents', () => {
    expect(normalizeText('  SÚNE   Đỏ ')).toBe('sune do');
  });

  it('unifies primes and brackets of an algorithm but keeps case', () => {
    expect(normalizeAlg('(R U’ R′)  [U]')).toBe("R U' R' U");
  });

  it('tells algorithm queries from words', () => {
    expect(isAlgQuery("R U R'")).toBe(true);
    expect(isAlgQuery('Rw U2')).toBe(true);
    expect(isAlgQuery('sune')).toBe(false);
    expect(isAlgQuery('')).toBe(false);
  });
});

describe('filterCases', () => {
  it('keeps everything without a query', () => {
    expect(keys({})).toHaveLength(CASES.length);
  });

  it('finds a case by name, id or group', () => {
    expect(keys({ query: 'sune' })).toEqual(['oll-27']);
    expect(keys({ query: 'oll 30' })).toEqual(['oll-30']);
    expect(keys({ query: 'aa' })).toEqual(['pll-Aa']);
    expect(keys({ query: '1.1' })).toEqual(['f2l-1.1']);
  });

  it('matches words by their start, not anywhere inside', () => {
    expect(keys({ query: 'une' })).toEqual([]);
    expect(keys({ query: 'perm' })).toEqual(['pll-Aa']);
  });

  it('finds a case by a pasted algorithm, ignoring brackets and primes style', () => {
    expect(keys({ query: "R U' R'" })).toEqual(['pll-Aa', 'f2l-1.1']);
    expect(keys({ query: 'U (R U’ R’)' })).toEqual(['f2l-1.1']);
  });

  it('does not match a partial move', () => {
    // "R U2" must not find "R U2'" (a different move), and "R U R" must not find "R U R'".
    expect(keys({ query: 'R U2' })).toEqual(['oll-30']);
    expect(keys({ query: 'R U R' })).toEqual([]);
  });

  it('filters by kind and by the core set', () => {
    expect(keys({ kinds: ['oll'] })).toEqual(['oll-27', 'oll-30']);
    expect(keys({ kinds: ['oll', 'pll'], set: 'core' })).toEqual(['oll-27', 'pll-Aa']);
    expect(keys({ set: 'core', query: 'p shapes' })).toEqual([]);
  });
});
