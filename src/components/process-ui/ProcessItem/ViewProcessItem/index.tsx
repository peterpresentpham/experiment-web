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

interface TProps {
  data: TProcess;
  metadata?: {
    onlyShowCurrentBlockTask?: boolean;
  };
  props?: ComponentProps<'div'>;
}

export default function ViewProcessItem({ data, metadata, props }: TProps) {
  const progress = (data.runtime / data.executionTime) * 100;
  const isTerminated = data.state === ProcessStatusType.TERMINATED;
  const isRunning = data.state === ProcessStatusType.RUNNING;

  return (
    <div
      {...props}
      className={cn(
        'group relative overflow-hidden border p-1 transition-all duration-300 hover:shadow-xl',
        'bg-card/40 border-border/50 backdrop-blur-sm',
        {
          'bg-blue-50/30 ring-1 ring-blue-500/20 dark:bg-blue-900/10':
            data.state == ProcessStatusType.NEW,
          'bg-yellow-50/30 ring-1 ring-yellow-500/20 dark:bg-yellow-900/10':
            data.state == ProcessStatusType.READY,
          'border-green-500/30 bg-green-50/40 shadow-[0_0_15px_rgba(34,197,94,0.1)] ring-1 ring-green-500/30 dark:bg-green-900/20':
            isRunning,
          'bg-orange-50/30 ring-1 ring-orange-500/20 dark:bg-orange-900/10':
            data.state == ProcessStatusType.WAITING,
          'bg-muted/20 opacity-75 grayscale-[0.5]': isTerminated,
        }
      )}
    >
      {/* Glossy Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />

      {/* Header Info */}
      <div className="relative mb-1.5 flex items-start justify-between gap-1">
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AppTooltip tooltipContent={data.pid}>
                <span className="font-mono text-sm font-black tracking-tighter">
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
                    className="rounded-3xs h-4 border-yellow-500/50 bg-yellow-500/5 text-[8px] font-black tracking-widest text-yellow-600 dark:text-yellow-400"
                  >
                    PRIORITY {data.readyPriority}
                  </Badge>
                )}
                {data.waitingPriority >= 0 && data.state == ProcessStatusType.WAITING && (
                  <Badge
                    variant="outline"
                    className="rounded-3xs h-4 border-orange-500/50 bg-orange-500/5 text-[8px] font-black tracking-widest text-orange-600 dark:text-orange-400"
                  >
                    WAITING {data.waitingPriority}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2 items-center justify-center">
                {isRunning && (
                  <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                )}
                <span
                  className={cn('h-1.5 w-1.5 rounded-full transition-colors duration-500', {
                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]':
                      data.state == ProcessStatusType.NEW,
                    'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]':
                      data.state == ProcessStatusType.READY,
                    'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]': isRunning,
                    'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]':
                      data.state == ProcessStatusType.WAITING,
                    'bg-muted-foreground/30': isTerminated,
                  })}
                />
              </div>
              <ProcessStatus
                state={data.state}
                rootprops={{
                  className: 'text-[9px] font-bold uppercase tracking-widest opacity-80',
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium whitespace-nowrap">
              <Clock size={10} strokeWidth={3} className="opacity-70" />
              <span>
                Arr: <span className="text-foreground font-mono">{data.arrivalTime}</span>
              </span>
            </div>
            {data.beginAt >= 0 && (
              <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium whitespace-nowrap">
                <Timer size={10} className="text-green-500/70" />
                <span>
                  Start: <span className="text-foreground font-mono">{data.beginAt}</span>
                </span>
              </div>
            )}
            {isTerminated && data.endAt >= 0 && (
              <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium whitespace-nowrap">
                <Timer size={10} className="text-primary/70" />
                <span>
                  End: <span className="text-foreground font-mono">{data.endAt}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Tasks */}
      <div className="relative space-y-1.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-black tracking-widest uppercase opacity-70">
            <span>CPU Cycle Execution</span>
            <span
              className={cn('font-mono', isTerminated ? 'text-muted-foreground' : 'text-primary')}
            >
              {data.runtime}/{data.executionTime}ms
            </span>
          </div>
          <div className="bg-muted/30 h-1.5 overflow-hidden ring-1 ring-black/5 ring-inset dark:ring-white/5">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
              className={cn('relative h-full overflow-hidden', {
                'bg-blue-500': data.state == ProcessStatusType.NEW,
                'bg-yellow-500': data.state == ProcessStatusType.READY,
                'bg-green-500': isRunning,
                'bg-orange-500': data.state == ProcessStatusType.WAITING,
                'bg-muted-foreground/40': isTerminated,
              })}
            >
              {isRunning && (
                <div
                  className="animate-shimmer absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                  style={{ backgroundSize: '200% 100%' }}
                />
              )}
            </motion.div>
          </div>
        </div>

        {data.blockTasks && data.blockTasks.length > 0 && (
          <div className="border-border/40 mt-2 border-t pt-2">
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
