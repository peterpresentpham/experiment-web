import { cn } from 'src/lib/utils';
import { useProcessStore } from 'src/states/process.state';
import { ProcessStatusType } from 'src/types/process.type';
import IncomingQueue from './Queue/IncomingQueue';
import ReadyQueue from './Queue/ReadyQueue';
import TerminatedQueue from './Queue/TerminatedQueue';
import WaitingQueue from './Queue/WaitingQueue';
import RunningScreen from './RunningScreen';

export default function ProcessQueueView() {
  const { processes } = useProcessStore();
  const processList = Object.values(processes);

  const runningProcess = processList.find((p) => p.state === ProcessStatusType.RUNNING);

  const incomingProcesses = processList
    .filter((p) => p.state === ProcessStatusType.NEW)
    .sort((a, b) => a.arrivalTime - b.arrivalTime);

  return (
    <div className="flex min-h-0 flex-col gap-2 pt-2 lg:h-[calc(100dvh-var(--header-height)-5rem)]">
      <RunningScreen runningProcess={runningProcess} />
      <div
        className={cn(
          'grid min-h-0 flex-1 grid-cols-1 gap-2',
          incomingProcesses.length > 0 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
        )}
      >
        {incomingProcesses.length > 0 && <IncomingQueue incomingProcesses={incomingProcesses} />}
        <WaitingQueue processList={processList} />
        <ReadyQueue processList={processList} />
        <TerminatedQueue processList={processList} />
      </div>
    </div>
  );
}
