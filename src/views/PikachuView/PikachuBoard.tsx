'use client';

import { motion } from 'motion/react';
import { useCallback, useMemo } from 'react';
import { PikachuMachineContext, usePikachuSend } from 'src/state-machine/pikachu.state-machine';
import { usePikachuStore } from 'src/states/pikachu.state';
import { PikachuMachineEvent, PikachuMachineState } from 'src/types/pikachu.type';
import PathDraw from './PathDraw';
import PikachuCell from './PikachuCell';
import SuggestionDraw from './SuggestionDraw';

type TProps = {
  size: number;
};

export default function PikachuBoard({ size }: TProps) {
  const send = usePikachuSend();
  const position = PikachuMachineContext.useSelector((snapshot) => snapshot.context.position);
  const selectedPath = PikachuMachineContext.useSelector(
    (snapshot) => snapshot.context.selectedPath
  );
  const hintRunning = PikachuMachineContext.useSelector((snapshot) => snapshot.context.hintRunning);
  const isOutOfMove = PikachuMachineContext.useSelector(
    (snapshot) => snapshot.value === PikachuMachineState.OUT_OF_MOVE
  );
  const board = usePikachuStore((state) => state.board);
  const numberOfRows = usePikachuStore((state) => state.metadata.numberOfRows);
  const numberOfColumns = usePikachuStore((state) => state.metadata.numberOfColumns);
  const imgType = usePikachuStore((state) => state.metadata.imgType);

  const onPieceClick = useCallback(
    (row: number, column: number) => {
      send({ type: PikachuMachineEvent.MOVE, position: [row, column] });
    },
    [send]
  );

  // Both ends of a matched path stay highlighted while the path is drawn.
  const highlighted = useMemo(() => {
    const keys = new Set<string>();
    if (position) keys.add(`${position[0]}_${position[1]}`);
    if (selectedPath.length > 0) {
      const first = selectedPath[0];
      const last = selectedPath[selectedPath.length - 1];
      keys.add(`${first[0]}_${first[1]}`);
      keys.add(`${last[0]}_${last[1]}`);
    }
    return keys;
  }, [position, selectedPath]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative flex h-fit w-fit flex-col items-center gap-y-px"
      style={{ padding: `${size}px` }}
    >
      {isOutOfMove && (
        <div
          role="status"
          className="bg-foreground/60 text-background absolute inset-0 z-20 flex items-center justify-center rounded-xl text-center text-sm font-medium"
        >
          No more moves. Change the board to continue.
        </div>
      )}
      {Array.from({ length: numberOfRows }, (_, rowIndex) => {
        const row = rowIndex + 1;
        return (
          <div key={row} className="flex items-center gap-x-px">
            {Array.from({ length: numberOfColumns }, (_, columnIndex) => {
              const column = columnIndex + 1;

              return (
                <PikachuCell
                  key={column}
                  row={row}
                  column={column}
                  size={size}
                  value={board[row][column]}
                  imgType={imgType}
                  isSelected={highlighted.has(`${row}_${column}`)}
                  onPieceClick={onPieceClick}
                />
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
