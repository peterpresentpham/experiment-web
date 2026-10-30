import { ComponentProps, PropsWithChildren } from 'react';
import { cn } from 'src/lib/utils';

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <h3 className="text-foreground text-lg font-semibold">
      {title} <span className="text-muted-foreground text-sm font-normal">({count})</span>
    </h3>
  );
}

export default function BaseQueue(
  params: PropsWithChildren<{ title: string; count: number; contentprops?: ComponentProps<'div'> }>
) {
  const { title, count, children, contentprops } = params;

  return (
    <div className="bg-muted/40 flex h-fit max-h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border py-2">
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
