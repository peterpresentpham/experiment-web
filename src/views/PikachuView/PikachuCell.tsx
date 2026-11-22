import { memo } from 'react';
import { pikachuPieceSrc } from 'src/configs/pikachu.constance';
import { useMessages } from 'src/i18n/client';
import { pikachuMessages } from 'src/i18n/messages/pikachu';
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
  const { piece } = useMessages(pikachuMessages);

  return (
    <div
      style={{ width: size - 1, height: size - 1 }}
      className={cn(
        'relative overflow-hidden rounded-md border',
        hasPiece
          ? 'cursor-pointer bg-card shadow-xs transition-transform duration-150 hover:z-10 hover:-translate-y-px hover:scale-105 active:scale-95'
          : 'border-none',
        isSelected && 'z-10 ring-2 ring-primary'
      )}
      onClick={() => onPieceClick(row, column)}
    >
      {hasPiece && (
        <img
          src={pikachuPieceSrc(imgType, value)}
          alt={piece(value, row, column)}
          draggable={false}
          decoding="async"
          className="h-full w-full animate-in object-contain p-1 drop-shadow-sm duration-200 zoom-in-75 fade-in"
        />
      )}
    </div>
  );
}

export default memo(PikachuCell);
