import { TCaroMachineRequest } from '../caro-machine';
import { MachineBoard } from '../caro-machine/board';
import { lookupExperience, TExperienceBook, toStone } from '../caro-machine/experience';
import { getTengen } from './browser';

/**
 * The hell level's first choice: lessons from earlier losses, then Tengen. Returns null when the
 * engine is unavailable or picks a move the book says lost before, so the caller falls back to
 * the network, which can search around those moves.
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

  const engine = await getTengen();
  if (!engine) return null;
  let move: number;
  try {
    move = engine.think({ steps, size, winMode, turn });
  } catch (error) {
    console.error('[caro] Tengen failed on this position', error);
    return null;
  }
  if (move < 0 || board.cells[move] != 0 || learned?.avoid.has(move)) return null;
  return move;
}

/** Starts loading the engine (and measuring this device) before the first move. */
export async function warmUpTengen() {
  return (await getTengen()) != null;
}
