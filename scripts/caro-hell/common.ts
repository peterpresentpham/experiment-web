import * as tf from '@tensorflow/tfjs-core';
import * as tfl from '@tensorflow/tfjs-layers';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { setPriority } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { THellGame } from 'src/services/caro-hell/encode';
import { exportHellModel, loadHellModelFromArtifacts } from 'src/services/caro-hell/model';
import { checkWin } from 'src/services/caro.utils';
import { TCaroSizeBoard, TCaroWinMode, TTurn } from 'src/types/caro.type';

/** Shared helpers for the offline training scripts (run with `pnpm hell:*`). */

export const ROOT = resolve(import.meta.dirname, '../..');
// Overridable so a trial run does not touch the real data or the deployed model.
export const DATA_DIR = process.env.HELL_DATA_DIR ?? join(ROOT, 'ml-data/caro-hell');
export const MODEL_DIR = process.env.HELL_MODEL_DIR ?? join(ROOT, 'public/models/caro-hell');

/**
 * Native TensorFlow is 10–50x faster but needs a one-off manual install (see README);
 * without it everything still runs on the pure JavaScript CPU backend.
 */
export async function initBackend(options: { threads?: number } = {}) {
  if (options.threads) {
    // Read by libtensorflow when it starts, so this must happen before the import below.
    const threads = String(options.threads);
    process.env.TF_NUM_INTRAOP_THREADS = threads;
    process.env.TF_NUM_INTEROP_THREADS = '1';
    process.env.OMP_NUM_THREADS = threads;
  }
  try {
    // tfjs-node 4.22 still calls helpers that Node 23+ removed from `util`.
    const util = (await import('node:util')).default as unknown as Record<string, unknown>;
    util.isNullOrUndefined ??= (value: unknown) => value == null;
    util.isArray ??= Array.isArray;
    await import('@tensorflow/tfjs-node');
    await tf.setBackend('tensorflow');
  } catch {
    await import('@tensorflow/tfjs-backend-cpu');
    await tf.setBackend('cpu');
    console.warn(
      '[caro-hell] Native TensorFlow is not installed; using the slow CPU backend. See README.'
    );
  }
  await tf.ready();
  return tf.getBackend();
}

/** Writes model.json + weights.bin in the layout `tf.loadLayersModel(url)` expects. */
export async function saveModel(model: tfl.LayersModel, dir = MODEL_DIR) {
  const artifacts = await exportHellModel(model);
  mkdirSync(dir, { recursive: true });
  const weightData = artifacts.weightData as ArrayBuffer;
  writeAtomic(join(dir, 'weights.bin'), Buffer.from(weightData));
  const modelJson = {
    format: 'layers-model',
    generatedBy: 'experiment-web caro-hell trainer',
    modelTopology: artifacts.modelTopology,
    weightsManifest: [{ paths: ['weights.bin'], weights: artifacts.weightSpecs }],
    // The browser keys its fine-tuned copy on this, so a new base model replaces old copies.
    userDefinedMetadata: { trainedAt: new Date().toISOString() },
  };
  writeAtomic(join(dir, 'model.json'), JSON.stringify(modelJson));
}

/** Copies a saved model, e.g. a checkpoint that won its arena to the deployed folder. */
export function copyModel(from: string, to: string) {
  mkdirSync(to, { recursive: true });
  for (const file of ['weights.bin', 'model.json']) {
    copyFileSync(join(from, file), join(to, `${file}.tmp`));
    renameSync(join(to, `${file}.tmp`), join(to, file));
  }
}

/** Write-then-rename, so a killed process never leaves a half-written file behind. */
export function writeAtomic(file: string, data: string | Buffer) {
  writeFileSync(`${file}.tmp`, data);
  renameSync(`${file}.tmp`, file);
}

/** Adam's running averages, so a resumed run continues as if it had never stopped. */
export async function saveOptimizer(optimizer: tf.Optimizer, dir: string) {
  // Adam names both of a variable's moments alike; an index keeps them apart and in order.
  const weights = (await optimizer.getWeights()).map(({ name, tensor }, index) => ({
    name: `${index}|${name}`,
    tensor,
  }));
  const { data, specs } = await tf.io.encodeWeights(weights);
  mkdirSync(dir, { recursive: true });
  writeAtomic(join(dir, 'optimizer.bin'), Buffer.from(data));
  writeAtomic(join(dir, 'optimizer.json'), JSON.stringify(specs));
}

export async function loadOptimizer(optimizer: tf.Optimizer, dir: string) {
  if (!existsSync(join(dir, 'optimizer.json'))) return false;
  const specs = JSON.parse(readFileSync(join(dir, 'optimizer.json'), 'utf8'));
  const data = readFileSync(join(dir, 'optimizer.bin'));
  const weights = tf.io.decodeWeights(
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
    specs
  );
  await optimizer.setWeights(
    Object.entries(weights)
      .map(([name, tensor]) => ({
        index: Number(name.split('|')[0]),
        name: name.slice(name.indexOf('|') + 1),
        tensor,
      }))
      .sort((a, b) => a.index - b.index)
      .map(({ name, tensor }) => ({ name, tensor }))
  );
  return true;
}

export function hasModel(dir = MODEL_DIR) {
  return existsSync(join(dir, 'model.json'));
}

export async function loadModel(dir = MODEL_DIR) {
  const json = JSON.parse(readFileSync(join(dir, 'model.json'), 'utf8'));
  const weights = readFileSync(join(dir, json.weightsManifest[0].paths[0]));
  return loadHellModelFromArtifacts({
    modelTopology: json.modelTopology,
    weightSpecs: json.weightsManifest[0].weights,
    weightData: weights.buffer.slice(weights.byteOffset, weights.byteOffset + weights.byteLength),
  });
}

export function appendGames(file: string, games: Array<THellGame>) {
  mkdirSync(DATA_DIR, { recursive: true });
  const lines = games.map((game) => JSON.stringify(game)).join('\n');
  writeFileSync(join(DATA_DIR, file), lines + '\n', { flag: 'a' });
}

/** Every game in the data folder whose file name starts with one of the prefixes. */
export function readGames(prefixes: Array<string>) {
  if (!existsSync(DATA_DIR)) return [];
  return readdirSync(DATA_DIR)
    .filter((file) => file.endsWith('.jsonl') && prefixes.some((prefix) => file.startsWith(prefix)))
    .sort()
    .flatMap((file) =>
      readFileSync(join(DATA_DIR, file), 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line) as THellGame)
    );
}

export type TPlayer = (state: {
  steps: { [location: number]: TTurn };
  moves: Array<number>;
  size: TCaroSizeBoard;
  winMode: TCaroWinMode;
  turn: TTurn;
}) => TChoice | Promise<TChoice>;

type TChoice = {
  move: number;
  policy?: Array<[number, number]> | null;
  /** What chose the move, for players that combine several (e.g. "book"). */
  source?: string;
};

/** Lets pending signals and timers run between long synchronous steps. */
export const yieldToEvents = () => new Promise((resolve) => setImmediate(resolve));

/**
 * Plays one game; turn 0 moves first. Returns the record with per-ply policy targets.
 * Yields between moves so Ctrl+C is noticed during long games.
 */
export async function playGame(
  players: Record<TTurn, TPlayer>,
  size: TCaroSizeBoard,
  winMode: TCaroWinMode,
  opening: Array<number> = []
): Promise<THellGame> {
  const steps: { [location: number]: TTurn } = {};
  const moves: Array<number> = [];
  const policies: Array<Array<[number, number]> | null> = [];
  let winner = -1;

  for (let ply = 0; ply < size * size; ply++) {
    const turn = (ply % 2) as TTurn;
    let move: number;
    let policy: Array<[number, number]> | null = null;
    if (ply < opening.length) move = opening[ply];
    else {
      await yieldToEvents();
      // External engines (other processes) answer asynchronously.
      const choice = await players[turn]({ steps, moves, size, winMode, turn });
      move = choice.move;
      policy = choice.policy === undefined ? [[move, 1]] : choice.policy;
    }
    if (move < 0 || steps[move] != undefined) break;
    steps[move] = turn;
    moves.push(move);
    policies.push(policy);
    const win = checkWin({ steps, currentStep: move, currentPlayer: turn, size }, winMode);
    if (win.winMode.length > 0) {
      winner = turn;
      break;
    }
  }
  return { size, winMode, moves, winner, policies };
}

/**
 * A random empty cell within `radius` of a stone (near the centre on an empty board), as a person
 * might open.
 */
export function randomNearby(
  moves: ReadonlyArray<number>,
  size: number,
  radius: number,
  random: () => number = Math.random
) {
  const center = Math.floor(size / 2);
  if (moves.length == 0) {
    const row = center + Math.floor(random() * 3) - 1;
    const column = center + Math.floor(random() * 3) - 1;
    return row * size + column;
  }
  const taken = new Set(moves);
  const cells = new Set<number>();
  for (const move of moves) {
    const [row, column] = [Math.floor(move / size), move % size];
    for (let dr = -radius; dr <= radius; dr++)
      for (let dc = -radius; dc <= radius; dc++) {
        const [r, c] = [row + dr, column + dc];
        if (r >= 0 && c >= 0 && r < size && c < size && !taken.has(r * size + c))
          cells.add(r * size + c);
      }
  }
  const options = [...cells];
  return options[Math.floor(random() * options.length)];
}

/** A few random stones near the centre, so games do not all start the same way. */
export function randomOpening(size: number, plies: number, random: () => number) {
  const center = Math.floor(size / 2);
  const moves = new Set<number>();
  while (moves.size < plies) {
    const row = center + Math.floor(random() * 5) - 2;
    const column = center + Math.floor(random() * 5) - 2;
    moves.add(row * size + column);
  }
  return [...moves];
}

export function countGames(file: string) {
  const path = join(DATA_DIR, file);
  if (!existsSync(path)) return 0;
  return readFileSync(path, 'utf8').split('\n').filter(Boolean).length;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Lowest scheduling priority: the computer stays responsive while training runs. */
export function lowerPriority() {
  try {
    setPriority(19);
  } catch {
    // Not permitted on this system; run at normal priority.
  }
}

export function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return value != undefined && Number.isFinite(parsed) ? parsed : fallback;
}

/** True when the module is the script being run, not imported by another script. */
export function isEntry(moduleUrl: string) {
  return process.argv[1] != undefined && moduleUrl == pathToFileURL(resolve(process.argv[1])).href;
}

export function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}
