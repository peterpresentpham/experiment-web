/* eslint-disable no-console -- command-line script */
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { parseNumber } from './common';

/**
 * Compares single-threaded Tengen WebAssembly builds: each searches the same positions to a fixed
 * depth, so the node counts must match (same behaviour) and only the time differs.
 *
 *   node --import tsx scripts/caro-hell/wasm-bench.ts --depth 12 public/engines/tengen/tengen.wasm other.wasm
 */

type TExports = {
  tg_new(size: number, rule: number): number;
  tg_play(x: number, y: number): number;
  tg_think(ms: number, depth: number): number;
  tg_set_hash(megabytes: number): void;
};

/** Middle-game positions under the blocked-ends rule, alternating from Black, as (x, y). */
const POSITIONS: Array<Array<[number, number]>> = [
  [
    [7, 7],
    [8, 7],
    [7, 9],
    [9, 8],
    [5, 8],
    [9, 6],
  ],
  [
    [7, 7],
    [8, 8],
    [6, 8],
    [8, 6],
    [8, 7],
    [6, 6],
    [9, 7],
  ],
  [
    [7, 7],
    [7, 8],
    [8, 9],
    [6, 7],
    [9, 9],
    [10, 10],
    [8, 8],
    [6, 6],
  ],
];

async function load(file: string) {
  let nodes = 0;
  const { instance } = await WebAssembly.instantiate(readFileSync(file), {
    env: {
      tg_now: () => performance.timeOrigin + performance.now(),
      tg_info: (_depth: number, _seldepth: number, _value: number, reported: number) => {
        nodes = reported;
      },
    },
  });
  const engine = instance.exports as unknown as TExports;
  return {
    search(stones: Array<[number, number]>, depth: number) {
      engine.tg_new(15, 8);
      for (const [x, y] of stones) engine.tg_play(x, y);
      const startedAt = performance.now();
      const move = engine.tg_think(600_000, depth);
      return { move, nodes, ms: performance.now() - startedAt };
    },
  };
}

async function main() {
  const { values, positionals } = parseArgs({
    options: { depth: { type: 'string', default: '12' }, rounds: { type: 'string', default: '3' } },
    allowPositionals: true,
  });
  const depth = parseNumber(values.depth, 12);
  const rounds = parseNumber(values.rounds, 3);
  const engines = await Promise.all(positionals.map(load));
  const totals = positionals.map(() => ({ nodes: 0, ms: 0, moves: [] as Array<number> }));
  // Builds take turns so a slow phase of the machine hits them equally.
  for (let round = 0; round < rounds; round++)
    for (const stones of POSITIONS)
      engines.forEach((engine, index) => {
        const { move, nodes, ms } = engine.search(stones, depth);
        totals[index].nodes += nodes;
        totals[index].ms += ms;
        if (round == 0) totals[index].moves.push(move);
      });
  positionals.forEach((file, index) => {
    const { nodes, ms, moves } = totals[index];
    console.log(
      `${file}: ${(nodes / ms / 1000).toFixed(2)}M nodes/s, ${nodes} nodes in ${(ms / 1000).toFixed(1)} s, moves ${moves.join(' ')}`
    );
  });
}

await main();
