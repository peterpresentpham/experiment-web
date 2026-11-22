import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  loadRapfi,
  parseRapfiMove,
  rapfiCommands,
  TRapfi,
  TRapfiCaroNetwork,
  TRapfiFactory,
} from 'src/services/caro-rapfi/engine';
import { beforeAll, describe, expect, it } from 'vitest';

const RAPFI_DIR = join(process.cwd(), 'public/engines/rapfi');
const CARO_DIR = join(process.cwd(), 'public/models/caro-rapfi');

async function startRapfi(options: {
  loadCaroNetwork?: () => Promise<TRapfiCaroNetwork | null>;
  onMessage?: (line: string) => void;
}) {
  const url = pathToFileURL(join(RAPFI_DIR, 'rapfi-single-simd128.js')).href;
  const { default: factory } = (await import(/* @vite-ignore */ url)) as {
    default: TRapfiFactory;
  };
  return loadRapfi(factory, {
    threads: 1,
    turnMs: 300,
    locateFile: (file) => join(RAPFI_DIR, file.endsWith('.data') ? 'rapfi.data' : file),
    ...options,
  });
}

describe('rapfiCommands', () => {
  it('lists the stones from the side to move, then starts the search', () => {
    // 15x15: location 112 is (x 7, y 7), 128 is (x 8, y 8). Turn 0 moved first and is to move.
    const commands = rapfiCommands({
      steps: { 112: 0, 128: 1 },
      size: 15,
      turn: 0,
      winMode: 'non-blockOpponent',
    });
    expect(commands).toEqual(['YXBLOCKRESET', 'BOARD\n7,7,1\n8,8,2\nDONE']);
  });

  it('alternates the stones from the side that moved first, whatever the board order', () => {
    // Turn 1 moved first (it has one stone more) and turn 0 is to move. In board order the two
    // stones of turn 1 (0 and 1) would follow each other, which Rapfi reads as a pass between.
    const commands = rapfiCommands({
      steps: { 0: 1, 1: 1, 2: 0 },
      size: 15,
      turn: 0,
      winMode: 'non-blockOpponent',
    });
    expect(commands).toEqual(['YXBLOCKRESET', 'BOARD\n0,0,2\n2,0,1\n1,0,2\nDONE']);
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
    engine = await startRapfi({});
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

  it('stops two fives of one line with one stone under the blocked-ends rule', async () => {
    // Row 7: the opponent (turn 0) has columns 5-8 and Rapfi (turn 1) holds 10. Columns 4 and 9
    // both complete a five, but a stone on 4 also caps the five through 9 at both ends.
    const steps = { 110: 0, 111: 0, 112: 0, 113: 0, 115: 1, 0: 1, 224: 1 } as const;
    expect(await engine.think({ steps, size: 15, winMode: 'blockOpponent', turn: 1 })).toBe(109);
  });

  it('blocks an open three from two cells away under the blocked-ends rule', async () => {
    // From a logged game (20x20): the opponent (turn 1) has column 7, rows 5-7. A stone on row 9
    // leaves it only fours that one stone stops, and wins here; the engine used to miss it.
    const steps = {
      168: 0,
      148: 1,
      189: 0,
      147: 1,
      210: 0,
      127: 1,
      231: 0,
      252: 1,
      229: 0,
      169: 1,
      190: 0,
      107: 1,
    } as const;
    expect(await engine.think({ steps, size: 20, winMode: 'blockOpponent', turn: 0 })).toBe(187);
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

describe('Rapfi with the caro network', () => {
  // The network each game loaded, as Rapfi reports it.
  const loaded: Array<string> = [];
  let engine: TRapfi;

  beforeAll(async () => {
    engine = await startRapfi({
      loadCaroNetwork: () =>
        Promise.resolve({
          config: readFileSync(join(CARO_DIR, 'config.toml')),
          network: readFileSync(join(CARO_DIR, 'caro.bin.lz4')),
        }),
      onMessage: (line) => {
        const match = /load weight from \/(\S+)/.exec(line);
        if (match) loaded.push(match[1]);
      },
    });
  }, 30_000);

  it('plays the blocked-ends rule with the caro network on every board size', async () => {
    for (const size of [15, 20]) {
      loaded.length = 0;
      const move = await engine.think({
        steps: { 112: 0 },
        size,
        winMode: 'blockOpponent',
        turn: 1,
      });
      expect(move).toBeGreaterThanOrEqual(0);
      expect(loaded).toEqual(['caro.bin.lz4']);
    }
  });

  it('keeps the free-rule network for the free rule', async () => {
    loaded.length = 0;
    await engine.think({ steps: { 112: 0 }, size: 15, winMode: 'non-blockOpponent', turn: 1 });
    expect(loaded).toEqual(['mix9svqfreestyle_bsmix.bin.lz4']);
  });
});

describe('Rapfi without the caro network', () => {
  it('plays the blocked-ends rule with the classical evaluation', async () => {
    const engine = await startRapfi({
      loadCaroNetwork: () => Promise.reject(new Error('offline')),
    });
    const steps = { 109: 0, 110: 0, 111: 0, 112: 0, 108: 1, 20: 1, 40: 1, 60: 1 } as const;
    expect(await engine.think({ steps, size: 15, winMode: 'blockOpponent', turn: 0 })).toBe(113);
  }, 30_000);
});
