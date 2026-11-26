'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import GameStatus from 'src/components/games/GameStatus';
import useSudokuGame from 'src/hooks/useSudokuGame';
import useSudokuKeyboard from 'src/hooks/useSudokuKeyboard';
import { useMessages } from 'src/i18n/client';
import { sudokuMessages } from 'src/i18n/messages/sudoku';
import { formatElapsed } from 'src/services/sudoku/game.utils';
import { soundtrack } from 'src/services/soundtrack';
import { dailyResultKey, useSudokuStore } from 'src/states/sudoku.state';
import { useConfigStore } from 'src/states/config.state';
import { TSound } from 'src/types/global';
import SudokuBoard from './SudokuBoard';
import SudokuControls from './SudokuControls';
import SudokuHeader from './SudokuHeader';
import SudokuHintPanel from './SudokuHintPanel';

const noopSubscribe = () => () => {};

export default function SudokuView() {
  const text = useMessages(sudokuMessages);
  // The saved game lives in localStorage, so the board waits for the client to avoid a mismatch.
  const isMounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const { status, difficulty, mode, dailyDate, elapsed, dailyResults } = useSudokuStore();
  const { startGame, isGenerating, fallbackFor } = useSudokuGame();
  const previousStatus = useRef(status);
  useSudokuKeyboard();

  useEffect(() => {
    if (!isMounted || useSudokuStore.getState().status !== 'empty') return;
    void startGame('random', useSudokuStore.getState().difficulty);
  }, [isMounted, startGame]);

  // The clock stops while the tab is hidden.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') useSudokuStore.getState().fn.tick();
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (previousStatus.current === 'playing' && status === 'won')
      soundtrack.play({ type: TSound.WIN, isEnabled: useConfigStore.getState().isSound });
    previousStatus.current = status;
  }, [status]);

  if (!isMounted) return null;

  const best =
    mode === 'daily' && dailyDate ? dailyResults[dailyResultKey(dailyDate, difficulty)] : undefined;

  return (
    <div className="container flex flex-1 flex-col gap-3">
      <SudokuHeader
        isGenerating={isGenerating}
        onStart={(startMode, level) => void startGame(startMode, level)}
      />
      {status === 'won' && (
        <GameStatus
          isOver
          text={
            best !== undefined && mode === 'daily'
              ? `${text.status.won(formatElapsed(elapsed))} ${text.status.dailySolved(formatElapsed(best))}`
              : text.status.won(formatElapsed(elapsed))
          }
        />
      )}
      {fallbackFor && (
        <p role="status" className="text-sm text-muted-foreground">
          {text.status.fallback(text.difficulty[fallbackFor])}
        </p>
      )}
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
        <div className="w-full max-w-xl lg:flex-1">{status !== 'empty' && <SudokuBoard />}</div>
        <div className="flex w-full max-w-xl flex-col gap-3 lg:w-80">
          <SudokuControls />
          <SudokuHintPanel />
        </div>
      </div>
    </div>
  );
}
