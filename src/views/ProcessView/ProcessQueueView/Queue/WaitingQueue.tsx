import { AnimatePresence, motion } from 'motion/react';
import ViewProcessItem from 'src/components/process-ui/ProcessItem/ViewProcessItem';
import { ProcessStatusType, TProcess } from 'src/types/process.type';
import BaseQueue from './BaseQueue';
import { useMessages } from 'src/i18n/client';
import { processMessages } from 'src/i18n/messages/process';

interface TProps {
  processList: TProcess[];
}

export default function WaitingQueue({ processList }: TProps) {
  const { queues } = useMessages(processMessages);
  const waitingProcesses = processList
    .filter((p) => p.state === ProcessStatusType.WAITING)
    .sort((p1, p2) => {
      if (p1.waitingPriority - p2.waitingPriority != 0)
        return p1.waitingPriority - p2.waitingPriority;
      else return p1.arrivalTime - p2.arrivalTime;
    });

  return (
    <BaseQueue title={queues.waiting} count={waitingProcesses.length}>
      <AnimatePresence mode="popLayout">
        {waitingProcesses.map((process) => (
          <motion.div
            key={process.pid}
            layoutId={process.pid}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <ViewProcessItem data={process} metadata={{ onlyShowCurrentBlockTask: true }} />
          </motion.div>
        ))}
        {waitingProcesses.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">{queues.noWaiting}</p>
        )}
      </AnimatePresence>
    </BaseQueue>
  );
}
