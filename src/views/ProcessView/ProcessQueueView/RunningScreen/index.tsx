import { Cpu } from 'lucide-react';
import AppTooltip from 'src/components/AppTooltip';
import { useProcessStateMachine } from 'src/state-machine/process.state-machine';
import { useProcessStore } from 'src/states/process.state';
import { ProcessMachineEvent, TProcess } from 'src/types/process.type';
import ExportImportData from '../../ExportImportData';
import RunningProcessView from './RunningProcessView';

interface TProps {
  runningProcess: TProcess | undefined;
}

export default function RunningScreen({ runningProcess }: TProps) {
  const { mode } = useProcessStore();
  const { send } = useProcessStateMachine();

  function onReset() {
    send({ type: ProcessMachineEvent.RESET });
  }

  return (
    <div className="flex h-55 w-full gap-1 overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-3 py-2 dark:border-zinc-800/50 dark:bg-zinc-900/80">
          <div className="flex h-4 items-center gap-2">
            <Cpu size={16} className="text-blue-500" />
            <h2 className="text-[12px] font-bold tracking-tight uppercase">
              Processor Core | {mode}
            </h2>
          </div>
          {runningProcess && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                ACTIVE
              </span>
            </div>
          )}
        </div>
        <RunningProcessView runningProcess={runningProcess} />
        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          <ExportImportData />
          <AppTooltip tooltipContent="Reset">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="12px"
              width="12px"
              onClick={onReset}
            >
              <path d="M22 12C22 17.5228 17.5229 22 12 22C6.4772 22 2 17.5228 2 12C2 6.47715 6.4772 2 12 2V4C7.5817 4 4 7.58172 4 12C4 16.4183 7.5817 20 12 20C16.4183 20 20 16.4183 20 12C20 9.53614 18.8862 7.33243 17.1346 5.86492L15 8V2L21 2L18.5535 4.44656C20.6649 6.28002 22 8.9841 22 12Z"></path>
            </svg>
          </AppTooltip>
        </div>
      </div>
    </div>
  );
}
