import { memo } from 'react';
import { PIKACHU_URL } from 'src/configs/pikachu.constance';
import { cn } from 'src/lib/utils';
import { TPikachuImg } from 'src/types/pikachu.type';

type TProps = {
  row: number;
  column: number;
  size: number;
  value: number;
  imgType: TPikachuImg;
  isSelected: boolean;
  onPieceClick: (row: number, column: number) => void;
};

// Memoized so a click only re-renders the cells whose props actually changed.
function PikachuCell({ row, column, size, value, imgType, isSelected, onPieceClick }: TProps) {
  const hasPiece = value > 0;

  return (
    <div
      style={{ width: size - 1, height: size - 1 }}
      className={cn(
        'relative overflow-hidden rounded-md border',
        hasPiece
          ? 'bg-card cursor-pointer shadow-xs transition-transform duration-150 hover:z-10 hover:-translate-y-px hover:scale-105 active:scale-95'
          : 'border-none',
        isSelected && 'ring-primary z-10 ring-2'
      )}
      onClick={() => onPieceClick(row, column)}
    >
      {hasPiece && (
        <img
          src={imgType == 'external' ? `${PIKACHU_URL}/${value}.png` : `/pikachu/piece${value}.png`}
          alt={`Piece ${value}, row ${row}, column ${column}`}
          draggable={false}
          decoding="async"
          className="animate-in zoom-in-75 fade-in h-full w-full object-contain p-1 drop-shadow-sm duration-200"
        />
      )}
    </div>
  );
}

export default memo(PikachuCell);
