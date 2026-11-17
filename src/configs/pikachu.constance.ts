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

export const PIKACHU_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
