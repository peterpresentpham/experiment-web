import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { sudokuMessages } from 'src/i18n/messages/sudoku';
import { describeSudokuStep, sudokuCellName } from 'src/services/sudoku/describe.utils';
import { useSudokuStore } from 'src/states/sudoku.state';

export default function SudokuHintPanel() {
  const text = useMessages(sudokuMessages);
  const { hint, fn } = useSudokuStore();
  if (!hint) return null;

  return (
    <section
      aria-live="polite"
      className="flex flex-col gap-2 rounded-xl border bg-card p-3 text-sm"
    >
      <h2 className="font-semibold">{text.hint.title}</h2>
      {hint.type === 'mistake' && <p>{text.hint.mistake(hint.cells.map(sudokuCellName))}</p>}
      {hint.type === 'reveal' && <p>{text.hint.reveal(sudokuCellName(hint.cell), hint.digit)}</p>}
      {hint.type === 'steps' && (
        <ol className="flex flex-col gap-2">
          {hint.steps.map((step, index) => (
            <li key={index}>
              {text.hint.step(
                index + 1,
                text.techniques[step.technique],
                text.explain[step.technique](
                  describeSudokuStep(step, (kind, unitIndex) => text.units[kind](unitIndex))
                )
              )}
            </li>
          ))}
        </ol>
      )}
      <div className="flex gap-2">
        {hint.type === 'reveal' && (
          <Button size="sm" onClick={fn.applyReveal}>
            {text.actions.reveal}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={fn.clearHint}>
          {text.actions.dismiss}
        </Button>
      </div>
    </section>
  );
}
