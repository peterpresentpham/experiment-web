import { useEffect, useState } from 'react';

export const CHESS_SPEEDS = [0.5, 1, 2] as const;
export type TChessSpeed = (typeof CHESS_SPEEDS)[number];

const STEP_MS = 1500;

/** Frame index plus autoplay. Playing from the last frame starts over from the first. */
export function useChessPlayback(frameCount: number) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<TChessSpeed>(1);
  const last = frameCount - 1;

  useEffect(() => {
    if (!playing || index >= last) return;
    const timer = setTimeout(() => {
      setIndex(index + 1);
      if (index + 1 >= last) setPlaying(false);
    }, STEP_MS / speed);
    return () => clearTimeout(timer);
  }, [playing, index, last, speed]);

  function togglePlay() {
    if (playing) return setPlaying(false);
    if (index >= last) setIndex(0);
    setPlaying(true);
  }

  function goTo(next: number) {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(next, last)));
  }

  return { index, playing, speed, setSpeed, togglePlay, goTo };
}
