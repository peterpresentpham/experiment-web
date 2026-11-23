'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import type { TwistyPlayer } from 'cubing/twisty';
import { TWISTY_ORIENTATION, twistyAlg, twistyMask } from 'src/lib/cube/twisty';
import { nextMoveIndex, stepOrigin, TMoveTimes } from 'src/lib/cube/twisty-timeline';
import type { MaskName } from 'src/lib/cube/render';

type TModel = TwistyPlayer['experimentalModel'];
type TIndexer = Awaited<ReturnType<TModel['indexer']['get']>>;
// cubing.js brands its numbers; these are plain milliseconds and move indexes.
type TTimestamp = Parameters<TModel['timestampRequest']['set']>[0];
type TLeafIndex = Parameters<TIndexer['indexToMoveStartTimestamp']>[0];

export type TTwistyTimeline = {
  timestamp: number;
  end: number;
  atStart: boolean;
  atEnd: boolean;
  /** The move about to play (or playing); the move count once at the end. */
  moveIndex: number;
};

export const TWISTY_SPEEDS = [0.5, 1, 2] as const;
export type TTwistySpeed = (typeof TWISTY_SPEEDS)[number];

/** One frame: how long cubing.js takes to apply a new time. */
const SEEK_SETTLE_MS = 16;

const START: TTwistyTimeline = { timestamp: 0, end: 0, atStart: true, atEnd: false, moveIndex: 0 };

/**
 * A cubing.js `<twisty-player>` without its own controls, mounted in `host`, with its timeline
 * as React state and the actions a control bar needs. cubing.js is large (it brings its own 3D
 * engine), so it is imported only when a player is first shown.
 */
export function useTwistyPlayer(
  host: RefObject<HTMLDivElement | null>,
  alg: string,
  mask?: MaskName
) {
  const playerRef = useRef<TwistyPlayer | null>(null);
  const indexerRef = useRef<TIndexer | null>(null);
  const movesRef = useRef<TMoveTimes>({ starts: [], ends: [] });
  const timestampRef = useRef(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [timeline, setTimeline] = useState<TTwistyTimeline>(START);
  const [isPlaying, setPlaying] = useState(false);
  const [speed, setSpeedState] = useState<TTwistySpeed>(1);
  // A new algorithm keeps the speed the viewer picked.
  const speedRef = useRef<TTwistySpeed>(1);

  useEffect(() => {
    let cancelled = false;
    let detach = () => {};
    import('cubing/twisty')
      .then(({ TwistyPlayer }) => {
        if (cancelled || !host.current) return;
        const stickering = twistyMask(mask);
        const player = new TwistyPlayer({
          puzzle: '3x3x3',
          alg: twistyAlg(alg),
          // The setup is where the algorithm ends: the solved cube, yellow on top.
          experimentalSetupAlg: TWISTY_ORIENTATION,
          experimentalSetupAnchor: 'end',
          ...(stickering ? { experimentalStickeringMaskOrbits: stickering } : {}),
          background: 'none',
          controlPanel: 'none',
          hintFacelets: 'none',
          backView: 'none',
        });
        player.style.width = '100%';
        player.style.height = '100%';
        host.current.replaceChildren(player);
        playerRef.current = player;

        const model = player.experimentalModel;
        model.tempoScale.set(speedRef.current);
        const onIndexer = (indexer: TIndexer) => {
          indexerRef.current = indexer;
          const indexes = [...Array(indexer.numAnimatedLeaves()).keys()] as Array<TLeafIndex>;
          const starts = indexes.map((index) => indexer.indexToMoveStartTimestamp(index));
          movesRef.current = {
            starts,
            ends: indexes.map((index, i) => starts[i] + indexer.moveDuration(index)),
          };
        };
        const onTimeline = (info: Awaited<ReturnType<TModel['detailedTimelineInfo']['get']>>) => {
          timestampRef.current = info.timestamp;
          setTimeline({
            timestamp: info.timestamp,
            end: info.timeRange.end,
            atStart: info.atStart,
            atEnd: info.atEnd,
            moveIndex: info.atEnd
              ? movesRef.current.ends.length
              : nextMoveIndex(movesRef.current, info.timestamp),
          });
        };
        const onPlaying = (info: { playing: boolean }) => setPlaying(info.playing);
        model.indexer.addFreshListener(onIndexer);
        model.detailedTimelineInfo.addFreshListener(onTimeline);
        model.coarseTimelineInfo.addFreshListener(onPlaying);
        detach = () => {
          model.indexer.removeFreshListener(onIndexer);
          model.detailedTimelineInfo.removeFreshListener(onTimeline);
          model.coarseTimelineInfo.removeFreshListener(onPlaying);
        };
        setStatus('ready');
      })
      .catch((error) => {
        console.error('[rubik] 3D player failed to load', error);
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
      detach();
      playerRef.current?.remove();
      playerRef.current = null;
      indexerRef.current = null;
      movesRef.current = { starts: [], ends: [] };
      timestampRef.current = 0;
      // The next algorithm's player starts loading from the beginning.
      setStatus('loading');
      setTimeline(START);
    };
  }, [host, alg, mask]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    // Playing again from the end replays the algorithm.
    if (!isPlaying && timeline.atEnd) player.jumpToStart();
    player.togglePlay();
  }, [isPlaying, timeline.atEnd]);

  /** One move forwards (1) or backwards (-1). */
  const step = useCallback((direction: 1 | -1) => {
    const player = playerRef.current;
    if (!player) return;
    const model = player.experimentalModel;
    const play = () =>
      model.playingInfo.set({ playing: true, direction, untilBoundary: 'move', loop: false });
    const origin = stepOrigin(movesRef.current, timestampRef.current, direction);
    if (origin == timestampRef.current) return play();
    // A move is still playing: stop it at its boundary first. cubing.js applies the new time on
    // its next frame; a step asked for before then would still stop at the old boundary.
    player.pause();
    model.timestampRequest.set(origin as TTimestamp);
    setTimeout(play, SEEK_SETTLE_MS);
  }, []);

  const seek = useCallback((timestamp: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.pause();
    player.experimentalModel.timestampRequest.set(timestamp as TTimestamp);
  }, []);

  /** Shows the cube just before move `index`. */
  const jumpToMove = useCallback(
    (index: number) => {
      const indexer = indexerRef.current;
      if (indexer) seek(indexer.indexToMoveStartTimestamp(index as TLeafIndex));
    },
    [seek]
  );

  const setSpeed = useCallback((value: TTwistySpeed) => {
    playerRef.current?.experimentalModel.tempoScale.set(value);
    speedRef.current = value;
    setSpeedState(value);
  }, []);

  return {
    status,
    timeline,
    isPlaying,
    speed,
    togglePlay,
    step,
    seek,
    jumpToMove,
    setSpeed,
    jumpToStart: () => playerRef.current?.jumpToStart(),
    jumpToEnd: () => playerRef.current?.jumpToEnd(),
  };
}
