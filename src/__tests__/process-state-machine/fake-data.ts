import { TProcessDataObject, ProcessStatusType } from 'src/types/process.type';

export const initialProcesses: TProcessDataObject = {
  '52227ece-ad70-4d20-b196-026479e33770': {
    pid: '52227ece-ad70-4d20-b196-026479e33770',
    arrivalTime: 0,
    executionTime: 10,
    runtime: 0,
    currentBlockTaskIndex: 0,
    state: ProcessStatusType.NEW,
    readyPriority: -1,
    waitingPriority: -1,
    beginAt: -1,
    endAt: -1,
    blockTasks: [
      {
        arrivalTime: 4,
        executionTime: 5,
        runtime: 0,
      },
    ],
    index: 1,
  },
  '98bedffd-eaa2-45e6-bdd9-ef71a1fc0eac': {
    pid: '98bedffd-eaa2-45e6-bdd9-ef71a1fc0eac',
    arrivalTime: 6,
    executionTime: 10,
    runtime: 0,
    currentBlockTaskIndex: 0,
    state: ProcessStatusType.NEW,
    readyPriority: -1,
    waitingPriority: -1,
    beginAt: -1,
    endAt: -1,
    blockTasks: [
      {
        arrivalTime: 6,
        executionTime: 2,
        runtime: 0,
      },
    ],
    index: 2,
  },
  'deb8413e-bc04-4db2-9b02-44592fd8d979': {
    pid: 'deb8413e-bc04-4db2-9b02-44592fd8d979',
    arrivalTime: 3,
    executionTime: 10,
    runtime: 0,
    currentBlockTaskIndex: 0,
    state: ProcessStatusType.NEW,
    readyPriority: -1,
    waitingPriority: -1,
    beginAt: -1,
    endAt: -1,
    blockTasks: [
      {
        arrivalTime: 1,
        executionTime: 4,
        runtime: 0,
      },
    ],
    index: 3,
  },
};
