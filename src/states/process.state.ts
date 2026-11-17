import { resetRuntimeFields } from 'src/services/process.utils';
import {
  TProcessDataObject,
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
              const process = state.processes[pid];
              if (!process) return;
              // beginAt = -1 means "not set": keep the recorded start instead of wiping it.
              const { beginAt, ...rest } = data;
              Object.assign(process, rest);
              if (beginAt !== undefined && beginAt !== -1) process.beginAt = beginAt;
            });
          },
          resetProcesses: () => {
            set((state) => {
              const ordered = Object.values(state.processes).sort(
                (a, b) => a.arrivalTime - b.arrivalTime
              );
              ordered.forEach((process, i) => {
                Object.assign(process, resetRuntimeFields(process), { index: i + 1 });
              });
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
