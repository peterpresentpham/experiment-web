import { motion } from 'motion/react';
import { ComponentProps } from 'react';
import AppTooltip from 'src/components/AppTooltip';
import CopyClipboard from 'src/components/CopyClipboard';
import ProcessStatus from 'src/components/process-ui/ProcessStatus';
import { Badge } from 'src/components/shadcn/badge';
import { cn } from 'src/lib/utils';
import { formatText } from 'src/services';
import { ProcessStatusType, TProcess } from 'src/types/process.type';
import BlockTaskList from './BlockTaskList';
import { Clock, Timer } from 'lucide-react';
import { useMessages } from 'src/i18n/client';
import { processMessages } from 'src/i18n/messages/process';

interface TProps {
  data: TProcess;
  metadata?: {
    onlyShowCurrentBlockTask?: boolean;
  };
  props?: ComponentProps<'div'>;
}

export default function ViewProcessItem({ data, metadata, props }: TProps) {
  const { item: text } = useMessages(processMessages);
  const progress = (data.runtime / data.executionTime) * 100;
  const isTerminated = data.state === ProcessStatusType.TERMINATED;
  const isRunning = data.state === ProcessStatusType.RUNNING;

  return (
    <div
      {...props}
      className={cn(
        'group relative overflow-hidden rounded-lg border p-2 transition-all duration-300 hover:shadow-md',
        'border-border/60 bg-card',
        {
          'bg-info/5 ring-1 ring-info/20': data.state == ProcessStatusType.NEW,
          'bg-warning/10 ring-1 ring-warning/30': data.state == ProcessStatusType.READY,
          'border-success/30 bg-success/10 shadow-sm ring-1 ring-success/30': isRunning,
          'bg-primary/5 ring-1 ring-primary/20': data.state == ProcessStatusType.WAITING,
          'bg-muted/20 opacity-75 grayscale-[0.5]': isTerminated,
        }
      )}
    >
      {/* Header Info */}
      <div className="relative mb-1.5 flex items-start justify-between gap-1">
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AppTooltip tooltipContent={data.pid}>
                <span className="font-mono text-sm font-semibold tracking-tighter">
                  {data.index ? `P${data.index}` : formatText(data.pid, 4)}
                </span>
              </AppTooltip>
              <CopyClipboard
                copyText={data.pid}
                iconprops={{
                  size: 10,
                  className: 'opacity-30 hover:opacity-100 transition-opacity',
                }}
              />
              <div className="flex gap-1">
                {data.readyPriority >= 0 && data.state == ProcessStatusType.READY && (
                  <Badge
                    variant="outline"
                    className="h-4 rounded-md border-warning/50 bg-warning/15 text-xs font-semibold tracking-wide text-warning-foreground"
                  >
                    {text.priority(data.readyPriority)}
                  </Badge>
                )}
                {data.waitingPriority >= 0 && data.state == ProcessStatusType.WAITING && (
                  <Badge
                    variant="outline"
                    className="h-4 rounded-md border-primary/40 bg-primary/10 text-xs font-semibold tracking-wide text-primary"
                  >
                    {text.waiting(data.waitingPriority)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2 items-center justify-center">
                {isRunning && (
                  <span className="absolute h-full w-full animate-ping rounded-full bg-success/60" />
                )}
                <span
                  className={cn('h-1.5 w-1.5 rounded-full transition-colors duration-500', {
                    'bg-info': data.state == ProcessStatusType.NEW,
                    'bg-warning': data.state == ProcessStatusType.READY,
                    'bg-success': isRunning,
                    'bg-primary': data.state == ProcessStatusType.WAITING,
                    'bg-muted-foreground/30': isTerminated,
                  })}
                />
              </div>
              <ProcessStatus
                state={data.state}
                rootprops={{
                  className: 'text-xs font-bold uppercase tracking-wide opacity-80',
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-muted-foreground">
              <Clock size={10} strokeWidth={3} className="opacity-70" />
              <span>
                {text.arrival}:{' '}
                <span className="font-mono text-foreground">{data.arrivalTime}</span>
              </span>
            </div>
            {data.beginAt >= 0 && (
              <div className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-muted-foreground">
                <Timer size={10} className="text-success" />
                <span>
                  {text.start}: <span className="font-mono text-foreground">{data.beginAt}</span>
                </span>
              </div>
            )}
            {isTerminated && data.endAt >= 0 && (
              <div className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-muted-foreground">
                <Timer size={10} className="text-primary/70" />
                <span>
                  {text.end}: <span className="font-mono text-foreground">{data.endAt}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Tasks */}
      <div className="relative space-y-1.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wide uppercase opacity-70">
            <span>{text.cpu}</span>
            <span
              className={cn('font-mono', isTerminated ? 'text-muted-foreground' : 'text-primary')}
            >
              {data.runtime}/{data.executionTime}ms
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
              className={cn('relative h-full overflow-hidden', {
                'bg-info': data.state == ProcessStatusType.NEW,
                'bg-warning': data.state == ProcessStatusType.READY,
                'bg-success': isRunning,
                'bg-primary': data.state == ProcessStatusType.WAITING,
                'bg-muted-foreground/40': isTerminated,
              })}
            ></motion.div>
          </div>
        </div>

        {data.blockTasks && data.blockTasks.length > 0 && (
          <div className="mt-2 border-t border-border/40 pt-2">
            <BlockTaskList
              onlyShowCurrentBlockTask={metadata?.onlyShowCurrentBlockTask}
              data={data.blockTasks}
              currentBlockTaskIndex={data.currentBlockTaskIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
}
