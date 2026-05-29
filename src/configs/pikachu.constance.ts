import { TPikachuTransform } from 'src/types/pikachu.type';

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

export const pikachuTransformConfig: Record<
  TPikachuTransform,
  { id: TPikachuTransform; title: string }
> = {
  normal: { id: 'normal', title: 'Normal' },
  fallDown: { id: 'fallDown', title: 'Fall down' },
  fallUp: { id: 'fallUp', title: 'Fall up' },
  shiftLeft: { id: 'shiftLeft', title: 'Shift left' },
  shiftRight: { id: 'shiftRight', title: 'Shift right' },
  splitHorizontally: { id: 'splitHorizontally', title: 'Split horizontally' },
  mergeHorizontally: { id: 'mergeHorizontally', title: 'Merge horizontally' },
  splitVertically: { id: 'splitVertically', title: 'Split vertically' },
  mergeVertically: { id: 'mergeVertically', title: 'Merge vertically' },
  shiftUpLeft: { id: 'shiftUpLeft', title: 'Shift up left' },
  shiftUpRight: { id: 'shiftUpRight', title: 'Shift up right' },
  shiftDownLeft: { id: 'shiftDownLeft', title: 'Shift down left' },
  shiftDownRight: { id: 'shiftDownRight', title: 'Shift down right' },
  spreadOut: { id: 'spreadOut', title: 'Spread out' },
  collapseToCenter: { id: 'collapseToCenter', title: 'Collapse to center' },
};

export const PIKACHU_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
