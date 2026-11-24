import { checkWin } from 'src/services/caro.utils';
import { findMachineMove, learnFromGame } from 'src/services/caro-machine';
import { MachineBoard } from 'src/services/caro-machine/board';
import {
  learnFromCloseCalls,
  learnFromLoss,
  lookupExperience,
  mergeExperience,
  positionKey,
  rekeyExperience,
  TExperienceBook,
  TExperienceEntry,
  TGameRecord,
  toStone,
  transformIndex,
} from 'src/services/caro-machine/experience';
import { experienceFrame } from 'src/services/caro-machine/experience-key';
import { analyzePosition } from 'src/services/caro-machine/search';
import { findThreatWin } from 'src/services/caro-machine/threat';
import { TCaroMachineLevel, TCaroSizeBoard, TTurn } from 'src/types/caro.type';
import { describe, expect, it } from 'vitest';

function at(size: number, row: number, column: number) {
  return row * size + column;
}

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2 ** 31;
    return state / 2 ** 31;
  };
}

function boardOf(size: number, moves: TGameRecord['moves']) {
  const board = new MachineBoard(size, 'blockOpponent');
  for (const move of moves) board.place(move.location, toStone(move.turn));
  return board;
}

describe('caro machine experience: symmetry', () => {
  const size = 10;
  const moves: TGameRecord['moves'] = [
    { location: at(size, 4, 4), turn: 0 },
    { location: at(size, 4, 5), turn: 1 },
    { location: at(size, 5, 6), turn: 0 },
  ];

  it('gives all eight symmetric versions of a position the same key', () => {
    const keys = new Set<string>();
    for (let transform = 0; transform < 8; transform++) {
      const board = boardOf(
        size,
        moves.map((move) => ({ ...move, location: transformIndex(transform, move.location, size) }))
      );
      keys.add(positionKey(board.cells, size, 'blockOpponent', 2).key);
    }
    expect(keys.size).toBe(1);
  });

  it('keeps the side to move and the rules in the key', () => {
    const board = boardOf(size, moves);
    const key = (side: 1 | 2, winMode: 'blockOpponent' | 'non-blockOpponent') =>
      positionKey(board.cells, size, winMode, side).key;
    expect(key(1, 'blockOpponent')).not.toBe(key(2, 'blockOpponent'));
    expect(key(2, 'blockOpponent')).not.toBe(key(2, 'non-blockOpponent'));
  });

  it('maps a learned move back onto a rotated or mirrored board', () => {
    const lesson: TGameRecord = { size, winMode: 'blockOpponent', machineTurn: 1, moves };
    const avoided = at(size, 3, 3);
    const best = at(size, 6, 7);
    const book: TExperienceBook = new Map(
      learnFromLoss({ ...lesson, moves: [...moves, { location: avoided, turn: 1 }] }, new Map(), {
        analyze: () => ({ move: best, score: 10 }),
      })
    );

    for (let transform = 0; transform < 8; transform++) {
      const turned = (location: number) => transformIndex(transform, location, size);
      const board = boardOf(
        size,
        moves.map((move) => ({ ...move, location: turned(move.location) }))
      );
      const learned = lookupExperience(book, board, 2);
      expect(learned?.best).toBe(turned(best));
      expect(learned?.avoid).toEqual(new Set([turned(avoided)]));
    }
  });
});

describe('caro machine experience: shapes away from the edges', () => {
  // A position in the middle of the board: what a player shifted by a cell to replay a win.
  const shape: TGameRecord['moves'] = [
    { location: at(20, 10, 10), turn: 0 },
    { location: at(20, 9, 9), turn: 1 },
    { location: at(20, 9, 11), turn: 0 },
  ];
  const shifted = (moves: TGameRecord['moves'], size: number, dr: number, dc: number) =>
    moves.map((move) => {
      const [row, column] = [Math.floor(move.location / 20) + dr, (move.location % 20) + dc];
      return { ...move, location: at(size, row, column) };
    });

  it('applies a lesson to the same shape elsewhere on the board and on another size', () => {
    const avoided = at(20, 11, 9);
    const best = at(20, 8, 12);
    const book: TExperienceBook = new Map(
      learnFromLoss(
        {
          size: 20,
          winMode: 'blockOpponent',
          machineTurn: 1,
          moves: [...shape, { location: avoided, turn: 1 }],
        },
        new Map(),
        { analyze: () => ({ move: best, score: 10 }) }
      )
    );
    for (const [size, dr, dc] of [
      [20, 0, -1],
      [20, 3, 2],
      [15, -3, -4],
    ]) {
      const learned = lookupExperience(book, boardOf(size, shifted(shape, size, dr, dc)), 2);
      expect(learned?.best).toBe(at(size, 8 + dr, 12 + dc));
      expect(learned?.avoid).toEqual(new Set([at(size, 11 + dr, 9 + dc)]));
    }
  });

  it('keys a position near an edge by the whole board', () => {
    const nearEdge = boardOf(20, shifted(shape, 20, -8, 0));
    const middle = boardOf(20, shape);
    const frame = (board: MachineBoard) => experienceFrame(board.cells, 20, 'blockOpponent', 2);
    expect(frame(nearEdge).key).toBe(positionKey(nearEdge.cells, 20, 'blockOpponent', 2).key);
    expect(frame(middle).key).not.toBe(positionKey(middle.cells, 20, 'blockOpponent', 2).key);
  });

  it('drops a learned cell that falls off a smaller board', () => {
    const frame = experienceFrame(boardOf(20, shape).cells, 20, 'blockOpponent', 2);
    const small = boardOf(15, shifted(shape, 15, -6, -6));
    const smallFrame = experienceFrame(small.cells, 15, 'blockOpponent', 2);
    expect(smallFrame.key).toBe(frame.key);
    expect(smallFrame.toReal(frame.toCanonical(at(20, 1, 1)))).toBe(-1);
  });
});

describe('caro machine experience: lessons saved under whole-board keys', () => {
  it('moves them to shape keys away from the edges and leaves the rest', () => {
    const middle = boardOf(20, [
      { location: at(20, 10, 10), turn: 0 },
      { location: at(20, 9, 9), turn: 1 },
      { location: at(20, 9, 11), turn: 0 },
    ]);
    const edge = boardOf(20, [{ location: at(20, 0, 5), turn: 0 }]);
    // Old entries: whole-board keys, cells in the key's own (canonical) board.
    const old = (board: MachineBoard, avoid: number, best: number) => {
      const { key, transform } = positionKey(board.cells, 20, 'blockOpponent', 2);
      const turn = (index: number) => transformIndex(transform, index, 20);
      return [key, { avoid: [turn(avoid)], best: turn(best) }] as [string, TExperienceEntry];
    };
    const entries = [
      old(middle, at(20, 11, 9), at(20, 8, 12)),
      old(edge, at(20, 1, 5), at(20, 1, 6)),
    ];

    const book: TExperienceBook = new Map(rekeyExperience(entries));
    expect(book.has(entries[0][0])).toBe(false);
    expect(book.get(entries[1][0])).toEqual(entries[1][1]);
    const learned = lookupExperience(book, middle, 2);
    expect(learned?.avoid).toEqual(new Set([at(20, 11, 9)]));
    expect(learned?.best).toBe(at(20, 8, 12));
  });
});

describe('caro machine experience: post-mortem', () => {
  const size = 10;
  // Machine (turn 1) made three decisions; the human won afterwards.
  const record: TGameRecord = {
    size,
    winMode: 'blockOpponent',
    machineTurn: 1,
    moves: [
      { location: at(size, 4, 4), turn: 0 },
      { location: at(size, 0, 0), turn: 1 },
      { location: at(size, 4, 5), turn: 0 },
      { location: at(size, 0, 1), turn: 1 },
      { location: at(size, 4, 6), turn: 0 },
      { location: at(size, 0, 2), turn: 1 },
      { location: at(size, 4, 7), turn: 0 },
    ],
  };

  it('blames the last machine move first and stops once a fix is found', () => {
    const seen: Array<Array<number>> = [];
    const changed = learnFromLoss(record, new Map(), {
      analyze: (_board, _side, exclude) => {
        seen.push([...exclude]);
        return { move: at(size, 4, 3), score: 0 };
      },
    });
    expect(seen).toEqual([[at(size, 0, 2)]]);
    expect(changed).toHaveLength(1);
  });

  it('learns nothing when every position it can examine is already lost', () => {
    const lost = () => ({ move: 0, score: -1_000_000_000 });
    expect(learnFromLoss(record, new Map(), { analyze: lost })).toEqual([]);
  });

  it('stops walking back once the time budget is spent', () => {
    let calls = 0;
    const changed = learnFromLoss(record, new Map(), {
      deadline: performance.now() - 1,
      analyze: () => {
        calls++;
        return { move: 0, score: 0 };
      },
    });
    expect(calls).toBe(0);
    expect(changed).toEqual([]);
  });

  it('walks back to earlier moves while every alternative still loses', () => {
    const seen: Array<Array<number>> = [];
    const changed = learnFromLoss(record, new Map(), {
      analyze: (_board, _side, exclude) => {
        seen.push([...exclude]);
        // The last two positions are lost whatever the machine does.
        return seen.length < 3 ? { move: 0, score: -1_000_000_000 } : { move: 0, score: 5 };
      },
    });
    expect(seen).toEqual([[at(size, 0, 2)], [at(size, 0, 1)], [at(size, 0, 0)]]);
    // Only the real mistake is stored: the first machine move, with its replacement.
    const first = boardOf(size, record.moves.slice(0, 1));
    expect(changed).toHaveLength(1);
    expect(changed[0][0]).toBe(experienceFrame(first.cells, size, 'blockOpponent', 2).key);
    expect(changed[0][1].best).toBeDefined();
  });

  it('adds to what an earlier loss already taught about the same position', () => {
    const book: TExperienceBook = new Map();
    const analyze = () => ({ move: at(size, 4, 3), score: 0 });
    mergeExperience(book, learnFromLoss(record, book, { analyze }));
    const second = [...record.moves.slice(0, 5), { location: at(size, 9, 9), turn: 1 as TTurn }];
    mergeExperience(book, learnFromLoss({ ...record, moves: second }, book, { analyze }));

    const learned = lookupExperience(book, boardOf(size, record.moves.slice(0, 5)), 2);
    expect(learned?.avoid).toEqual(new Set([at(size, 0, 2), at(size, 9, 9)]));
  });

  it('uses a learned move and never plays an avoided one', () => {
    const position = record.moves.slice(0, 5);
    const steps = Object.fromEntries(position.map((move) => [move.location, move.turn]));
    const board = boardOf(size, position);
    const { key, transform } = positionKey(board.cells, size, 'blockOpponent', 2);
    const toCanonical = (index: number) => transformIndex(transform, index, size);
    const ask = (book: TExperienceBook) =>
      findMachineMove({
        steps,
        size,
        winMode: 'blockOpponent',
        turn: 1,
        level: 'hard',
        timeLimitMs: 200,
        book,
      });

    // Learned best move: played as is.
    const best = at(size, 2, 2);
    expect(ask(new Map([[key, { avoid: [], best: toCanonical(best) }]]))).toBe(best);

    // Only lessons to avoid: the usual reply (blocking the open three) is ruled out.
    const usual = ask(new Map());
    const avoidOnly = new Map([[key, { avoid: [toCanonical(usual)] }]]);
    expect(ask(avoidOnly)).not.toBe(usual);
  });

  it('drops the oldest lessons beyond the size limit', () => {
    const book: TExperienceBook = new Map();
    const entries = Array.from({ length: 3_005 }, (_, index) => [`k${index}`, { avoid: [index] }]);
    mergeExperience(book, entries as Array<[string, { avoid: Array<number> }]>);
    expect(book.size).toBe(3_000);
    expect(book.has('k0')).toBe(false);
    expect(book.has('k3004')).toBe(true);
  });
});

describe('caro machine experience: learning from a real loss', () => {
  type TPlayer = { level: TCaroMachineLevel; timeLimitMs: number; maxDepth?: number };

  // Plays a full 10x10 game; returns the record and the winner, if any.
  function playGame(
    players: Record<TTurn, TPlayer>,
    book: TExperienceBook,
    script?: Array<number>
  ) {
    const size: TCaroSizeBoard = 10;
    const steps: { [location: number]: TTurn } = {};
    const moves: TGameRecord['moves'] = [];
    // One random stream per side, so a scripted human does not shift the machine's choices.
    const randoms: Record<TTurn, () => number> = { 0: seeded(3), 1: seeded(5) };
    let turn: TTurn = 0;
    for (let ply = 0; ply < size * size; ply++) {
      const scripted = turn == 0 ? script?.[moves.length] : undefined;
      const location =
        scripted != undefined && steps[scripted] == undefined
          ? scripted
          : findMachineMove({
              steps,
              size,
              winMode: 'blockOpponent',
              turn,
              ...players[turn],
              random: randoms[turn],
              book: turn == 1 ? book : undefined,
            });
      if (location < 0) break;
      steps[location] = turn;
      moves.push({ location, turn });
      const win = checkWin(
        { steps, currentStep: location, currentPlayer: turn, size },
        'blockOpponent'
      );
      if (win.winMode.length > 0) return { moves, winner: turn };
      turn = (1 - turn) as TTurn;
    }
    return { moves, winner: undefined };
  }

  it('does not lose the same game twice', () => {
    // A strong player (turn 0) beats the quick medium machine (turn 1).
    const players: Record<TTurn, TPlayer> = {
      0: { level: 'hard', timeLimitMs: 250 },
      // A shallow search with time to spare always finishes, so its moves are deterministic.
      1: { level: 'medium', timeLimitMs: 10_000, maxDepth: 2 },
    };
    const book: TExperienceBook = new Map();
    const lost = playGame(players, book);
    expect(lost.winner).toBe(0);

    const record: TGameRecord = {
      size: 10,
      winMode: 'blockOpponent',
      machineTurn: 1,
      moves: lost.moves,
    };
    const changed = learnFromLoss(record, book, {
      analyze: (board, side, exclude) =>
        analyzePosition(
          board,
          side,
          {
            maxDepth: 12,
            timeLimitMs: 600,
            beamWidth: 14,
            useThreatSearch: true,
            searchForced: true,
          },
          exclude
        ),
    });
    expect(changed.length).toBeGreaterThan(0);
    mergeExperience(book, changed);

    // The human repeats exactly the same moves, ply by ply.
    const script: Array<number> = [];
    lost.moves.forEach((move, index) => {
      if (move.turn == 0) script[index] = move.location;
    });
    const machineMoves = (game: { moves: TGameRecord['moves'] }) =>
      game.moves.filter((move) => move.turn == 1).map((move) => move.location);

    // Control: without the lessons the machine walks into the very same loss.
    const control = playGame(players, new Map(), script);
    expect(machineMoves(control)).toEqual(machineMoves(lost));
    expect(control.winner).toBe(0);

    // With the lessons it leaves the losing line somewhere.
    const replay = playGame(players, book, script);
    const replayMachine = machineMoves(replay);
    expect(replayMachine).not.toEqual(machineMoves(lost).slice(0, replayMachine.length));

    // A fix never points at a move the machine already lost with.
    for (const [, entry] of changed) {
      if (entry.best != undefined) expect(entry.avoid).not.toContain(entry.best);
    }
  }, 60_000);
});

describe('caro machine experience: close calls in games the machine did not lose', () => {
  const size = 15;
  const X = (row: number, column: number) => ({
    location: at(size, row, column),
    turn: 0 as TTurn,
  });
  const O = (row: number, column: number) => ({
    location: at(size, row, column),
    turn: 1 as TTurn,
  });
  const opening = [X(7, 5), O(0, 0), X(7, 6), O(0, 1), X(7, 7)];
  const ending = [X(12, 12), O(0, 13), X(12, 13), O(14, 14)];

  it('finds the move that left the opponent a winning attack it then missed', () => {
    // Facing an open three, the machine plays in the corner; the human does not punish it,
    // and the machine blocks on its next move.
    const moves = [...opening, O(0, 14), X(12, 12), O(7, 8), X(12, 13), O(14, 14)];
    const changed = learnFromGame(
      { size, winMode: 'blockOpponent', machineTurn: 1, moves },
      new Map(),
      false
    );
    expect(changed).toHaveLength(1);

    const book = mergeExperience(new Map(), changed);
    const board = boardOf(size, opening);
    const learned = lookupExperience(book, board, 2);
    expect(learned?.avoid).toEqual(new Set([at(size, 0, 14)]));
    expect(learned?.best).toBeDefined();

    // After the learned move the human no longer has a forced win.
    board.place(learned!.best!, 2);
    const deadline = performance.now() + 2_000;
    expect(findThreatWin(board, 1, { mode: 'vcf', depth: 16, budget: 100_000, deadline })).toBe(-1);
    expect(findThreatWin(board, 1, { mode: 'vct', depth: 8, budget: 30_000, deadline })).toBe(-1);
  }, 30_000);

  it('learns nothing from a game where the machine never left an opening', () => {
    const moves = [...opening, O(7, 8), X(7, 4), O(7, 3), ...ending];
    expect(
      learnFromGame({ size, winMode: 'blockOpponent', machineTurn: 1, moves }, new Map(), false)
    ).toEqual([]);
  }, 30_000);

  it('does not judge the move that ended the game', () => {
    const moves = [...opening, O(0, 14)];
    const probed: Array<number> = [];
    learnFromCloseCalls({ size, winMode: 'blockOpponent', machineTurn: 1, moves }, new Map(), {
      analyze: () => ({ move: 0, score: 0 }),
      hasForcedWin: (board) => {
        probed.push(board.stones.length);
        return false;
      },
    });
    // Machine moves sit at plies 2 and 4; the final one (ply 6) ends the game.
    expect(probed).toEqual([2, 4]);
  });
});
