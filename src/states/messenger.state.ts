import { TChat, TMyGame } from 'src/types/caro.type';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type TMessegerStateType = {
  caroChats: Array<{ type: TChat; message: string }>;
  connect4Chats: Array<{ type: TChat; message: string }>;
  fn: {
    addChats: (type: TChat, gameType: TMyGame, message: string) => void;
  };
};

export const useMessengerStore = create<TMessegerStateType, [['zustand/immer', unknown]]>(
  immer((set) => {
    return {
      caroChats: [],
      connect4Chats: [],
      fn: {
        addChats: (type: TChat, gameType: TMyGame, message: string) => {
          set((state) => {
            if (gameType == 'caro') state.caroChats = [...state.caroChats, { type, message }];
            else if (gameType == 'connect4')
              state.connect4Chats = [...state.connect4Chats, { type, message }];
          });
        },
      },
    };
  })
);

export function useGameMessengerChat(game: TMyGame) {
  const { caroChats, connect4Chats, fn } = useMessengerStore();

  if (game == 'caro')
    return {
      chats: caroChats,
      fn: {
        addChats: (type: TChat, message: string) => {
          fn.addChats(type, 'caro', message);
        },
      },
    };
  else
    return {
      chats: connect4Chats,
      fn: {
        addChats: (type: TChat, message: string) => {
          fn.addChats(type, 'connect4', message);
        },
      },
    };
}
