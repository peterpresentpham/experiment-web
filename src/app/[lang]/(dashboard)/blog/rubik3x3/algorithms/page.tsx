import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import { TCaseKind } from 'src/services/rubik/search.utils';
import AlgorithmsView from 'src/views/Rubik3x3View/AlgorithmsView';

export async function generateMetadata(): Promise<Metadata> {
  const { rubik } = await getMessages(blogMessages);
  return generateAppMetadata(rubik.algorithmsTitle, rubik.algorithmsDescription);
}

const KINDS: Array<TCaseKind> = ['oll', 'pll', 'f2l'];

export default async function Algorithms({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const [{ q, type }, { title, rubik }] = await Promise.all([
    searchParams,
    getMessages(blogMessages),
  ]);

  return (
    <div className="container py-4 pb-20">
      <CssBreadcrumbs
        configs={[
          { label: title, link: '/blog' },
          { label: rubik.title, link: RUBIK_BASE },
          { label: rubik.algorithmsBreadcrumb },
        ]}
        className="mb-4"
      />
      <AlgorithmsView query={q} kind={KINDS.find((kind) => kind === type)} />
    </div>
  );
}
