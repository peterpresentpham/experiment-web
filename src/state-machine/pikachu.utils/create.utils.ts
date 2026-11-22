import { PIKACHU_NUM_TYPES } from 'src/configs/pikachu.constance';
import PikachuService from 'src/services/pikachu';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPikachuCreateEvent } from 'src/types/pikachu.type';

export function createPikachuBoard({ mode }: Pick<TPikachuCreateEvent, 'mode'>) {
  const { metadata, fn } = usePikachuStore.getState();
  const { numberOfRows, numberOfColumns, numberOfLines } = metadata;
  const { board, path } = PikachuService.createNewBoard({
    numberOfRows,
    numberOfColumns,
    numberOfLines,
    numTypes: PIKACHU_NUM_TYPES,
  });
  fn.createBoard(mode, board, path);
}
