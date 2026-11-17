import { CubeState, Vec } from 'src/lib/cube/cube';
import { BODY_COLOR, MaskName, stickerFill } from 'src/lib/cube/render';
import { cn } from 'src/lib/utils';

type Props = {
  state: CubeState;
  mask?: MaskName;
  size?: number;
  className?: string;
  title?: string;
};

const COS30 = Math.cos(Math.PI / 6);

function project([x, y, z]: Vec): string {
  const sx = (x - z) * COS30;
  const sy = (x + z) * 0.5 - y;
  return `${sx.toFixed(3)},${sy.toFixed(3)}`;
}

function quad(pos: Vec, normal: Vec, half: number): string {
  const axis = normal.findIndex((v) => v !== 0);
  const [a, b] = [0, 1, 2].filter((i) => i !== axis);
  const center: Vec = [0, 1, 2].map((i) => pos[i] + normal[i] * 0.5) as Vec;
  return [
    [half, half],
    [half, -half],
    [-half, -half],
    [-half, half],
  ]
    .map(([da, db]) => {
      const p: Vec = [...center];
      p[a] += da;
      p[b] += db;
      return project(p);
    })
    .join(' ');
}

/** Isometric view of the cube showing the U, F and R faces. */
export default function CubeIso({ state, mask = 'none', size = 120, className, title }: Props) {
  const visible = state.filter((s) => s.normal[0] === 1 || s.normal[1] === 1 || s.normal[2] === 1);
  return (
    <svg
      viewBox="-2.75 -3.15 5.5 6.3"
      width={size}
      height={(size * 6.3) / 5.5}
      className={cn('shrink-0', className)}
      role="img"
      aria-label={title}
    >
      {title && <title>{title}</title>}
      {visible.map((s) => (
        <g key={`${s.pos}|${s.normal}`}>
          <polygon points={quad(s.pos, s.normal, 0.5)} fill={BODY_COLOR} />
          <polygon
            points={quad(s.pos, s.normal, 0.42)}
            fill={stickerFill(s, mask)}
            stroke={BODY_COLOR}
            strokeWidth={0.02}
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
