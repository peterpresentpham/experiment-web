import { motion } from 'motion/react';
import ViewProcessItem from 'src/components/process-ui/ProcessItem/ViewProcessItem';
import { TProcess } from 'src/types/process.type';
import BaseQueue from './BaseQueue';

interface TProps {
  incomingProcesses: TProcess[];
}

export default function IncomingQueue({ incomingProcesses }: TProps) {
  return (
    <BaseQueue title="Incoming" count={incomingProcesses.length}>
      {incomingProcesses.map((process) => (
        <motion.div
          key={process.pid}
          layoutId={process.pid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ViewProcessItem data={process} />
        </motion.div>
      ))}
      {incomingProcesses.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">No incoming processes</p>
      )}
    </BaseQueue>
  );
}
