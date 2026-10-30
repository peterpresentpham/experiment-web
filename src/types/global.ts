import { LucideProps } from 'lucide-react';
import { RefAttributes } from 'react';

export type TPosition = [number, number]; // expect [row, column]
export type TVector = TPosition; // expect [x, y]

export enum TSound {
  CLICK = 'click',
  MOVE = 'move',
  SUCCESS = 'success',
  ERROR = 'error',
  BACKGROUND = 'background',
}

export type TSoundConfigType = {
  type: TSound;
  loop?: boolean;
  volume?: number;
  isEnabled?: boolean;
};

export type TIconProps = Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>;

export interface TAnimationComponentProps {
  size?: number | string;
  color?: string;
}
