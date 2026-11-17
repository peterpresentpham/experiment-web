import { useId } from 'react';
import { CubeState } from 'src/lib/cube/cube';
import { BODY_COLOR, llArrows, MaskName, stickerFill } from 'src/lib/cube/render';
import { cn } from 'src/lib/utils';

type Props = {
  state: CubeState;
  mask?: MaskName;
  arrows?: boolean;
  size?: number;
  className?: string;
  title?: string;
};

const CELL = 0.92;
const SIDE = 0.34;
const RING = 1.5 + 0.08 + SIDE / 2;

/** Top-down view of the last layer: the U face plus the top row of each side. */
export default function CubeTop({
  state,
  mask = 'none',
  arrows = false,
  size = 110,
  className,
  title,
}: Props) {
  const id = useId().replace(/:/g, '');
  const top = state.filter((s) => s.pos[1] === 1);
  const rects = top.map((s) => {
    const [x, , z] = s.pos;
    const fill = stickerFill(s, mask);
    const key = `${s.pos}|${s.normal}`;
    if (s.normal[1] === 1) {
      return { key, fill, x: x - CELL / 2, y: z - CELL / 2, w: CELL, h: CELL };
    }
    // Side stickers sit in a thin ring around the U face.
    const [nx, , nz] = s.normal;
    const cx = nx !== 0 ? nx * RING : x;
    const cy = nz !== 0 ? nz * RING : z;
    const w = nx !== 0 ? SIDE : CELL;
    const h = nz !== 0 ? SIDE : CELL;
    return { key, fill, x: cx - w / 2, y: cy - h / 2, w, h };
  });
  const list = arrows ? llArrows(state) : [];

  const shorten = (from: [number, number], to: [number, number], d: number) => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.hypot(dx, dy);
    return {
      x1: from[0] + (dx / len) * d,
      y1: from[1] + (dy / len) * d,
      x2: to[0] - (dx / len) * d,
      y2: to[1] - (dy / len) * d,
    };
  };

  return (
    <svg
      viewBox="-2.15 -2.15 4.3 4.3"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role="img"
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <defs>
        <marker
          id={`ah-${id}`}
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={BODY_COLOR} />
        </marker>
      </defs>
      <rect x={-1.55} y={-1.55} width={3.1} height={3.1} rx={0.12} fill={BODY_COLOR} />
      {rects.map((r) => (
        <rect
          key={r.key}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          rx={0.08}
          fill={r.fill}
          stroke={BODY_COLOR}
          strokeWidth={0.04}
        />
      ))}
      {list.map((a) => {
        const l = shorten(a.from, a.to, 0.22);
        return (
          <line
            key={`${a.from}-${a.to}`}
            {...l}
            stroke={BODY_COLOR}
            strokeWidth={0.09}
            strokeLinecap="round"
            markerEnd={`url(#ah-${id})`}
            markerStart={a.both ? `url(#ah-${id})` : undefined}
          />
        );
      })}
    </svg>
  );
}
