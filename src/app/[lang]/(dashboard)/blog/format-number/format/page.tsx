import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { Separator } from 'src/components/shadcn/separator';
import { FORMAT_NUMBER_BASE, FORMAT_NUMBER_PAGES } from 'src/configs/blog.config';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';
import { generateAppMetadata } from 'src/services';
import FormatPage from 'src/views/FormatNumberView/format';

const page = FORMAT_NUMBER_PAGES.find((item) => item.slug === 'format')!;

export async function generateMetadata(): Promise<Metadata> {
  const { formatNumber } = await getMessages(blogMessages);
  return generateAppMetadata(`${formatNumber.title} | ${formatNumber.pages[page.slug]}`);
}

export default async function Page() {
  const { title, formatNumber } = await getMessages(blogMessages);

  return (
    <>
      <CssBreadcrumbs
        configs={[
          { label: title, link: '/blog' },
          { label: formatNumber.title, link: FORMAT_NUMBER_BASE },
          { label: page.label },
        ]}
      />
      <Separator className="my-2" />
      <FormatPage />
    </>
  );
}
