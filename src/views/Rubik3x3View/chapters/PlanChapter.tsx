import { ReactNode } from 'react';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { Bullets, P } from '../parts';
import { ChapterHeading, SectionHeading } from './headings';

const SOURCE_URLS = [
  'https://www.cubeskills.com/tutorials',
  'https://www.cubeskills.com/blog/lookahead-progression-framework',
  'https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/',
  'https://www.speedsolving.com/wiki/',
  'https://jperm.net',
  'https://www.cubeskills.com/tutorials/optimising-the-beginners-method',
  'https://cubefreak.net/speed/cfop/cross.php',
  'https://en.wikibooks.org/wiki/How_to_solve_the_Rubik%27s_Cube/Beginner',
  'https://mrlhumphreys.github.io/twisty_guide_j/guides/3x3x3-beginners',
  'https://www.gancube.com/pages/how-to-solve-3x3-cube-for-beginners',
  'https://cstimer.net',
  'https://www.worldcubeassociation.org',
];

const TEXT = defineMessages<{
  intro: string;
  roadmapItems: Array<ReactNode>;
  pace: string;
  goals: Array<string>;
  methods: Array<ReactNode>;
  // Same order as `SOURCE_URLS`.
  sources: Array<string>;
}>({
  en: {
    intro:
      'You now have every step of CFOP. This last chapter says what to learn in which order, how fast each stage should be, which other methods exist, and where this guide took its material from.',
    roadmapItems: [
      <>
        <strong>Full PLL (21 cases)</strong>: you already know 7, so only 14 more. Every solve has a
        PLL, so learn it before OLL.
      </>,
      <>
        <strong>Better F2L</strong>: learn algorithms for the cases where you often pause, practise
        inserting into the back slots without rotating, and lookahead.
      </>,
      <>
        <strong>Full OLL (57 cases)</strong>: you already know 10 from 2-look. Learn by group, easy
        groups first (T, P, square, C, W...), the dot cases last.
      </>,
      <>
        <strong>After that (optional)</strong>: COLL, ZBLL, extended cross (XCross), AUF prediction.
      </>,
    ],
    pace: 'Learn about 3 to 5 algorithms a week. Only move on once you recognise a case within 1 second and execute it without stumbling. Click an algorithm to copy it; the smaller lines below are alternatives.',
    goals: [
      'Under 30 seconds: 4-look CFOP with intuitive F2L is enough, and many people get under 25.',
      'Under 20 seconds: full PLL, good F2L, the start of lookahead.',
      'Under 15 seconds: full OLL, smooth F2L, lookahead at the "tracking" level.',
      'Under 10 seconds: lookahead at the "knowing" level, good finger tricks, usually an XCross. This is the level of strong competitors.',
      'The single-solve world record is currently around 3 to 4 seconds (see the latest results at worldcubeassociation.org).',
    ],
    methods: [
      <>
        <strong>Roux</strong>: build 1x2x3 blocks on both sides, then the last-layer corners (CMLL),
        then the edges with M moves. Fewer moves, fewer algorithms and great for lookahead. But it
        uses many M moves, which are harder to finger trick.
      </>,
      <>
        <strong>ZZ</strong>: orient all edges first (EOLine/EOCross), then F2L uses only R, U and L
        with no rotations, and the OLL always has oriented edges.
      </>,
      <>
        <strong>Petrus, Mehta</strong>: block-based, used by fewer people.
      </>,
      'General advice: pick 1 method and stick with it. Switching back and forth wastes the most time. CFOP has the most learning material.',
    ],
    sources: [
      'CubeSkills: OLL/PLL sheets (Feliks Zemdegs, Andy Klise)',
      'CubeSkills: Lookahead Progression Framework',
      'Ruwix: beginner method and CFOP',
      'Speedsolving Wiki',
      'J Perm (video tutorials from beginner to advanced)',
      "CubeSkills: Optimising the Beginner's Method (cross on the bottom, flipped edge, choosing corners)",
      'Cubefreak: planning the cross',
      'Wikibooks: beginner method (white on top)',
      'Twisty Guide: 3x3 beginner method',
      'GAN Cube: beginner guide',
      'csTimer (timer and WCA-standard scrambles)',
      'World Cube Association: rules and records',
    ],
  },
  vi: {
    intro:
      'Đến đây bạn đã có đủ các bước của CFOP. Chương cuối này nói nên học gì theo thứ tự nào, mỗi giai đoạn nên nhanh đến đâu, còn những phương pháp nào khác, và hướng dẫn này lấy tài liệu từ đâu.',
    roadmapItems: [
      <>
        <strong>Full PLL (21 ca)</strong>: bạn đã có 7, chỉ thêm 14. Mỗi lần giải đều có PLL, nên
        học trước OLL.
      </>,
      <>
        <strong>F2L tốt hơn</strong>: học công thức cho các ca bạn hay dừng, tập chèn vào khe sau mà
        không xoay khối, và lookahead.
      </>,
      <>
        <strong>Full OLL (57 ca)</strong>: bạn đã có 10 từ 2-look. Học theo nhóm, nhóm dễ trước (chữ
        T, P, vuông, C, W...), nhóm chấm học cuối.
      </>,
      <>
        <strong>Sau đó (tuỳ chọn)</strong>: COLL, ZBLL, cross-chéo (XCross), dự đoán AUF.
      </>,
    ],
    pace: 'Mỗi tuần học khoảng 3 đến 5 công thức. Chỉ học tiếp khi đã nhận ra ca trong vòng 1 giây và làm không vấp. Bấm vào công thức để sao chép; dòng nhỏ bên dưới là công thức thay thế.',
    goals: [
      'Dưới 30 giây: 4-look CFOP với F2L trực quan là đủ, nhiều người đạt dưới 25 giây.',
      'Dưới 20 giây: full PLL, F2L tốt, bắt đầu có lookahead.',
      'Dưới 15 giây: full OLL, F2L mượt, lookahead mức "theo dõi".',
      'Dưới 10 giây: lookahead mức "biết trước", finger tricks tốt, cross thường là XCross. Đây là mức của người thi đấu giỏi.',
      'Kỷ lục thế giới 1 lần giải hiện quanh 3 đến 4 giây (xem bảng mới nhất tại worldcubeassociation.org).',
    ],
    methods: [
      <>
        <strong>Roux</strong>: ghép khối 1x2x3 hai bên, rồi góc tầng cuối (CMLL), rồi cạnh bằng lớp
        M. Ít nước hơn, ít công thức, rất hợp lookahead. Nhưng dùng nhiều M, khó finger trick hơn.
      </>,
      <>
        <strong>ZZ</strong>: định hướng tất cả cạnh trước (EOLine/EOCross), sau đó F2L chỉ dùng R,
        U, L, không xoay khối, và OLL luôn có cạnh đúng.
      </>,
      <>
        <strong>Petrus, Mehta</strong>: dựa trên khối, ít người dùng hơn.
      </>,
      'Lời khuyên chung: chọn 1 phương pháp và đi đến cùng. Đổi qua đổi lại là cách phí thời gian nhất. CFOP có nhiều tài liệu nhất.',
    ],
    sources: [
      'CubeSkills: bảng OLL/PLL (Feliks Zemdegs, Andy Klise)',
      'CubeSkills: Lookahead Progression Framework',
      'Ruwix: phương pháp người mới và CFOP',
      'Speedsolving Wiki',
      'J Perm (video hướng dẫn từ người mới đến nâng cao)',
      "CubeSkills: Optimising the Beginner's Method (cross ở mặt dưới, cạnh bị lật, chọn góc)",
      'Cubefreak: cách tính trước dấu cộng',
      'Wikibooks: phương pháp người mới (trắng ở trên)',
      'Twisty Guide: phương pháp người mới 3x3',
      'GAN Cube: hướng dẫn người mới',
      'csTimer (bấm giờ, xáo trộn chuẩn WCA)',
      'World Cube Association: luật và kỷ lục',
    ],
  },
});

/** Learning order, speed goals, other methods and the references of the guide. */
export default async function PlanChapter() {
  const t = TEXT[await getLocale()];

  return (
    <section>
      <ChapterHeading id="plan" />
      <P>{t.intro}</P>

      <SectionHeading id="plan-roadmap" />
      <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">
        {t.roadmapItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
      <P>{t.pace}</P>

      <SectionHeading id="plan-goals" />
      <Bullets items={t.goals} />

      <SectionHeading id="plan-methods" />
      <Bullets items={t.methods} />

      <SectionHeading id="plan-sources" />
      <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
        {SOURCE_URLS.map((href, i) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noreferrer" className="underline">
              {t.sources[i]}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
