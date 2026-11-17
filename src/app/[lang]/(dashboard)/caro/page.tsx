import { Metadata } from 'next';
import { caroMessages } from 'src/i18n/messages/caro';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import CaroView from 'src/views/CaroView';

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMessages(caroMessages);
  return generateAppMetadata(meta.title, meta.description);
}

export default function Caro() {
  return <CaroView />;
}
