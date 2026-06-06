/* eslint-disable quotes */
'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import { createCaroMessage } from 'src/services/caro.utils';
import { useCaroStore } from 'src/states/caro.state';
import { TTurn } from 'src/types/caro.type';
import { useCaroConnectionContext } from './caro-connection.context';

export type TCaroStateContextType = {
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
  const {
    turn,
    winState,
    isBlindForceOver,
    stepsOrder,
    metadata: { playMode, size },
    fn: { move, undo, reset },
  } = useCaroStore();
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
      if (stepsOrder.length == size * size)
        return { playerText: "It's a draw", isWin: false, isOver: true };
      else return { playerText: `${playerName}${playerTitle}`, isWin: false, isOver: false };
    }
  }, [isOverWin, playMode, connectionType, role, turn, stepsOrder.length, size]);

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

  return (
    <CaroStateContext.Provider
      value={{
        playerText,
        isWin,
        isOver,
        shouldDisableBoard: shouldDisableBoard || isWin || isOver,
        fn: { move: handleMove, undo: handleUndo, reset: handleReset },
      }}
    >
      {children}
    </CaroStateContext.Provider>
  );
}

export function useCaroStateContext() {
  return useContext(CaroStateContext);
}
