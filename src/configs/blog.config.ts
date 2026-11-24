import { FORMAT_NUMBER_SLUGS } from './format-number.slugs';

export type TBlogTopicId = 'thesis' | 'formatNumber' | 'rubik' | 'chess';

// Titles and descriptions live in `blogMessages.topics`, keyed by `id`.
export type TBlogTopic = { id: TBlogTopicId; href: string };

export type TFormatNumberSlug = (typeof FORMAT_NUMBER_SLUGS)[number];

export type TDocPage = {
  slug: TFormatNumberSlug;
  // Breadcrumb label: the API name, which stays the same in every language.
  label: string;
};

export const BLOG_TOPICS: Array<TBlogTopic> = [
  { id: 'thesis', href: '/blog/master-thesis' },
  { id: 'formatNumber', href: '/blog/format-number/getting-started' },
  { id: 'rubik', href: '/blog/rubik3x3' },
  { id: 'chess', href: '/blog/chess' },
];

export const RUBIK_BASE = '/blog/rubik3x3';

export const FORMAT_NUMBER_BASE = '/blog/format-number';

export const FORMAT_NUMBER_PAGES: Array<TDocPage> = FORMAT_NUMBER_SLUGS.map((slug) => ({
  slug,
  label: slug,
}));
