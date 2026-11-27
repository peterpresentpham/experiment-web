import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import GuideView from 'src/views/CaroGuideView/GuideView';

export async function generateMetadata(): Promise<Metadata> {
  const { caro } = await getMessages(blogMessages);
  return generateAppMetadata(caro.title, caro.description);
}

export default async function CaroGuide({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const [{ level }, { title, caro }] = await Promise.all([searchParams, getMessages(blogMessages)]);
  return (
    <div className="container py-4 pb-20">
      <CssBreadcrumbs
        configs={[{ label: title, link: '/blog' }, { label: caro.title }]}
        className="mb-4"
      />
      <GuideView level={level} />
    </div>
  );
}
