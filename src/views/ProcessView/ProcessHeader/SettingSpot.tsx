import SettingDialog from 'src/components/process-ui/dialogs/SettingDialog';
import { Badge } from 'src/components/shadcn/badge';
import { useProcessStore } from 'src/states/process.state';

export default function SettingSpot() {
  const { status } = useProcessStore();

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="border-info/30 bg-info/10 text-info px-2 text-xs font-semibold tracking-wide uppercase"
      >
        STATUS: {status}
      </Badge>
      <div className="bg-border h-6 w-px" />
      <SettingDialog />
    </div>
  );
}
