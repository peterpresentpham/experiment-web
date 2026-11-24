'use client';

import { Pause, Play, RotateCcw, SkipBack, SkipForward, StepBack, StepForward } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from 'src/components/shadcn/button';
import { buildTimeline, legalTargets } from 'src/services/chess/timeline';
import { cn } from 'src/lib/utils';
import type { TChessExample, TChessPiece } from 'src/types/chess.type';
import Chess3DBoard from './Chess3DBoard';
import { CHESS_SPEEDS, useChessPlayback } from './useChessPlayback';

export type TChessPlayerLabels = {
  play: string;
  pause: string;
  replay: string;
  toStart: string;
  toEnd: string;
  stepBack: string;
  stepForward: string;
  speed: string;
  moves: string;
  startPosition: string;
};

type TProps = { example: TChessExample; labels: TChessPlayerLabels; className?: string };

/**
 * Plays a lesson example on the 3D board, with play/step controls and the list of moves (each one
 * a jump). An example without moves is a still position, optionally with the legal moves of one
 * piece marked.
 */
export default function ChessPlayer({ example, labels, className }: TProps) {
  const frames = useMemo(
    () => buildTimeline(example.fen, example.moves),
    [example.fen, example.moves]
  );
  const { index, playing, speed, setSpeed, togglePlay, goTo } = useChessPlayback(frames.length);
  const frame = frames[index];
  const hasMoves = frames.length > 1;

  const targets = useMemo(
    () => (example.showMovesFrom ? legalTargets(example.fen, example.showMovesFrom) : []),
    [example.fen, example.showMovesFrom]
  );

  // Every piece of the line stays mounted so a captured one can shrink away instead of vanishing.
  const allPieces = useMemo(() => {
    const present = new Set(frame.pieces.map((piece) => piece.id));
    const known = new Map<string, TChessPiece>();
    for (const f of frames) for (const piece of f.pieces) known.set(piece.id, piece);
    for (const piece of frame.pieces) known.set(piece.id, piece);
    return [...known.values()].map((piece) => ({ piece, present: present.has(piece.id) }));
  }, [frames, frame]);

  return (
    <div className={cn('flex w-full max-w-xl flex-col gap-2', className)}>
      <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted/30">
        <Chess3DBoard
          frame={frame}
          allPieces={allPieces}
          targets={index == 0 ? targets : []}
          marks={example.marks ?? []}
          from={index == 0 ? example.showMovesFrom : undefined}
        />
      </div>

      {hasMoves && (
        <>
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label={labels.toStart}
              onClick={() => goTo(0)}
            >
              <SkipBack className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={labels.stepBack}
              disabled={index == 0}
              onClick={() => goTo(index - 1)}
            >
              <StepBack className="size-4" />
            </Button>
            <Button
              size="sm"
              onClick={togglePlay}
              aria-label={
                playing ? labels.pause : index == frames.length - 1 ? labels.replay : labels.play
              }
            >
              {playing ? (
                <Pause className="size-4" />
              ) : index == frames.length - 1 ? (
                <RotateCcw className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
              {playing ? labels.pause : index == frames.length - 1 ? labels.replay : labels.play}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={labels.stepForward}
              disabled={index == frames.length - 1}
              onClick={() => goTo(index + 1)}
            >
              <StepForward className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={labels.toEnd}
              onClick={() => goTo(frames.length - 1)}
            >
              <SkipForward className="size-4" />
            </Button>
            <div className="ml-auto flex items-center gap-1" role="group" aria-label={labels.speed}>
              {CHESS_SPEEDS.map((value) => (
                <Button
                  key={value}
                  variant={speed == value ? 'default' : 'outline'}
                  size="sm"
                  aria-pressed={speed == value}
                  onClick={() => setSpeed(value)}
                >
                  {value}x
                </Button>
              ))}
            </div>
          </div>

          <ol className="flex flex-wrap gap-1 text-sm" aria-label={labels.moves}>
            {frames.map((f, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i == index}
                  className={cn(
                    'rounded px-2 py-0.5 font-mono transition-colors hover:bg-muted',
                    i == index && 'bg-primary text-primary-foreground hover:bg-primary'
                  )}
                >
                  {i == 0 ? labels.startPosition : f.san}
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
