'use client';

import { Bot, ChevronDown, Eye, EyeOff, Globe, LucideIcon, Scale, Users } from 'lucide-react';
import { DIALOG_KEY } from 'src/configs/constance';
import { useCaroConnectionContext } from 'src/context/caro-connection.context';
import { useMessages } from 'src/i18n/client';
import { caroMessages } from 'src/i18n/messages/caro';
import { cn } from 'src/lib/utils';
import { useCaroStore } from 'src/states/caro.state';
import { useDialogStore } from 'src/states/dialog.state';

const MODE_ICONS = { machine: Bot, offline: Users, online: Globe };

type TItem = { icon: LucideIcon; label: string; value: string };

type TProps = { className?: string };

// The settings of the current game at a glance (mode, game type, win rule) in one slim line, so
// the board keeps the height; opens the caro settings.
export default function CaroGameInfo({ className }: TProps) {
  const { playMode, machineLevel, gameType, isOverride, winMode } = useCaroStore(
    (state) => state.metadata
  );
  const { role, connectionType } = useCaroConnectionContext();
  const setDialog = useDialogStore((state) => state.setDialog);
  const { mode, config, connection } = useMessages(caroMessages);

  const modeParts: string[] = [mode[playMode]];
  if (playMode == 'machine') modeParts.push(config.levels[machineLevel]);
  if (playMode == 'online')
    modeParts.push(connectionType == 'connected' ? connection[role] : mode.notConnected);
  const typeParts: string[] = [gameType == 'blind' ? config.blind : config.normal];
  if (isOverride && playMode != 'machine') typeParts.push(config.override);

  const items: Array<TItem> = [
    { icon: MODE_ICONS[playMode], label: mode.label, value: modeParts.join(' · ') },
    {
      icon: gameType == 'blind' ? EyeOff : Eye,
      label: config.gameType,
      value: typeParts.join(' · '),
    },
    { icon: Scale, label: config.winType, value: mode.rules[winMode] },
  ];
  const summary = items.map((item) => `${item.label}: ${item.value}`).join(', ');

  return (
    <button
      type="button"
      aria-label={mode.change(summary)}
      title={mode.change(summary)}
      onClick={() => setDialog(DIALOG_KEY.caroConfigDialog, true)}
      className={cn(
        'group flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/40 px-1.5 py-1 text-left transition-colors',
        'outline-none hover:border-primary/50 hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring',
        className
      )}
    >
      <span className="flex flex-1 flex-wrap items-center gap-y-1 sm:divide-x">
        {/* Labels stay in the accessible name and tooltip; the values speak for themselves. */}
        {items.map(({ icon: Icon, label, value }) => (
          <span
            key={label}
            title={label}
            className="flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap"
          >
            <Icon size={16} aria-hidden className="shrink-0 text-primary" />
            <span className="text-sm font-medium">{value}</span>
          </span>
        ))}
      </span>
      <span className="inline-flex shrink-0 items-center gap-0.5 self-start rounded-md bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground sm:self-center">
        {mode.changeAction}
        <ChevronDown size={14} aria-hidden />
      </span>
    </button>
  );
}
