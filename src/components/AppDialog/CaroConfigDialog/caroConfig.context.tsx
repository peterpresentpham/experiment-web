'use client';

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
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
  size: 20,
  playMode: 'machine',
  gameType: 'normal',
  winMode: 'blockOpponent',
  isOverride: false,
  maxError: 5,
  machineLevel: 'hell',
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

  // The drafts follow the store when it changes (a new game, an online sync), field by field, so
  // an unrelated change does not undo an edit. Adjusted during render, as React recommends over an
  // effect: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [synced, setSynced] = useState(metadata);
  if (synced != metadata) {
    setSynced(metadata);
    if (metadata.size != synced.size) setSize(metadata.size);
    if (metadata.playMode != synced.playMode) setPlayMode(metadata.playMode);
    if (metadata.gameType != synced.gameType) setGameType(metadata.gameType);
    if (metadata.winMode != synced.winMode) setWinMode(metadata.winMode);
    if (metadata.isOverride != synced.isOverride) setIsOverride(metadata.isOverride);
    if (metadata.maxNumberOfBlindError != synced.maxNumberOfBlindError)
      setMaxError(metadata.maxNumberOfBlindError);
    if (metadata.machineLevel != synced.machineLevel) setMachineLevel(metadata.machineLevel);
    if (metadata.machineTurn != synced.machineTurn) setMachineTurn(metadata.machineTurn);
  }

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
