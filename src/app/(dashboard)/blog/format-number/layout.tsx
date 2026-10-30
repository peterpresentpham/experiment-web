import { ReactNode } from 'react';
import DocsNav from 'src/components/Layouts/DocsNav';
import { FORMAT_NUMBER_BASE, FORMAT_NUMBER_PAGES } from 'src/configs/blog.config';

type TProps = {
  children: ReactNode;
};

export default function FormatNumberLayout({ children }: TProps) {
  const items = FORMAT_NUMBER_PAGES.map((page) => ({
    title: page.title,
    href: `${FORMAT_NUMBER_BASE}/${page.slug}`,
  }));

  return (
    <div className="container flex flex-col gap-6 py-6 lg:flex-row lg:gap-10">
      <DocsNav title="Documentation" items={items} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
