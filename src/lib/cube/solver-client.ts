import type { TRubikSolverRequest, TRubikSolverResponse } from 'src/workers/rubik-solver.worker';
import type { TFacelets } from './facelets';
import type { TSolveResult } from './solver';

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<
  number,
  { resolve: (r: TSolveResult) => void; reject: (e: Error) => void }
>();

/** The solver worker, started on first use and kept for the page's lifetime. */
export function startSolver() {
  if (worker) return worker;
  worker = new Worker(new URL('../../workers/rubik-solver.worker.ts', import.meta.url), {
    type: 'module',
  });
  worker.onmessage = ({ data }: MessageEvent<TRubikSolverResponse>) => {
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

/** Solves a cube in the solver worker (see `solveFacelets`). */
export function solveInWorker(facelets: TFacelets) {
  const id = nextId++;
  return new Promise<TSolveResult>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    startSolver().postMessage({ id, facelets } satisfies TRubikSolverRequest);
  });
}
