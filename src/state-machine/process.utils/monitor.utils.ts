import { useProcessStore } from 'src/states/process.state';
import { TProcessMonitor } from 'src/types/process.type';

export function addMonitorData(
  newData: Array<TProcessMonitor>,
  oldData: Array<TProcessMonitor>
): Array<TProcessMonitor> {
  const maxBlockTaskPerSlice = useProcessStore.getState().maxBlockTaskPerSlice;

  // Create a new copy to avoid mutation, ensuring React detects changes
  const result = [...oldData];

  const minIndex = result.length >= maxBlockTaskPerSlice ? result.length - maxBlockTaskPerSlice : 0;

  for (const newProcess of newData) {
    const foundIndex = result.slice(minIndex).findLastIndex((item) => item.pid === newProcess.pid);

    if (foundIndex !== -1) {
      const realIndex = foundIndex + minIndex;
      const oldProcess = result[realIndex];

      if (oldProcess.state === newProcess.state && oldProcess.end === newProcess.start) {
        result[realIndex] = { ...oldProcess, end: newProcess.end };
        continue;
      }
    }
    result.push(newProcess);
  }
  return result;
}
