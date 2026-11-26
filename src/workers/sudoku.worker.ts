/// <reference lib="webworker" />
import { generateSudoku } from 'src/services/sudoku/generator.utils';
import { createSeededRandom } from 'src/services/sudoku/random.utils';
import type { TSudokuDifficulty, TSudokuPuzzle } from 'src/types/sudoku.type';

/** Generates puzzles off the main thread: a hard one can take a few hundred milliseconds. */

export type TSudokuWorkerRequest = { id: number; difficulty: TSudokuDifficulty; seed: number };
export type TSudokuWorkerResponse =
  { id: number; result: TSudokuPuzzle } | { id: number; error: string };

self.onmessage = ({ data }: MessageEvent<TSudokuWorkerRequest>) => {
  let response: TSudokuWorkerResponse;
  try {
    response = {
      id: data.id,
      result: generateSudoku(data.difficulty, createSeededRandom(data.seed)),
    };
  } catch (error) {
    response = { id: data.id, error: String(error) };
  }
  self.postMessage(response);
};
