import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import ThesisLoading from 'src/components/Thesis/ThesisLoading';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';

export async function generateMetadata(): Promise<Metadata> {
  const { thesis } = await getMessages(blogMessages);
  return generateAppMetadata(thesis.metaTitle, thesis.metaDescription);
}

const MasterThesisView = dynamic(() => import('src/views/MasterThesisView'), {
  loading: () => <ThesisLoading />,
});

export default async function MasterThesis() {
  const { title, home, thesis } = await getMessages(blogMessages);

  return (
    <div className="container py-4">
      <CssBreadcrumbs
        className="mb-4"
        configs={[
          { label: home, link: '/' },
          { label: title, link: '/blog' },
          { label: thesis.breadcrumb },
        ]}
      />
      {/* The thesis itself is only written in English. */}
      <div lang="en">
        <MasterThesisView />
      </div>
    </div>
  );
}
