import { useProcessStore } from 'src/states/process.state';
import {
  ProcessMonitoringStatusType,
  TProcessMonitor,
  ProcessStatusType,
  TProcess,
} from 'src/types/process.type';
import { addMonitorData } from './monitor.utils';
import { TProcessContextType } from './type.utils';

export function runProcessGuard(context: TProcessContextType): boolean {
  return (
    !!context.currentProcess || !context.newQueue?.isEmpty() || !context.waitingQueue?.isEmpty()
  );
}

// change process state
export function runProcessEntry(context: TProcessContextType): Partial<TProcessContextType> {
  const metricsData = context.metricsData;
  const currentProcess = context.currentProcess;
  if (currentProcess) {
    const updateProcess = useProcessStore.getState().fn.updateProcess;
    const currentBlockTask = currentProcess?.blockTasks?.[currentProcess.currentBlockTaskIndex];
    if (currentBlockTask?.arrivalTime == currentProcess.runtime) {
      const waitingQueue = context.waitingQueue;
      let newPriority: number | undefined = undefined;
      if (waitingQueue) newPriority = waitingQueue.enqueue(currentProcess);
      updateProcess(currentProcess.pid, {
        state: ProcessStatusType.WAITING,
        waitingPriority: newPriority,
      });
      return { waitingQueue, currentProcess: undefined };
    } else {
      const data: Partial<Omit<TProcess, 'pid'>> = { state: ProcessStatusType.RUNNING };
      const saveProcess = useProcessStore.getState().processes[currentProcess.pid];
      if (saveProcess.beginAt === -1) {
        data.beginAt = context.counter;
        const _currentMetric = metricsData[currentProcess.pid];
        metricsData[currentProcess.pid] = { ..._currentMetric, startTime: context.counter };
      }
      updateProcess(currentProcess.pid, data);
      return { currentProcess: { ...currentProcess, ...data } };
    }
  }
  return {};
}

// run waiting process and execute active process
export function runProcessAction(context: TProcessContextType): Partial<TProcessContextType> {
  // run waiting tasks
  const waitingQueue = context.waitingQueue;
  const readyQueue = context.readyQueue;
  const metricsData = context.metricsData;
  const monitorData: Array<TProcessMonitor> = [];
  if (waitingQueue && readyQueue) {
    const maxBlockTaskPerSlice = useProcessStore.getState().maxBlockTaskPerSlice;
    let counter = 0;
    const updateProcess = useProcessStore.getState().fn.updateProcess;
    const _willRunWaitingQueue: Array<TProcess> = [];
    while (!waitingQueue.isEmpty() && ++counter <= maxBlockTaskPerSlice) {
      _willRunWaitingQueue.push(waitingQueue.dequeue()!);
    }
    for (const _waitingProcess of _willRunWaitingQueue) {
      if (_waitingProcess && _waitingProcess.blockTasks) {
        // update monitor
        monitorData.push({
          pid: _waitingProcess.pid,
          index: _waitingProcess.index,
          start: context.counter,
          end: context.counter + 1,
          state: ProcessMonitoringStatusType.RUNNING_BLOCKING_TASK,
        });

        const currentBlockTask = _waitingProcess.blockTasks[_waitingProcess.currentBlockTaskIndex];
        const runtime = _waitingProcess.runtime + 1;
        const taskRuntime = currentBlockTask.runtime + 1;

        const updatedBlockTasks = [..._waitingProcess.blockTasks];
        updatedBlockTasks[_waitingProcess.currentBlockTaskIndex] = {
          ...currentBlockTask,
          runtime: taskRuntime,
        };

        if (taskRuntime < currentBlockTask.executionTime) {
          const updatedProcess = { ..._waitingProcess, runtime, blockTasks: updatedBlockTasks };
          const newPriority = waitingQueue.enqueue(updatedProcess);
          updateProcess(_waitingProcess.pid, {
            runtime,
            blockTasks: updatedBlockTasks,
            waitingPriority: newPriority,
          });
        } else if (runtime < _waitingProcess.executionTime) {
          const updatedProcess = {
            ..._waitingProcess,
            runtime,
            blockTasks: updatedBlockTasks,
            state: ProcessStatusType.READY,
            currentBlockTaskIndex: _waitingProcess.currentBlockTaskIndex + 1,
          };
          const newPriority = readyQueue.enqueue(updatedProcess);
          updateProcess(_waitingProcess.pid, {
            runtime,
            blockTasks: updatedBlockTasks,
            state: ProcessStatusType.READY,
            currentBlockTaskIndex: _waitingProcess.currentBlockTaskIndex + 1,
            readyPriority: newPriority,
          });
        } else {
          const _currentMetric = metricsData[_waitingProcess.pid];
          metricsData[_waitingProcess.pid] = {
            ..._currentMetric,
            completionTime: context.counter + 1,
          };
          updateProcess(_waitingProcess.pid, {
            runtime,
            blockTasks: updatedBlockTasks,
            state: ProcessStatusType.TERMINATED,
            endAt: context.counter + 1,
          });
        }
      }
    }
  }
  // run current process
  const currentProcess = context.currentProcess;
  if (currentProcess) {
    monitorData.push({
      pid: currentProcess.pid,
      index: currentProcess.index,
      start: context.counter,
      end: context.counter + 1,
      state: ProcessMonitoringStatusType.RUNNING,
    });
    const runtime = currentProcess.runtime + 1;
    if (runtime < currentProcess.executionTime)
      return {
        currentProcess: { ...currentProcess, runtime },
        counter: context.counter + 1,
        waitingQueue,
        readyQueue,
        monitorData: addMonitorData(monitorData, context.monitorData),
        metricsData: { ...metricsData },
      };
    const _currentMetric = metricsData[currentProcess.pid];
    metricsData[currentProcess.pid] = {
      ..._currentMetric,
      completionTime: context.counter + 1,
    };
    return {
      currentProcess: {
        ...currentProcess,
        runtime,
        state: ProcessStatusType.TERMINATED,
        endAt: context.counter + 1,
      },
      counter: context.counter + 1,
      waitingQueue,
      readyQueue,
      monitorData: addMonitorData(monitorData, context.monitorData),
      metricsData: { ...metricsData },
    };
  }
  return {
    currentProcess: undefined,
    counter: context.counter + 1,
    waitingQueue,
    readyQueue,
    monitorData: addMonitorData(monitorData, context.monitorData),
    metricsData: { ...metricsData },
  };
}
