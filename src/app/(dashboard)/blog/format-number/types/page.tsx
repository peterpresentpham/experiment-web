import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { Separator } from 'src/components/shadcn/separator';
import { FORMAT_NUMBER_BASE, FORMAT_NUMBER_PAGES } from 'src/configs/blog.config';
import { generateAppMetadata } from 'src/services';
import TypesPage from 'src/views/FormatNumberView/types';

const page = FORMAT_NUMBER_PAGES.find((item) => item.slug === 'types')!;

export const metadata: Metadata = generateAppMetadata(`Format number | ${page.title}`);

export default function Page() {
  return (
    <>
      <CssBreadcrumbs
        configs={[
          { label: 'Blog', link: '/blog' },
          { label: 'Format number', link: FORMAT_NUMBER_BASE },
          { label: page.label },
        ]}
      />
      <Separator className="my-2" />
      <TypesPage />
    </>
  );
}
