'use client';

import { BarChart2, LayoutGrid, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import MetricDialog from 'src/components/process-ui/dialogs/MetricDialog';
import UpdateProcessDialog from 'src/components/process-ui/dialogs/UpdateProcessDialog';
import { Button } from 'src/components/shadcn/button';
import { sleep } from 'src/services';
import { useProcessStateMachine } from 'src/state-machine/process.state-machine';
import { useProcessStore } from 'src/states/process.state';
import { ProcessMachineEvent } from 'src/types/process.type';
import SettingSpot from './SettingSpot';
import TimeSliceCounter from './TimeSliceCounter';
import { useMessages } from 'src/i18n/client';
import { processMessages } from 'src/i18n/messages/process';

export default function ProcessHeader() {
  const [updateProcessOpen, setUpdateProcessOpen] = useState(false);
  const { processes, status, displayMode, fn } = useProcessStore();
  const { send } = useProcessStateMachine();

  const t = useMessages(processMessages);
  const text = useMemo(() => {
    if (status == 'ready' || status == 'initial') return t.run;
    else if (status == 'ended') return t.rerun;
    else return t.pause;
  }, [status, t]);

  async function onRun() {
    if (status == 'initial' || status == 'ready')
      send({ type: ProcessMachineEvent.INITIALIZE, processes });
    else if (status == 'ended') {
      send({ type: ProcessMachineEvent.RESET });
      await sleep(1400);
      send({
        type: ProcessMachineEvent.INITIALIZE,
        processes: useProcessStore.getState().processes,
      });
    }
  }

  function onChangeDisplayMode() {
    if (displayMode == 'chart') fn.setMetadata({ displayMode: 'column' });
    else fn.setMetadata({ displayMode: 'chart' });
  }

  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <UpdateProcessDialog open={updateProcessOpen} onOpenChange={setUpdateProcessOpen} />
        <Button
          onClick={() => void onRun()}
          variant={status == 'ended' ? 'outline' : 'secondary'}
          size="sm"
          className="bg-success/10 text-success hover:bg-success/20 hover:text-success"
        >
          {status == 'initial' || status == 'ready' ? <Play size={5} /> : <></>}
          <span className="text-xs font-semibold tracking-tight uppercase">{text}</span>
        </Button>
        <Button
          onClick={onChangeDisplayMode}
          variant="ghost"
          className="h-8 border-x border-transparent hover:border-border hover:bg-muted"
          size="sm"
        >
          {displayMode == 'chart' ? (
            <div className="flex items-center gap-1.5">
              <LayoutGrid size={12} className="text-muted-foreground" />
              <span className="text-xs font-bold tracking-tight uppercase">{t.columnView}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <BarChart2 size={12} className="text-muted-foreground" />
              <span className="text-xs font-bold tracking-tight uppercase">{t.chartView}</span>
            </div>
          )}
        </Button>
        <MetricDialog />
      </div>
      <SettingSpot />
      <TimeSliceCounter />
    </div>
  );
}
