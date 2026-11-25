'use client';

import { Camera, Undo2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { rubikSolverMessages } from 'src/i18n/messages/rubikSolver';
import {
  classifyStickers,
  guideRegion,
  sampleFace,
  TRgb,
  TScanResult,
} from 'src/lib/cube/color-scan';
import type { Face } from 'src/lib/cube/cube';
import { STICKER_COLORS } from 'src/lib/cube/render';
import { useCamera } from './useCamera';

/** The side faces in turn (yellow on top), then the top and the bottom. */
const SCAN_ORDER: Array<Face> = ['F', 'R', 'B', 'L', 'U', 'D'];
/** The guide's share of the preview's width; it matches the overlay's `inset-1/8`. */
const GUIDE = 0.75;
const PREVIEW_MS = 250;

const css = ([r, g, b]: TRgb) => `rgb(${r} ${g} ${b})`;

type TProps = { onDone: (result: TScanResult) => void; onCancel: () => void };

/**
 * Takes a picture of each face through a 3x3 guide over the camera preview. The guide's cells
 * show the colours read live, so the cube can be lined up before each capture.
 */
export default function CubeScanner({ onDone, onCancel }: TProps) {
  const t = useMessages(rubikSolverMessages).scanner;
  const video = useRef<HTMLVideoElement>(null);
  const camera = useCamera(video);
  const [samples, setSamples] = useState<Partial<Record<Face, Array<TRgb>>>>({});
  const [live, setLive] = useState<Array<TRgb> | null>(null);
  const step = SCAN_ORDER.findIndex((face) => !samples[face]);
  const face = SCAN_ORDER[step];

  const read = () => {
    const frame = camera.grab();
    if (!frame) return null;
    const { x, y, size } = guideRegion(frame.width, frame.height, GUIDE);
    return sampleFace(frame, x, y, size);
  };

  useEffect(() => {
    if (camera.status != 'ready') return;
    const timer = setInterval(() => setLive(read()), PREVIEW_MS);
    return () => clearInterval(timer);
    // `read` only reads refs through `camera.grab`, which is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera.status]);

  const capture = () => {
    const colors = read();
    if (!colors || !face) return;
    const next = { ...samples, [face]: colors };
    if (SCAN_ORDER.every((f) => next[f]))
      onDone(classifyStickers(next as Record<Face, Array<TRgb>>));
    else setSamples(next);
  };

  const retake = () => {
    const previous = SCAN_ORDER[step - 1];
    if (!previous) return;
    const next = { ...samples };
    delete next[previous];
    setSamples(next);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{t.title}</p>
        <p className="text-sm text-muted-foreground">{t.step(step + 1, SCAN_ORDER.length)}</p>
      </div>
      <p className="flex items-center gap-2 text-sm">
        <span
          className="size-4 shrink-0 rounded-xs border"
          style={{ backgroundColor: STICKER_COLORS[face] }}
        />
        {t.faces[face]}
      </p>
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-black">
        <video ref={video} muted playsInline className="size-full object-cover" />
        {camera.status == 'ready' && (
          <div className="absolute inset-1/8 grid grid-cols-3 grid-rows-3 gap-1">
            {Array.from({ length: 9 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-center rounded-sm border-2 border-white/80"
              >
                {live && (
                  <span
                    className="size-1/3 rounded-full border border-white"
                    style={{ backgroundColor: css(live[index]) }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {camera.status != 'ready' && (
          <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white">
            {camera.status == 'starting' ? t.starting : t.cameraError}
          </p>
        )}
      </div>
      <div className="flex gap-1">
        {SCAN_ORDER.map((f) => (
          <div key={f} className="grid flex-1 grid-cols-3 gap-px rounded-xs border p-px">
            {Array.from({ length: 9 }, (_, index) => (
              <span
                key={index}
                className="aspect-square bg-muted"
                style={samples[f] ? { backgroundColor: css(samples[f][index]) } : undefined}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={capture} disabled={camera.status != 'ready'}>
          <Camera className="size-4" />
          {t.capture}
        </Button>
        <Button variant="outline" onClick={retake} disabled={step == 0}>
          <Undo2 className="size-4" />
          {t.retake}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          <X className="size-4" />
          {t.cancel}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t.privacy}</p>
    </div>
  );
}
