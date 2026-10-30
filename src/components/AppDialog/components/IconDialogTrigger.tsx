import { LucideIcon } from 'lucide-react';
import AppTooltip from 'src/components/AppTooltip';
import IconButton from 'src/components/buttons/IconButton';
import { DialogTrigger } from 'src/components/shadcn/dialog';

type TProps = {
  label: string;
  icon: LucideIcon;
};

export default function IconDialogTrigger({ label, icon: Icon }: TProps) {
  return (
    <AppTooltip tooltipContent={label} contentProps={{ side: 'bottom' }}>
      <DialogTrigger asChild>
        <IconButton aria-label={label}>
          <Icon size={18} />
        </IconButton>
      </DialogTrigger>
    </AppTooltip>
  );
}
