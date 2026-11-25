'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

// `mediaDevices` is missing on plain HTTP and in older browsers, whatever the types say.
const hasCamera = () =>
  typeof (navigator.mediaDevices as MediaDevices | undefined)?.getUserMedia == 'function';

/** Frames are read at this size (shorter side): enough for 9 stickers, cheap to sample. */
const FRAME_SIDE = 360;

/**
 * The device camera shown in `video` (the back camera on phones), and a way to read the current
 * frame's pixels. The stream stops when the component unmounts.
 */
export function useCamera(video: RefObject<HTMLVideoElement | null>) {
  // Without camera support (or on plain HTTP) there is nothing to start.
  const [status, setStatus] = useState<'starting' | 'ready' | 'error'>(() =>
    hasCamera() ? 'starting' : 'error'
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;
    if (!hasCamera()) return;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      })
      .then(async (media) => {
        stream = media;
        if (cancelled || !video.current) return media.getTracks().forEach((t) => t.stop());
        video.current.srcObject = media;
        await video.current.play();
        if (!cancelled) setStatus('ready');
      })
      .catch((error) => {
        console.warn('[rubik] camera unavailable', error);
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [video]);

  /** The current frame, scaled down, or null before the first frame. */
  const grab = useCallback(() => {
    const element = video.current;
    if (!element || !element.videoWidth) return null;
    const scale = FRAME_SIDE / Math.min(element.videoWidth, element.videoHeight);
    const width = Math.round(element.videoWidth * scale);
    const height = Math.round(element.videoHeight * scale);
    canvasRef.current ??= document.createElement('canvas');
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(element, 0, 0, width, height);
    return context.getImageData(0, 0, width, height);
  }, [video]);

  return { status, grab };
}
