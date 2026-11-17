import { Metadata } from 'next';
import { pikachuMessages } from 'src/i18n/messages/pikachu';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import PikachuView from 'src/views/PikachuView';

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getMessages(pikachuMessages);
  return generateAppMetadata(meta.title, meta.description);
}

export default function Pikachu() {
  return <PikachuView />;
}
