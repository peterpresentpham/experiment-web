import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import GuideView from 'src/views/Rubik3x3View/GuideView';

export async function generateMetadata(): Promise<Metadata> {
  const { rubik } = await getMessages(blogMessages);
  return generateAppMetadata(rubik.title, rubik.description);
}

export default async function Rubik3x3({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const [{ level }, { title, rubik }] = await Promise.all([
    searchParams,
    getMessages(blogMessages),
  ]);
  return (
    <div className="container py-4 pb-20">
      <CssBreadcrumbs
        configs={[{ label: title, link: '/blog' }, { label: rubik.title }]}
        className="mb-4"
      />
      <GuideView level={level} />
    </div>
  );
}
