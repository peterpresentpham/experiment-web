'use client';

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useConnect4Store } from 'src/states/connect4.state';
import { TCaroGame, TPlayMode } from 'src/types/caro.type';

type TConnect4ConfigContextType = {
  playMode: TPlayMode;
  gameType: TCaroGame;
  maxError: number;
  fn: {
    setPlayMode: Dispatch<SetStateAction<TPlayMode>>;
    setGameType: Dispatch<SetStateAction<TCaroGame>>;
    setMaxError: Dispatch<SetStateAction<number>>;
  };
};

const connect4ConfigContextDefault: TConnect4ConfigContextType = {
  playMode: 'offline',
  gameType: 'normal',
  maxError: 5,
  fn: { setPlayMode: () => {}, setGameType: () => {}, setMaxError: () => {} },
};

const Connect4ConfigContext = createContext<TConnect4ConfigContextType>(
  connect4ConfigContextDefault
);

interface TProps {
  children: ReactNode;
}

export default function Connect4ConfigProvider({ children }: TProps) {
  const { metadata } = useConnect4Store();

  const [playMode, setPlayMode] = useState(metadata.playMode);
  const [gameType, setGameType] = useState(metadata.gameType);
  const [maxError, setMaxError] = useState(metadata.maxNumberOfBlindError);

  useEffect(() => {
    setPlayMode(metadata.playMode);
  }, [metadata.playMode]);

  useEffect(() => {
    setGameType(metadata.gameType);
  }, [metadata.gameType]);

  useEffect(() => {
    setMaxError(metadata.maxNumberOfBlindError);
  }, [metadata.maxNumberOfBlindError]);

  const contextData = useMemo<TConnect4ConfigContextType>(() => {
    return { playMode, gameType, maxError, fn: { setPlayMode, setGameType, setMaxError } };
  }, [playMode, gameType, maxError]);

  return (
    <Connect4ConfigContext.Provider value={contextData}>{children}</Connect4ConfigContext.Provider>
  );
}

export function useConnect4ConfigContext() {
  return useContext(Connect4ConfigContext);
}
