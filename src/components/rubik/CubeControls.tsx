'use client';

import { Pause, Play, SkipBack, SkipForward, StepBack, StepForward } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { cn } from 'src/lib/utils';
import { TTwistySpeed, TTwistyTimeline, TWISTY_SPEEDS } from './useTwistyPlayer';

export type TCubeControlLabels = {
  play: string;
  pause: string;
  replay: string;
  toStart: string;
  toEnd: string;
  stepBack: string;
  stepForward: string;
  progress: string;
  speed: string;
  moves: string;
};

type TProps = {
  moves: Array<string>;
  timeline: TTwistyTimeline;
  isPlaying: boolean;
  speed: TTwistySpeed;
  labels: TCubeControlLabels;
  onTogglePlay: () => void;
  onStep: (direction: 1 | -1) => void;
  onSeek: (timestamp: number) => void;
  onJumpToMove: (index: number) => void;
  onToStart: () => void;
  onToEnd: () => void;
  onSpeed: (speed: TTwistySpeed) => void;
};

/**
 * Controls under the 3D cube: the algorithm's moves (the next one highlighted, each one a jump),
 * a progress bar to scrub, play and step buttons, and the speed.
 */
export default function CubeControls({
  moves,
  timeline,
  isPlaying,
  speed,
  labels,
  onTogglePlay,
  onStep,
  onSeek,
  onJumpToMove,
  onToStart,
  onToEnd,
  onSpeed,
}: TProps) {
  const progress = timeline.end > 0 ? (timeline.timestamp / timeline.end) * 100 : 0;
  const nextSpeed = TWISTY_SPEEDS[(TWISTY_SPEEDS.indexOf(speed) + 1) % TWISTY_SPEEDS.length];

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card/60 p-3 backdrop-blur">
      <ol aria-label={labels.moves} className="flex flex-wrap gap-1 font-mono text-sm">
        {moves.map((move, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onJumpToMove(index)}
              aria-current={index == timeline.moveIndex ? 'step' : undefined}
              className={cn(
                'min-w-8 rounded-md px-1.5 py-0.5 transition-colors',
                index < timeline.moveIndex && 'text-foreground',
                index == timeline.moveIndex && 'bg-primary text-primary-foreground',
                index > timeline.moveIndex && 'text-muted-foreground hover:bg-muted'
              )}
            >
              {move}
            </button>
          </li>
        ))}
      </ol>

      <input
        type="range"
        min={0}
        max={timeline.end}
        step={1}
        value={timeline.timestamp}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label={labels.progress}
        style={{ '--progress': `${progress}%` } as React.CSSProperties}
        className={cn(
          'h-1.5 w-full cursor-pointer appearance-none rounded-full',
          'bg-[linear-gradient(to_right,var(--primary)_var(--progress),var(--muted)_var(--progress))]',
          '[&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
          '[&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-background',
          '[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0',
          '[&::-moz-range-thumb]:bg-primary'
        )}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <IconButton label={labels.toStart} onClick={onToStart} disabled={timeline.atStart}>
            <SkipBack />
          </IconButton>
          <IconButton
            label={labels.stepBack}
            onClick={() => onStep(-1)}
            disabled={timeline.atStart}
          >
            <StepBack />
          </IconButton>
          <Button
            size="icon"
            className="rounded-full"
            onClick={onTogglePlay}
            aria-label={isPlaying ? labels.pause : timeline.atEnd ? labels.replay : labels.play}
          >
            {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
          </Button>
          <IconButton
            label={labels.stepForward}
            onClick={() => onStep(1)}
            disabled={timeline.atEnd}
          >
            <StepForward />
          </IconButton>
          <IconButton label={labels.toEnd} onClick={onToEnd} disabled={timeline.atEnd}>
            <SkipForward />
          </IconButton>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="font-mono tabular-nums"
          onClick={() => onSpeed(nextSpeed)}
          aria-label={`${labels.speed}: ${speed}×`}
        >
          {speed}×
        </Button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  children,
  ...props
}: { label: string } & React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </Button>
  );
}
