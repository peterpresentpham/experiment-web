import { TPikachuImg, TPikachuTransform } from 'src/types/pikachu.type';

export const PIKACHU_PIECE_SIZE = 52;

export const pikachuRoundTransformations: Array<TPikachuTransform> = [
  'normal',
  'fallDown',
  'fallUp',
  'shiftLeft',
  'shiftRight',
  'splitHorizontally',
  'mergeHorizontally',
  'splitVertically',
  'mergeVertically',
  'shiftUpLeft',
  'shiftUpRight',
  'shiftDownLeft',
  'shiftDownRight',
  'spreadOut',
  'collapseToCenter',
];

export const pikachuImageSets: Array<TPikachuImg> = ['magic', 'vietnamese-food'];

// Every image set has this many different pieces.
export const PIKACHU_NUM_TYPES = 90;

export function pikachuPieceSrc(imgType: TPikachuImg, value: number) {
  return `/pikachu-${imgType}/piece${value}.png`;
}
