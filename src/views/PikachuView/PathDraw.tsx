import { TPosition } from 'src/types/global';

function getMetadata(fromPosition: TPosition, toPosition: TPosition, size: number) {
  const xDistance = fromPosition[1] - toPosition[1];
  const yDistance = fromPosition[0] - toPosition[0];
  const mode = xDistance != 0 ? 'width' : 'height';
  if (mode == 'width') {
    const _left = Math.min(fromPosition[1], toPosition[1]);
    return {
      left: _left * size + size / 2 - 1,
      top: fromPosition[0] * size + size / 2 - 1,
      width: Math.abs(xDistance) * size + 2,
      height: '2px',
    };
  } else {
    const _top = Math.min(fromPosition[0], toPosition[0]);
    return {
      left: fromPosition[1] * size + size / 2 - 1,
      top: _top * size + size / 2 - 1,
      width: '2px',
      height: Math.abs(yDistance) * size + 2,
    };
  }
}

type TProps = {
  size: number;
  selectedPath: Array<TPosition>;
};

export default function PathDraw({ size, selectedPath }: TProps) {
  return (
    <div className="pointer-events-none">
      {selectedPath.slice(1).map((toPosition, index) => {
        const fromPosition = selectedPath[index];
        const { left, top, width, height } = getMetadata(fromPosition, toPosition, size);

        return (
          <div
            key={index}
            style={{ width, height, left, top }}
            className="bg-primary/70 absolute rounded-full shadow-sm"
          />
        );
      })}
    </div>
  );
}
