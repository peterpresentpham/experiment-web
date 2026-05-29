import { ComponentProps, useCallback, useState } from 'react';
import { cn } from 'src/lib/utils';
import { useChatContext } from 'src/context/papp/chat.context';
import { TSocketReceiveMessage, TUserFindItem } from 'src/types/papp.type';
import ActionPopover from './ActionPopover';
import EditMessageInput from './EditMessageInput';

interface TProps extends ComponentProps<'div'> {
  senderType?: 'me' | 'another';
  item: TSocketReceiveMessage;
  user?: TUserFindItem;
}

export default function MessageItem({ senderType = 'me', item, user, ...props }: TProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [editedMessage, setEditedMessage] = useState(item.content);
  const { fn } = useChatContext();

  const handleStartEdit = useCallback(() => {
    setEditedMessage(item.content);
    setIsEdit(true);
  }, [item.content]);

  const handleSave = useCallback(() => {
    const trimmed = editedMessage.trim();
    if (!trimmed || trimmed === item.content) {
      setIsEdit(false);
      return;
    }
    fn.editMessage(item.id, trimmed);
    setIsEdit(false);
  }, [editedMessage, item.content, item.id, fn]);
  return (
    <div
      {...props}
      className={cn(
        'mt-2 flex',
        senderType == 'me' ? 'justify-end' : 'justify-start',
        isEdit && 'mb-4',
        props.className
      )}
    >
      <div
        className={cn(
          'group relative flex max-w-[85%] items-center gap-1 sm:max-w-[75%]',
          senderType == 'me' ? 'justify-end' : 'justify-start'
        )}
      >
        {senderType == 'me' && (
          <div className="invisible opacity-0 transition-all group-hover:visible group-hover:opacity-100">
            <ActionPopover setIsEdit={handleStartEdit} />
          </div>
        )}

        <div className={cn('rounded-lg p-2', senderType == 'me' ? 'bg-chart-5' : 'bg-secondary')}>
          {isEdit ? (
            <EditMessageInput editedMessage={editedMessage} setEditedMessage={setEditedMessage} />
          ) : (
            <>{item.content}</>
          )}
        </div>
        {isEdit && (
          <div className="absolute -bottom-4 flex gap-1">
            <span
              className="cursor-pointer text-xs hover:underline"
              onClick={() => setIsEdit(false)}
            >
              cancel
            </span>
            <span className="text-xs">·</span>
            <span className="cursor-pointer text-xs hover:underline" onClick={handleSave}>
              save
            </span>
          </div>
        )}
        <div className="absolute -top-3 text-xs">
          {senderType == 'me' ? 'you' : user?.name || `#${item.senderId}`}
        </div>
      </div>
    </div>
  );
}
