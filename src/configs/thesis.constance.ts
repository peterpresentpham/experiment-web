export const appendixIndex = ['A', 'B', 'C', 'D'];

export const THESIS_CLASS = {
  chapter: 'thesis-chapter',
  section: 'thesis-section',
  subsection: 'thesis-subsection',
  ref: 'thesis-ref',
  figure: 'thesis-figure',
  equation: 'thesis-equation',
  cite: 'thesis-cite',
  acknowledgement: 'thesis-acknowledgement',
  abstract: 'thesis-abstract',
  reference: 'thesis-reference',
  program: 'thesis-program',
  table: 'thesis-table',
  appendix: 'thesis-appendix',
  sameChapterAppendix: 'thesis-same-chapter-appendix',
  algorithm: 'thesis-algorithm',
};

export const mathJaxConfig = {
  'fast-preview': { disabled: true },
  tex2jax: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
  },
  messageStyle: 'none',
};
