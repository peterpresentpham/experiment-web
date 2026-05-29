'use client';

import { ComponentProps } from 'react';
import { cn } from 'src/lib/utils';
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

  return (
    <div {...rest} className={cn('flex flex-col gap-2 overflow-y-auto py-2', props.className)}>
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
