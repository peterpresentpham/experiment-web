import { EllipsisVertical } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/shadcn/popover';

interface TProps {
  setIsEdit: Dispatch<SetStateAction<boolean>>;
}

export default function ActionPopover({ setIsEdit }: TProps) {
  const [open, setOpen] = useState(false);

  function onEdit() {
    setIsEdit(true);
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
      <PopoverTrigger>
        <EllipsisVertical size={20} className="cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-25">
        <div className="cursor-pointer text-sm" onClick={onEdit}>
          Edit
        </div>
        <div className="mt-1 cursor-pointer text-sm" onClick={onForward}>
          Forward
        </div>
        <div className="mt-1 cursor-pointer text-sm" onClick={onDelete}>
          Delete
        </div>
      </PopoverContent>
    </Popover>
  );
}
