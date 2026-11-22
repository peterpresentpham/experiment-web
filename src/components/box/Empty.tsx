import { ComponentProps, ReactNode } from 'react';
import { cn } from 'src/lib/utils';

interface TProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  component?: ReactNode;
  rootprops?: ComponentProps<'div'>;
}

export function ListEmpty({ title, description, icon, action, component, rootprops }: TProps) {
  return (
    <div
      {...rootprops}
      className={cn(
        'flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center text-muted-foreground',
        rootprops?.className
      )}
    >
      {icon && <div className="text-muted-foreground/70 [&_svg]:size-6">{icon}</div>}
      {title && <p className="text-sm font-medium text-foreground">{title}</p>}
      {description && <p className="text-sm">{description}</p>}
      {component}
      {action}
    </div>
  );
}
