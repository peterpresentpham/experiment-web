import { TCaroWinMode, TTurn } from 'src/types/caro.type';
import { MachineBoard, TStone } from './board';
import { experienceFrame } from './experience-key';
import { isLosingScore, TAnalysis } from './search';

/**
 * What the machine learned about one position, in canonical coordinates.
 * - avoid: moves it lost with here, never played again.
 * - best: the move a deep post-game analysis found instead; played straight away.
 */
export type TExperienceEntry = { avoid: Array<number>; best?: number };

/** Keyed by `experienceFrame`; insertion order doubles as recency for trimming. */
export type TExperienceBook = Map<string, TExperienceEntry>;

export type TGameRecord = {
  size: number;
  winMode: TCaroWinMode;
  /** The player the machine played for. */
  machineTurn: TTurn;
  /** Every move of the game in order. */
  moves: Array<{ location: number; turn: TTurn }>;
};

export type TLearnOptions = {
  /**
   * Time (from `performance.now()`) after which no further position is examined. Positions that
   * are already lost are proven in milliseconds, so the walk back can go far within the budget.
   */
  deadline?: number;
  /** Deep analysis of a position, skipping the excluded moves. */
  analyze: (board: MachineBoard, side: TStone, exclude: ReadonlySet<number>) => TAnalysis;
};

export type TCloseCallOptions = TLearnOptions & {
  /** Whether `attacker`, who is to move, has a proven forced win on this board. */
  hasForcedWin: (board: MachineBoard, attacker: TStone) => boolean;
};

export { positionKey, transformIndex } from './experience-key';

export const MAX_EXPERIENCE_ENTRIES = 3_000;

export function toStone(turn: TTurn): TStone {
  return turn == 0 ? 1 : 2;
}

/** Real-board view of what the book knows about the current position, if anything. */
export function lookupExperience(book: TExperienceBook, board: MachineBoard, side: TStone) {
  if (book.size == 0) return undefined;
  const { key, toReal } = experienceFrame(board.cells, board.size, board.winMode, side);
  const entry = book.get(key);
  if (!entry) return undefined;
  // A lesson learned elsewhere on the board may name a cell this board does not have.
  const best = entry.best == undefined ? -1 : toReal(entry.best);
  return {
    avoid: new Set(entry.avoid.map(toReal).filter((index) => index >= 0)),
    best: best >= 0 ? best : undefined,
  };
}

/**
 * Post-mortem of a game the machine lost. Walks back through the machine's own moves: each one
 * is ruled out in turn, and a deep analysis looks for a replacement. A position where every
 * replacement still loses was already lost, so the real mistake came earlier and the walk goes
 * on. It stops at the first position with a replacement that is not proven to lose: that is the
 * mistake, and the lesson for it is returned.
 *
 * Returns the entries to add or replace (empty when no mistake was found within the budget).
 */
export function learnFromLoss(
  record: TGameRecord,
  book: TExperienceBook,
  options: TLearnOptions
): Array<[string, TExperienceEntry]> {
  const { size, winMode, machineTurn, moves } = record;
  const side = toStone(machineTurn);

  const decisions: Array<number> = [];
  moves.forEach((move, index) => {
    if (move.turn == machineTurn) decisions.push(index);
  });

  for (const decision of decisions.reverse()) {
    if (options.deadline != undefined && performance.now() > options.deadline) break;
    const board = new MachineBoard(size, winMode);
    for (const move of moves.slice(0, decision)) board.place(move.location, toStone(move.turn));

    const { key, toCanonical, toReal } = experienceFrame(board.cells, size, winMode, side);
    const known = book.get(key);
    const avoid = new Set((known?.avoid ?? []).map(toReal).filter((index) => index >= 0));
    avoid.add(moves[decision].location);

    const result = options.analyze(board, side, avoid);
    if (result.move >= 0 && !isLosingScore(result.score)) {
      const entry: TExperienceEntry = {
        avoid: [...avoid].map(toCanonical),
        best: toCanonical(result.move),
      };
      return [[key, entry]];
    }
  }

  return [];
}

/**
 * Post-mortem of a game the machine did not lose. After each machine move, checks whether the
 * opponent had a forced win and missed it: that move was a mistake that simply went unpunished.
 * Each such close call is then treated like a loss that ended right there.
 *
 * Returns the entries to add or replace (empty when there was no close call).
 */
export function learnFromCloseCalls(
  record: TGameRecord,
  book: TExperienceBook,
  options: TCloseCallOptions
): Array<[string, TExperienceEntry]> {
  const { size, winMode, machineTurn, moves } = record;
  const opponent = toStone((1 - machineTurn) as TTurn);
  // Lessons are merged as they come, so a later close call builds on an earlier one.
  const working: TExperienceBook = new Map(book);
  const changed = new Map<string, TExperienceEntry>();

  const board = new MachineBoard(size, winMode);
  for (let index = 0; index < moves.length; index++) {
    const move = moves[index];
    board.place(move.location, toStone(move.turn));
    // The last move ends the game, so there is nothing left for the opponent to miss.
    if (move.turn != machineTurn || index == moves.length - 1) continue;
    if (options.deadline != undefined && performance.now() > options.deadline) break;
    if (!options.hasForcedWin(board, opponent)) continue;

    const lessons = learnFromLoss(
      { ...record, moves: moves.slice(0, index + 1) },
      working,
      options
    );
    mergeExperience(working, lessons);
    for (const [key, entry] of lessons) changed.set(key, entry);
  }

  return [...changed];
}

/** Applies learned entries, newest last, and drops the oldest beyond the size limit. */
export function mergeExperience(book: TExperienceBook, entries: Array<[string, TExperienceEntry]>) {
  for (const [key, entry] of entries) {
    book.delete(key);
    book.set(key, entry);
  }
  while (book.size > MAX_EXPERIENCE_ENTRIES) {
    const oldest = book.keys().next().value;
    if (oldest == undefined) break;
    book.delete(oldest);
  }
  return book;
}

/**
 * Lessons saved under the old whole-board keys, moved to the keys `experienceFrame` gives now,
 * so a lesson learned away from the edges also covers the same shape elsewhere. Two lessons that
 * now share a key are merged: the moves to avoid of both, the later best move.
 */
export function rekeyExperience(entries: Array<[string, TExperienceEntry]>) {
  const book: TExperienceBook = new Map();
  for (const [key, entry] of entries) {
    const match = /^(\d+)([bn])([12]):([012]+)$/.exec(key);
    const size = Number(match?.[1]);
    let moved: [string, TExperienceEntry] = [key, entry];
    if (match && match[4].length == size * size) {
      // The key spells out its own canonical board, the frame the entry's cells are in.
      const cells = [...match[4]].map(Number);
      const winMode: TCaroWinMode = match[2] == 'b' ? 'blockOpponent' : 'non-blockOpponent';
      const frame = experienceFrame(cells, size, winMode, Number(match[3]) as TStone);
      moved = [
        frame.key,
        {
          avoid: entry.avoid.map(frame.toCanonical),
          ...(entry.best != undefined && { best: frame.toCanonical(entry.best) }),
        },
      ];
    }
    const known = book.get(moved[0]);
    book.set(
      moved[0],
      known
        ? {
            avoid: [...new Set([...known.avoid, ...moved[1].avoid])],
            ...((moved[1].best ?? known.best) != undefined && {
              best: moved[1].best ?? known.best,
            }),
          }
        : moved[1]
    );
  }
  return [...book];
}
