import { useState } from 'react';
import SudokuInstructionDialog from 'src/components/AppDialog/SudokuInstructionDialog';
import GameToolbar from 'src/components/games/GameToolbar';
import { Badge } from 'src/components/shadcn/badge';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { sudokuMessages } from 'src/i18n/messages/sudoku';
import { formatElapsed } from 'src/services/sudoku/game.utils';
import { TSudokuMode, useSudokuStore } from 'src/states/sudoku.state';
import { TSound } from 'src/types/global';
import { TSudokuDifficulty } from 'src/types/sudoku.type';

const DIFFICULTIES: TSudokuDifficulty[] = ['easy', 'medium', 'hard', 'expert'];

type TProps = {
  isGenerating: boolean;
  onStart: (mode: TSudokuMode, difficulty: TSudokuDifficulty) => void;
};

export default function SudokuHeader({ isGenerating, onStart }: TProps) {
  const text = useMessages(sudokuMessages);
  const { actions } = useMessages(commonMessages);
  const { difficulty, mode, dailyDate, elapsed, mistakes, hintsUsed, checkMistakes } =
    useSudokuStore();
  // The difficulty of the next game; the one being played stays in the store.
  const [target, setTarget] = useState<TSudokuDifficulty>(difficulty);

  return (
    <GameToolbar
      title={text.title}
      status={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {mode === 'daily' && dailyDate
              ? `${text.difficulty[difficulty]} · ${text.status.dailyLabel(dailyDate)}`
              : `${text.difficulty[difficulty]} · ${text.modes[mode]}`}
          </Badge>
          <Badge variant="secondary" role="timer">
            {text.status.time(formatElapsed(elapsed))}
          </Badge>
          {checkMistakes && <Badge variant="secondary">{text.status.mistakes(mistakes)}</Badge>}
          {hintsUsed > 0 && <Badge variant="secondary">{text.status.hints(hintsUsed)}</Badge>}
        </div>
      }
      tools={<SudokuInstructionDialog />}
      actions={
        <>
          <div role="group" className="flex items-center gap-1">
            {DIFFICULTIES.map((level) => (
              <Button
                key={level}
                size="sm"
                variant={level === target ? 'default' : 'outline'}
                aria-pressed={level === target}
                onClick={() => setTarget(level)}
              >
                {text.difficulty[level]}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={isGenerating}
            onClick={() => onStart('daily', target)}
          >
            {text.actions.daily}
          </Button>
          <Button
            size="sm"
            sound={TSound.SHUFFLE}
            isLoading={isGenerating}
            loadingText={text.status.generating}
            onClick={() => onStart('random', target)}
          >
            {actions.newGame}
          </Button>
        </>
      }
    />
  );
}
