import { toCaroGameReport } from 'src/services/caro-game-report/report';
import {
  parseCaroGameReport,
  TCaroGameReport,
  TCaroGameTiming,
} from 'src/services/caro-game-report/validate';
import { describe, expect, it } from 'vitest';

// 15x15: player 0 plays row 7 columns 3-7, player 1 plays row 0 in between.
const WIN_ROW = [108, 0, 109, 1, 110, 2, 111, 3, 112];

const report = (overrides: Partial<TCaroGameReport> = {}): TCaroGameReport => ({
  version: 1,
  size: 15,
  winMode: 'blockOpponent',
  machineTurn: 1,
  firstTurn: 0,
  moves: WIN_ROW,
  winner: 0,
  ...overrides,
});

describe('parseCaroGameReport', () => {
  it('keeps a real game', () => {
    expect(parseCaroGameReport(report())).toEqual(report());
  });

  it('turns a game record into a report', () => {
    const record = {
      size: 15,
      winMode: 'blockOpponent' as const,
      machineTurn: 1 as const,
      moves: WIN_ROW.map((location, index) => ({ location, turn: (index % 2) as 0 | 1 })),
    };
    expect(toCaroGameReport(record, 0)).toEqual(report());
  });

  it('rejects a winner the board does not show', () => {
    expect(parseCaroGameReport(report({ winner: 1 }))).toBeNull();
    expect(parseCaroGameReport(report({ winner: -1 }))).toBeNull();
    expect(parseCaroGameReport(report({ moves: WIN_ROW.slice(0, 7) }))).toBeNull();
  });

  it('rejects moves after the game was won, repeated cells and cells off the board', () => {
    expect(parseCaroGameReport(report({ moves: [...WIN_ROW, 4] }))).toBeNull();
    expect(parseCaroGameReport(report({ moves: [108, 108], winner: -1 }))).toBeNull();
    expect(parseCaroGameReport(report({ moves: [225], winner: -1 }))).toBeNull();
  });

  it('applies the blocked-ends rule: a five capped at both ends is no win', () => {
    // Player 1 (first) holds row 7 columns 2 and 8, so player 0's five between them is capped.
    const moves = [107, 108, 113, 109, 1, 110, 2, 111, 3, 112];
    expect(parseCaroGameReport(report({ firstTurn: 1, moves, winner: -1 }))).not.toBeNull();
    expect(parseCaroGameReport(report({ firstTurn: 1, moves, winner: 0 }))).toBeNull();
    const free = report({ firstTurn: 1, moves, winner: 0, winMode: 'non-blockOpponent' });
    expect(parseCaroGameReport(free)).toEqual(free);
  });

  it('rejects other shapes', () => {
    expect(parseCaroGameReport(null)).toBeNull();
    expect(parseCaroGameReport({ ...report(), version: 2 })).toBeNull();
    expect(parseCaroGameReport(report({ size: 3 as never }))).toBeNull();
    expect(parseCaroGameReport({ ...report(), moves: 'x' })).toBeNull();
  });
});

// The machine (player 1) played moves 1, 3, 5 and 7 of WIN_ROW.
const timing = (overrides: Partial<TCaroGameTiming> = {}): TCaroGameTiming => ({
  device: 'android',
  threads: 2,
  loaded: { tengen: 1_800, rapfi: -1 },
  moves: [
    { at: 1, ms: 41_000, source: 'tengen', learning: false },
    { at: 3, ms: 900, source: 'tengen', learning: true },
  ],
  ...overrides,
});

describe('game timing', () => {
  it('keeps the timing of a finished game', () => {
    const game = report({ timing: timing() });
    expect(parseCaroGameReport(game)).toEqual(game);
  });

  it('drops a timing the app could not have measured, keeping the game', () => {
    const atPlayerMove = timing({ moves: [{ at: 2, ms: 900, source: 'book', learning: false }] });
    expect(parseCaroGameReport(report({ timing: atPlayerMove }))).toEqual(report());
    const outOfOrder = timing({ moves: [...timing().moves].reverse() });
    expect(parseCaroGameReport(report({ timing: outOfOrder }))).toEqual(report());
    expect(parseCaroGameReport(report({ timing: timing({ threads: 99 }) }))).toEqual(report());
  });

  it('keeps an unfinished game only with its timing, and only while nobody has won', () => {
    const left = report({
      moves: [108],
      winner: null,
      timing: timing({ moves: [], waitingMs: 52_000 }),
    });
    expect(parseCaroGameReport(left)).toEqual(left);
    // Left before the machine's opening move.
    const opening = report({
      firstTurn: 1,
      moves: [],
      winner: null,
      timing: timing({ moves: [] }),
    });
    expect(parseCaroGameReport(opening)).toEqual(opening);
    expect(parseCaroGameReport(report({ moves: [108], winner: null }))).toBeNull();
    expect(parseCaroGameReport(report({ winner: null, timing: timing() }))).toBeNull();
  });

  it('leaves out the timing of moves taken back', () => {
    const record = {
      size: 15,
      winMode: 'blockOpponent' as const,
      machineTurn: 1 as const,
      moves: WIN_ROW.slice(0, 2).map((location, index) => ({
        location,
        turn: (index % 2) as 0 | 1,
      })),
    };
    expect(toCaroGameReport(record, null, timing()).timing?.moves).toEqual([timing().moves[0]]);
  });
});
