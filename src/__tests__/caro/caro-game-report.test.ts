import { toCaroGameReport } from 'src/services/caro-game-report/report';
import { parseCaroGameReport, TCaroGameReport } from 'src/services/caro-game-report/validate';
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
