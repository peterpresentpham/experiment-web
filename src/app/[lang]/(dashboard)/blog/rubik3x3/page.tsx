import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { RUBIK_LEVELS } from 'src/configs/rubikBook.config';
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
  // Old links used `?level=` for the three tabs; each level is now a reading path in the book.
  const known = RUBIK_LEVELS.find((value) => value === level);
  if (known) redirect(`${RUBIK_BASE}#path-${known}`);

  return (
    <div className="container py-4 pb-20">
      <CssBreadcrumbs
        configs={[{ label: title, link: '/blog' }, { label: rubik.title }]}
        className="mb-4"
      />
      <GuideView />
    </div>
  );
}
