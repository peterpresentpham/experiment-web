import { motion } from 'motion/react';
import ViewProcessItem from 'src/components/process-ui/ProcessItem/ViewProcessItem';
import { ProcessStatusType, TProcess } from 'src/types/process.type';
import BaseQueue from './BaseQueue';

interface TProps {
  processList: TProcess[];
}

export default function TerminatedQueue({ processList }: TProps) {
  const terminatedProcesses = processList
    .filter((p) => p.state === ProcessStatusType.TERMINATED)
    .sort((p1, p2) => {
      if (p1.endAt - p2.endAt != 0) return p2.endAt - p1.endAt;
      else return p2.arrivalTime - p1.arrivalTime;
    });

  return (
    <BaseQueue title="Terminated" count={terminatedProcesses.length}>
      {terminatedProcesses.map((process) => (
        <motion.div
          key={process.pid}
          layoutId={process.pid}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <ViewProcessItem data={process} />
        </motion.div>
      ))}
      {terminatedProcesses.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">No terminated processes</p>
      )}
    </BaseQueue>
  );
}
