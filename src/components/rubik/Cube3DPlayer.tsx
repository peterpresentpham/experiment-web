'use client';

import { useEffect, useRef, useState } from 'react';
import { TWISTY_ORIENTATION, twistyAlg, twistyMask } from 'src/lib/cube/twisty';
import type { MaskName } from 'src/lib/cube/render';
import { cn } from 'src/lib/utils';

type TProps = {
  /** Algorithm to play; the player starts from the case it solves and ends solved. */
  alg: string;
  mask?: MaskName;
  className?: string;
  loadingLabel: string;
  errorLabel: string;
};

/**
 * A 3D cube (cubing.js `<twisty-player>`) that plays `alg` move by move, with play, step and
 * scrub controls. The cube can be dragged to look at it from any side. cubing.js is large (it
 * brings its own 3D engine), so it is imported only when a player is first shown.
 */
export default function Cube3DPlayer({ alg, mask, className, loadingLabel, errorLabel }: TProps) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    let player: HTMLElement | undefined;
    import('cubing/twisty')
      .then(({ TwistyPlayer }) => {
        if (cancelled || !host.current) return;
        const stickering = twistyMask(mask);
        player = new TwistyPlayer({
          puzzle: '3x3x3',
          alg: twistyAlg(alg),
          // The setup is where the algorithm ends: the solved cube, yellow on top.
          experimentalSetupAlg: TWISTY_ORIENTATION,
          experimentalSetupAnchor: 'end',
          ...(stickering ? { experimentalStickeringMaskOrbits: stickering } : {}),
          background: 'none',
          controlPanel: 'bottom-row',
          hintFacelets: 'none',
          backView: 'none',
        });
        player.style.width = '100%';
        player.style.height = '100%';
        host.current.replaceChildren(player);
        setStatus('ready');
      })
      .catch((error) => {
        console.error('[rubik] 3D player failed to load', error);
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
      player?.remove();
    };
  }, [alg, mask]);

  return (
    <div className={cn('relative aspect-square w-full max-w-72', className)}>
      <div ref={host} className="size-full" />
      {status != 'ready' && (
        <p className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
          {status == 'loading' ? loadingLabel : errorLabel}
        </p>
      )}
    </div>
  );
}
