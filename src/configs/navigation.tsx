import { BookOpen, Cpu, Gamepad2, LucideIcon, Puzzle } from 'lucide-react';

export type TNavId = 'caro' | 'pikachu' | 'blog' | 'process';

// Titles, descriptions and tags live in `commonMessages.nav`, keyed by `id`.
export type TNavItem = {
  id: TNavId;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: Array<TNavItem> = [
  { id: 'caro', href: '/caro', icon: Gamepad2 },
  { id: 'pikachu', href: '/pikachu', icon: Puzzle },
  { id: 'blog', href: '/blog', icon: BookOpen },
  { id: 'process', href: '/process', icon: Cpu },
];

/** Links shown in the header and on the home page: the blog is hidden, reachable by URL and
 * through the sitemap only. */
export const VISIBLE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.id != 'blog');

export const REPO_URL = 'https://github.com/phamhongphuc1999/experiment-web';
export const PORTFOLIO_URL = 'https://peter-present.xyz/';
