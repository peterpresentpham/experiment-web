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
import {
  TCaroGame,
  TCaroMachineLevel,
  TCaroSizeBoard,
  TCaroWinMode,
  TPlayMode,
  TTurn,
} from 'src/types/caro.type';

type TCaroConfigContextType = {
  size: TCaroSizeBoard;
  playMode: TPlayMode;
  gameType: TCaroGame;
  winMode: TCaroWinMode;
  isOverride: boolean;
  maxError: number;
  machineLevel: TCaroMachineLevel;
  machineTurn: TTurn;
  fn: {
    setSize: Dispatch<SetStateAction<TCaroSizeBoard>>;
    setPlayMode: Dispatch<SetStateAction<TPlayMode>>;
    setGameType: Dispatch<SetStateAction<TCaroGame>>;
    setIsOverride: Dispatch<SetStateAction<boolean>>;
    setMaxError: Dispatch<SetStateAction<number>>;
    setWinMode: Dispatch<SetStateAction<TCaroWinMode>>;
    setMachineLevel: Dispatch<SetStateAction<TCaroMachineLevel>>;
    setMachineTurn: Dispatch<SetStateAction<TTurn>>;
  };
};

const caroConfigContextDefault: TCaroConfigContextType = {
  size: 10,
  playMode: 'machine',
  gameType: 'normal',
  winMode: 'blockOpponent',
  isOverride: false,
  maxError: 5,
  machineLevel: 'hard',
  machineTurn: 1,
  fn: {
    setSize: () => {},
    setPlayMode: () => {},
    setGameType: () => {},
    setIsOverride: () => {},
    setMaxError: () => {},
    setWinMode: () => {},
    setMachineLevel: () => {},
    setMachineTurn: () => {},
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
  const [machineLevel, setMachineLevel] = useState(metadata.machineLevel);
  const [machineTurn, setMachineTurn] = useState(metadata.machineTurn);

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

  useEffect(() => {
    setMachineLevel(metadata.machineLevel);
  }, [metadata.machineLevel]);

  useEffect(() => {
    setMachineTurn(metadata.machineTurn);
  }, [metadata.machineTurn]);

  const contextData = useMemo<TCaroConfigContextType>(() => {
    return {
      size,
      playMode,
      gameType,
      winMode,
      isOverride,
      maxError,
      machineLevel,
      machineTurn,
      fn: {
        setSize,
        setPlayMode,
        setGameType,
        setWinMode,
        setIsOverride,
        setMaxError,
        setMachineLevel,
        setMachineTurn,
      },
    };
  }, [size, playMode, winMode, gameType, isOverride, maxError, machineLevel, machineTurn]);

  return <CaroConfigContext.Provider value={contextData}>{children}</CaroConfigContext.Provider>;
}

export function useCaroConfigContext() {
  return useContext(CaroConfigContext);
}
