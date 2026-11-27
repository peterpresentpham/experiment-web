'use client';

import { Pause, Play, RotateCcw, SkipBack, SkipForward, StepBack, StepForward } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { caroGuideMessages } from 'src/i18n/messages/caroGuide';
import { cn } from 'src/lib/utils';
import {
  buildFrames,
  cellName,
  columnName,
  parseCell,
  TCaroGuideExample,
  viewWindow,
} from 'src/services/caro-guide/board';

const STEP_MS = 900;

type TProps = { example: TCaroGuideExample };

/**
 * A part of the caro board around an example, with its moves played one at a time. Column
 * letters and row numbers on the edges match the cell names the text uses.
 */
export default function CaroGuideBoard({ example }: TProps) {
  const t = useMessages(caroGuideMessages).board;
  const frames = useMemo(() => buildFrames(example), [example]);
  const view = useMemo(() => viewWindow(example), [example]);
  const marks = useMemo(
    () => new Set((example.marks ?? []).map((name) => parseCell(name, example.size))),
    [example]
  );
  const last = frames.length - 1;
  const [index, setIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setIndex((value) => Math.min(value + 1, last));
      if (index + 1 >= last) setPlaying(false);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [isPlaying, index, last]);

  const goTo = (next: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(next, last)));
  };
  const togglePlay = () => {
    if (isPlaying) return setPlaying(false);
    if (index >= last) setIndex(0);
    setPlaying(true);
  };

  const frame = frames[index];
  const win = new Set(frame.win);
  const range = [...Array(view.side).keys()];

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <div
        className="grid w-full rounded-md border bg-muted/30 p-1 text-xs select-none"
        style={{ gridTemplateColumns: `auto repeat(${view.side}, minmax(0, 1fr))` }}
      >
        <span />
        {range.map((k) => (
          <span key={k} className="text-center text-muted-foreground">
            {columnName(view.column + k)}
          </span>
        ))}
        {range.map((r) => {
          const row = view.row + r;
          return [
            <span key={`row-${row}`} className="flex items-center pr-1 text-muted-foreground">
              {row + 1}
            </span>,
            ...range.map((c) => {
              const cell = row * example.size + view.column + c;
              const stone = frame.stones.get(cell);
              const number = frame.numbers.get(cell);
              const label = stone ? t[stone] : '';
              return (
                <div
                  key={cell}
                  role="img"
                  aria-label={t.cell(cellName(cell, example.size), label, number)}
                  className={cn(
                    'relative flex aspect-square items-center justify-center border border-border/60 bg-background text-sm font-bold sm:text-base',
                    stone == 'x' && 'text-player-1',
                    stone == 'o' && 'text-player-2',
                    frame.last == cell && 'bg-amber-200/60 dark:bg-amber-500/30',
                    win.has(cell) && 'bg-emerald-300/60 dark:bg-emerald-500/40',
                    marks.has(cell) && 'ring-2 ring-destructive ring-inset'
                  )}
                >
                  {stone?.toUpperCase()}
                  {number && (
                    <span className="absolute right-0.5 bottom-0 origin-bottom-right scale-75 text-xs leading-none font-normal text-muted-foreground">
                      {number}
                    </span>
                  )}
                </div>
              );
            }),
          ];
        })}
      </div>
      {last > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="icon" aria-label={t.toStart} onClick={() => goTo(0)}>
            <SkipBack className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.stepBack}
            onClick={() => goTo(index - 1)}
          >
            <StepBack className="size-4" />
          </Button>
          <Button
            size="icon"
            aria-label={isPlaying ? t.pause : index >= last ? t.replay : t.play}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : index >= last ? (
              <RotateCcw className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.stepForward}
            onClick={() => goTo(index + 1)}
          >
            <StepForward className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t.toEnd} onClick={() => goTo(last)}>
            <SkipForward className="size-4" />
          </Button>
          <span className="ml-2 text-sm text-muted-foreground" aria-live="polite">
            {index == 0 ? t.start : t.position(index, last)}
          </span>
        </div>
      )}
    </div>
  );
}
