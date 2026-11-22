import SettingDialog from 'src/components/process-ui/dialogs/SettingDialog';
import { Badge } from 'src/components/shadcn/badge';
import { useProcessStore } from 'src/states/process.state';
import { useMessages } from 'src/i18n/client';
import { processMessages } from 'src/i18n/messages/process';

export default function SettingSpot() {
  const text = useMessages(processMessages);
  const { status } = useProcessStore();

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="border-info/30 bg-info/10 px-2 text-xs font-semibold tracking-wide text-info uppercase"
      >
        {text.statusBadge(text.storeStatus[status])}
      </Badge>
      <div className="h-6 w-px bg-border" />
      <SettingDialog />
    </div>
  );
}
