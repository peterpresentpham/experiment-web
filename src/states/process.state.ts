import cloneDeep from 'lodash.clonedeep';
import {
  TProcessDataObject,
  ProcessStatusType,
  TProcessStoreStatus,
  TProcess,
  SchedulerModeType,
} from 'src/types/process.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface TProcessMetadataType {
  mode: SchedulerModeType;
  status: TProcessStoreStatus;
  interval: number;
  maxBlockTaskPerSlice: number;
  displayMode: 'chart' | 'column';
}

interface TProcessStateType extends TProcessMetadataType {
  processes: TProcessDataObject;
  fn: {
    setMetadata: (metadata?: Partial<TProcessMetadataType>) => void;
    setProcesses: (processes: TProcessDataObject) => void;
    updateProcess: (pid: string, data: Partial<Omit<TProcess, 'pid'>>) => void;
    resetProcesses: () => void;
    clear: () => void;
  };
}

export const useProcessStore = create<
  TProcessStateType,
  [['zustand/persist', unknown], ['zustand/immer', unknown]]
>(
  persist(
    immer((set) => {
      return {
        mode: SchedulerModeType.FIFO,
        processes: {},
        displayMode: 'column',
        status: 'initial',
        interval: 1000,
        maxBlockTaskPerSlice: 5,
        fn: {
          setMetadata: (metadata?: Partial<TProcessMetadataType>) => {
            set((state) => {
              if (metadata?.mode) state.mode = metadata.mode;
              if (metadata?.status) state.status = metadata.status;
              if (metadata?.interval) state.interval = metadata.interval;
              if (metadata?.maxBlockTaskPerSlice)
                state.maxBlockTaskPerSlice = metadata.maxBlockTaskPerSlice;
              if (metadata?.displayMode) state.displayMode = metadata.displayMode;
            });
          },
          setProcesses: (processes: TProcessDataObject) => {
            set((state) => {
              state.processes = processes;
            });
          },
          updateProcess: (pid: string, data: Partial<Omit<TProcess, 'pid'>>) => {
            set((state) => {
              if (state.processes[pid]) {
                if (data.beginAt == -1) data.beginAt = state.processes[pid].beginAt;
                Object.assign(state.processes[pid], data);
              }
            });
          },
          resetProcesses: () => {
            set((state) => {
              const newProcesses = cloneDeep(state.processes);
              let counter = 1;
              for (const item of Object.values(newProcesses).sort(
                (a, b) => a.arrivalTime - b.arrivalTime
              )) {
                newProcesses[item.pid].index = counter++;
                newProcesses[item.pid].runtime = 0;
                newProcesses[item.pid].state = ProcessStatusType.NEW;
                newProcesses[item.pid].currentBlockTaskIndex = 0;
                newProcesses[item.pid].readyPriority = -1;
                newProcesses[item.pid].waitingPriority = -1;
                newProcesses[item.pid].beginAt = -1;
                newProcesses[item.pid].endAt = -1;
                if (newProcesses[item.pid].blockTasks) {
                  newProcesses[item.pid].blockTasks = newProcesses[item.pid].blockTasks?.map(
                    (task) => ({ ...task, runtime: 0 })
                  );
                }
              }
              state.processes = newProcesses;
              state.status = 'ready';
            });
          },
          clear: () => {
            set((state) => {
              state.processes = {};
              state.status = 'initial';
            });
          },
        },
      };
    }),
    {
      name: 'experiment.process.v3',
      version: 1.0,
      migrate(persistedState, version) {
        if (version < 1.0) {
          return { ...(persistedState as TProcessStateType) };
        }
        return persistedState;
      },
      partialize: (state) => {
        const { fn, ...restState } = state;
        return restState;
      },
    }
  )
);
