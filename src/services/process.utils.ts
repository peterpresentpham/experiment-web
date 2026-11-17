import { ProcessStatusType, TProcess, TProcessDataObject } from 'src/types/process.type';

type TRuntimeFields = Pick<
  TProcess,
  | 'runtime'
  | 'state'
  | 'currentBlockTaskIndex'
  | 'readyPriority'
  | 'waitingPriority'
  | 'beginAt'
  | 'endAt'
  | 'blockTasks'
>;

/** Simulation fields of a process set back to "not started yet". */
export function resetRuntimeFields(process: Pick<TProcess, 'blockTasks'>): TRuntimeFields {
  const fields: TRuntimeFields = {
    runtime: 0,
    state: ProcessStatusType.NEW,
    currentBlockTaskIndex: 0,
    readyPriority: -1,
    waitingPriority: -1,
    beginAt: -1,
    endAt: -1,
  };
  if (process.blockTasks) {
    fields.blockTasks = process.blockTasks.map((task) => ({ ...task, runtime: 0 }));
  }
  return fields;
}

type TImportedProcess = Partial<TProcess> & Pick<TProcess, 'arrivalTime' | 'executionTime'>;

/**
 * Turns user-provided JSON into processes ready to simulate.
 * Accepts either an array of processes or an object keyed by pid; runtime fields are reset.
 */
export function parseImportedProcesses(json: unknown): TProcessDataObject {
  const result: TProcessDataObject = {};
  if (Array.isArray(json)) {
    (json as Array<TImportedProcess>).forEach((item, index) => {
      const pid = item.pid || crypto.randomUUID();
      result[pid] = {
        ...(item as TProcess),
        ...resetRuntimeFields(item),
        pid,
        index: item.index ?? index + 1,
      };
    });
  } else if (typeof json === 'object' && json !== null) {
    Object.entries(json as Record<string, TImportedProcess>).forEach(([key, item]) => {
      result[key] = { ...(item as TProcess), ...resetRuntimeFields(item), pid: item.pid || key };
    });
  }
  return result;
}
