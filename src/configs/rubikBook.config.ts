/**
 * Structure of the Rubik guide: chapters in reading order, each with its sections. The titles
 * live in `rubikBookMessages` and the same ids are used as HTML anchors, so the contents list and
 * the headings can never drift apart.
 */
export type TRubikLevel = 'beginner' | 'intermediate' | 'advanced';

export type TBookSection = {
  id: string;
  /** Shown as a badge next to the title; sections for every reader have none. */
  level?: TRubikLevel;
};

export type TBookChapter = { id: string; sections: Array<TBookSection> };

export const RUBIK_LEVELS: Array<TRubikLevel> = ['beginner', 'intermediate', 'advanced'];

/** Number of steps of the layer-by-layer method (`RUBIK_GUIDE[locale].beginnerSteps`). */
export const LBL_STEP_COUNT = 7;

const LBL_STEPS: Array<TBookSection> = Array.from({ length: LBL_STEP_COUNT }, (_, index) => ({
  id: `lbl-step-${index + 1}`,
  level: 'beginner',
}));

export const RUBIK_BOOK: Array<TBookChapter> = [
  {
    id: 'path',
    sections: [
      { id: 'path-beginner' },
      { id: 'path-intermediate' },
      { id: 'path-advanced' },
      { id: 'path-lookup' },
    ],
  },
  {
    id: 'basics',
    sections: [{ id: 'basics-structure' }, { id: 'basics-notation' }, { id: 'basics-grip' }],
  },
  {
    id: 'lbl',
    sections: [...LBL_STEPS, { id: 'lbl-variants' }, { id: 'lbl-tips', level: 'beginner' }],
  },
  {
    id: 'cross',
    sections: [
      { id: 'cross-direct', level: 'intermediate' },
      { id: 'cross-planning', level: 'intermediate' },
      { id: 'cross-inspection', level: 'intermediate' },
      { id: 'cross-xcross', level: 'advanced' },
    ],
  },
  {
    id: 'f2l',
    sections: [
      { id: 'f2l-corners', level: 'intermediate' },
      { id: 'f2l-pairs', level: 'intermediate' },
      { id: 'f2l-algs', level: 'advanced' },
    ],
  },
  {
    id: 'oll',
    sections: [
      { id: 'oll-2look', level: 'intermediate' },
      { id: 'oll-full', level: 'advanced' },
    ],
  },
  {
    id: 'pll',
    sections: [
      { id: 'pll-2look', level: 'intermediate' },
      { id: 'pll-full', level: 'advanced' },
    ],
  },
  {
    id: 'skills',
    sections: [
      { id: 'skills-fingers', level: 'intermediate' },
      { id: 'skills-saving', level: 'intermediate' },
      { id: 'skills-lookahead', level: 'advanced' },
      { id: 'skills-lastlayer', level: 'advanced' },
      { id: 'skills-practice', level: 'advanced' },
    ],
  },
  {
    id: 'plan',
    sections: [
      { id: 'plan-roadmap', level: 'advanced' },
      { id: 'plan-goals' },
      { id: 'plan-methods' },
      { id: 'plan-sources' },
    ],
  },
];

/** What to read at each level, in order. An id is a chapter (the whole chapter) or a section. */
export const RUBIK_PATHS: Record<TRubikLevel, Array<string>> = {
  beginner: ['basics', 'lbl'],
  intermediate: [
    'cross-direct',
    'cross-planning',
    'cross-inspection',
    'f2l-corners',
    'f2l-pairs',
    'oll-2look',
    'pll-2look',
    'skills-fingers',
    'skills-saving',
  ],
  advanced: [
    'pll-full',
    'f2l-algs',
    'oll-full',
    'cross-xcross',
    'skills-lookahead',
    'skills-lastlayer',
    'skills-practice',
    'plan',
  ],
};
