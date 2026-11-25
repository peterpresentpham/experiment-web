import { faceletsToPattern, isSolvedFacelets, TCubeError, TFacelets } from './facelets';
import { initialize, solvePattern } from './vendor/min2phase';

export type TSolveResult = { ok: true; alg: string } | { ok: false; errors: Array<TCubeError> };

/** min2phase reads the faces in this order. */
const SOLVER_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'] as const;

let isReady = false;

/** Builds the solver's tables (a fraction of a second), so the first solve is quick. */
export function prepareSolver() {
  if (isReady) return;
  initialize();
  isReady = true;
}

/**
 * A short solution (about 20 moves, Kociemba's two-phase search) for a painted or scanned cube,
 * or why the colours are not a real cube. It blocks for up to a few hundred milliseconds, so the
 * page runs it in a worker.
 */
export function solveFacelets(facelets: TFacelets): TSolveResult {
  const pattern = faceletsToPattern(facelets);
  if (!pattern.ok) return pattern;
  if (isSolvedFacelets(facelets)) return { ok: true, alg: '' };
  prepareSolver();
  const alg = solvePattern(SOLVER_ORDER.map((face) => facelets[face].join('')).join(''));
  return { ok: true, alg: alg.trim().split(/\s+/).join(' ') };
}
