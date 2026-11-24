import type { TChessSquare } from 'src/types/chess.type';

export const BOARD_FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

/** World position of a square's centre: white at +z (towards the camera), a-file at -x. */
export function squareToXZ(square: TChessSquare): [number, number] {
  const file = BOARD_FILES.indexOf(square[0] as (typeof BOARD_FILES)[number]);
  const rank = Number(square[1]) - 1;
  return [file - 3.5, 3.5 - rank];
}

export function isDarkSquare(square: TChessSquare): boolean {
  const file = BOARD_FILES.indexOf(square[0] as (typeof BOARD_FILES)[number]);
  return (file + Number(square[1])) % 2 == 1;
}
