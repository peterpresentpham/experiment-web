import PikachuService from 'src/services/pikachu';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPikachuContext, TPikachuCreateEvent } from 'src/types/pikachu.type';

export function createPikachuAction({ mode }: TPikachuCreateEvent): Partial<TPikachuContext> {
  const { metadata, fn } = usePikachuStore.getState();
  const { numberOfRows, numberOfColumns, numberOfLines, imgType } = metadata;
  const { board, path } = PikachuService.createNewBoard({
    numberOfRows,
    numberOfColumns,
    numberOfLines,
    numTypes: imgType == 'internal' ? 90 : 1025,
  });
  fn.createBoard(mode, board, path);
  return {};
}
