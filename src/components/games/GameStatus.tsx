import { ReactNode } from 'react';
import { TTurn } from 'src/types/caro.type';
import { cn } from 'src/lib/utils';

type TProps = {
  /** The full sentence, announced to assistive tech. */
  text: string;
  /** A shorter visible text; `text` is then only announced. */
  label?: string;
  turn?: TTurn;
  /** Shown instead of the turn dot, e.g. the side's piece. */
  marker?: ReactNode;
  isOver?: boolean;
};

// Announces whose turn it is, and the final result, to assistive tech.
export default function GameStatus({ text, label, turn, marker, isOver = false }: TProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium',
        isOver ? 'border-transparent bg-success/15 text-success' : 'bg-secondary text-foreground'
      )}
    >
      {!isOver && marker}
      {!isOver && !marker && turn != undefined && (
        <span
          aria-hidden
          className={cn('size-2.5 rounded-full', turn == 0 ? 'bg-player-1' : 'bg-player-2')}
        />
      )}
      {label ? (
        <>
          <span aria-hidden>{label}</span>
          <span className="sr-only">{text}</span>
        </>
      ) : (
        text
      )}
    </p>
  );
}
