import { Activity } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import ViewProcessItem from 'src/components/process-ui/ProcessItem/ViewProcessItem';
import { TProcess } from 'src/types/process.type';

interface TProps {
  runningProcess: TProcess | undefined;
}

export default function RunningProcessView({ runningProcess }: TProps) {
  return (
    <div className="relative flex flex-1 items-center justify-center p-4">
      <AnimatePresence mode="popLayout">
        {runningProcess ? (
          <motion.div
            key={runningProcess.pid}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-full max-w-sm"
          >
            <ViewProcessItem
              data={runningProcess}
              metadata={{ onlyShowCurrentBlockTask: true }}
              props={{
                className:
                  'border-none bg-transparent dark:bg-transparent shadow-none hover:shadow-none p-0',
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 text-zinc-400"
          >
            <Activity size={32} className="opacity-20" />
            <span className="text-xs font-medium tracking-widest uppercase opacity-50">
              Core Idle
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-40 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
    </div>
  );
}
