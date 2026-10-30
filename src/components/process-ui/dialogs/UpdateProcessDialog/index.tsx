import { DialogProps } from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { Button } from 'src/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from 'src/components/shadcn/dialog';
import { useProcessStore } from 'src/states/process.state';
import {
  TProcessDataObject,
  ProcessStatusType,
  TProcessTime,
  TProcess,
} from 'src/types/process.type';
import MainProcessList from './MainProcessList';
import UpdateFooter from './UpdateFooter';

export default function UpdateProcessDialog(props: DialogProps) {
  const {
    status,
    processes,
    fn: { setProcesses, setMetadata },
  } = useProcessStore();
  const [data, setData] = useState<TProcessDataObject>({});

  useEffect(() => {
    if (props.open) setData(processes);
  }, [props.open, processes]);

  function onCreateProcess() {
    setData((state) => {
      const pid = crypto.randomUUID();
      const newProcess: TProcess = {
        pid,
        arrivalTime: 0,
        executionTime: 10,
        runtime: 10,
        currentBlockTaskIndex: 0,
        state: ProcessStatusType.NEW,
        readyPriority: -1,
        waitingPriority: -1,
        beginAt: -1,
        endAt: -1,
      };
      return { [pid]: newProcess, ...state };
    });
  }

  function onSave() {
    const cleanData: TProcessDataObject = {};
    Object.values(data)
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .forEach((process, index) => {
        const cleanBlockTasks: Array<TProcessTime> = [];
        (process.blockTasks || []).forEach((task) => {
          const isIntersects = cleanBlockTasks.some((t) => {
            const start1 = task.arrivalTime;
            const end1 = task.arrivalTime + task.executionTime;
            const start2 = t.arrivalTime;
            const end2 = t.arrivalTime + t.executionTime;
            return start1 < end2 && start2 < end1;
          });
          if (!isIntersects) cleanBlockTasks.push(task);
        });

        let executionTime = process.executionTime;
        const maxBlockTaskEnd = cleanBlockTasks.reduce((max, task) => {
          return Math.max(max, task.arrivalTime + task.executionTime);
        }, 0);

        if (maxBlockTaskEnd > executionTime) executionTime = maxBlockTaskEnd;
        cleanData[process.pid] = {
          ...process,
          blockTasks: cleanBlockTasks.sort((item1, item2) => {
            return item1.arrivalTime - item2.arrivalTime;
          }),
          executionTime,
          runtime: 0,
          index: index + 1,
        };
      });

    setProcesses(cleanData);
    if (Object.keys(cleanData).length > 0) setMetadata({ status: 'ready' });
    else setMetadata({ status: 'initial' });
    if (props.onOpenChange) props.onOpenChange(false);
  }

  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={status != 'initial' && status != 'ready'}
          className="cursor-pointer"
        >
          Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-4">
        <DialogHeader>Update Process</DialogHeader>
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Processes</p>
          <Button variant="outline" size="sm" className="" onClick={onCreateProcess} type="button">
            + Add Process
          </Button>
        </div>
        <MainProcessList data={data} setData={setData} />
        <UpdateFooter onSave={onSave} onOpenChange={props.onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
