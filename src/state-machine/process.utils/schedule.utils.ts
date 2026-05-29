import { useProcessStore } from 'src/states/process.state';
import { ProcessStatusType, TProcess } from 'src/types/process.type';
import { TProcessContextType } from './type.utils';

export function scheduleProcessGuard(context: TProcessContextType): boolean {
  return !context.currentProcess;
}

export function scheduleProcessesEntry(context: TProcessContextType): Partial<TProcessContextType> {
  const newQueue = context.newQueue;
  const readyQueue = context.readyQueue;
  const metricsData = context.metricsData;
  if (newQueue && readyQueue) {
    const updateProcess = useProcessStore.getState().fn.updateProcess;
    while (!newQueue.isEmpty() && (newQueue.peek()?.arrivalTime || 0) <= context.counter) {
      const _process = newQueue.pop();
      if (_process) {
        const readyProcess: TProcess = { ..._process, state: ProcessStatusType.READY };
        const newPriority = readyQueue.enqueue(readyProcess);
        metricsData[readyProcess.pid] = {
          index: readyProcess.index,
          arrivalTime: readyProcess.arrivalTime,
          burstTime: readyProcess.executionTime,
        };
        updateProcess(readyProcess.pid, { ...readyProcess, readyPriority: newPriority });
      }
    }
  }
  return { newQueue, readyQueue, metricsData: { ...metricsData } };
}
