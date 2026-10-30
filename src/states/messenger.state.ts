import { TChat } from 'src/types/caro.type';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type TMessegerStateType = {
  caroChats: Array<{ type: TChat; message: string }>;
  fn: {
    addChats: (type: TChat, message: string) => void;
  };
};

const useMessengerStore = create<TMessegerStateType, [['zustand/immer', unknown]]>(
  immer((set) => {
    return {
      caroChats: [],
      fn: {
        addChats: (type: TChat, message: string) => {
          set((state) => {
            state.caroChats = [...state.caroChats, { type, message }];
          });
        },
      },
    };
  })
);

export function useCaroChat() {
  const chats = useMessengerStore((state) => state.caroChats);
  const addChats = useMessengerStore((state) => state.fn.addChats);
  return { chats, fn: { addChats } };
}
