import { TPikachuGame, TPikachuTransform } from 'src/types/pikachu.type';

type TRoundMetadata = {
  gameType: TPikachuGame;
  roundList: Array<TPikachuTransform>;
  round: number;
  randomRoundListIndex: number;
};

/**
 * Transform used by the current round. Falls back to the first round (or 'normal' for an empty
 * list) when the stored round or random index no longer points into the list, e.g. after the
 * round list was edited or a save from an older version was loaded.
 */
export function getRoundTransform(metadata: TRoundMetadata): TPikachuTransform {
  const { gameType, roundList, round, randomRoundListIndex } = metadata;
  const index = gameType == 'randomBoard' ? randomRoundListIndex : round - 1;
  return roundList[index] ?? roundList[0] ?? 'normal';
}

/** Whether the board still has at least one piece. */
export function hasPieces(board: Array<Array<number>>) {
  return board.some((row) => row.some((value) => value > 0));
}
