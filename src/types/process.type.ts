export enum ProcessMachineStateType {
  INITIAL = 'initial',
  SCHEDULING = 'scheduling', // simulate the incoming process go and the scheduler arrange process priority
  RUNNING = 'running',
  CONTEXT_SAVING = 'context-saving',
  CONTEXT_LOADING = 'context-loading',
  TERMINATED = 'terminated',
}

export enum ProcessStatusType {
  NEW = 'new',
  READY = 'ready',
  RUNNING = 'running',
  WAITING = 'waiting',
  TERMINATED = 'terminated',
}

export enum ProcessMonitoringStatusType {
  RUNNING = 'running',
  RUNNING_BLOCKING_TASK = 'running-blocking-task',
}

export interface TProcessMonitor {
  pid: string;
  index?: number;
  start: number;
  end: number;
  state: ProcessMonitoringStatusType;
}

export type TProcessTime = {
  arrivalTime: number; // Time when the process arrives (enters the ready queue)
  executionTime: number; // Total CPU time required to finish the process
  runtime: number; // CPU time already spent running
};

export type TProcess = TProcessTime & {
  index?: number;
  pid: string;
  blockTasks?: Array<TProcessTime>; // simulate the waiting state (example: I/O)
  currentBlockTaskIndex: number;
  state: ProcessStatusType;
  readyPriority: number;
  waitingPriority: number;
  beginAt: number;
  endAt: number;
};

export type TProcessDataObject = {
  [id: string]: TProcess;
};

export type TProcessStoreStatus = 'initial' | 'ready' | 'running' | 'pause' | 'ended';

export enum SchedulerModeType {
  FIFO = 'fifo',
  SJF = 'sjf',
  ROUND_ROBIN = 'round-robin',
  MLFQ = 'mlfq',
}

export enum ProcessMachineEvent {
  INITIALIZE = 'initialize',
  SET_METADATA = 'set-metadata',
  RESET = 'reset',
  CLEAR = 'clear',
}

export type TProcessMetrics = {
  index?: number;
  arrivalTime: number;
  burstTime: number; // the total process run
  startTime?: number; // the first time process run
  completionTime?: number; // the time process fullfil
};

export type TProcessMeasureMetrics = {
  turnaroundTime?: number; // = completionTime - arrivalTime
  waitingTime?: number; // = turnaroundTime - burstTime
  responseTime?: number; // = startTime - arrivalTime
};
