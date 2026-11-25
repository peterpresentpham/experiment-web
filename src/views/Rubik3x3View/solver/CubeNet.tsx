'use client';

import type { Face } from 'src/lib/cube/cube';
import type { TFaceletRef, TFacelets } from 'src/lib/cube/facelets';
import { STICKER_COLORS } from 'src/lib/cube/render';
import { cn } from 'src/lib/utils';

/** The unfolded cube: U above F; L, F, R, B in a row; D below F. */
const NET: Array<{ face: Face; className: string }> = [
  { face: 'U', className: 'col-start-2 row-start-1' },
  { face: 'L', className: 'col-start-1 row-start-2' },
  { face: 'F', className: 'col-start-2 row-start-2' },
  { face: 'R', className: 'col-start-3 row-start-2' },
  { face: 'B', className: 'col-start-4 row-start-2' },
  { face: 'D', className: 'col-start-2 row-start-3' },
];

const has = (refs: Array<TFaceletRef>, face: Face, index: number) =>
  refs.some((ref) => ref.face == face && ref.index == index);

type TProps = {
  facelets: TFacelets;
  /** Stickers of a piece that cannot exist, ringed in red. */
  wrong: Array<TFaceletRef>;
  /** Stickers whose scanned colour was a close call, with a dashed border. */
  uncertain: Array<TFaceletRef>;
  describe: (color: Face, face: Face, index: number) => string;
  onPaint: (face: Face, index: number) => void;
};

/** The cube as a net of 54 stickers; tapping a sticker paints it (centres stay fixed). */
export default function CubeNet({ facelets, wrong, uncertain, describe, onPaint }: TProps) {
  return (
    <div className="grid w-full max-w-md grid-cols-4 grid-rows-3 gap-1">
      {NET.map(({ face, className }) => (
        <div
          key={face}
          className={cn('grid grid-cols-3 gap-0.5 rounded-sm bg-zinc-900 p-0.5', className)}
        >
          {facelets[face].map((color, index) => (
            <button
              key={index}
              type="button"
              disabled={index == 4}
              aria-label={describe(color, face, index)}
              onClick={() => onPaint(face, index)}
              style={{ backgroundColor: STICKER_COLORS[color] }}
              className={cn(
                'aspect-square rounded-xs border-2 border-transparent transition-transform enabled:hover:scale-105',
                index == 4 && 'cursor-default',
                has(uncertain, face, index) && 'border-dashed border-zinc-900',
                has(wrong, face, index) && 'ring-2 ring-destructive ring-offset-1'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
