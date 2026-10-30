import { Dispatch, SetStateAction } from 'react';
import { ListEmpty } from 'src/components/box/Empty';
import ChangeProcessItem from 'src/components/process-ui/ProcessItem/ChangeProcessItem';
import { Button } from 'src/components/shadcn/button';
import { TProcessDataObject } from 'src/types/process.type';
import ExportImportData from 'src/views/ProcessView/ExportImportData';

interface TProps {
  data: TProcessDataObject;
  setData: Dispatch<SetStateAction<TProcessDataObject>>;
}

export default function MainProcessList({ data, setData }: TProps) {
  return (
    <div className="max-h-100 overflow-y-auto">
      {Object.values(data).length === 0 ? (
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
        Object.values(data).map((item) => {
          return (
            <ChangeProcessItem
              key={item.pid}
              data={item}
              events={{
                onAddBlockTask: () => {
                  setData((state) => {
                    const currentTasks = state[item.pid].blockTasks || [];
                    return {
                      ...state,
                      [item.pid]: {
                        ...state[item.pid],
                        blockTasks: [
                          { arrivalTime: 0, executionTime: 1, runtime: 0 },
                          ...currentTasks,
                        ],
                      },
                    };
                  });
                },
                onBlockTaskArrivalTimeChange: (index, arrivalTime) => {
                  setData((state) => {
                    const currentProcess = state[item.pid];
                    const currentTasks = [...(currentProcess.blockTasks || [])];
                    if (!currentTasks[index]) return state;

                    currentTasks[index] = { ...currentTasks[index], arrivalTime };
                    return {
                      ...state,
                      [item.pid]: {
                        ...currentProcess,
                        blockTasks: currentTasks,
                      },
                    };
                  });
                },
                onBlockTaskExecutionTimeChange: (index, executionTime) => {
                  setData((state) => {
                    const currentProcess = state[item.pid];
                    const currentTasks = [...(currentProcess.blockTasks || [])];
                    if (!currentTasks[index]) return state;

                    currentTasks[index] = {
                      ...currentTasks[index],
                      executionTime,
                      runtime: 0,
                    };
                    return {
                      ...state,
                      [item.pid]: {
                        ...currentProcess,
                        blockTasks: currentTasks,
                      },
                    };
                  });
                },
                onBlockTaskDelete: (index) => {
                  setData((state) => {
                    const currentProcess = state[item.pid];
                    const currentTasks = (currentProcess.blockTasks || []).filter(
                      (_, i) => i !== index
                    );
                    return {
                      ...state,
                      [item.pid]: {
                        ...currentProcess,
                        blockTasks: currentTasks,
                      },
                    };
                  });
                },
                onExecutionTimeChange: (executionTime) => {
                  setData((state) => ({
                    ...state,
                    [item.pid]: { ...state[item.pid], executionTime },
                  }));
                },
                onArrivalTimeChange: (arrivalTime) => {
                  setData((state) => ({
                    ...state,
                    [item.pid]: { ...state[item.pid], arrivalTime },
                  }));
                },
                onDelete: () => {
                  setData((state) => {
                    const { [item.pid]: _, ...newState } = state;
                    return newState;
                  });
                },
              }}
            />
          );
        })
      )}
    </div>
  );
}
