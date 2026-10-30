import { AnimatePresence, motion } from 'motion/react';
import ViewProcessItem from 'src/components/process-ui/ProcessItem/ViewProcessItem';
import { ProcessStatusType, TProcess } from 'src/types/process.type';
import BaseQueue from './BaseQueue';

interface TProps {
  processList: TProcess[];
}

export default function ReadyQueue({ processList }: TProps) {
  const readyProcesses = processList
    .filter((p) => p.state === ProcessStatusType.READY)
    .sort((p1, p2) => {
      if (p1.readyPriority - p2.readyPriority != 0) return p1.readyPriority - p2.readyPriority;
      else return p1.arrivalTime - p2.arrivalTime;
    });

  return (
    <BaseQueue title="Ready" count={readyProcesses.length}>
      <AnimatePresence mode="popLayout">
        {readyProcesses.map((process) => (
          <motion.div
            key={process.pid}
            layoutId={process.pid}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <ViewProcessItem data={process} metadata={{ onlyShowCurrentBlockTask: true }} />
          </motion.div>
        ))}
        {readyProcesses.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">Queue is empty</p>
        )}
      </AnimatePresence>
    </BaseQueue>
  );
}
