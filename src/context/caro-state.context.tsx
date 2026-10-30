/* eslint-disable quotes */
'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import { createCaroMessage } from 'src/services/caro.utils';
import { useCaroStore } from 'src/states/caro.state';
import { TTurn } from 'src/types/caro.type';
import { useCaroConnectionContext } from './caro-connection.context';

type TCaroStateContextType = {
  playerText: string;
  isWin: boolean;
  isOver: boolean;
  shouldDisableBoard: boolean;
  fn: {
    move: (location: number) => void;
    undo: () => void;
    reset: (turn?: TTurn | undefined) => void;
  };
};

const caroStateContextDefault: TCaroStateContextType = {
  playerText: '',
  isWin: false,
  isOver: false,
  shouldDisableBoard: false,
  fn: {
    move: () => {},
    undo: () => {},
    reset: () => {},
  },
};

const CaroStateContext = createContext<TCaroStateContextType>(caroStateContextDefault);

interface TProps {
  children: ReactNode;
}

export default function CaroStateProvider({ children }: TProps) {
  const turn = useCaroStore((state) => state.turn);
  const winState = useCaroStore((state) => state.winState);
  const isBlindForceOver = useCaroStore((state) => state.isBlindForceOver);
  const stepCount = useCaroStore((state) => state.stepsOrder.length);
  const playMode = useCaroStore((state) => state.metadata.playMode);
  const size = useCaroStore((state) => state.metadata.size);
  const { move, undo, reset } = useCaroStore.getState().fn;
  const { peer, role, connectionType } = useCaroConnectionContext();

  const isOverWin = Boolean(winState) || isBlindForceOver;

  const { playerText, isWin, isOver } = useMemo(() => {
    let playerTitle = "'s turn";
    if (isOverWin) playerTitle = ' win';
    let playerName = '';
    let _isWin = false;
    if (playMode == 'online' && connectionType == 'connected') {
      if (role == 'host') {
        if (turn == 0) {
          playerName = 'You';
          _isWin = true;
        } else playerName = 'Opponent';
      } else {
        if (turn == 0) playerName = 'Opponent';
        else {
          playerName = 'You';
          _isWin = true;
        }
      }
    } else {
      playerName = `Player ${turn + 1}`;
      _isWin = true;
    }
    const isWin = _isWin && isOverWin;
    if (isWin) return { playerText: `${playerName}${playerTitle}`, isWin, isOver: isWin };
    else {
      if (stepCount == size * size)
        return { playerText: "It's a draw", isWin: false, isOver: true };
      else return { playerText: `${playerName}${playerTitle}`, isWin: false, isOver: false };
    }
  }, [isOverWin, playMode, connectionType, role, turn, stepCount, size]);

  const { shouldDisableBoard } = useMemo(() => {
    if (connectionType == 'connected' && playMode == 'online') {
      if (role == 'host' && turn == 0) return { shouldDisableBoard: false };
      else if (role == 'guest' && turn == 1) return { shouldDisableBoard: false };
      else return { shouldDisableBoard: true };
    }
    return { shouldDisableBoard: false };
  }, [connectionType, role, turn, playMode]);

  const handleMove = useCallback(
    (location: number) => {
      move(location);
      if (peer) peer.send(createCaroMessage('move', location));
    },
    [move, peer]
  );

  const handleUndo = useCallback(() => {
    undo();
    if (peer) peer.send(createCaroMessage('undo'));
  }, [peer, undo]);

  const handleReset = useCallback(
    (turn?: TTurn) => {
      reset(turn);
      if (peer) peer.send(createCaroMessage('newGame'));
    },
    [peer, reset]
  );

  const value = useMemo<TCaroStateContextType>(
    () => ({
      playerText,
      isWin,
      isOver,
      shouldDisableBoard: shouldDisableBoard || isWin || isOver,
      fn: { move: handleMove, undo: handleUndo, reset: handleReset },
    }),
    [playerText, isWin, isOver, shouldDisableBoard, handleMove, handleUndo, handleReset]
  );

  return <CaroStateContext.Provider value={value}>{children}</CaroStateContext.Provider>;
}

export function useCaroStateContext() {
  return useContext(CaroStateContext);
}
