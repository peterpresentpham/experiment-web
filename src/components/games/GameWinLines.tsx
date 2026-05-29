import { cn } from 'src/lib/utils';
import { TCaroWin, TTurn } from 'src/types/caro.type';

interface TProps {
  turn?: TTurn;
  winTypes?: Partial<{ [type in TCaroWin]: boolean }>;
}

export default function GameWinLines({ turn, winTypes }: TProps) {
  return (
    <>
      {winTypes?.horizontal && (
        <div
          className={cn(
            'absolute top-1/2 h-px w-full -translate-y-1/2',
            turn == 0 ? 'bg-chart-1' : 'bg-chart-2'
          )}
        />
      )}
      {winTypes?.vertical && (
        <div
          className={cn(
            'absolute left-1/2 h-full w-px -translate-x-1/2',
            turn == 0 ? 'bg-chart-1' : 'bg-chart-2'
          )}
        />
      )}
      {winTypes?.leftDiagonal && (
        <div
          className={cn(
            'absolute top-1/2 left-1/2 h-px w-[140%] origin-center -translate-1/2 rotate-45',
            turn == 0 ? 'bg-chart-1' : 'bg-chart-2'
          )}
        />
      )}
      {winTypes?.rightDiagonal && (
        <div
          className={cn(
            'absolute top-1/2 left-1/2 h-px w-[140%] origin-center -translate-1/2 -rotate-45',
            turn == 0 ? 'bg-chart-1' : 'bg-chart-2'
          )}
        />
      )}
    </>
  );
}
