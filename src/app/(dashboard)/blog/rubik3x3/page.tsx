import { Metadata } from 'next';
import Link from 'next/link';
import { ArticleLI, ArticleUL } from 'src/components/box/ArticleBox';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { generateAppMetadata } from 'src/services';

export const metadata: Metadata = generateAppMetadata(
  'Rubik 3x3',
  'Algorithms for solving the Rubik 3x3 cube.'
);

export default function Rubik3x3() {
  return (
    <div className="container py-4">
      <CssBreadcrumbs
        configs={[{ label: 'Blog', link: '/blog' }, { label: 'Rubik 3x3' }]}
        className="mb-4"
      />
      <ArticleUL className="list-disc">
        <ArticleLI className="w-fit">
          <Link href={`${RUBIK_BASE}/f2l`} className="hover:underline">
            41 F2L
          </Link>
        </ArticleLI>
      </ArticleUL>
    </div>
  );
}
