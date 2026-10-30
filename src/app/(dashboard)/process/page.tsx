import { Metadata } from 'next';
import { generateAppMetadata } from 'src/services';
import ProcessView from 'src/views/ProcessView';

export const metadata: Metadata = generateAppMetadata(
  'Process Scheduler',
  'Visualize how an operating system schedules processes across CPU cores.'
);

export default function Process() {
  return (
    <div className="container pt-1 pb-0">
      <ProcessView />
    </div>
  );
}
