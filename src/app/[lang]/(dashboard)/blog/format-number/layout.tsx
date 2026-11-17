import { ReactNode } from 'react';
import DocsNav from 'src/components/Layouts/DocsNav';
import { FORMAT_NUMBER_BASE, FORMAT_NUMBER_PAGES } from 'src/configs/blog.config';
import { blogMessages } from 'src/i18n/messages/blog';
import { getMessages } from 'src/i18n/server';

type TProps = {
  children: ReactNode;
};

export default async function FormatNumberLayout({ children }: TProps) {
  const { formatNumber } = await getMessages(blogMessages);
  const items = FORMAT_NUMBER_PAGES.map((page) => ({
    title: formatNumber.pages[page.slug],
    href: `${FORMAT_NUMBER_BASE}/${page.slug}`,
  }));

  return (
    <div className="container flex flex-col gap-6 py-6 lg:flex-row lg:gap-10">
      <DocsNav title={formatNumber.docs} items={items} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
