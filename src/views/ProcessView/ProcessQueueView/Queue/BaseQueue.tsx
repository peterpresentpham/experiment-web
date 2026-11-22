import { ComponentProps, PropsWithChildren } from 'react';
import { cn } from 'src/lib/utils';

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <h3 className="text-lg font-semibold text-foreground">
      {title} <span className="text-sm font-normal text-muted-foreground">({count})</span>
    </h3>
  );
}

export default function BaseQueue(
  params: PropsWithChildren<{ title: string; count: number; contentprops?: ComponentProps<'div'> }>
) {
  const { title, count, children, contentprops } = params;

  return (
    <div className="flex h-fit max-h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-muted/40 py-2">
      <div className="px-2">
        <SectionTitle title={title} count={count} />
      </div>
      <div
        {...contentprops}
        className={cn(
          'scroll-hidden mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2',
          contentprops?.className
        )}
      >
        {children}
      </div>
    </div>
  );
}
