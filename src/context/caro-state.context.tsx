'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import useCaroMachine from 'src/hooks/useCaroMachine';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { createCaroMessage } from 'src/services/caro.utils';
import { soundtrack } from 'src/services/soundtrack';
import { useCaroStore } from 'src/states/caro.state';
import { TTurn } from 'src/types/caro.type';
import { TSound } from 'src/types/global';
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
  const machineTurn = useCaroStore((state) => state.metadata.machineTurn);
  const { move, undo, reset } = useCaroStore.getState().fn;
  const { peer, role, connectionType } = useCaroConnectionContext();
  const { status } = useMessages(caroMessages);

  const isOverWin = Boolean(winState) || isBlindForceOver;

  // `outcome` is how the game ended for the player at this device, for the closing sound.
  const { playerText, isWin, isOver, outcome } = useMemo((): {
    playerText: string;
    isWin: boolean;
    isOver: boolean;
    outcome?: 'win' | 'lose' | 'draw';
  } => {
    const isDraw = stepCount == size * size;
    if (playMode == 'machine') {
      const isMachine = turn == machineTurn;
      if (isOverWin) {
        if (isMachine)
          return { playerText: status.machineWins, isWin: false, isOver: true, outcome: 'lose' };
        return { playerText: status.youWin, isWin: true, isOver: true, outcome: 'win' };
      }
      if (isDraw) return { playerText: status.draw, isWin: false, isOver: true, outcome: 'draw' };
      const playerText = isMachine ? status.machineThinking : status.yourTurn;
      return { playerText, isWin: false, isOver: false };
    }
    if (playMode == 'online' && connectionType == 'connected') {
      const isMine = (role == 'host' && turn == 0) || (role == 'guest' && turn == 1);
      // Only the winner's side treats the game as over; the loser waits for the new game.
      if (isOverWin && isMine)
        return { playerText: status.youWin, isWin: true, isOver: true, outcome: 'win' };
      if (isOverWin)
        return { playerText: status.opponentWins, isWin: false, isOver: false, outcome: 'lose' };
      if (isDraw) return { playerText: status.draw, isWin: false, isOver: true, outcome: 'draw' };
      return {
        playerText: isMine ? status.yourTurn : status.opponentTurn,
        isWin: false,
        isOver: false,
      };
    }
    if (isOverWin)
      return { playerText: status.win(turn + 1), isWin: true, isOver: true, outcome: 'win' };
    if (isDraw) return { playerText: status.draw, isWin: false, isOver: true, outcome: 'draw' };
    return { playerText: status.turn(turn + 1), isWin: false, isOver: false };
  }, [isOverWin, playMode, machineTurn, connectionType, role, turn, stepCount, size, status]);

  useEffect(() => {
    if (!outcome) return;
    const sounds = { win: TSound.WIN, lose: TSound.LOSE, draw: TSound.DRAW };
    soundtrack.play({ type: sounds[outcome] });
  }, [outcome]);

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

  const { isMachineTurn } = useCaroMachine({ isOver, move: handleMove });

  const handleUndo = useCallback(() => {
    undo();
    if (peer) peer.send(createCaroMessage('undo'));
  }, [peer, undo]);

  const handleReset = useCallback(
    (turn?: TTurn) => {
      // In machine mode player 1 always starts, so the "first move" setting decides who opens.
      reset(playMode == 'machine' ? 0 : turn);
      if (peer) peer.send(createCaroMessage('newGame'));
    },
    [peer, reset, playMode]
  );

  const value = useMemo<TCaroStateContextType>(
    () => ({
      playerText,
      isWin,
      isOver,
      shouldDisableBoard: shouldDisableBoard || isMachineTurn || isWin || isOver,
      fn: { move: handleMove, undo: handleUndo, reset: handleReset },
    }),
    [
      playerText,
      isWin,
      isOver,
      shouldDisableBoard,
      isMachineTurn,
      handleMove,
      handleUndo,
      handleReset,
    ]
  );

  return <CaroStateContext.Provider value={value}>{children}</CaroStateContext.Provider>;
}

export function useCaroStateContext() {
  return useContext(CaroStateContext);
}
