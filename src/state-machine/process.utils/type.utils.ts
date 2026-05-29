import { PriorityQueue } from 'src/structure/PriorityQueue';
import Queue from 'src/structure/Queue';
import {
  TProcessDataObject,
  ProcessMachineEvent,
  TProcessMetrics,
  TProcessMonitor,
  TProcess,
} from 'src/types/process.type';

export interface TProcessContextType {
  interval: number;
  counter: number;
  newQueue: PriorityQueue<TProcess> | undefined; // incoming processes
  waitingQueue: Queue<TProcess> | undefined;
  readyQueue: Queue<TProcess> | undefined;
  currentProcess: TProcess | undefined;
  monitorData: Array<TProcessMonitor>;
  metricsData: Record<string, TProcessMetrics>;
}

export type TInitializeProcessEventType = {
  type: ProcessMachineEvent.INITIALIZE;
  processes: TProcessDataObject;
};

export type TSetMetadataEventType = {
  type: ProcessMachineEvent.SET_METADATA;
  interval?: number;
};

export type TProcessEventType =
  | TInitializeProcessEventType
  | TSetMetadataEventType
  | { type: ProcessMachineEvent.RESET }
  | { type: ProcessMachineEvent.CLEAR };
