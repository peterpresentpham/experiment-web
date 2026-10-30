import { TTurn } from 'src/types/caro.type';
import { cn } from 'src/lib/utils';

type TProps = {
  text: string;
  turn?: TTurn;
  isOver?: boolean;
};

// Announces whose turn it is, and the final result, to assistive tech.
export default function GameStatus({ text, turn, isOver = false }: TProps) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium',
        isOver ? 'bg-success/15 text-success border-transparent' : 'bg-secondary text-foreground'
      )}
    >
      {!isOver && turn != undefined && (
        <span
          aria-hidden
          className={cn('size-2.5 rounded-full', turn == 0 ? 'bg-player-1' : 'bg-player-2')}
        />
      )}
      {text}
    </p>
  );
}
