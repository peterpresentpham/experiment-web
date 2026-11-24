import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import GuideView from 'src/views/ChessView/GuideView';

export async function generateMetadata(): Promise<Metadata> {
  const { chess } = await getMessages(blogMessages);
  return generateAppMetadata(chess.title, chess.description);
}

export default async function Chess({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const [{ level }, { title, chess }] = await Promise.all([
    searchParams,
    getMessages(blogMessages),
  ]);
  return (
    <div className="container py-4 pb-20">
      <CssBreadcrumbs
        configs={[{ label: title, link: '/blog' }, { label: chess.title }]}
        className="mb-4"
      />
      <GuideView level={level} />
    </div>
  );
}
