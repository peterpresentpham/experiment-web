import { TUserFindItem } from 'src/types/papp.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface TConversationStateType {
  currentConversationId: number | undefined;
  conversationUsers: Record<number, TUserFindItem>;
  fn: {
    setCurrentConversationId: (currentConversationId: number) => void;
    addConversationUsers: (users: Array<TUserFindItem>) => void;
    resetConversationUsers: () => void;
  };
}

export const useConversationStore = create<
  TConversationStateType,
  [['zustand/persist', unknown], ['zustand/immer', unknown]]
>(
  persist(
    immer((set) => {
      return {
        currentConversationId: undefined,
        conversationUsers: [],
        fn: {
          setCurrentConversationId: (currentConversationId: number) => {
            set((state) => {
              state.currentConversationId = currentConversationId;
            });
          },
          addConversationUsers: (users: Array<TUserFindItem>) => {
            set((state) => {
              users.forEach((user) => {
                state.conversationUsers[user.id] = user;
              });
            });
          },
          resetConversationUsers: () => {
            set((state) => {
              state.conversationUsers = [];
            });
          },
        },
      };
    }),
    {
      name: 'experiment.conversation',
      version: 1.0,
      partialize: (state) => {
        const { fn, ...rest } = state;
        return rest;
      },
    }
  )
);
