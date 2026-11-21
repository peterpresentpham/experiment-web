import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  loadRapfi,
  parseRapfiMove,
  rapfiCommands,
  TRapfi,
  TRapfiFactory,
} from 'src/services/caro-rapfi/engine';
import { beforeAll, describe, expect, it } from 'vitest';

const RAPFI_DIR = join(process.cwd(), 'public/engines/rapfi');

describe('rapfiCommands', () => {
  it('lists the stones from the side to move, then starts the search', () => {
    // 15x15: location 112 is (x 7, y 7), 128 is (x 8, y 8).
    const commands = rapfiCommands({
      steps: { 112: 0, 128: 1 },
      size: 15,
      turn: 1,
      winMode: 'non-blockOpponent',
    });
    expect(commands).toEqual(['YXBLOCKRESET', 'BOARD\n7,7,2\n8,8,1\nDONE']);
  });

  it('blocks excluded moves before the board', () => {
    const commands = rapfiCommands({
      steps: { 112: 0 },
      size: 15,
      turn: 1,
      winMode: 'non-blockOpponent',
      exclude: [113],
    });
    expect(commands).toEqual(['YXBLOCKRESET', 'YXBLOCK\n8,7\nDONE', 'BOARD\n7,7,2\nDONE']);
  });
});

describe('parseRapfiMove', () => {
  it('reads x,y as a location and ignores other output', () => {
    expect(parseRapfiMove('8,7', 15)).toBe(113);
    expect(parseRapfiMove('MESSAGE Depth 12', 15)).toBeNull();
    expect(parseRapfiMove('15,0', 15)).toBeNull();
  });
});

describe('Rapfi engine (single-threaded WebAssembly build)', () => {
  let engine: TRapfi;

  beforeAll(async () => {
    const url = pathToFileURL(join(RAPFI_DIR, 'rapfi-single-simd128.js')).href;
    const { default: factory } = (await import(/* @vite-ignore */ url)) as {
      default: TRapfiFactory;
    };
    engine = await loadRapfi(factory, {
      threads: 1,
      turnMs: 300,
      locateFile: (file) => join(RAPFI_DIR, file.endsWith('.data') ? 'rapfi.data' : file),
    });
  }, 30_000);

  it('wins with an open four', async () => {
    // Row 7: the side to move (turn 0) has columns 4-7, both ends open.
    const steps = { 109: 0, 110: 0, 111: 0, 112: 0, 20: 1, 40: 1, 60: 1, 200: 1 } as const;
    expect([108, 113]).toContain(
      await engine.think({ steps, size: 15, winMode: 'non-blockOpponent', turn: 0 })
    );
  });

  it('blocks a four', async () => {
    const steps = { 108: 1, 109: 0, 110: 0, 111: 0, 112: 0, 20: 1, 40: 1 } as const;
    expect(await engine.think({ steps, size: 15, winMode: 'non-blockOpponent', turn: 1 })).toBe(
      113
    );
  });

  it('does not play excluded moves', async () => {
    const request = { steps: { 112: 0 }, size: 15, winMode: 'non-blockOpponent', turn: 1 } as const;
    const first = await engine.think(request);
    const second = await engine.think({ ...request, exclude: [first] });
    expect(second).not.toBe(first);
  });

  it('knows a four blocked at both ends is no threat under the blocked-ends rule', async () => {
    // Row 7: the opponent (turn 0) has columns 4-7, Rapfi (turn 1) holds 3 and 9, so filling 8
    // makes a five capped by Rapfi's stones at both ends. Under the free rule Rapfi must block 8.
    const steps = { 109: 0, 110: 0, 111: 0, 112: 0, 108: 1, 114: 1, 32: 1, 192: 0 } as const;
    const free = await engine.think({ steps, size: 15, winMode: 'non-blockOpponent', turn: 1 });
    const caro = await engine.think({ steps, size: 15, winMode: 'blockOpponent', turn: 1 });
    expect(free).toBe(113);
    expect(caro).not.toBe(113);
  });

  it('wins with a four open at one end under the blocked-ends rule', async () => {
    // Rapfi (turn 0) has columns 4-7 with the opponent at 3: column 8 makes a five open at 9.
    const steps = { 109: 0, 110: 0, 111: 0, 112: 0, 108: 1, 20: 1, 40: 1, 60: 1 } as const;
    expect(await engine.think({ steps, size: 15, winMode: 'blockOpponent', turn: 0 })).toBe(113);
  });

  it('plays on a 20x20 board', async () => {
    const move = await engine.think({
      steps: { 210: 0 },
      size: 20,
      winMode: 'non-blockOpponent',
      turn: 1,
    });
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(400);
    expect(move).not.toBe(210);
  });
});
