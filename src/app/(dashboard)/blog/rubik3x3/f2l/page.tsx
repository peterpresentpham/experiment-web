import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { generateAppMetadata } from 'src/services';
import F2lView from 'src/views/Rubik3x3View/F2lView';

export const metadata: Metadata = generateAppMetadata('Rubik 3x3 | F2L');

export default function F2L() {
  return (
    <div className="container py-4">
      <CssBreadcrumbs
        configs={[
          { label: 'Blog', link: '/blog' },
          { label: 'Rubik 3x3', link: RUBIK_BASE },
          { label: 'f2l' },
        ]}
      />
      <F2lView />
    </div>
  );
}
