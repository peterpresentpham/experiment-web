import { useMemo, useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/shadcn/popover';
import { useGetListConversations } from 'src/queries/papp/conversation.query';
import { useConversationStore } from 'src/states/conversation.state';

export default function Conversation() {
  const [open, setOpen] = useState(false);
  const currentConversationId = useConversationStore((state) => state.currentConversationId);
  const fn = useConversationStore((state) => state.fn);
  const { data } = useGetListConversations();

  const currentConversation = useMemo(() => {
    if (currentConversationId) {
      const _conversation = (data?.data || []).find(
        (item) => item.conversationId == currentConversationId
      );
      return _conversation;
    }
    return undefined;
  }, [currentConversationId, data?.data]);

  const conversationName = useMemo(() => {
    if (currentConversation) {
      return (
        currentConversation.conversationName ||
        `${currentConversation.yourParticipant.name}-${currentConversation.anotherParticipant?.name}`
      );
    }
    return 'Select conversation';
  }, [currentConversation]);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">{conversationName}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          {(data?.data || []).map((item, key) => {
            const name =
              item.conversationName ||
              `${item.yourParticipant.name}-${item.anotherParticipant?.name}`;

            return (
              <div
                key={item.conversationId}
                className="hover:bg-background flex cursor-pointer items-center rounded-sm px-1 py-1"
                onClick={() => {
                  fn.setCurrentConversationId(item.conversationId);
                  setOpen(false);
                }}
              >
                <p className="text-sm">
                  {key}. {name}
                </p>
              </div>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
