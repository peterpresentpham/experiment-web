import { Timer } from 'lucide-react';
import { TProcessTime } from 'src/types/process.type';

interface TBlockTaskItemProps {
  index?: number;
  item: TProcessTime;
}

function BlockTaskItem({ index, item }: TBlockTaskItemProps) {
  const subProgress = (item.runtime / item.executionTime) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        {index != undefined ? (
          <span className="text-muted-foreground">Task #{index + 1}</span>
        ) : (
          <div />
        )}
        <span className="font-medium">
          T+{item.arrivalTime} ({item.executionTime}ms)
        </span>
      </div>
      <div className="h-1 overflow-hidden bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-orange-400 transition-all duration-300"
          style={{ width: `${subProgress}%` }}
        />
      </div>
    </div>
  );
}

interface TProps {
  onlyShowCurrentBlockTask?: boolean;
  data: Array<TProcessTime>;
  currentBlockTaskIndex: number;
}

export default function BlockTaskList({
  onlyShowCurrentBlockTask,
  data,
  currentBlockTaskIndex,
}: TProps) {
  if (data[currentBlockTaskIndex] == undefined && onlyShowCurrentBlockTask == true) return null;

  const content =
    onlyShowCurrentBlockTask == true ? (
      <div className="space-y-2">
        <BlockTaskItem item={data[currentBlockTaskIndex]} />
      </div>
    ) : (
      <div className="space-y-2">
        {data.map((item, index) => {
          return <BlockTaskItem key={index} index={index} item={item} />;
        })}
      </div>
    );

  return (
    <div className="bg-black/5 p-2 dark:bg-white/5">
      <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
        <Timer size={12} />
        {onlyShowCurrentBlockTask ? 'Next task' : `Blocked Tasks (${data.length})`}
      </p>
      {content}
    </div>
  );
}
