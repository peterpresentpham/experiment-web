import { Trash } from 'lucide-react';
import { Button } from 'src/components/shadcn/button';
import { useProcessStateMachine } from 'src/state-machine/process.state-machine';
import { useProcessStore } from 'src/states/process.state';
import { ProcessMachineEvent } from 'src/types/process.type';

interface TProps {
  onSave(): void;
  onOpenChange?: (open: boolean) => void;
}

export default function UpdateFooter({ onSave, onOpenChange }: TProps) {
  const { status } = useProcessStore();
  const { send } = useProcessStateMachine();

  function onClear() {
    send({ type: ProcessMachineEvent.CLEAR });
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={status === 'running'}
        className="text-destructive hover:text-destructive/50 border-destructive! hover:border-destructive/50"
        onClick={onClear}
      >
        <Trash size={10} />
        <span className="text-xs font-medium tracking-tight uppercase">Clear all</span>
      </Button>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => onOpenChange?.(false)} type="button" className="">
          Cancel
        </Button>
        <Button onClick={onSave} type="button" className="">
          Save changes
        </Button>
      </div>
    </div>
  );
}
