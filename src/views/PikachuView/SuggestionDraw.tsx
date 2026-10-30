import { usePikachuStore } from 'src/states/pikachu.state';

type TProps = {
  size: number;
};

export default function SuggestionDraw({ size }: TProps) {
  const suggestion = usePikachuStore((state) => state.suggestion);
  const firstPiece = suggestion[0];
  const secondPiece = suggestion[suggestion.length - 1];

  return (
    <div className="pointer-events-none">
      <div
        style={{ width: size, height: size, left: firstPiece[1] * size, top: firstPiece[0] * size }}
        className="animate-pulse-soft border-primary absolute rounded-lg border shadow-md"
      />
      <div
        style={{
          width: size,
          height: size,
          left: secondPiece[1] * size,
          top: secondPiece[0] * size,
        }}
        className="animate-pulse-soft border-primary absolute rounded-lg border shadow-md"
      />
    </div>
  );
}
