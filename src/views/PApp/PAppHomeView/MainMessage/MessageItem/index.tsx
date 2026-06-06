import { Check, PencilLine, X } from 'lucide-react';
import { ComponentProps, useCallback, useState } from 'react';
import { useChatContext } from 'src/context/papp/chat.context';
import { cn } from 'src/lib/utils';
import { MESSAGE_TYPE, TSocketReceiveMessage, TUserFindItem } from 'src/types/papp.type';
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

  const handleCancelEdit = useCallback(() => {
    setIsEdit(false);
    setEditedMessage(item.content);
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
        'flex px-3',
        senderType == 'me' ? 'justify-end' : 'justify-start',
        props.className
      )}
    >
      <div
        className={cn(
          'group relative flex max-w-[75%] flex-col gap-0.5 md:max-w-[60%]',
          senderType == 'me' ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name */}
        <span
          className={cn(
            'text-muted-foreground px-1 text-[11px] leading-none',
            senderType == 'me' && 'text-right'
          )}
        >
          {senderType == 'me' ? 'You' : user?.name || `#${item.senderId}`}
        </span>

        {/* Bubble + actions */}
        <div
          className={cn(
            'flex items-end gap-1',
            senderType == 'me' ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          {/* Message bubble */}
          <div
            className={cn(
              'relative rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm',
              senderType == 'me'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-secondary text-secondary-foreground rounded-bl-md'
            )}
          >
            {isEdit ? (
              <div className="flex flex-col gap-2">
                <EditMessageInput
                  editedMessage={editedMessage}
                  setEditedMessage={setEditedMessage}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                  >
                    <X size={13} />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors"
                  >
                    <Check size={13} />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="wrap-break-word whitespace-pre-wrap">{item.content}</span>
                {item.type == MESSAGE_TYPE.EDIT_TEXT && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] opacity-60">
                    <PencilLine size={10} />
                    edited
                  </span>
                )}
              </>
            )}
          </div>
          {/* Actions popover — always visible on hover */}
          <div className="invisible flex opacity-0 transition-all group-hover:visible group-hover:opacity-100">
            <ActionPopover senderType={senderType} setIsEdit={handleStartEdit} />
          </div>
        </div>
      </div>
    </div>
  );
}
