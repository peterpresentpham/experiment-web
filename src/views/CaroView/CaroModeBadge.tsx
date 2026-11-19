'use client';

import { Bot, ChevronDown, Globe, Users } from 'lucide-react';
import { DIALOG_KEY } from 'src/configs/constance';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { cn } from 'src/lib/utils';
import { useCaroStore } from 'src/states/caro.state';
import { useDialogStore } from 'src/states/dialog.state';

const MODE_ICONS = { machine: Bot, offline: Users, online: Globe };

// The obvious place to see and change the play mode; opens the caro settings.
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
        'group bg-background inline-flex cursor-pointer items-center gap-2 rounded-lg border py-1.5 pr-2 pl-3 text-sm shadow-xs transition-colors',
        'hover:border-primary/60 hover:bg-accent focus-visible:ring-ring outline-none focus-visible:ring-[3px]'
      )}
    >
      <Icon size={16} aria-hidden className="text-primary shrink-0" />
      <span className="text-muted-foreground hidden sm:inline">{mode.label}:</span>
      <span className="font-medium">{summary}</span>
      <span className="bg-primary text-primary-foreground ml-1 inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-semibold">
        {mode.changeAction}
        <ChevronDown size={14} aria-hidden />
      </span>
    </button>
  );
}
