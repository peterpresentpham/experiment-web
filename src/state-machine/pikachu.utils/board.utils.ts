import { toast } from 'sonner';
import { getRandom, isPositionEqual } from 'src/services';
import PikachuService from 'src/services/pikachu';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPosition } from 'src/types/global';
import { TMatchResult, TPikachuContext } from 'src/types/pikachu.type';

export type TMoveResolution =
  | { type: 'ignore' }
  | { type: 'select' }
  | { type: 'deselect' }
  | { type: 'invalid' }
  | { type: 'match'; path: Array<TPosition> };

export function changeBoard() {
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
}

/**
 * Decides what a click on `position` means. Cheap and side-effect free: only the single
 * `findPath` call runs here, so the path can be drawn right away.
 */
export function resolveMove(context: TPikachuContext, position: TPosition): TMoveResolution {
  const { board, metadata } = usePikachuStore.getState();
  if (board[position[0]][position[1]] == 0) return { type: 'ignore' };
  if (context.position == undefined) return { type: 'select' };
  if (isPositionEqual(context.position, position)) return { type: 'deselect' };

  const path = PikachuService.findPath({
    board,
    sourcePiece: context.position,
    targetPiece: position,
    numberOfRows: metadata.numberOfRows,
    numberOfColumns: metadata.numberOfColumns,
    numberOfLines: metadata.numberOfLines,
  });
  return path ? { type: 'match', path } : { type: 'invalid' };
}

/**
 * Removes the matched pair from a copy of the board and works out what happens next.
 * Pure with respect to the store: nothing is written until `commitMatchResult`.
 */
export function computeMatchResult(context: TPikachuContext): TMatchResult | undefined {
  if (!context.matchedPair) return undefined;
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
  const nextBoard = board.map((row) => row.slice());

  const transformType =
    gameType != 'randomBoard' ? roundList[round - 1] : roundList[randomRoundListIndex];
  PikachuService.transform(
    { board: nextBoard, moves: context.matchedPair, numberOfRows, numberOfColumns },
    transformType
  );

  let randomCounter = context.randomCounter;
  let nextRandomIndex: number | undefined;
  if (gameType == 'randomBoard') {
    if (randomCounter >= 5) {
      nextRandomIndex = getRandom(roundList.length);
      randomCounter = 1;
      PikachuService.format(
        { board: nextBoard, numberOfRows, numberOfColumns },
        roundList[nextRandomIndex]
      );
    } else randomCounter += 1;
  }

  const possiblePath = PikachuService.findPathWithoutTarget({
    board: nextBoard,
    numberOfRows,
    numberOfColumns,
    numberOfLines,
  });
  const outcome = possiblePath ? 'continue' : possiblePath === null ? 'outOfMove' : 'cleared';
  return {
    board: nextBoard,
    suggestion: possiblePath || undefined,
    outcome,
    randomCounter,
    randomRoundListIndex: nextRandomIndex,
  };
}

export function commitMatchResult(result: TMatchResult | undefined) {
  if (!result) return;
  const { fn } = usePikachuStore.getState();
  if (result.randomRoundListIndex != undefined)
    fn.setMetadata({ randomRoundListIndex: result.randomRoundListIndex });
  if (result.outcome == 'continue' && result.suggestion)
    fn.movePath(result.board, result.suggestion);
  else if (result.outcome == 'outOfMove') fn.moveChangeBoard(result.board);
  else fn.move(result.board);
}

export function notifyOutOfMove() {
  toast.warning('Out of move, please change board');
}

export function notifyWin() {
  toast.success('You win!!!');
}
