import { Be_Vietnam_Pro } from 'next/font/google';
import IconImg from 'public/favicon.ico';
import ThumbImg from 'public/thumbnail.webp';
import { TMyAllGame } from 'src/types/caro.type';
import { ENV_TYPE, TPageMetadata } from 'src/types/global';
import { SchedulerModeType } from 'src/types/process.type';

export const APP_NAME = 'Experiment App';
export const MAX_CARO_BOARD_SIZE = 50;
export const MAX_CONNECT4_BOARD_SIZE = 80;

export const ENCRYPT_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || '';
export const IV_HEX = process.env.NEXT_PUBLIC_IV_HEX || '00112233445566778899aabbccddeeff';
export const PAPP_BACKEND_URL = process.env.NEXT_PUBLIC_PAPP_BACKEND_URL || '';
export const ENV = (process.env.NEXT_PUBLIC_ENV || 'production') as ENV_TYPE;

export enum DIALOG_KEY {
  caroConfigDialog = 'caroConfigDialog',
  caroConnectionDialog = 'caroConnectionDialog',
  caroInstructionDialog = 'caroInstructionDialog',
  connect4ConfigDialog = 'connect4ConfigDialog',
  connect4InstructionDialog = 'connect4InstructionDialog',
  pikachuConfigDialog = 'pikachuConfigDialog',
  pikachuInstructionDialog = 'pikachuInstructionDialog',
  routingGameDialog = 'routingGameDialog',
  changeBoardConfirmDialog = 'changeBoardConfirmDialog',
  globalConfigDialog = 'globalConfigDialog',
}

export enum QUERY_KEY {
  getMe = 'getMe',
  getListConversations = 'getListConversations',
  findUsers = 'findUsers',
  getMessages = 'getMessages',
}

export const gameConfigs: { [game in TMyAllGame]: { title: string } } = {
  caro: { title: 'Caro' },
  connect4: { title: 'Connect4' },
  pikachu: { title: 'Pikachu' },
};

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

export const siteMetadata: TPageMetadata = {
  title: APP_NAME,
  description: 'I will deploy some app to domain.',
  url: 'https://experiment.peter-present.xyz/',
  siteName: APP_NAME,
  twitterHandle: 'PhamHon08928762',
  icon: IconImg.src,
  image: ThumbImg.src,
  keywords: '',
};

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['400', '700'],
  variable: '--font-be-vietnam-pro',
});
