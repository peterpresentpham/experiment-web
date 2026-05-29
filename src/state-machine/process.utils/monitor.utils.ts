import { useProcessStore } from 'src/states/process.state';
import { TProcessMonitor } from 'src/types/process.type';

export function addMonitorData(
  newData: Array<TProcessMonitor>,
  oldData: Array<TProcessMonitor>
): Array<TProcessMonitor> {
  const maxBlockTaskPerSlice = useProcessStore.getState().maxBlockTaskPerSlice;

  const minIndex =
    oldData.length >= maxBlockTaskPerSlice ? oldData.length - maxBlockTaskPerSlice : 0;

  for (const newProcess of newData) {
    const foundIndex = oldData.slice(minIndex).findLastIndex((item) => item.pid === newProcess.pid);

    if (foundIndex !== -1) {
      const realIndex = foundIndex + minIndex;
      const oldProcess = oldData[realIndex];

      if (oldProcess.state === newProcess.state && oldProcess.end === newProcess.start) {
        oldData[realIndex].end = newProcess.end;
        continue;
      }
    }
    oldData.push(newProcess);
  }
  return oldData;
}
