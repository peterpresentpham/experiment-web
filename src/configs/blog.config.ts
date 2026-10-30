export type TBlogTopic = {
  title: string;
  description: string;
  href: string;
};

export type TDocPage = {
  slug: string;
  title: string;
  label: string;
};

export const BLOG_TOPICS: Array<TBlogTopic> = [
  {
    title: 'Master thesis',
    description:
      'Account abstraction wallet with social recovery based on zero-knowledge proofs, written as a web book.',
    href: '/blog/master-thesis',
  },
  {
    title: 'Format number',
    description: 'Documentation for @peter-present/format-number, a number formatting library.',
    href: '/blog/format-number/getting-started',
  },
  {
    title: 'Rubik 3x3',
    description: '41 F2L cases with images and algorithms you can copy with a click.',
    href: '/blog/rubik3x3',
  },
];

export const RUBIK_BASE = '/blog/rubik3x3';

export const FORMAT_NUMBER_BASE = '/blog/format-number';

export const FORMAT_NUMBER_PAGES: Array<TDocPage> = [
  { slug: 'getting-started', title: 'Getting started', label: 'Getting started' },
  { slug: 'round', title: 'Round', label: 'round' },
  { slug: 'compact', title: 'Compact', label: 'compact' },
  { slug: 'io', title: 'IO', label: 'io' },
  { slug: 'notation', title: 'Notation', label: 'notation' },
  { slug: 'format', title: 'Format', label: 'format' },
  { slug: 'types', title: 'Types', label: 'types' },
];
