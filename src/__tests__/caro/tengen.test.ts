import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  loadTengen,
  TARGET_NODES,
  tengenMoveOrder,
  tengenThreads,
  tengenTiming,
  TTengen,
} from 'src/services/caro-tengen/engine';
import { beforeAll, describe, expect, it } from 'vitest';

const WASM_DIR = join(process.cwd(), 'public/engines/tengen');

describe('tengenTiming', () => {
  it('keeps fast devices at the base time', () => {
    expect(tengenTiming(TARGET_NODES * 4)).toEqual({ optimumMs: 1_500, hardMs: 3_000 });
  });

  it('gives slower devices more time, within the caps', () => {
    const { optimumMs, hardMs } = tengenTiming(TARGET_NODES / 2);
    expect(optimumMs).toBe(2_000);
    expect(hardMs).toBe(4_000);
    expect(tengenTiming(1)).toEqual({ optimumMs: 2_500, hardMs: 4_000 });
    expect(tengenTiming(0)).toEqual({ optimumMs: 2_500, hardMs: 4_000 });
  });
});

describe('tengenThreads', () => {
  const desktop = { isolated: true, cores: 8, userAgent: 'Mozilla/5.0 (X11)', maxTouchPoints: 0 };

  it('leaves a core free and caps desktops at four', () => {
    expect(tengenThreads(desktop)).toBe(4);
    expect(tengenThreads({ ...desktop, cores: 3 })).toBe(2);
    expect(tengenThreads({ ...desktop, cores: 1 })).toBe(1);
  });

  it('uses one thread without isolation and on iPhones and iPads', () => {
    expect(tengenThreads({ ...desktop, isolated: false })).toBe(1);
    expect(tengenThreads({ ...desktop, userAgent: 'iPhone' })).toBe(1);
    expect(tengenThreads({ ...desktop, userAgent: 'Macintosh', maxTouchPoints: 5 })).toBe(1);
  });

  it('caps other phones at two', () => {
    expect(tengenThreads({ ...desktop, userAgent: 'Linux; Android 14; Mobile' })).toBe(2);
  });
});

describe('tengenMoveOrder', () => {
  it('starts with the side to move when the counts are even', () => {
    expect(tengenMoveOrder({ 1: 0, 2: 1, 3: 0, 4: 1 }, 0)).toEqual([1, 2, 3, 4]);
    expect(tengenMoveOrder({ 1: 0, 2: 1 }, 1)).toEqual([2, 1]);
  });

  it('starts with the opponent when it has one stone more', () => {
    expect(tengenMoveOrder({ 1: 0, 2: 1, 3: 0 }, 1)).toEqual([1, 2, 3]);
  });

  it('rejects impossible positions', () => {
    expect(tengenMoveOrder({ 1: 0, 2: 0 }, 1)).toBeNull();
    expect(tengenMoveOrder({ 1: 0, 2: 1, 3: 0 }, 0)).toBeNull();
  });
});

describe('Tengen engine (single-threaded WebAssembly build)', () => {
  let engine: TTengen;
  const fast = { optimumMs: 100, hardMs: 200 };

  beforeAll(async () => {
    engine = await loadTengen(
      { compile: async (file) => WebAssembly.compile(readFileSync(join(WASM_DIR, file))) },
      1
    );
  });

  it('measures the device', () => {
    expect(engine.threads).toBe(1);
    expect(engine.nodesPerSecond).toBeGreaterThan(0);
  });

  it('wins with an open four', () => {
    // Row 7: the side to move (turn 0) has four in a row at columns 4-7, both ends open.
    const steps = { 109: 0, 110: 0, 111: 0, 112: 0, 20: 1, 40: 1, 60: 1, 200: 1 } as const;
    const move = engine.think({ steps, size: 15, winMode: 'blockOpponent', turn: 0 }, fast);
    expect([108, 113]).toContain(move);
  });

  it('blocks a four', () => {
    // Turn 1 must stop turn 0's four on row 7 (columns 4-7, column 3 already blocked).
    const steps = { 108: 1, 109: 0, 110: 0, 111: 0, 112: 0, 20: 1, 40: 1 } as const;
    const move = engine.think({ steps, size: 15, winMode: 'non-blockOpponent', turn: 1 }, fast);
    expect(move).toBe(113);
  });

  it('completes a five boxed in at both ends in the free rule', () => {
    // Row 7, columns 4-7, with turn 1 at columns 3 and 9: column 8 makes a five that wins only
    // when blocked fives count.
    const steps = { 108: 1, 109: 0, 110: 0, 111: 0, 112: 0, 114: 1, 20: 1, 40: 1 } as const;
    const move = engine.think({ steps, size: 15, winMode: 'non-blockOpponent', turn: 0 }, fast);
    expect(move).toBe(113);
  });

  it('plays on a 10x10 board', () => {
    const move = engine.think(
      { steps: { 44: 0 }, size: 10, winMode: 'blockOpponent', turn: 1 },
      fast
    );
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(100);
    expect(move).not.toBe(44);
  });
});
