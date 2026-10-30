import { Cpu, Gamepad2, LucideIcon, Puzzle } from 'lucide-react';

export type TNavItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tag: string;
};

export const NAV_ITEMS: Array<TNavItem> = [
  {
    title: 'Caro',
    description: 'Classic five-in-a-row with offline, online (peer-to-peer) and blind modes.',
    href: '/caro',
    icon: Gamepad2,
    tag: 'Game',
  },
  {
    title: 'Pikachu',
    description: 'Match pairs of tiles across a board that shifts as you clear it.',
    href: '/pikachu',
    icon: Puzzle,
    tag: 'Game',
  },
  {
    title: 'Process',
    description: 'Visualize how an operating system schedules processes across CPU cores.',
    href: '/process',
    icon: Cpu,
    tag: 'Simulation',
  },
];

export const REPO_URL = 'https://github.com/phamhongphuc1999/experiment-web';
export const PORTFOLIO_URL = 'https://peter-present.xyz/';
