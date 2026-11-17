import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import AdvancedTab from './AdvancedTab';
import BeginnerTab from './BeginnerTab';
import IntermediateTab from './IntermediateTab';
import RubikTabs, { RubikPanel } from './RubikTabs';

const SOURCE_URLS = [
  'https://www.cubeskills.com/tutorials',
  'https://www.cubeskills.com/blog/lookahead-progression-framework',
  'https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/',
  'https://www.speedsolving.com/wiki/',
  'https://jperm.net',
  'https://cstimer.net',
  'https://www.worldcubeassociation.org',
];

const TEXT = defineMessages<{
  title: string;
  intro: string;
  levels: Record<'beginner' | 'intermediate' | 'advanced', { label: string; hint: string }>;
  sourcesTitle: string;
  // Same order as `SOURCE_URLS`.
  sources: Array<string>;
}>({
  en: {
    title: 'Learn to solve the Rubik 3x3 from scratch',
    intro:
      'A 3x3 cube has about 43 quintillion states, yet every one of them can be solved in at most 20 moves. You do not need to remember states: you only need a method that breaks the solve into steps. Pick the tab for your level. Every picture is drawn automatically from its own algorithm, and every algorithm has been checked in a simulation.',
    levels: {
      beginner: { label: '1. Beginner', hint: 'LBL · 7 steps · ~7 algorithms' },
      intermediate: { label: '2. Intermediate', hint: 'CFOP 4-look · 17 algorithms' },
      advanced: { label: '3. Advanced', hint: 'Full OLL/PLL · F2L · lookahead' },
    },
    sourcesTitle: 'References',
    sources: [
      'CubeSkills: OLL/PLL sheets (Feliks Zemdegs, Andy Klise)',
      'CubeSkills: Lookahead Progression Framework',
      'Ruwix: beginner method and CFOP',
      'Speedsolving Wiki',
      'J Perm (video tutorials from beginner to advanced)',
      'csTimer (timer and WCA-standard scrambles)',
      'World Cube Association: rules and records',
    ],
  },
  vi: {
    title: 'Học giải Rubik 3x3 từ con số 0',
    intro:
      'Rubik 3x3 có khoảng 43 tỷ tỷ trạng thái, nhưng mọi trạng thái đều giải được trong tối đa 20 nước. Bạn không cần nhớ trạng thái: chỉ cần một phương pháp chia nhỏ thành các bước. Chọn tab theo trình độ. Mọi hình minh hoạ được vẽ tự động từ chính công thức, và mọi công thức đều đã được kiểm tra bằng mô phỏng.',
    levels: {
      beginner: { label: '1. Người mới', hint: 'LBL · 7 bước · ~7 công thức' },
      intermediate: { label: '2. Trung cấp', hint: 'CFOP 4-look · 17 công thức' },
      advanced: { label: '3. Chuyên nghiệp', hint: 'Full OLL/PLL · F2L · lookahead' },
    },
    sourcesTitle: 'Nguồn tham khảo',
    sources: [
      'CubeSkills: bảng OLL/PLL (Feliks Zemdegs, Andy Klise)',
      'CubeSkills: Lookahead Progression Framework',
      'Ruwix: phương pháp người mới và CFOP',
      'Speedsolving Wiki',
      'J Perm (video hướng dẫn từ người mới đến nâng cao)',
      'csTimer (bấm giờ, xáo trộn chuẩn WCA)',
      'World Cube Association: luật và kỷ lục',
    ],
  },
});

export default async function GuideView({ level }: { level?: string }) {
  const t = TEXT[await getLocale()];
  const panels: Array<RubikPanel> = [
    { value: 'beginner', ...t.levels.beginner, content: <BeginnerTab /> },
    { value: 'intermediate', ...t.levels.intermediate, content: <IntermediateTab /> },
    { value: 'advanced', ...t.levels.advanced, content: <AdvancedTab /> },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">{t.title}</h1>
      <p className="mt-3 leading-relaxed">{t.intro}</p>

      <RubikTabs panels={panels} defaultLevel={level} />

      <section className="mt-16 border-t pt-4 text-sm">
        <p className="font-semibold">{t.sourcesTitle}</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          {SOURCE_URLS.map((href, i) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noreferrer" className="underline">
                {t.sources[i]}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
