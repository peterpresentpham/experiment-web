import { Metadata } from 'next';
import { processMessages } from 'src/i18n/messages/process';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import ProcessView from 'src/views/ProcessView';

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMessages(processMessages);
  return generateAppMetadata(meta.title, meta.description);
}

export default function Process() {
  return (
    <div className="container pt-1 pb-0">
      <ProcessView />
    </div>
  );
}
