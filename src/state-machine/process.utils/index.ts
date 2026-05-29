import { useProcessStore } from 'src/states/process.state';
import { PriorityQueue } from 'src/structure/PriorityQueue';
import Queue from 'src/structure/Queue';
import { TProcess } from 'src/types/process.type';
import { TInitializeProcessEventType, TProcessContextType } from './type.utils';

export function initializeProcessesAction(
  event: TInitializeProcessEventType
): Partial<TProcessContextType> {
  const processes = Object.values(event.processes);
  const newQueue = new PriorityQueue<TProcess>((a, b) => {
    return a.arrivalTime - b.arrivalTime;
  });
  processes.forEach((p) => newQueue.push(p));
  const setMetadata = useProcessStore.getState().fn.setMetadata;
  setMetadata({ status: 'running' });
  return {
    newQueue,
    waitingQueue: new Queue<TProcess>(),
    readyQueue: new Queue<TProcess>(),
  };
}

export function loadProcessContextEntry(
  context: TProcessContextType
): Partial<TProcessContextType> {
  if (!context.currentProcess && !context.readyQueue?.isEmpty()) {
    return { currentProcess: context.readyQueue?.dequeue() };
  }
  return {};
}

export function resetAction(): Partial<TProcessContextType> {
  const fn = useProcessStore.getState().fn;
  fn.resetProcesses();
  return {
    newQueue: undefined,
    readyQueue: undefined,
    waitingQueue: undefined,
    currentProcess: undefined,
    counter: 0,
    monitorData: [],
    metricsData: {},
  };
}

export function clearAction(): Partial<TProcessContextType> {
  const fn = useProcessStore.getState().fn;
  fn.clear();
  return {
    newQueue: undefined,
    readyQueue: undefined,
    waitingQueue: undefined,
    currentProcess: undefined,
    counter: 0,
    monitorData: [],
    metricsData: {},
  };
}
