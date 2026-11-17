import { Metadata } from 'next';
import CssBreadcrumbs from 'src/components/CssBreadcrumbs';
import { generateAppMetadata } from 'src/services';
import GuideView from 'src/views/Rubik3x3View/GuideView';

export const metadata: Metadata = generateAppMetadata(
  'Rubik 3x3',
  'Hướng dẫn giải Rubik 3x3 theo cấp độ: người mới, trung cấp, chuyên nghiệp. Đủ OLL, PLL, F2L, có hình minh hoạ.'
);

export default async function Rubik3x3({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  return (
    <div className="container py-4 pb-20">
      <CssBreadcrumbs
        configs={[{ label: 'Blog', link: '/blog' }, { label: 'Rubik 3x3' }]}
        className="mb-4"
      />
      <GuideView level={level} />
    </div>
  );
}
