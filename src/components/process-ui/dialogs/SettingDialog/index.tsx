import { DialogProps } from '@radix-ui/react-dialog';
import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import BaseInput from 'src/components/input/BaseInput';
import { Button } from 'src/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from 'src/components/shadcn/dialog';
import { ProcessSchedulerConfigs } from 'src/configs/constance';
import { useProcessStore } from 'src/states/process.state';

export default function SettingDialog(props: DialogProps) {
  const {
    mode,
    maxBlockTaskPerSlice,
    displayMode,
    fn: { setMetadata },
  } = useProcessStore();

  const [localMode, setLocalMode] = useState(mode);
  const [localMaxBlock, setLocalMaxBlock] = useState(maxBlockTaskPerSlice);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalMode(mode);
      setLocalMaxBlock(maxBlockTaskPerSlice);
    }
  }, [open, mode, maxBlockTaskPerSlice]);

  const onSave = () => {
    setMetadata({ mode: localMode, maxBlockTaskPerSlice: localMaxBlock });
    setOpen(false);
  };

  function onChangeDisplayMode() {
    if (displayMode == 'chart') setMetadata({ displayMode: 'column' });
    else setMetadata({ displayMode: 'chart' });
  }

  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Settings size={14} className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-4">
        <DialogHeader className="max-w-2xl p-4">Process Setting</DialogHeader>
        <p className="text-lg font-semibold">Scheduler Mode</p>
        <div className="flex flex-wrap items-center gap-1">
          {Object.values(ProcessSchedulerConfigs).map((item) => {
            return (
              <Button
                key={item.id}
                variant={localMode == item.id ? 'default' : 'outline'}
                onClick={() => setLocalMode(item.id)}
                className=""
                disabled={item.coming}
              >
                {item.name}
              </Button>
            );
          })}
        </div>

        <p className="border-t pt-2 text-lg font-semibold">Max blocks task</p>
        <BaseInput
          value={localMaxBlock}
          name="input-max-block"
          type="number"
          min={1}
          max={5}
          className=""
          onChange={(event) => {
            const value = parseInt(event.target.value);
            if (isNaN(value)) return;
            const validatedValue = Math.min(Math.max(value, 1), 5);
            setLocalMaxBlock(validatedValue);
          }}
        />
        <p className="border-t pt-2 text-lg font-semibold">Display mode</p>
        <Button onClick={onChangeDisplayMode} className="w-fit" size="sm">
          {displayMode}
        </Button>
        <DialogFooter className="mt-4 border-t pt-2">
          <Button onClick={onSave} className="">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
