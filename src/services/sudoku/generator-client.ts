import type { TSudokuDifficulty, TSudokuPuzzle } from 'src/types/sudoku.type';
import type { TSudokuWorkerRequest, TSudokuWorkerResponse } from 'src/workers/sudoku.worker';

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<
  number,
  { resolve: (puzzle: TSudokuPuzzle) => void; reject: (error: Error) => void }
>();

function startWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('../../workers/sudoku.worker.ts', import.meta.url), {
    type: 'module',
  });
  worker.onmessage = ({ data }: MessageEvent<TSudokuWorkerResponse>) => {
    const request = pending.get(data.id);
    pending.delete(data.id);
    if (!request) return;
    if ('error' in data) request.reject(new Error(data.error));
    else request.resolve(data.result);
  };
  worker.onerror = (event) => {
    for (const request of pending.values()) request.reject(new Error(event.message));
    pending.clear();
    worker = undefined;
  };
  return worker;
}

/** Generates a puzzle in the worker; the same difficulty and seed always give the same puzzle. */
export function generateSudokuInWorker(difficulty: TSudokuDifficulty, seed: number) {
  const id = nextId++;
  return new Promise<TSudokuPuzzle>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    startWorker().postMessage({ id, difficulty, seed } satisfies TSudokuWorkerRequest);
  });
}
