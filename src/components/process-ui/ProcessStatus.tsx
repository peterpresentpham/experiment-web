import { ComponentProps } from 'react';
import { cn } from 'src/lib/utils';
import { ProcessStatusType } from 'src/types/process.type';

type TProps = {
  state: ProcessStatusType;
  rootprops?: ComponentProps<'span'>;
};

export default function ProcessStatus({ state, rootprops }: TProps) {
  return (
    <span
      {...rootprops}
      className={cn(
        'text-xs font-semibold uppercase',
        {
          'text-info': state == ProcessStatusType.NEW,
          'text-warning-foreground': state == ProcessStatusType.READY,
          'text-success': state == ProcessStatusType.RUNNING,
          'text-primary': state == ProcessStatusType.WAITING,
          'text-muted-foreground': state == ProcessStatusType.TERMINATED,
        },
        rootprops?.className
      )}
    >
      {state}
    </span>
  );
}
