import { ComponentProps, useState } from 'react';
import { cn } from 'src/lib/utils';
import { TSocketMessage, TUserFindItem } from 'src/types/papp.type';
import ActionPopover from './ActionPopover';
import EditMessageInput from './EditMessageInput';

interface TProps extends ComponentProps<'div'> {
  senderType?: 'me' | 'another';
  item: TSocketMessage;
  user?: TUserFindItem;
}

export default function MessageItem({ senderType = 'me', item, user, ...props }: TProps) {
  const [isEdit, setIsEdit] = useState(false);

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
          'group relative flex items-center gap-1',
          senderType == 'me' ? 'justify-end' : 'justify-start'
        )}
      >
        {senderType == 'me' && (
          <div className="invisible opacity-0 transition-all group-hover:visible group-hover:opacity-100">
            <ActionPopover setIsEdit={setIsEdit} />
          </div>
        )}

        <div
          className={cn(
            'max-w-[75%] rounded-lg p-2',
            senderType == 'me' ? 'bg-chart-5' : 'bg-secondary'
          )}
        >
          {isEdit ? <EditMessageInput message={item.message} /> : <>{item.message}</>}
        </div>
        {isEdit && (
          <div className="absolute -bottom-4">
            <span
              className="cursor-pointer text-xs hover:underline"
              onClick={() => setIsEdit(false)}
            >
              cancel
            </span>
            .
            <span
              className="cursor-pointer text-xs hover:underline"
              onClick={() => setIsEdit(false)}
            >
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
