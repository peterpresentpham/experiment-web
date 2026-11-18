import { TCaroWinMode, TTurn } from 'src/types/caro.type';
import { transformIndex } from '../caro-machine/experience';

/**
 * Network input, one plane per feature, from the point of view of the side to move:
 * own stones, opponent stones, a constant plane (lets the net see the board edge through the
 * zero padding) and the win rule.
 */
export const INPUT_PLANES = 4;

/** Recent games kept for replay during in-browser fine-tuning; small enough for localStorage. */
export const MAX_REPLAY_GAMES = 40;

/** A finished or ongoing game in the order the moves were played. Turn 0 always moves first. */
export type THellGame = {
  size: number;
  winMode: TCaroWinMode;
  moves: Array<number>;
  /** 0 or 1 when someone won, -1 for a draw or an unfinished game. */
  winner: number;
  /**
   * Search visit distributions per ply, as sparse [cell, probability] pairs. Present for
   * self-play games; null where the move should not be learned as a policy target.
   */
  policies?: Array<Array<[number, number]> | null>;
};

/** One training example; plane and policy arrays are laid out row-major, HWC for planes. */
export type THellSample = {
  size: number;
  planes: Float32Array;
  /** 1 for empty cells, the only legal targets. */
  legal: Float32Array;
  policy: Float32Array;
  /** 0 when the sample only teaches the value head. */
  policyWeight: number;
  /** Game result for the side to move: 1 win, -1 loss, 0 draw. */
  value: number;
};

export function turnAt(ply: number): TTurn {
  return (ply % 2) as TTurn;
}

/** Writes the planes for `cells` (0 empty, 1 and 2 stones) with `side` to move. */
export function encodePlanes(
  cells: ArrayLike<number>,
  size: number,
  winMode: TCaroWinMode,
  side: number,
  out = new Float32Array(size * size * INPUT_PLANES)
) {
  const rule = winMode == 'blockOpponent' ? 1 : 0;
  for (let cell = 0; cell < size * size; cell++) {
    const owner = cells[cell];
    const base = cell * INPUT_PLANES;
    out[base] = owner == side ? 1 : 0;
    out[base + 1] = owner != 0 && owner != side ? 1 : 0;
    out[base + 2] = 1;
    out[base + 3] = rule;
  }
  return out;
}

/**
 * Turns a game into samples, one per ply, under the given board symmetry (0..7).
 * - learnPolicy: which plies teach the policy head when the game carries no search policies.
 * - lessons: better moves found after the game, by ply; they replace the played move as target.
 */
export function samplesFromGame(
  game: THellGame,
  options: {
    transform?: number;
    learnPolicy?: 'all' | 'winner';
    lessons?: Map<number, number>;
  } = {}
): Array<THellSample> {
  const { size, winMode, moves, winner, policies } = game;
  const { transform = 0, learnPolicy = 'all', lessons } = options;
  const area = size * size;
  const map = (cell: number) => (transform == 0 ? cell : transformIndex(transform, cell, size));
  const cells = new Int8Array(area);
  const samples: Array<THellSample> = [];

  for (let ply = 0; ply < moves.length; ply++) {
    const turn = turnAt(ply);
    const side = turn + 1;
    const policy = new Float32Array(area);
    let policyWeight = 0;

    const lesson = lessons?.get(ply);
    const searched = policies?.[ply];
    if (lesson != undefined) {
      policy[map(lesson)] = 1;
      policyWeight = 1;
    } else if (searched) {
      for (const [cell, probability] of searched) policy[map(cell)] = probability;
      policyWeight = 1;
    } else if (!policies && (learnPolicy == 'all' || turn == winner)) {
      policy[map(moves[ply])] = 1;
      policyWeight = 1;
    }

    const legal = new Float32Array(area);
    for (let cell = 0; cell < area; cell++) legal[cell] = cells[cell] == 0 ? 1 : 0;
    samples.push({
      size,
      planes: encodePlanes(cells, size, winMode, side),
      legal,
      policy,
      policyWeight,
      value: winner < 0 ? 0 : winner == turn ? 1 : -1,
    });
    cells[map(moves[ply])] = side;
  }
  return samples;
}

/**
 * The sample for a single ply, without building the rest of the game. Used by the offline
 * trainer, which draws random positions from thousands of games.
 */
export function sampleAtPly(game: THellGame, ply: number, transform = 0): THellSample {
  const { size, winMode, moves, winner, policies } = game;
  const area = size * size;
  const map = (cell: number) => (transform == 0 ? cell : transformIndex(transform, cell, size));
  const cells = new Int8Array(area);
  for (let index = 0; index < ply; index++) cells[map(moves[index])] = turnAt(index) + 1;

  const turn = turnAt(ply);
  const policy = new Float32Array(area);
  let policyWeight = 0;
  const searched = policies ? policies[ply] : [[moves[ply], 1] as [number, number]];
  if (searched) {
    for (const [cell, probability] of searched) policy[map(cell)] = probability;
    policyWeight = 1;
  }

  const legal = new Float32Array(area);
  for (let cell = 0; cell < area; cell++) legal[cell] = cells[cell] == 0 ? 1 : 0;
  return {
    size,
    planes: encodePlanes(cells, size, winMode, turn + 1),
    legal,
    policy,
    policyWeight,
    value: winner < 0 ? 0 : winner == turn ? 1 : -1,
  };
}
