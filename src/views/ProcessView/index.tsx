'use client';

import { ListEmpty } from 'src/components/box/Empty';
import { Button } from 'src/components/shadcn/button';
import { ProcessMachineContext } from 'src/state-machine/process.state-machine';
import { useProcessStore } from 'src/states/process.state';
import ExportImportData from './ExportImportData';
import ProcessHeader from './ProcessHeader';
import ProcessQueueView from './ProcessQueueView';
import TimelineChart from './TimelineChart';

function ProcessViewLayout() {
  const { processes, displayMode } = useProcessStore();

  return (
    <div>
      <ProcessHeader />
      {Object.values(processes).length == 0 ? (
        <ListEmpty
          title="No processes created yet."
          rootprops={{ className: 'cols-span-2 flex-col mt-2' }}
          component={
            <div className="mt-2 flex items-center gap-2">
              <ExportImportData
                isShowExport={false}
                components={{ import: <Button className="">Import</Button> }}
              />
            </div>
          }
        />
      ) : (
        <>
          {displayMode == 'column' && <ProcessQueueView />}
          {displayMode == 'chart' && (
            <div className="mt-2 h-[calc(100dvh-var(--header-height)-5rem)] min-h-96 rounded-lg border p-2 shadow-xs">
              <TimelineChart />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProcessView() {
  return (
    <ProcessMachineContext.Provider>
      <ProcessViewLayout />
    </ProcessMachineContext.Provider>
  );
}
