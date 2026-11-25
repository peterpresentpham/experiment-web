'use client';

import { Camera, RotateCcw, Shuffle, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { useMessages } from 'src/i18n/client';
import { blogMessages } from 'src/i18n/messages/blog';
import { rubikSolverMessages } from 'src/i18n/messages/rubikSolver';
import type { TScanResult } from 'src/lib/cube/color-scan';
import { Face, FACES } from 'src/lib/cube/cube';
import {
  faceletsFromAlg,
  randomScramble,
  solvedFacelets,
  TCubeError,
  TFaceletRef,
  TFacelets,
} from 'src/lib/cube/facelets';
import { STICKER_COLORS } from 'src/lib/cube/render';
import type { TSolveResult } from 'src/lib/cube/solver';
import { solveInWorker, startSolver } from 'src/lib/cube/solver-client';
import { cn } from 'src/lib/utils';
import CubeNet from './CubeNet';

// cubing.js touches `window` and custom elements, so the player and the scanner's camera never
// render on the server.
const Cube3DPlayer = dynamic(() => import('src/components/rubik/Cube3DPlayer'), { ssr: false });
const CubeScanner = dynamic(() => import('./CubeScanner'), { ssr: false });

/** The palette in the order people name a cube's colours. */
const PALETTE: Array<Face> = ['D', 'U', 'F', 'B', 'R', 'L'];

/** Paint (or scan) a cube, solve it, and play the solution on the 3D cube. */
export default function SolverView() {
  const t = useMessages(rubikSolverMessages);
  const { player } = useMessages(blogMessages).rubik;
  const [facelets, setFacelets] = useState<TFacelets>(solvedFacelets);
  const [paint, setPaint] = useState<Face>('D');
  const [uncertain, setUncertain] = useState<Array<TFaceletRef>>([]);
  const [result, setResult] = useState<TSolveResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'solving' | 'failed'>('idle');
  const [isScanning, setScanning] = useState(false);

  // Start the solver (and its tables) while the person paints.
  useEffect(() => void startSolver(), []);

  const load = (next: TFacelets, flagged: Array<TFaceletRef> = []) => {
    setFacelets(next);
    setUncertain(flagged);
    setResult(null);
    setStatus('idle');
  };

  const onPaint = (face: Face, index: number) => {
    const next = { ...facelets, [face]: facelets[face].map((c, i) => (i == index ? paint : c)) };
    load(
      next,
      uncertain.filter((ref) => ref.face != face || ref.index != index)
    );
  };

  const onScanned = ({ facelets: scanned, uncertain: flagged }: TScanResult) => {
    setScanning(false);
    load(scanned, flagged);
  };

  const solve = async () => {
    setStatus('solving');
    try {
      setResult(await solveInWorker(facelets));
      setStatus('idle');
    } catch (error) {
      console.error('[rubik] solver failed', error);
      setStatus('failed');
    }
  };

  const counts = new Map<Face, number>(FACES.map((face) => [face, 0]));
  for (const face of FACES)
    for (const color of facelets[face]) counts.set(color, counts.get(color)! + 1);
  const errors = result && !result.ok ? result.errors : [];
  const wrong = errors.flatMap((error) => ('stickers' in error ? error.stickers : []));
  const message = (error: TCubeError) =>
    error.kind == 'colorCount'
      ? t.errors.colorCount(t.colors[error.color], error.count)
      : t.errors[error.kind];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">{t.title}</h1>
        <p className="mt-3 leading-relaxed">{t.intro}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t.hold}</p>
      </div>

      {isScanning ? (
        <CubeScanner onDone={onScanned} onCancel={() => setScanning(false)} />
      ) : (
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-wrap items-center gap-2"
            role="radiogroup"
            aria-label={t.palette}
          >
            {PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={paint == color}
                onClick={() => setPaint(color)}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-2 py-1 text-sm',
                  paint == color && 'border-foreground bg-muted'
                )}
              >
                <span
                  className="size-5 rounded-xs border"
                  style={{ backgroundColor: STICKER_COLORS[color] }}
                />
                {t.colors[color]}
                <span
                  className={cn(
                    'text-xs text-muted-foreground',
                    counts.get(color) != 9 && 'text-destructive'
                  )}
                >
                  {counts.get(color)}/9
                </span>
              </button>
            ))}
          </div>
          <CubeNet
            facelets={facelets}
            wrong={wrong}
            uncertain={uncertain}
            describe={(color, face, index) => t.sticker(t.colors[color], t.colors[face], index)}
            onPaint={onPaint}
          />
          {uncertain.length > 0 && <p className="text-sm text-muted-foreground">{t.uncertain}</p>}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void solve()} disabled={status == 'solving'}>
              <Sparkles className="size-4" />
              {status == 'solving' ? t.solving : t.solve}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setScanning(true);
              }}
            >
              <Camera className="size-4" />
              {t.scan}
            </Button>
            <Button variant="outline" onClick={() => load(faceletsFromAlg(randomScramble()))}>
              <Shuffle className="size-4" />
              {t.scramble}
            </Button>
            <Button variant="ghost" onClick={() => load(solvedFacelets())}>
              <RotateCcw className="size-4" />
              {t.reset}
            </Button>
          </div>
        </div>
      )}

      {status == 'failed' && <p className="text-sm text-destructive">{t.failed}</p>}
      {errors.length > 0 && (
        <ul className="list-disc space-y-1 pl-6 text-sm text-destructive">
          {errors.map((error, index) => (
            <li key={index}>{message(error)}</li>
          ))}
        </ul>
      )}
      {result?.ok && result.alg == '' && <p className="text-sm">{t.solved}</p>}
      {result?.ok && result.alg != '' && (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{t.solution(result.alg.split(' ').length)}</p>
          <Cube3DPlayer key={result.alg} alg={result.alg} labels={player} />
        </div>
      )}
    </div>
  );
}
