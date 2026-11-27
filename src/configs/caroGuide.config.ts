import type { TCaroGuideExample } from 'src/services/caro-guide/board';

export const CARO_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type TCaroLevel = (typeof CARO_LEVELS)[number];

export const CARO_EXAMPLE_IDS = [
  'five',
  'blockedFive',
  'edgeFive',
  'overline',
  'openThree',
  'splitThree',
  'closedThree',
  'four',
  'openFour',
  'blockGap',
  'fakeOpenFour',
  'fourThree',
  'doubleThree',
  'vcf',
  'bookOpening',
  'realGame',
  'hellLineA',
  'hellLineB',
] as const;
export type TCaroExampleId = (typeof CARO_EXAMPLE_IDS)[number];

export const CARO_SECTION_IDS = [
  'board',
  'blockRule',
  'shapes',
  'defence',
  'blockedEnds',
  'doubleThreats',
  'vcf',
  'firstMove',
  'opening',
  'realGame',
  'beatHell',
  'practice',
] as const;
export type TCaroSectionId = (typeof CARO_SECTION_IDS)[number];

export const CARO_SECTIONS: Record<
  TCaroLevel,
  Array<{ id: TCaroSectionId; examples: Array<TCaroExampleId> }>
> = {
  beginner: [
    { id: 'board', examples: ['five', 'overline'] },
    { id: 'blockRule', examples: ['blockedFive', 'edgeFive'] },
    { id: 'shapes', examples: ['openThree', 'splitThree', 'closedThree', 'four', 'openFour'] },
    { id: 'defence', examples: ['blockGap'] },
  ],
  intermediate: [
    { id: 'blockedEnds', examples: ['fakeOpenFour'] },
    { id: 'doubleThreats', examples: ['fourThree', 'doubleThree'] },
    { id: 'vcf', examples: ['vcf'] },
  ],
  advanced: [
    { id: 'firstMove', examples: [] },
    { id: 'opening', examples: ['bookOpening'] },
    { id: 'realGame', examples: ['realGame'] },
    { id: 'beatHell', examples: ['hellLineA', 'hellLineB'] },
    { id: 'practice', examples: [] },
  ],
};

const SMALL = { size: 15, winMode: 'blockOpponent' } as const;

/**
 * Every example of the guide; its text lives in `caroGuideMessages.examples`, keyed by the same
 * id. `src/__tests__/caro/guide-examples.test.ts` checks each claim the text makes (a win, no
 * win, an open four, a forced win) with the game's own rule check and the machine's threat search.
 */
export const CARO_EXAMPLES: Record<TCaroExampleId, TCaroGuideExample> = {
  five: { ...SMALL, x: ['f8', 'g8', 'h8', 'i8'], o: ['g7', 'h9', 'i7'], moves: ['j8'], first: 'x' },
  overline: {
    ...SMALL,
    x: ['f8', 'g8', 'h8', 'j8', 'k8'],
    o: ['g7', 'h9', 'j9', 'i7'],
    moves: ['i8'],
    first: 'x',
  },
  blockedFive: {
    ...SMALL,
    x: ['f8', 'g8', 'h8', 'i8'],
    o: ['e8', 'k8', 'h7'],
    moves: ['j8'],
    first: 'x',
    marks: ['e8', 'k8'],
  },
  edgeFive: {
    ...SMALL,
    x: ['b8', 'c8', 'd8', 'e8'],
    o: ['f8', 'c7', 'd9'],
    moves: ['a8'],
    first: 'x',
    marks: ['f8'],
  },
  openThree: {
    ...SMALL,
    x: ['g8', 'h8', 'i8'],
    o: ['g9', 'h7'],
    moves: [],
    first: 'o',
    marks: ['f8', 'j8'],
  },
  splitThree: {
    ...SMALL,
    x: ['g8', 'h8', 'j8'],
    o: ['h9', 'i7'],
    moves: [],
    first: 'o',
    marks: ['f8', 'i8', 'k8'],
  },
  closedThree: { ...SMALL, x: ['g8', 'h8', 'i8'], o: ['f8', 'h9'], moves: [], first: 'o' },
  four: {
    ...SMALL,
    x: ['g8', 'h8', 'i8', 'j8'],
    o: ['f8', 'h9', 'i9'],
    moves: [],
    first: 'o',
    marks: ['k8'],
  },
  openFour: {
    ...SMALL,
    x: ['g8', 'h8', 'i8', 'j8'],
    o: ['h9', 'i9', 'i7'],
    moves: [],
    first: 'o',
    marks: ['f8', 'k8'],
  },
  blockGap: {
    ...SMALL,
    x: ['g8', 'h8', 'j8'],
    o: ['h9', 'i7'],
    moves: ['i8'],
    first: 'o',
    marks: ['f8', 'k8'],
  },
  fakeOpenFour: {
    ...SMALL,
    x: ['g8', 'h8', 'i8', 'j8'],
    o: ['l8', 'h9', 'i9'],
    moves: ['f8', 'k8'],
    first: 'o',
    marks: ['l8'],
  },
  fourThree: {
    ...SMALL,
    x: ['g8', 'h8', 'i8', 'j6', 'j7'],
    o: ['f8', 'h7', 'i9', 'g9'],
    moves: ['j8', 'k8', 'j9', 'j10', 'j5'],
    first: 'x',
  },
  doubleThree: {
    ...SMALL,
    x: ['g8', 'h8', 'i6', 'i7'],
    o: ['g9', 'j7', 'h6'],
    moves: ['i8', 'i9', 'j8', 'f8', 'k8'],
    first: 'x',
  },
  vcf: {
    ...SMALL,
    x: ['f8', 'g8', 'h8', 'i10', 'i11', 'j10', 'k11'],
    o: ['e8', 'i12', 'l12', 'g10', 'j11', 'h12'],
    moves: ['i8', 'j8', 'i9', 'i7', 'g7'],
    first: 'x',
  },
  // The hell level's opening book (20x20, blocked ends): the player starts in the middle.
  bookOpening: {
    size: 20,
    winMode: 'blockOpponent',
    x: [],
    o: [],
    moves: ['k11', 'j10', 'l10', 'm9'],
    first: 'x',
  },
  // A game the hell level lost on the deployed site (2026-11-24), before its book was rebuilt.
  realGame: {
    size: 20,
    winMode: 'blockOpponent',
    x: [],
    o: [],
    moves: [
      'k11',
      'j10',
      'l10',
      'j12',
      'm9',
      'm12',
      'n8',
      'o7',
      'l8',
      'j13',
      'j11',
      'k12',
      'l12',
      'l11',
      'm10',
      'k10',
      'j9',
      'n13',
      'o14',
      'h15',
      'i14',
      'k13',
      'n10',
      'k7',
      'o11',
      'q13',
      'm8',
      'm13',
      'l13',
      'o13',
      'p13',
      'o8',
      'm7',
      'm6',
      'p10',
      'o10',
      'o9',
      'q11',
      'l6',
    ],
    first: 'x',
    marks: ['j12', 'm12'],
  },
  // Games a stronger Rapfi won against the hell level as the site plays it
  // (scripts/caro-hell/hell-attack.ts): the shortest win of the l10 and m10 lines.
  hellLineA: {
    size: 20,
    winMode: 'blockOpponent',
    x: [],
    o: [],
    moves:
      'k11 j10 l10 m9 i12 m11 i11 h14 j11 m10 m12 l8 m8 l9 l11 g11 k12 l7 l12 j12 l13 l14 i10 m14 h9'.split(
        ' '
      ),
    first: 'x',
    marks: ['h14'],
  },
  hellLineB: {
    size: 20,
    winMode: 'blockOpponent',
    x: [],
    o: [],
    moves:
      'k11 j10 m10 l11 n10 j9 m12 j7 j8 m9 n11 p9 o10 k10 o12 l9 o9 h7 i8 k9 i9 o11 n12 n9 l12 p12 k12'.split(
        ' '
      ),
    first: 'x',
    marks: ['j7'],
  },
};
