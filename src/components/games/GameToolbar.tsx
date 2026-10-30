import { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

type TProps = {
  title: string;
  status?: ReactNode;
  tools?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

// Presentational layout shared by the board games; each game owns its own logic and slots.
export default function GameToolbar({
  title,
  status,
  tools,
  actions,
  children,
  className,
}: TProps) {
  return (
    <div className={cn('bg-card flex flex-col gap-3 rounded-xl border p-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {status}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {tools}
          {actions && <div className="ml-2 flex items-center gap-2">{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}
