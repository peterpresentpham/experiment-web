import { LucideProps } from 'lucide-react';
import { ComponentProps, RefAttributes } from 'react';

export type TPosition = [number, number]; // expect [row, column]
export type TVector = TPosition; // expect [x, y]

export enum TSound {
  // Buttons.
  CLICK = 'click',
  // Pikachu: pick a piece, drop it, match a pair, ask for a hint, deal a new board.
  SELECT = 'select',
  DESELECT = 'deselect',
  MATCH = 'match',
  HINT = 'hint',
  SHUFFLE = 'shuffle',
  // Caro: a stone from this player, from the other side (machine, friend online), take back.
  PLACE = 'place',
  PLACE_OPPONENT = 'placeOpponent',
  UNDO = 'undo',
  // A move that is not allowed.
  ERROR = 'error',
  // Short music for the outcome: a Pikachu round cleared, game won, lost, drawn, no move left.
  ROUND = 'round',
  WIN = 'win',
  LOSE = 'lose',
  DRAW = 'draw',
  NO_MOVE = 'noMove',
  BACKGROUND = 'background',
}

export type TSoundConfigType = {
  type: TSound;
  loop?: boolean;
  volume?: number;
  isEnabled?: boolean;
};

export type TDivProps = ComponentProps<'div'>;
export type TIconProps = Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>;

export interface TAnimationComponentProps {
  size?: number | string;
  color?: string;
}
