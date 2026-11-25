/// <reference lib="webworker" />
import type { TFacelets } from 'src/lib/cube/facelets';
import { prepareSolver, solveFacelets, TSolveResult } from 'src/lib/cube/solver';

/** Solves cubes off the main thread: the search would freeze the page for a moment. */

export type TRubikSolverRequest = { id: number; facelets: TFacelets };
export type TRubikSolverResponse =
  { id: number; result: TSolveResult } | { id: number; error: string };

// The tables are built as soon as the worker starts, while the person is still painting.
prepareSolver();

self.onmessage = ({ data }: MessageEvent<TRubikSolverRequest>) => {
  let response: TRubikSolverResponse;
  try {
    response = { id: data.id, result: solveFacelets(data.facelets) };
  } catch (error) {
    response = { id: data.id, error: String(error) };
  }
  self.postMessage(response);
};
