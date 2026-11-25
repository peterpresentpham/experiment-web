import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';
import { pikachuRoundTransformations } from 'src/configs/pikachu.constance';
import { PATH_DISPLAY_MS, pikachuMachine } from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPosition } from 'src/types/global';
import {
  PikachuMachineEvent,
  PikachuMachineState,
  TPikachuTransform,
} from 'src/types/pikachu.type';
import { withBorder } from '../services/pikachu-helpers';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), warning: vi.fn() } }));
vi.mock('src/services/soundtrack', () => ({ soundtrack: { play: vi.fn() } }));

const ROWS = 4;
const COLUMNS = 6;

function loadBoard(
  raw: Array<Array<number>>,
  metadata: Partial<{
    gameType: 'normal' | 'randomBoard';
    round: number;
    roundList: Array<TPikachuTransform>;
    randomRoundListIndex: number;
  }> = {}
) {
  usePikachuStore.setState({
    board: withBorder(raw),
    suggestion: [],
    metadata: {
      ...usePikachuStore.getState().metadata,
      numberOfRows: ROWS,
      numberOfColumns: COLUMNS,
      numberOfLines: 2,
      imgType: 'magic',
      gameType: 'normal',
      round: 1,
      roundList: pikachuRoundTransformations,
      randomRoundListIndex: 0,
      ...metadata,
    },
  });
  const actor = createActor(pikachuMachine).start();
  actor.send({ type: PikachuMachineEvent.LOAD_SAVE_GAME });
  return actor;
}

function match(actor: ReturnType<typeof loadBoard>, first: TPosition, second: TPosition) {
  actor.send({ type: PikachuMachineEvent.MOVE, position: first });
  actor.send({ type: PikachuMachineEvent.MOVE, position: second });
  vi.advanceTimersByTime(PATH_DISPLAY_MS);
}

// One matching pair in the top-left corner, everything else empty.
const LAST_PAIR = [
  [1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

describe('pikachu game flow', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts the next round with a full board after clearing one', () => {
    const actor = loadBoard(LAST_PAIR, { round: 2 });
    match(actor, [1, 1], [1, 2]);

    expect(actor.getSnapshot().value).toBe(PikachuMachineState.PLAYING);
    const { board, metadata, suggestion } = usePikachuStore.getState();
    expect(metadata.round).toBe(3);
    expect(board.slice(1, -1).every((row) => row.slice(1, -1).every((value) => value > 0))).toBe(
      true
    );
    expect(suggestion.length).toBeGreaterThan(1);
  });

  it('wraps back to round one after the last round', () => {
    const actor = loadBoard(LAST_PAIR, { round: pikachuRoundTransformations.length });
    match(actor, [1, 1], [1, 2]);
    expect(usePikachuStore.getState().metadata.round).toBe(1);
  });

  it('wraps back when the stored round is past a shortened round list', () => {
    const actor = loadBoard(LAST_PAIR, { round: 9, roundList: ['normal', 'fallDown'] });
    match(actor, [1, 1], [1, 2]);
    expect(usePikachuStore.getState().metadata.round).toBe(1);
  });

  it('ends the game when random mode is cleared', () => {
    const actor = loadBoard(LAST_PAIR, { gameType: 'randomBoard', randomRoundListIndex: 3 });
    match(actor, [1, 1], [1, 2]);
    expect(actor.getSnapshot().value).toBe(PikachuMachineState.INITIAL);
  });

  it('plays with an empty round list instead of crashing', () => {
    const actor = loadBoard(
      [
        [1, 1, 2, 2, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ],
      { roundList: [] }
    );
    match(actor, [1, 1], [1, 2]);
    expect(actor.getSnapshot().value).toBe(PikachuMachineState.PLAYING);
    expect(usePikachuStore.getState().board[1].slice(1, 5)).toEqual([0, 0, 2, 2]);
  });

  it('reshuffles automatically when no move is left', () => {
    // After the 1s go, the 2s and 3s block each other on the diagonals.
    const actor = loadBoard([
      [1, 1, 0, 0, 0, 0],
      [0, 0, 2, 3, 0, 0],
      [0, 0, 3, 2, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ]);
    match(actor, [1, 1], [1, 2]);
    expect(actor.getSnapshot().value).toBe(PikachuMachineState.PLAYING);
    const { board, suggestion } = usePikachuStore.getState();
    const [first, last] = [suggestion[0], suggestion[suggestion.length - 1]];
    expect(board[first[0]][first[1]]).toBe(board[last[0]][last[1]]);
  });

  it('applies the round transform after a match', () => {
    // Round 2 is fallDown: the 3 above the removed pair drops into the gap.
    const actor = loadBoard(
      [
        [0, 3, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [0, 2, 2, 0, 0, 0],
      ],
      { round: 2 }
    );
    match(actor, [2, 2], [3, 2]);
    const { board } = usePikachuStore.getState();
    expect(board.slice(1, 5).map((row) => row[2])).toEqual([0, 0, 3, 2]);
  });
});
