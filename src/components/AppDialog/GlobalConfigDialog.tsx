'use client';

import { Settings2 } from 'lucide-react';
import { DIALOG_KEY } from 'src/configs/constance';
import { useDialogStore } from 'src/states/dialog.state';
import IconButton from '../buttons/IconButton';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../shadcn/dialog';
import SoundtrackConfig from './components/SoundtrackConfig';

export default function GlobalConfigDialog() {
  const { dialog, setDialog } = useDialogStore();

  return (
    <Dialog
      open={dialog[DIALOG_KEY.globalConfigDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.globalConfigDialog, open)}
    >
      <DialogTrigger asChild>
        <IconButton aria-label="Open settings">
          <Settings2 size={18} />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Config</DialogHeader>
        <div>
          <SoundtrackConfig />
        </div>
      </DialogContent>
    </Dialog>
  );
}
