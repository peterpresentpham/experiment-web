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
import { usePikachuStore } from 'src/states/pikachu.state';
import { TPikachuGame, TPikachuImg, TPikachuTransform } from 'src/types/pikachu.type';

type TPikachuConfigContextType = {
  size: { numberOfRows: number; numberOfColumns: number };
  numberOfLines: number;
  imgType: TPikachuImg;
  rounds: Array<TPikachuTransform>;
  gameType: TPikachuGame;
  fn: {
    setSize: Dispatch<SetStateAction<{ numberOfRows: number; numberOfColumns: number }>>;
    setNumberOfLines: Dispatch<SetStateAction<number>>;
    setImgType: Dispatch<SetStateAction<TPikachuImg>>;
    setRounds: Dispatch<SetStateAction<TPikachuTransform[]>>;
    setGameType: Dispatch<SetStateAction<TPikachuGame>>;
  };
};

const pikachuConfigContextDefault: TPikachuConfigContextType = {
  size: { numberOfRows: 16, numberOfColumns: 9 },
  numberOfLines: 2,
  imgType: 'magic',
  rounds: [],
  gameType: 'normal',
  fn: {
    setSize: () => {},
    setNumberOfLines: () => {},
    setImgType: () => {},
    setRounds: () => {},
    setGameType: () => {},
  },
};

const PikachuConfigContext = createContext<TPikachuConfigContextType>(pikachuConfigContextDefault);

interface TProps {
  children: ReactNode;
}

export default function PikachuConfigProvider({ children }: TProps) {
  const { metadata } = usePikachuStore();
  const [size, setSize] = useState<{ numberOfRows: number; numberOfColumns: number }>({
    numberOfRows: metadata.numberOfRows,
    numberOfColumns: metadata.numberOfColumns,
  });
  const [numberOfLines, setNumberOfLines] = useState(metadata.numberOfLines);
  const [imgType, setImgType] = useState<TPikachuImg>(metadata.imgType);
  const [rounds, setRounds] = useState<Array<TPikachuTransform>>(metadata.roundList);
  const [gameType, setGameType] = useState<TPikachuGame>(metadata.gameType);

  // The drafts follow the store when it changes (e.g. once it is restored from storage), field by
  // field, so an unrelated change does not undo an edit. Adjusted during render, as React
  // recommends over an effect.
  const [synced, setSynced] = useState(metadata);
  if (synced != metadata) {
    setSynced(metadata);
    if (
      metadata.numberOfRows != synced.numberOfRows ||
      metadata.numberOfColumns != synced.numberOfColumns
    )
      setSize({ numberOfRows: metadata.numberOfRows, numberOfColumns: metadata.numberOfColumns });
    if (metadata.numberOfLines != synced.numberOfLines) setNumberOfLines(metadata.numberOfLines);
    if (metadata.imgType != synced.imgType) setImgType(metadata.imgType);
    if (metadata.roundList != synced.roundList) setRounds(metadata.roundList);
    if (metadata.gameType != synced.gameType) setGameType(metadata.gameType);
  }

  const contextData = useMemo<TPikachuConfigContextType>(() => {
    return {
      size,
      numberOfLines,
      imgType,
      rounds,
      gameType,
      fn: { setSize, setNumberOfLines, setImgType, setRounds, setGameType },
    };
  }, [size, numberOfLines, imgType, rounds, gameType]);

  return (
    <PikachuConfigContext.Provider value={contextData}>{children}</PikachuConfigContext.Provider>
  );
}

export function usePikachuConfigContext() {
  return useContext(PikachuConfigContext);
}
