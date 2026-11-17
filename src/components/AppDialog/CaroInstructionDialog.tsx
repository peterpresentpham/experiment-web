'use client';

import { Bluetooth, Circle, Settings } from 'lucide-react';
import IconDialogTrigger from 'src/components/AppDialog/components/IconDialogTrigger';
import { DIALOG_KEY } from 'src/configs/constance';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { commonMessages } from 'src/i18n/messages/common';
import { useDialogStore } from 'src/states/dialog.state';
import { Dialog, DialogContent, DialogHeader } from '../shadcn/dialog';

function Term({ children }: { children: string }) {
  return <span className="text-primary font-medium">{children}</span>;
}

export default function CaroInstructionDialog() {
  const { dialog, setDialog } = useDialogStore();
  const { instruction: text } = useMessages(caroMessages);
  const { actions } = useMessages(commonMessages);

  function onSettingClick() {
    setDialog(DIALOG_KEY.caroInstructionDialog, false);
    setDialog(DIALOG_KEY.caroConfigDialog, true);
  }

  return (
    <Dialog
      open={dialog[DIALOG_KEY.caroInstructionDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.caroInstructionDialog, open)}
    >
      <IconDialogTrigger label={actions.instructions} icon={Circle} />
      <DialogContent className="sm:max-w-4xl!">
        <DialogHeader>{text.title}</DialogHeader>
        <div className="scroll-hidden h-fit max-h-[75vh] overflow-auto">
          <p className="text-lg">{text.howToPlay}</p>
          <p className="text-justify text-sm">{text.howToPlayText}</p>
          <p className="mt-2 text-lg">{text.setting}</p>
          <div className="text-justify text-sm">
            {text.settingBefore}{' '}
            <Settings onClick={onSettingClick} className="inline cursor-pointer" size={14} />{' '}
            {text.settingAfter}
          </div>
          <p className="mt-2 text-lg">{text.playMode}</p>
          <p className="text-justify text-sm">
            {text.playModeIntro} <Term>{text.modes.offline}</Term>, <Term>{text.modes.online}</Term>
            {` ${text.and} `}
            <Term>{text.modes.machine}</Term>. {text.playModeText}
          </p>
          <p className="text-justify text-sm">
            {text.onlineBefore}
            <Bluetooth className="inline" size={14} />
            {text.onlineAfter}
          </p>
          <p className="mt-2 text-lg">{text.online}</p>
          <p className="text-justify text-sm">{text.onlineText}</p>
          <p className="mt-2 text-lg">{text.gameType}</p>
          <p className="text-justify text-sm">
            {text.gameTypeIntro} <Term>{text.types.normal}</Term> {text.and}{' '}
            <Term>{text.types.blind}</Term>.
          </p>
          <p className="text-justify text-sm">{text.normalText}</p>
          <p className="text-justify text-sm">{text.blindText}</p>
          <p className="text-justify text-sm">{text.overrideText}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
