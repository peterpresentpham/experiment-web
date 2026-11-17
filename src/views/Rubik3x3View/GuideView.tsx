import AdvancedTab from './AdvancedTab';
import BeginnerTab from './BeginnerTab';
import IntermediateTab from './IntermediateTab';
import RubikTabs, { RubikPanel } from './RubikTabs';

const PANELS: Array<RubikPanel> = [
  {
    value: 'beginner',
    label: '1. Người mới',
    hint: 'LBL · 7 bước · ~7 công thức',
    content: <BeginnerTab />,
  },
  {
    value: 'intermediate',
    label: '2. Trung cấp',
    hint: 'CFOP 4-look · 17 công thức',
    content: <IntermediateTab />,
  },
  {
    value: 'advanced',
    label: '3. Chuyên nghiệp',
    hint: 'Full OLL/PLL · F2L · lookahead',
    content: <AdvancedTab />,
  },
];

const SOURCES = [
  {
    label: 'CubeSkills: bảng OLL/PLL (Feliks Zemdegs, Andy Klise)',
    href: 'https://www.cubeskills.com/tutorials',
  },
  {
    label: 'CubeSkills: Lookahead Progression Framework',
    href: 'https://www.cubeskills.com/blog/lookahead-progression-framework',
  },
  {
    label: 'Ruwix: phương pháp người mới và CFOP',
    href: 'https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/',
  },
  { label: 'Speedsolving Wiki', href: 'https://www.speedsolving.com/wiki/' },
  { label: 'J Perm (video hướng dẫn từ người mới đến nâng cao)', href: 'https://jperm.net' },
  { label: 'csTimer (bấm giờ, xáo trộn chuẩn WCA)', href: 'https://cstimer.net' },
  { label: 'World Cube Association: luật và kỷ lục', href: 'https://www.worldcubeassociation.org' },
];

export default function GuideView({ level }: { level?: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">Học giải Rubik 3x3 từ con số 0</h1>
      <p className="mt-3 leading-relaxed">
        Rubik 3x3 có khoảng 43 tỷ tỷ trạng thái, nhưng mọi trạng thái đều giải được trong tối đa 20
        nước. Bạn không cần nhớ trạng thái: chỉ cần một phương pháp chia nhỏ thành các bước. Chọn
        tab theo trình độ. Mọi hình minh hoạ được vẽ tự động từ chính công thức, và mọi công thức
        đều đã được kiểm tra bằng mô phỏng.
      </p>

      <RubikTabs panels={PANELS} defaultLevel={level} />

      <section className="mt-16 border-t pt-4 text-sm">
        <p className="font-semibold">Nguồn tham khảo</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          {SOURCES.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noreferrer" className="underline">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
