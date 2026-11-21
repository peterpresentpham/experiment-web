import { TCaroWinMode } from 'src/types/caro.type';
import { TCaroMachineRequest } from '../caro-machine';
import { MachineBoard } from '../caro-machine/board';
import { lookupExperience, TExperienceBook, toStone } from '../caro-machine/experience';
import { getRapfi } from 'src/services/caro-rapfi/browser';
import { getOpeningBook, getTengen } from './browser';
import { findBookMove } from './opening-book';

/**
 * The hell level's first choice: lessons from earlier losses, then the opening book, then the
 * engine, which searches around the moves that lost here before: Rapfi (stronger in both rules),
 * or Tengen when Rapfi cannot run. Returns null when no engine is available or every move it
 * could play lost before, so the caller falls back to the network.
 */
export async function findTengenMove(
  request: Omit<TCaroMachineRequest, 'level'>,
  book: TExperienceBook
) {
  const { steps, size, winMode, turn } = request;
  const board = new MachineBoard(size, winMode);
  for (const [location, owner] of Object.entries(steps))
    board.place(Number(location), toStone(owner));
  if (board.stones.length >= board.area) return -1;

  const learned = lookupExperience(book, board, toStone(turn));
  if (learned?.best != undefined && board.cells[learned.best] == 0) return learned.best;

  // A book move that lost here before is skipped, like any other.
  const bookMove = findBookMove(await getOpeningBook(), request);
  if (bookMove != undefined && !learned?.avoid.has(bookMove)) return bookMove;

  const rapfi = await getRapfi();
  if (rapfi) {
    try {
      const move = await rapfi.think({ steps, size, winMode, turn, exclude: learned?.avoid });
      if (board.cells[move] == 0 && !learned?.avoid.has(move)) return move;
    } catch (error) {
      console.error('[caro] Rapfi failed on this position', error);
    }
  }

  const engine = await getTengen();
  if (!engine) return null;
  let move: number;
  try {
    move = engine.think({ steps, size, winMode, turn, exclude: learned?.avoid });
  } catch (error) {
    console.error('[caro] Tengen failed on this position', error);
    return null;
  }
  if (move < 0 || board.cells[move] != 0 || learned?.avoid.has(move)) return null;
  return move;
}

/** Starts loading the engine (and the blocked-ends opening book) before the first move. */
export async function warmUpTengen(winMode: TCaroWinMode) {
  if (winMode == 'blockOpponent') void getOpeningBook();
  if ((await getRapfi()) != null) return true;
  return (await getTengen()) != null;
}
