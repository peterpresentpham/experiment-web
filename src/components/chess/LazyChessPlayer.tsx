'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { TChessExample } from 'src/types/chess.type';
import type { TChessPlayerLabels } from './ChessPlayer';

// three.js touches `window` and WebGL, so the player never renders on the server.
const ChessPlayer = dynamic(() => import('./ChessPlayer'), { ssr: false });

type TProps = { example: TChessExample; labels: TChessPlayerLabels & { loading: string } };

/**
 * Mounts the 3D player only while it is on screen. A guide page holds many examples and a browser
 * allows only a handful of live WebGL contexts, so off-screen boards are unmounted.
 */
export default function LazyChessPlayer({ example, labels }: TProps) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '200px',
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={host} className="w-full max-w-xl">
      {visible ? (
        <ChessPlayer example={example} labels={labels} />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
          {labels.loading}
        </div>
      )}
    </div>
  );
}
