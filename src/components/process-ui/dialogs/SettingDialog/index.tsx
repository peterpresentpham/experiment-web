import { DialogProps } from '@radix-ui/react-dialog';
import { Settings } from 'lucide-react';
import { useState } from 'react';
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
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { processMessages } from 'src/i18n/messages/process';
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
  const { settings, schedulers } = useMessages(processMessages);
  const { actions } = useMessages(commonMessages);

  // Each opening starts from the saved settings.
  function onOpenChange(next: boolean) {
    if (next) {
      setLocalMode(mode);
      setLocalMaxBlock(maxBlockTaskPerSlice);
    }
    setOpen(next);
  }

  const onSave = () => {
    setMetadata({ mode: localMode, maxBlockTaskPerSlice: localMaxBlock });
    setOpen(false);
  };

  function onChangeDisplayMode() {
    if (displayMode == 'chart') setMetadata({ displayMode: 'column' });
    else setMetadata({ displayMode: 'chart' });
  }

  return (
    <Dialog {...props} open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Settings role="button" aria-label={settings.open} size={14} className="cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-4">
        <DialogHeader className="max-w-2xl p-4">{settings.title}</DialogHeader>
        <p className="text-lg font-semibold">{settings.scheduler}</p>
        <div className="flex flex-wrap items-center gap-1">
          {Object.values(ProcessSchedulerConfigs).map((item) => {
            return (
              <Button
                key={item.id}
                variant={localMode == item.id ? 'default' : 'outline'}
                onClick={() => setLocalMode(item.id)}

                disabled={item.coming}
              >
                {schedulers[item.id]}
              </Button>
            );
          })}
        </div>

        <p className="border-t pt-2 text-lg font-semibold">{settings.maxBlockTasks}</p>
        <BaseInput
          value={localMaxBlock}
          name="input-max-block"
          type="number"
          min={1}
          max={5}

          onChange={(event) => {
            const value = parseInt(event.target.value);
            if (isNaN(value)) return;
            const validatedValue = Math.min(Math.max(value, 1), 5);
            setLocalMaxBlock(validatedValue);
          }}
        />
        <p className="border-t pt-2 text-lg font-semibold">{settings.displayMode}</p>
        <Button onClick={onChangeDisplayMode} className="w-fit" size="sm">
          {settings.displayModes[displayMode]}
        </Button>
        <DialogFooter className="mt-4 border-t pt-2">
          <Button onClick={onSave}>{actions.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
