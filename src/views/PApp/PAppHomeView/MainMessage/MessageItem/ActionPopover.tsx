import { EllipsisVertical } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/shadcn/popover';

interface TProps {
  senderType: 'me' | 'another';
  setIsEdit: Dispatch<SetStateAction<boolean>>;
}

const actionItemClass =
  'cursor-pointer rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent';

export default function ActionPopover({ senderType, setIsEdit }: TProps) {
  const [open, setOpen] = useState(false);

  function onEdit() {
    setIsEdit(true);
    setOpen(false);
  }

  function onReply() {
    setOpen(false);
  }

  function onForward() {
    setOpen(false);
  }

  function onDelete() {
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Message actions"
        >
          <EllipsisVertical size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-1.5" align="end" side="top">
        {senderType == 'me' && (
          <div className={actionItemClass} onClick={onEdit} role="button" tabIndex={0}>
            Edit
          </div>
        )}
        <div className={actionItemClass} onClick={onReply} role="button" tabIndex={0}>
          Reply
        </div>
        <div className={actionItemClass} onClick={onForward} role="button" tabIndex={0}>
          Forward
        </div>
        {senderType == 'me' && (
          <div
            className={`${actionItemClass} text-destructive hover:bg-destructive/10`}
            onClick={onDelete}
            role="button"
            tabIndex={0}
          >
            Delete
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
