export type TCaseKind = 'oll' | 'pll' | 'f2l';

/** `core` cases are the ones the intermediate path teaches (2-look OLL/PLL, basic F2L). */
export type TCaseSet = 'core' | 'full';

export type TSearchableCase = {
  key: string;
  kind: TCaseKind;
  set: TCaseSet;
  /** Everything a reader may type to find the case: id, name, group, code. */
  texts: Array<string>;
  algs: Array<string>;
};

export type TCaseFilter = {
  query: string;
  /** Empty means every kind. */
  kinds: Array<TCaseKind>;
  /** `core` keeps only the core cases. */
  set: TCaseSet;
};

/** Lower case, no accents, single spaces: so "Sune", "sune" and "SÚNE" are the same word. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

// One move: a face or slice, optionally wide (`Rw`), with a turn suffix.
const MOVE = /^([RLUDFBMESxyzrludfb])w?(2'?|'|2)?$/;

/** Curly primes become `'`, brackets disappear and spacing is collapsed. Case is kept. */
export function normalizeAlg(alg: string): string {
  return alg
    .replace(/[’′‘`]/g, "'")
    .replace(/[()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when every word of the query is a move, so it is meant as an algorithm. */
export function isAlgQuery(query: string): boolean {
  const words = normalizeAlg(query).split(' ').filter(Boolean);
  return words.length > 0 && words.every((word) => MOVE.test(word));
}

function words(text: string): Array<string> {
  return normalizeText(text)
    .split(/[\s\-_/·:]+/)
    .filter(Boolean);
}

function matchesText(item: TSearchableCase, query: string): boolean {
  const tokens = words(query);
  if (tokens.length === 0) return true;
  const haystack = item.texts.flatMap(words);
  // Each token must start one of the case's words, so "oll 2" finds OLL 2x but "l" is not
  // swallowed by every word that merely contains an "l".
  return tokens.every((token) => haystack.some((word) => word.startsWith(token)));
}

function matchesAlg(item: TSearchableCase, query: string): boolean {
  // Padded with spaces so "R U" does not match inside "R U2" or "fR U".
  const needle = ` ${normalizeAlg(query)} `;
  return item.algs.some((alg) => ` ${normalizeAlg(alg)} `.includes(needle));
}

export function matchesCase(item: TSearchableCase, filter: TCaseFilter): boolean {
  if (filter.kinds.length > 0 && !filter.kinds.includes(item.kind)) return false;
  if (filter.set === 'core' && item.set !== 'core') return false;
  const query = filter.query.trim();
  if (!query) return true;
  return matchesText(item, query) || (isAlgQuery(query) && matchesAlg(item, query));
}

export function filterCases<T extends TSearchableCase>(items: Array<T>, filter: TCaseFilter) {
  return items.filter((item) => matchesCase(item, filter));
}
