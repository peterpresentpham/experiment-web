import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';
import { PATH_DISPLAY_MS, pikachuMachine } from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPosition } from 'src/types/global';
import { PikachuMachineEvent, PikachuMachineState } from 'src/types/pikachu.type';

function startGame() {
  const actor = createActor(pikachuMachine).start();
  actor.send({ type: PikachuMachineEvent.CREATE, mode: 'newGame' });
  return actor;
}

// The path suggested by the store is always a connectable pair of identical pieces.
function getMatchingPair(): [TPosition, TPosition] {
  const { suggestion } = usePikachuStore.getState();
  return [suggestion[0], suggestion[suggestion.length - 1]];
}

describe('pikachu state machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    usePikachuStore.setState({
      board: [],
      suggestion: [],
      metadata: { ...usePikachuStore.getState().metadata, gameType: 'normal', round: 1 },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the path immediately and removes the pair after the display delay', () => {
    const actor = startGame();
    const [first, second] = getMatchingPair();

    actor.send({ type: PikachuMachineEvent.MOVE, position: first });
    expect(actor.getSnapshot().context.position).toEqual(first);

    actor.send({ type: PikachuMachineEvent.MOVE, position: second });
    let snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe(PikachuMachineState.MATCHED);
    expect(snapshot.context.selectedPath.length).toBeGreaterThan(1);
    // The board is untouched until the path has been shown.
    expect(usePikachuStore.getState().board[first[0]][first[1]]).toBeGreaterThan(0);

    vi.advanceTimersByTime(PATH_DISPLAY_MS);
    snapshot = actor.getSnapshot();
    expect(snapshot.value).not.toBe(PikachuMachineState.MATCHED);
    expect(snapshot.context.selectedPath).toEqual([]);
    expect(snapshot.context.position).toBeUndefined();
    expect(usePikachuStore.getState().board[first[0]][first[1]]).toBe(0);
    expect(usePikachuStore.getState().board[second[0]][second[1]]).toBe(0);
  });

  it('ignores input while the path is shown', () => {
    const actor = startGame();
    const [first, second] = getMatchingPair();
    actor.send({ type: PikachuMachineEvent.MOVE, position: first });
    actor.send({ type: PikachuMachineEvent.MOVE, position: second });
    const pathBefore = actor.getSnapshot().context.selectedPath;

    actor.send({ type: PikachuMachineEvent.MOVE, position: [1, 1] });
    expect(actor.getSnapshot().value).toBe(PikachuMachineState.MATCHED);
    expect(actor.getSnapshot().context.selectedPath).toBe(pathBefore);
  });

  it('cancels a pending match when a new game starts', () => {
    const actor = startGame();
    const [first, second] = getMatchingPair();
    actor.send({ type: PikachuMachineEvent.MOVE, position: first });
    actor.send({ type: PikachuMachineEvent.MOVE, position: second });

    actor.send({ type: PikachuMachineEvent.CREATE, mode: 'newGame' });
    const board = usePikachuStore.getState().board;
    vi.advanceTimersByTime(PATH_DISPLAY_MS * 2);

    expect(actor.getSnapshot().value).toBe(PikachuMachineState.PLAYING);
    expect(actor.getSnapshot().context.selectedPath).toEqual([]);
    expect(usePikachuStore.getState().board).toBe(board);
  });

  it('toggles and deselects a piece', () => {
    const actor = startGame();
    const [first] = getMatchingPair();

    actor.send({ type: PikachuMachineEvent.MOVE, position: first });
    actor.send({ type: PikachuMachineEvent.MOVE, position: first });
    expect(actor.getSnapshot().context.position).toBeUndefined();
    expect(actor.getSnapshot().value).toBe(PikachuMachineState.PLAYING);
  });

  it('clears the selection on an invalid pair', () => {
    const actor = startGame();
    const board = usePikachuStore.getState().board;
    const [first] = getMatchingPair();
    const other = (() => {
      for (let r = 1; r < board.length - 1; r++)
        for (let c = 1; c < board[r].length - 1; c++)
          if (board[r][c] > 0 && board[r][c] !== board[first[0]][first[1]])
            return [r, c] as TPosition;
      throw new Error('no different piece');
    })();

    actor.send({ type: PikachuMachineEvent.MOVE, position: first });
    actor.send({ type: PikachuMachineEvent.MOVE, position: other });
    expect(actor.getSnapshot().context.position).toBeUndefined();
    expect(actor.getSnapshot().context.selectedPath).toEqual([]);
    expect(actor.getSnapshot().value).toBe(PikachuMachineState.PLAYING);
  });
});
