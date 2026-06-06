'use client';

import { ComponentProps, useCallback, useEffect, useRef } from 'react';
import { cn } from 'src/lib/utils';
import { useChatContext } from 'src/context/papp/chat.context';
import { useGetMe } from 'src/queries/papp/user.query';
import { useConversationStore } from 'src/states/conversation.state';
import { TSocketReceiveMessage } from 'src/types/papp.type';
import MessageItem from './MessageItem';

type TProps = ComponentProps<'div'> & {
  messages?: TSocketReceiveMessage[];
};

export default function MainMessage(props: TProps) {
  const { messages = [], ...rest } = props;
  const { data } = useGetMe();
  const conversationUsers = useConversationStore((state) => state.conversationUsers);
  const { hasMoreMessages, isLoadingMoreMessages, fn } = useChatContext();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    const container = scrollContainerRef.current;
    if (container && prevScrollHeightRef.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      container.scrollTop = diff;
    }
  }, [messages.length]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop < 100 && hasMoreMessages && !isLoadingMoreMessages) {
      prevScrollHeightRef.current = container.scrollHeight;
      fn.loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMoreMessages, fn]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      {...rest}
      className={cn('flex flex-col gap-2 overflow-y-auto py-2', props.className)}
    >
      {isLoadingMoreMessages && (
        <p className="text-muted-foreground self-center py-2 text-xs">Loading older messages...</p>
      )}

      {messages.length === 0 ? (
        <p className="text-muted-foreground text-sm">No messages yet.</p>
      ) : (
        messages.map((item) => {
          return (
            <MessageItem
              key={`${item.conversationId}-${item.senderId}-${item.id}`}
              senderType={data?.id == item.senderId ? 'me' : 'another'}
              item={item}
              user={conversationUsers[item.senderId]}
            />
          );
        })
      )}
    </div>
  );
}
