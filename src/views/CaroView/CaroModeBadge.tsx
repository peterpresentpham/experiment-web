'use client';

import { Bot, Globe, Users } from 'lucide-react';
import { DIALOG_KEY } from 'src/configs/constance';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { cn } from 'src/lib/utils';
import { useCaroStore } from 'src/states/caro.state';
import { useDialogStore } from 'src/states/dialog.state';

const MODE_ICONS = { machine: Bot, offline: Users, online: Globe };

// Shows the active play mode at a glance and opens the caro settings to change it.
export default function CaroModeBadge() {
  const { playMode, machineLevel, gameType, isOverride } = useCaroStore((state) => state.metadata);
  const { role, connectionType } = useCaroConnectionContext();
  const setDialog = useDialogStore((state) => state.setDialog);
  const { mode, config, connection } = useMessages(caroMessages);

  const parts: string[] = [mode[playMode]];
  if (playMode == 'machine') parts.push(config.levels[machineLevel]);
  if (playMode == 'online')
    parts.push(connectionType == 'connected' ? connection[role] : mode.notConnected);
  if (gameType == 'blind') parts.push(config.blind);
  if (isOverride && playMode != 'machine') parts.push(config.override);
  const summary = parts.join(' · ');
  const Icon = MODE_ICONS[playMode];

  return (
    <button
      type="button"
      aria-label={mode.change(summary)}
      title={mode.change(summary)}
      onClick={() => setDialog(DIALOG_KEY.caroConfigDialog, true)}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring outline-none focus-visible:ring-[3px]',
        playMode == 'machine' ? 'border-primary/40 text-primary' : 'text-muted-foreground'
      )}
    >
      <Icon size={15} aria-hidden />
      {summary}
    </button>
  );
}
