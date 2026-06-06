'use client';

import { useEffect, useMemo } from 'react';
import { useChatContext } from 'src/context/papp/chat.context';
import { useFindUsers } from 'src/queries/papp/user.query';
import { useConversationStore } from 'src/states/conversation.state';
import ChatInput from './ChatInput';
import HomeHeader from './HomeHeader';
import MainMessage from './MainMessage';

export default function PAppHomeView() {
  const currentConversationId = useConversationStore((state) => state.currentConversationId);
  const addConversationUsers = useConversationStore((state) => state.fn.addConversationUsers);

  const { messages, typingUserIds, fn } = useChatContext();

  const { userIds } = useMemo(() => {
    if (!currentConversationId) return { userIds: [] };
    const ids = new Set(messages.map((item) => item.senderId));
    return { userIds: [...ids] };
  }, [currentConversationId, messages]);

  const { data: conversationUsers } = useFindUsers({ userIds });
  useEffect(() => {
    if (conversationUsers?.data) addConversationUsers(conversationUsers.data);
  }, [addConversationUsers, conversationUsers?.data]);

  const conversationUsersMap = useConversationStore((state) => state.conversationUsers);

  const typingUserNames = useMemo(() => {
    return typingUserIds.map((id) => conversationUsersMap[id]?.name).filter(Boolean) as string[];
  }, [typingUserIds, conversationUsersMap]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto pb-20">
        <HomeHeader />
        <MainMessage className="flex-1" messages={messages} />
        {typingUserNames.length > 0 && (
          <span className="text-muted-foreground ml-4 text-sm italic">
            {typingUserNames.join(', ')} typing...
          </span>
        )}
      </div>
      <div className="bg-background fixed right-0 bottom-2 left-0 container py-0!">
        <ChatInput
          onSend={fn.sendMessage}
          onStartTyping={fn.typingMessage}
          onStopTyping={fn.stopMessage}
        />
      </div>
    </div>
  );
}
