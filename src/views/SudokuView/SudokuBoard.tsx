import { useCallback, useMemo } from 'react';
import useFitBoard from 'src/hooks/useFitBoard';
import { useMessages } from 'src/i18n/client';
import { sudokuMessages } from 'src/i18n/messages/sudoku';
import { findConflicts } from 'src/services/sudoku/game.utils';
import { boxOf, columnOf, digitsOf, rowOf } from 'src/services/sudoku/units.utils';
import { useSudokuStore } from 'src/states/sudoku.state';
import SudokuCell from './SudokuCell';

const MAX_CELL_SIZE = 64;

export default function SudokuBoard() {
  const text = useMessages(sudokuMessages);
  const { board, givens, solution, selected, checkMistakes, hint, status, fn } = useSudokuStore();
  const { ref, size } = useFitBoard(
    useCallback(
      (width, height) => Math.min(Math.floor(Math.min(width, height) / 9), MAX_CELL_SIZE),
      []
    ),
    MAX_CELL_SIZE
  );

  const conflicts = useMemo(() => findConflicts(board.values), [board.values]);
  const hintCells = useMemo(() => {
    if (hint?.type === 'steps') return new Set(hint.steps.flatMap((step) => step.cells));
    return new Set<number>();
  }, [hint]);
  const mistakeCells = useMemo(() => new Set(hint?.type === 'mistake' ? hint.cells : []), [hint]);
  const hintTarget =
    hint?.type === 'steps'
      ? (hint.steps[hint.steps.length - 1].placement?.cell ?? null)
      : hint?.type === 'reveal'
        ? hint.cell
        : null;

  const selectedValue = selected === null ? 0 : board.values[selected];

  return (
    <div
      ref={ref}
      className="flex aspect-square w-full max-w-xl items-center justify-center self-center"
    >
      <div
        role="group"
        aria-label={text.board.label}
        className="grid overflow-hidden rounded-lg border-2 border-foreground/60 bg-card"
        style={{ gridTemplateColumns: `repeat(9, ${size}px)` }}
      >
        {board.values.map((value, index) => {
          const isGiven = givens[index] !== 0;
          return (
            <SudokuCell
              key={index}
              index={index}
              size={size}
              value={value}
              notes={board.notes[index]}
              isGiven={isGiven}
              isSelected={selected === index}
              isPeer={
                selected !== null &&
                selected !== index &&
                (rowOf(selected) === rowOf(index) ||
                  columnOf(selected) === columnOf(index) ||
                  boxOf(selected) === boxOf(index))
              }
              isSameDigit={selectedValue !== 0 && selected !== index && value === selectedValue}
              isConflict={conflicts.has(index)}
              isWrong={checkMistakes && !isGiven && value !== 0 && value !== solution[index]}
              isHintCell={hintCells.has(index)}
              isHintTarget={hintTarget === index}
              isMistakeHint={mistakeCells.has(index)}
              highlightDigit={selectedValue}
              label={
                value !== 0
                  ? text.board.cell(rowOf(index) + 1, columnOf(index) + 1, value, isGiven)
                  : text.board.emptyCell(
                      rowOf(index) + 1,
                      columnOf(index) + 1,
                      digitsOf(board.notes[index])
                    )
              }
              onSelect={status === 'playing' ? fn.select : () => {}}
            />
          );
        })}
      </div>
    </div>
  );
}
