import { Be_Vietnam_Pro } from 'next/font/google';
import { SchedulerModeType } from 'src/types/process.type';

export const APP_NAME = 'Experiment App';
export const MAX_CARO_BOARD_SIZE = 50;

// The game-signaling server (src/server/signaling.mjs) always runs as its own
// process (`yarn signal`), separate from the Next.js app — this must point to it.
// See README "Caro real-time server".
export const GAME_SIGNAL_URL = process.env.NEXT_PUBLIC_GAME_SIGNAL_URL || '';

export enum DIALOG_KEY {
  caroConfigDialog = 'caroConfigDialog',
  caroConnectionDialog = 'caroConnectionDialog',
  caroInstructionDialog = 'caroInstructionDialog',
  pikachuConfigDialog = 'pikachuConfigDialog',
  pikachuInstructionDialog = 'pikachuInstructionDialog',
  changeBoardConfirmDialog = 'changeBoardConfirmDialog',
  globalConfigDialog = 'globalConfigDialog',
}

export const ProcessSchedulerConfigs: Record<
  SchedulerModeType,
  { id: SchedulerModeType; name: string; coming?: boolean }
> = {
  [SchedulerModeType.FIFO]: { id: SchedulerModeType.FIFO, name: 'First In, First Out' },
  [SchedulerModeType.SJF]: { id: SchedulerModeType.SJF, name: 'Shortest Job First', coming: true },
  [SchedulerModeType.ROUND_ROBIN]: { id: SchedulerModeType.ROUND_ROBIN, name: 'Round Robin' },
  [SchedulerModeType.MLFQ]: {
    id: SchedulerModeType.MLFQ,
    name: 'Multilevel Feedback Queue',
    coming: true,
  },
};

export const SITE_URL = 'https://experiment.peter-present.xyz';
export const SITE_DESCRIPTION =
  'A playground of small web experiments: board games, an OS process scheduler visualizer and a chat app.';
export const GTM_ID = 'GTM-W3M57J7H';

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '700'],
  variable: '--font-be-vietnam-pro',
});
