'use client';

import { motion } from 'motion/react';
import { useRef } from 'react';
import { PIKACHU_URL } from 'src/configs/pikachu.constance';
import { cn } from 'src/lib/utils';
import { usePikachuStateMachine } from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPosition } from 'src/types/global';
import { PikachuMachineEvent, PikachuMachineState } from 'src/types/pikachu.type';
import PathDraw from './PathDraw';
import SuggestionDraw from './SuggestionDraw';

type TProps = {
  size: number;
};

export default function PikachuBoard({ size }: TProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { state, send } = usePikachuStateMachine();
  const { position, selectedPath, hintRunning } = state.context;
  const {
    board,
    metadata: { numberOfRows, numberOfColumns, imgType },
  } = usePikachuStore();

  function onPieceClick(position: TPosition) {
    send({ type: PikachuMachineEvent.MOVE, position });
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative flex h-fit w-fit flex-col items-center gap-y-px"
      style={{ padding: `${size}px` }}
    >
      {state.value == PikachuMachineState.OUT_OF_MOVE && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      {Array.from({ length: numberOfRows }).map((_, _row) => {
        const row = _row + 1;
        return (
          <div key={row} className="flex items-center gap-x-px">
            {Array.from({ length: numberOfColumns }).map((_, _column) => {
              const column = _column + 1;
              const _index = board[row][column];
              const isSelected = position?.[1] == column && position?.[0] == row;
              const isPiece = board[row][column];

              return (
                <motion.div
                  key={`${row}_${column}`}
                  whileHover={isPiece ? { scale: 1.06, y: -1 } : {}}
                  whileTap={isPiece ? { scale: 0.97 } : {}}
                  style={{ width: `${size - 1}px`, height: `${size - 1}px` }}
                  className={cn(
                    'relative overflow-hidden rounded-md border border-slate-200/60 transition-all duration-200 dark:border-white/4',
                    isPiece
                      ? 'bg-linear-to-br from-amber-200/35 via-white to-amber-100/30 dark:from-amber-300/8 dark:via-slate-900/35 dark:to-amber-200/8'
                      : 'border-none',
                    isSelected &&
                      'shadow-[0_0_14px_rgba(251,191,36,0.25)] ring-2 ring-amber-300/70 dark:shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                  )}
                  onClick={() => onPieceClick([row, column])}
                >
                  {isPiece > 0 && (
                    <motion.img
                      initial={{ scale: 0, rotate: -4, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      src={
                        imgType == 'external'
                          ? `${PIKACHU_URL}/${_index}.png`
                          : `/pikachu/piece${_index}.png`
                      }
                      alt={`${row}_${column}`}
                      className="h-full w-full cursor-pointer object-contain p-1 drop-shadow-[0_6px_12px_rgba(15,23,42,0.22)] dark:drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        );
      })}
      {selectedPath.length > 0 && <PathDraw size={size} selectedPath={selectedPath} />}
      {hintRunning && <SuggestionDraw size={size} />}
    </motion.div>
  );
}
