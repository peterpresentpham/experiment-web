import { useCallback, useRef, useState } from 'react';
import { dailyKey } from 'src/services/sudoku/game.utils';
import { generateSudokuInWorker } from 'src/services/sudoku/generator-client';
import { hashSeed } from 'src/services/sudoku/random.utils';
import { TSudokuMode, useSudokuStore } from 'src/states/sudoku.state';
import { TSudokuDifficulty } from 'src/types/sudoku.type';

/**
 * Starts games: generates the puzzle in a worker, then hands it to the store. A daily puzzle is
 * seeded by the date and difficulty, so everyone gets the same one; a random puzzle by chance.
 */
export default function useSudokuGame() {
  const [isGenerating, setIsGenerating] = useState(false);
  // The difficulty that was asked for when generation fell back to a different grade.
  const [fallbackFor, setFallbackFor] = useState<TSudokuDifficulty | null>(null);
  const latestRequest = useRef(0);

  const startGame = useCallback(async (mode: TSudokuMode, difficulty: TSudokuDifficulty) => {
    const request = ++latestRequest.current;
    const dailyDate = mode === 'daily' ? dailyKey() : null;
    const seed =
      mode === 'daily'
        ? hashSeed(`sudoku:${dailyDate}:${difficulty}`)
        : Math.floor(Math.random() * 0x100000000);
    setIsGenerating(true);
    try {
      const puzzle = await generateSudokuInWorker(difficulty, seed);
      // A newer request supersedes this one.
      if (request !== latestRequest.current) return;
      useSudokuStore.getState().fn.start(puzzle, { difficulty, mode, dailyDate });
      setFallbackFor(puzzle.difficulty === difficulty ? null : difficulty);
    } catch {
      // The worker failed to start or crashed; the board that was on screen stays as it is.
    } finally {
      if (request === latestRequest.current) setIsGenerating(false);
    }
  }, []);

  return { startGame, isGenerating, fallbackFor };
}
