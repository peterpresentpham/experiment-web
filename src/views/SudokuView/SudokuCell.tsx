import { memo } from 'react';
import { cn } from 'src/lib/utils';
import { digitsOf } from 'src/services/sudoku/units.utils';

type TProps = {
  index: number;
  size: number;
  value: number;
  notes: number;
  isGiven: boolean;
  isSelected: boolean;
  /** Shares a row, column or box with the selected cell. */
  isPeer: boolean;
  /** Holds the same digit as the selected cell. */
  isSameDigit: boolean;
  isConflict: boolean;
  isWrong: boolean;
  isHintCell: boolean;
  isHintTarget: boolean;
  isMistakeHint: boolean;
  /** The digit a note should be highlighted for. */
  highlightDigit: number;
  label: string;
  onSelect: (index: number) => void;
};

function SudokuCell(props: TProps) {
  const {
    index,
    size,
    value,
    notes,
    isGiven,
    isSelected,
    isPeer,
    isSameDigit,
    isConflict,
    isWrong,
    isHintCell,
    isHintTarget,
    isMistakeHint,
    highlightDigit,
    label,
    onSelect,
  } = props;
  const row = Math.floor(index / 9);
  const column = index % 9;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      onClick={() => onSelect(index)}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      className={cn(
        'relative flex items-center justify-center border-r border-b border-border leading-none outline-none focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring',
        column % 3 === 2 && column !== 8 && 'border-r-2 border-r-foreground/60',
        row % 3 === 2 && row !== 8 && 'border-b-2 border-b-foreground/60',
        column === 8 && 'border-r-0',
        row === 8 && 'border-b-0',
        isPeer && 'bg-accent',
        isSameDigit && 'bg-primary/20',
        isHintCell && 'bg-success/25',
        isMistakeHint && 'bg-destructive/25',
        isSelected && 'bg-primary/35',
        isHintTarget && 'ring-2 ring-success ring-inset',
        isGiven ? 'font-semibold text-foreground' : 'text-primary',
        (isConflict || isWrong) && 'text-destructive'
      )}
    >
      {value !== 0 ? (
        value
      ) : notes !== 0 ? (
        <span
          aria-hidden
          className="grid size-full grid-cols-3 grid-rows-3 p-px text-muted-foreground"
          style={{ fontSize: size * 0.24 }}
        >
          {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => (
            <span
              key={digit}
              className={cn(
                'flex items-center justify-center',
                highlightDigit === digit && 'font-bold text-primary'
              )}
            >
              {digitsOf(notes).includes(digit) ? digit : ''}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  );
}

export default memo(SudokuCell);
