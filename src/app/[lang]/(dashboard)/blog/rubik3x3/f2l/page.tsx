import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import F2lView from 'src/views/Rubik3x3View/F2lView';

export async function generateMetadata(): Promise<Metadata> {
  const { rubik } = await getMessages(blogMessages);
  return generateAppMetadata(rubik.f2lTitle);
}

export default async function F2L() {
  const { title, rubik } = await getMessages(blogMessages);

  return (
    <div className="container py-4">
      <CssBreadcrumbs
        configs={[
          { label: title, link: '/blog' },
          { label: rubik.title, link: RUBIK_BASE },
          { label: 'f2l' },
        ]}
      />
      <F2lView />
    </div>
  );
}
