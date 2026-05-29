import cloneDeep from 'lodash.clonedeep';
import { toast } from 'sonner';
import { getRandom, isPositionEqual, sleep } from 'src/services';
import PikachuService from 'src/services/pikachu';
import { soundtrack } from 'src/services/soundtrack';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TSound } from 'src/types/global';
import {
  PikachuMachineEvent,
  TPikachuContext,
  TPikachuEvent,
  TPikachuMoveEvent,
} from 'src/types/pikachu.type';

export function changeBoardAction(): Partial<TPikachuContext> {
  const state = usePikachuStore.getState();
  const { numberOfRows, numberOfColumns, numberOfLines, imgType } = state.metadata;
  const { board, path } = PikachuService.changeBoard({
    currentBoard: state.board,
    numberOfRows,
    numberOfColumns,
    numberOfLines,
    numTypes: imgType == 'internal' ? 90 : 1025,
  });
  state.fn.changeBoard(board, path);
  return { position: undefined, selectedPath: [] };
}

export function move(
  context: TPikachuContext,
  { position }: TPikachuMoveEvent,
  send: (event: TPikachuEvent) => void
): Partial<TPikachuContext> {
  const { board, metadata } = usePikachuStore.getState();
  const {
    numberOfRows,
    numberOfColumns,
    numberOfLines,
    gameType,
    roundList,
    round,
    randomRoundListIndex,
  } = metadata;
  if (board[position[0]][position[1]] == 0) return {};
  if (context.position == undefined) {
    soundtrack.play({ type: TSound.CLICK });
    return { position };
  } else if (isPositionEqual(context.position, position)) {
    soundtrack.play({ type: TSound.CLICK });
    return { position: undefined };
  } else {
    const cloneBoard = cloneDeep(board);
    const path = PikachuService.findPath({
      board: cloneBoard,
      sourcePiece: context.position,
      targetPiece: position,
      numberOfRows,
      numberOfColumns,
      numberOfLines,
    });
    if (path) {
      const transformType =
        gameType != 'randomBoard' ? roundList[round - 1] : roundList[randomRoundListIndex];
      PikachuService.transform(
        { board: cloneBoard, moves: [context.position, position], numberOfRows, numberOfColumns },
        transformType
      );
      let randomCounter = context.randomCounter;
      const { fn } = usePikachuStore.getState();
      if (gameType == 'randomBoard') {
        if (context.randomCounter >= 5) {
          const randomRoundListIndex = getRandom(roundList.length);
          fn.setMetadata({ randomRoundListIndex });
          randomCounter = 1;
          PikachuService.format(
            { board: cloneBoard, numberOfRows, numberOfColumns },
            roundList[randomRoundListIndex]
          );
        } else randomCounter += 1;
      }
      if (context.hintRunning) {
        const latestIndex = path.length - 1;
        const firstCheck =
          isPositionEqual(position, path[0]) || isPositionEqual(position, path[latestIndex]);
        const secondCheck =
          isPositionEqual(context.position, path[0]) ||
          isPositionEqual(context.position, path[latestIndex]);
        if (firstCheck && secondCheck) send({ type: PikachuMachineEvent.SHOW_HINT });
      }
      const possiblePath = PikachuService.findPathWithoutTarget({
        board: cloneBoard,
        numberOfRows,
        numberOfColumns,
        numberOfLines,
      });
      soundtrack.play({ type: TSound.MOVE });
      if (possiblePath)
        sleep(150).then(() => {
          fn.movePath(cloneBoard, possiblePath);
        });
      else if (possiblePath === null) {
        toast.warning('Out of move, please change board');
        sleep(150).then(() => {
          fn.moveChangeBoard(cloneBoard);
        });
        send({ type: PikachuMachineEvent.RESET_SELECTION });
        send({ type: PikachuMachineEvent.OUT_OF_MOVE });
      } else {
        sleep(200).then(() => {
          if (gameType != 'randomBoard')
            send({ type: PikachuMachineEvent.CREATE, mode: 'nextRound' });
          else {
            toast.success('You win!!!');
            send({ type: PikachuMachineEvent.WIN });
          }
        });
      }
      return { randomCounter, selectedPath: path };
    } else {
      soundtrack.play({ type: TSound.ERROR });
      return { position: undefined, selectedPath: [] };
    }
  }
  return {};
}
