import { Bluetooth } from 'lucide-react';
import IconDialogTrigger from 'src/components/AppDialog/components/IconDialogTrigger';
import { useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader } from 'src/components/shadcn/dialog';
import { DIALOG_KEY } from 'src/configs/constance';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { useCaroStore } from 'src/states/caro.state';
import { useDialogStore } from 'src/states/dialog.state';
import { TRole } from 'src/types/caro.type';
import GuestConnection from './GuestConnection';
import HostConnection from './HostConnection';

export default function CaroConnectionDialog() {
  const { dialog, setDialog } = useDialogStore();
  const {
    metadata: { playMode },
  } = useCaroStore();
  const [role, setRole] = useState<TRole>('host');
  const { peer, connectionType } = useCaroConnectionContext();
  const isBusy = connectionType != 'init';
  const { connection: text } = useMessages(caroMessages);

  return playMode == 'online' ? (
    <Dialog
      open={dialog[DIALOG_KEY.caroConnectionDialog]}
      onOpenChange={(open) => setDialog(DIALOG_KEY.caroConnectionDialog, open)}
    >
      <IconDialogTrigger label={text.trigger} icon={Bluetooth} />
      <DialogContent>
        <DialogHeader>{text.title}</DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setRole('host')}
              variant={role == 'host' ? 'default' : 'secondary'}
              disabled={isBusy}
            >
              {text.host}
            </Button>
            <Button
              onClick={() => setRole('guest')}
              variant={role == 'guest' ? 'default' : 'secondary'}
              disabled={isBusy}
            >
              {text.guest}
            </Button>
          </div>
          {connectionType == 'connected' && (
            <Button
              variant="destructive"
              onClick={() => {
                if (peer) peer.destroy();
              }}
            >
              {text.disconnect}
            </Button>
          )}
        </div>
        {connectionType == 'init' ? (
          <p className="text-sm">
            {text.youAre} <span className="text-chart-3">{text.roleLabel[role]}</span>
          </p>
        ) : (
          <p className="text-sm">
            {connectionType == 'connected' ? (
              <span className="text-success">{text.youConnected}</span>
            ) : (
              <span className="text-warning-foreground">{text.youConnecting}</span>
            )}{' '}
            <span className="text-chart-3">{text.roleLabel[role]}</span>
          </p>
        )}
        {role == 'host' ? <HostConnection /> : <GuestConnection />}
      </DialogContent>
    </Dialog>
  ) : null;
}
