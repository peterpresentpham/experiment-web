export type TTurn = 0 | 1;
export type TRole = 'host' | 'guest';
export type TConnection = 'init' | 'connecting' | 'connected';
export type TPlayMode = 'offline' | 'online' | 'machine';
export type TCaroGame = 'normal' | 'blind';
export type TCaroWinMode = 'blockOpponent' | 'non-blockOpponent';
export type TCaroSizeBoard = 3 | 10 | 15;
export type TChat = 'yourChat' | 'friendChat';

export type TCaroWin = 'leftDiagonal' | 'rightDiagonal' | 'vertical' | 'horizontal';

export type TWinState = {
  winMode: Array<TCaroWin>;
  locations: {
    [location: number]: Partial<{ [type in TCaroWin]: boolean }>;
  };
};

export type TCaroMessage = 'chat' | 'move' | 'newGame' | 'undo' | 'sync';
