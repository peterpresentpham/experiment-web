'use client';

import { Settings2 } from 'lucide-react';
import { DIALOG_KEY } from 'src/configs/constance';
import { useMessages } from 'src/i18n/client';
import { commonMessages } from 'src/i18n/messages/common';
import { useDialogStore } from 'src/states/dialog.state';
import IconButton from '../buttons/IconButton';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../shadcn/dialog';
import LanguageConfig from './components/LanguageConfig';
import SoundtrackConfig from './components/SoundtrackConfig';

export default function GlobalConfigDialog() {
  const { dialog, setDialog } = useDialogStore();
  const { settings } = useMessages(commonMessages);

  return (
    <Dialog
      open={dialog[DIALOG_KEY.globalConfigDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.globalConfigDialog, open)}
    >
      <DialogTrigger asChild>
        <IconButton aria-label={settings.open}>
          <Settings2 size={18} />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>{settings.title}</DialogHeader>
        <div>
          <LanguageConfig />
          <SoundtrackConfig />
        </div>
      </DialogContent>
    </Dialog>
  );
}
