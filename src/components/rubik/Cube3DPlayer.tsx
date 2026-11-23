'use client';

import { useMemo, useRef } from 'react';
import { twistyMoves } from 'src/lib/cube/twisty';
import type { MaskName } from 'src/lib/cube/render';
import { cn } from 'src/lib/utils';
import CubeControls, { TCubeControlLabels } from './CubeControls';
import { useTwistyPlayer } from './useTwistyPlayer';

type TProps = {
  /** Algorithm to play; the player starts from the case it solves and ends solved. */
  alg: string;
  mask?: MaskName;
  className?: string;
  labels: TCubeControlLabels & { loading: string; error: string };
};

/**
 * A 3D cube (cubing.js `<twisty-player>`) that plays `alg` move by move, with its own controls
 * below. The cube can be dragged to look at it from any side.
 */
export default function Cube3DPlayer({ alg, mask, className, labels }: TProps) {
  const host = useRef<HTMLDivElement>(null);
  const player = useTwistyPlayer(host, alg, mask);
  const moves = useMemo(() => twistyMoves(alg), [alg]);

  return (
    <div className={cn('flex w-full max-w-80 flex-col gap-2', className)}>
      <div className="relative aspect-square w-full">
        <div ref={host} className="size-full cursor-grab active:cursor-grabbing" />
        {player.status != 'ready' && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {player.status == 'loading' ? labels.loading : labels.error}
          </p>
        )}
      </div>
      {player.status == 'ready' && (
        <CubeControls
          moves={moves}
          timeline={player.timeline}
          isPlaying={player.isPlaying}
          speed={player.speed}
          labels={labels}
          onTogglePlay={player.togglePlay}
          onStep={player.step}
          onSeek={player.seek}
          onJumpToMove={player.jumpToMove}
          onToStart={player.jumpToStart}
          onToEnd={player.jumpToEnd}
          onSpeed={player.setSpeed}
        />
      )}
    </div>
  );
}
