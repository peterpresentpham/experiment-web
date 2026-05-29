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
import { useCaroStore } from 'src/states/caro.state';
import { TCaroGame, TCaroSizeBoard, TCaroWinMode, TPlayMode } from 'src/types/caro.type';

type TCaroConfigContextType = {
  size: TCaroSizeBoard;
  playMode: TPlayMode;
  gameType: TCaroGame;
  winMode: TCaroWinMode;
  isOverride: boolean;
  maxError: number;
  fn: {
    setSize: Dispatch<SetStateAction<TCaroSizeBoard>>;
    setPlayMode: Dispatch<SetStateAction<TPlayMode>>;
    setGameType: Dispatch<SetStateAction<TCaroGame>>;
    setIsOverride: Dispatch<SetStateAction<boolean>>;
    setMaxError: Dispatch<SetStateAction<number>>;
    setWinMode: Dispatch<SetStateAction<TCaroWinMode>>;
  };
};

const caroConfigContextDefault: TCaroConfigContextType = {
  size: 10,
  playMode: 'offline',
  gameType: 'normal',
  winMode: 'blockOpponent',
  isOverride: false,
  maxError: 5,
  fn: {
    setSize: () => {},
    setPlayMode: () => {},
    setGameType: () => {},
    setIsOverride: () => {},
    setMaxError: () => {},
    setWinMode: () => {},
  },
};

const CaroConfigContext = createContext<TCaroConfigContextType>(caroConfigContextDefault);

interface TProps {
  children: ReactNode;
}

export default function CaroConfigProvider({ children }: TProps) {
  const { metadata } = useCaroStore();

  const [size, setSize] = useState(metadata.size);
  const [playMode, setPlayMode] = useState(metadata.playMode);
  const [gameType, setGameType] = useState(metadata.gameType);
  const [winMode, setWinMode] = useState(metadata.winMode);
  const [isOverride, setIsOverride] = useState(metadata.isOverride);
  const [maxError, setMaxError] = useState(metadata.maxNumberOfBlindError);

  useEffect(() => {
    setWinMode(metadata.winMode);
  }, [metadata.winMode]);

  useEffect(() => {
    setSize(metadata.size);
  }, [metadata.size]);

  useEffect(() => {
    setPlayMode(metadata.playMode);
  }, [metadata.playMode]);

  useEffect(() => {
    setGameType(metadata.gameType);
  }, [metadata.gameType]);

  useEffect(() => {
    setIsOverride(metadata.isOverride);
  }, [metadata.isOverride]);

  useEffect(() => {
    setMaxError(metadata.maxNumberOfBlindError);
  }, [metadata.maxNumberOfBlindError]);

  const contextData = useMemo<TCaroConfigContextType>(() => {
    return {
      size,
      playMode,
      gameType,
      winMode,
      isOverride,
      maxError,
      fn: { setSize, setPlayMode, setGameType, setWinMode, setIsOverride, setMaxError },
    };
  }, [size, playMode, winMode, gameType, isOverride, maxError]);

  return <CaroConfigContext.Provider value={contextData}>{children}</CaroConfigContext.Provider>;
}

export function useCaroConfigContext() {
  return useContext(CaroConfigContext);
}
