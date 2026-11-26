import { Eraser, Lightbulb, ListChecks, Pencil, Redo2, Undo2 } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { sudokuMessages } from 'src/i18n/messages/sudoku';
import { countDigits } from 'src/services/sudoku/game.utils';
import { useSudokuStore } from 'src/states/sudoku.state';
import { TSound } from 'src/types/global';

export default function SudokuControls() {
  const text = useMessages(sudokuMessages);
  const { actions } = useMessages(commonMessages);
  const { board, history, future, noteMode, checkMistakes, status, fn } = useSudokuStore();
  const isPlaying = status === 'playing';
  const counts = countDigits(board.values);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          sound={TSound.UNDO}
          disabled={!isPlaying || history.length === 0}
          onClick={fn.undo}
        >
          <Undo2 />
          {actions.undo}
        </Button>
        <Button
          variant="outline"
          size="sm"
          sound={TSound.UNDO}
          disabled={!isPlaying || future.length === 0}
          onClick={fn.redo}
        >
          <Redo2 />
          {text.actions.redo}
        </Button>
        <Button variant="outline" size="sm" disabled={!isPlaying} onClick={fn.erase}>
          <Eraser />
          {text.actions.erase}
        </Button>
        <Button
          variant={noteMode ? 'default' : 'outline'}
          size="sm"
          aria-pressed={noteMode}
          disabled={!isPlaying}
          onClick={fn.toggleNoteMode}
        >
          <Pencil />
          {text.actions.notes}
        </Button>
        <Button variant="outline" size="sm" disabled={!isPlaying} onClick={fn.autoNotes}>
          <ListChecks />
          {text.actions.autoNotes}
        </Button>
        <Button
          variant="outline"
          size="sm"
          sound={TSound.HINT}
          disabled={!isPlaying}
          onClick={fn.requestHint}
        >
          <Lightbulb />
          {text.actions.hint}
        </Button>
      </div>

      <div
        role="group"
        aria-label={text.board.pad}
        className="grid grid-cols-9 gap-1.5 lg:grid-cols-3"
      >
        {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => {
          const left = 9 - counts[digit];
          return (
            <Button
              key={digit}
              variant="secondary"
              size="lg"
              sound={TSound.PLACE}
              aria-label={text.board.padDigit(digit, Math.max(left, 0))}
              disabled={!isPlaying || (left <= 0 && !noteMode)}
              onClick={() => fn.input(digit)}
              className="relative px-0 text-xl lg:h-14"
            >
              {digit}
              <span
                aria-hidden
                className="absolute right-1 bottom-0.5 text-[10px] text-muted-foreground"
              >
                {Math.max(left, 0)}
              </span>
            </Button>
          );
        })}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={checkMistakes}
          onChange={(event) => fn.setCheckMistakes(event.target.checked)}
        />
        {text.actions.checkMistakes}
      </label>
    </div>
  );
}
