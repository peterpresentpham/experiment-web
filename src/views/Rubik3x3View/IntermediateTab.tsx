import Link from 'next/link';
import { ReactNode } from 'react';
import { RUBIK_BASE } from 'src/configs/blog.config';
import {
  F2L_BASIC_SOURCES,
  OLL_EDGE_EXTRA_OPTIONS,
  OLL_EDGE_SOURCES,
  PLL_EXTRA_OPTIONS,
} from 'src/configs/rubikAlgOptions.config';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { OLL_CASES, PLL_CASES } from 'src/configs/rubikLL.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { AlgRow, Bullets, Callout, CardGrid, CaseCard, CubePicture, H2, H3, P } from './parts';

const TEXT = defineMessages<{
  intro: ReactNode;
  cross: string;
  crossCaption: string;
  crossTips: Array<string>;
  crossCases: (link: ReactNode) => ReactNode;
  crossCasesLink: string;
  f2l: string;
  f2lIntro: string;
  f2lTips: Array<string>;
  f2lBasic: string;
  f2lMore: (link: ReactNode) => ReactNode;
  f2lPage: string;
  oll: string;
  ollIntro: string;
  ollEdges: string;
  ollCorners: string;
  ollCornersIntro: string;
  pll: string;
  pllIntro: string;
  sourcesNote: string;
  tips: string;
  fingerTricks: string;
  fingerTips: Array<string>;
  saveTime: string;
  saveTimeTips: Array<string>;
  nextTitle: string;
  next: string;
}>({
  en: {
    intro: (
      <>
        CFOP (also called Fridrich) is the method most competitors use. The name lists its 4 steps:{' '}
        <strong>C</strong>ross, <strong>F</strong>2L (first two layers), <strong>O</strong>LL
        (orient the last layer), <strong>P</strong>LL (permute the last layer). Full CFOP takes
        about 55 to 60 moves, compared with over 100 for LBL. At this level you learn the short
        &quot;4-look&quot; version: OLL and PLL are each done in 2 looks, with only 17 algorithms
        (several of them already familiar from LBL).
      </>
    ),
    cross: 'Step 1: Cross on the bottom',
    crossCaption: 'White cross, seen from the bottom',
    crossTips: [
      'Drop the "daisy". Solve the white cross directly on the bottom so you do not waste time flipping the cube.',
      'Every cross can be solved in at most 8 moves, about 6 on average. Goal: plan the whole cross during the 15-second inspection before the timer starts, as WCA rules allow.',
      'How to practise: first build the cross on top (where you can see it), then gradually move it to the bottom. Each day, plan 20 crosses by looking only, without turning, then do them and check.',
      'Place the edges in the right order relative to each other (for example green next to red), then fix them all with one D turn, instead of aligning each edge on its own.',
    ],
    crossCases: (link) => (
      <>Every way a cross edge can sit, with its moves and a picture, is in {link}.</>
    ),
    crossCasesLink: 'Beginner tab: Solving the white face fast',
    f2l: 'Step 2: Intuitive F2L',
    f2lIntro:
      'Instead of doing the white corners and then the middle edges separately, F2L joins a white corner with its matching middle edge into a "pair" in the top layer, then inserts the whole pair into its slot at once. There are 4 slots, one pair each.',
    f2lTips: [
      'Idea: find the corner and edge of a pair, bring both to the top layer, join them without breaking the cross, then insert with 3 or 4 moves.',
      'Only insert when the pair is right above its slot. Turn U to bring the empty slot into place (usually front-right).',
      "If a corner or edge is stuck in the wrong slot: take it out with R U R' (or similar), then try again.",
      'Do not learn all 41 algorithms yet. Understand F2L intuitively first and only learn algorithms for cases you find hard (in the Advanced tab).',
    ],
    f2lBasic: 'The 4 basic insertions (grey stickers are not solved yet):',
    f2lMore: (link) => (
      <>All 41 F2L cases with pictures are in the Advanced tab or on the {link}.</>
    ),
    f2lPage: 'separate F2L page',
    oll: 'Step 3: 2-look OLL (10 algorithms)',
    ollIntro:
      'Look 1: make the yellow cross (like LBL, but faster). Look 2: twist the 4 yellow corners to face up. Grey stickers in the pictures are not yellow.',
    ollEdges: 'Look 1: yellow cross',
    ollCorners: 'Look 2: orient the corners (OCLL)',
    ollCornersIntro:
      'Count the yellow corners already facing up: 0 corners means H or Pi, 1 corner means Sune or Anti-Sune, 2 corners means one of the other 3 cases.',
    pll: 'Step 4: 2-look PLL (7 algorithms)',
    pllIntro:
      'Look 1: put the 4 corners in place (A or Y). Look 2: put the 4 edges in place (U, H or Z). Arrows show where each piece goes when you do the algorithm. After each algorithm you may need a U turn to align.',
    sourcesNote:
      'Algorithms without a source label come from the CubeSkills sheets. The smaller ones under them are the other options found, with their source: pick the one that feels best in your hands.',
    tips: 'Tips and tricks at this level',
    fingerTricks: 'Basic finger tricks',
    fingerTips: [
      'Hold the cube naturally with your thumbs in front, without squeezing. Most algorithms that only use R, U and F are written to be done with your fingers, without changing your grip.',
      "U: flick with the right index finger. U': flick with the left index finger. U2: two flicks in a row with the right index and middle fingers (double flick).",
      "R/R': use your wrist. F: push with the right thumb (or regrip). F': pull from the top with the right index finger. D: pull with the left ring finger.",
      'Practise each algorithm slowly and smoothly with the right fingers before speeding up. Wrong fingering learned early is very hard to fix later.',
    ],
    saveTime: 'Saving time',
    saveTimeTips: [
      'Avoid whole-cube rotations (y, x). Each one costs about 0.3 to 0.5 seconds and makes you lose track of the pieces you are following.',
      'Use the 15-second inspection: find the whole cross and, if you can, the first F2L pair too.',
      'Recognise OLL/PLL by shapes and positions, not by counting stickers. For example headlights (2 corners of the same colour on one side) identify Aa right away.',
      'Time yourself with csTimer and track the average of 5 (ao5) and 12 (ao12) solves rather than lucky single solves.',
    ],
    nextTitle: 'Goals, and when to move on to Advanced?',
    next: '4-look CFOP with intuitive F2L is enough to get under 30 seconds, and many people get under 25. Once you are consistently under about 30 seconds, switch to the Advanced tab: learn full PLL first, then better F2L and lookahead, and finally full OLL.',
  },
  vi: {
    intro: (
      <>
        CFOP (còn gọi Fridrich) là phương pháp được đa số người thi đấu dùng. Tên gồm 4 bước:{' '}
        <strong>C</strong>ross (dấu cộng), <strong>F</strong>2L (2 tầng đầu), <strong>O</strong>LL
        (xoay tầng cuối), <strong>P</strong>LL (hoán vị tầng cuối). CFOP đầy đủ cần khoảng 55 đến 60
        nước, so với hơn 100 của LBL. Ở cấp này bạn học bản rút gọn &quot;4-look&quot;: OLL và PLL
        mỗi bước làm 2 lần, chỉ cần 17 công thức (nhiều cái đã quen từ LBL).
      </>
    ),
    cross: 'Bước 1: Cross ở mặt dưới',
    crossCaption: 'Cross trắng, nhìn từ mặt dưới',
    crossTips: [
      'Bỏ "bông hoa". Giải dấu cộng trắng trực tiếp ở mặt dưới, để không mất thời gian lật khối.',
      'Mọi cross đều giải được trong tối đa 8 nước, trung bình khoảng 6. Mục tiêu: tính toàn bộ cross trong 15 giây quan sát (inspection) trước khi bấm giờ, theo luật WCA.',
      'Cách tập: lúc đầu làm cross ở trên (nhìn được), rồi chuyển dần xuống dưới. Mỗi ngày giải 20 cross chỉ nhìn, không xoay, rồi mới làm và kiểm tra.',
      'Ưu tiên đặt các cạnh theo thứ tự tương đối với nhau (ví dụ xanh lá cạnh đỏ) rồi xoay D một lần, thay vì căn từng cạnh.',
    ],
    crossCases: (link) => <>Mọi vị trí của cạnh dấu cộng, kèm cách xoay và hình, có ở {link}.</>,
    crossCasesLink: 'tab Người mới: Giải mặt trắng nhanh',
    f2l: 'Bước 2: F2L trực quan',
    f2lIntro:
      'Thay vì làm góc trắng rồi cạnh tầng giữa riêng, F2L ghép 1 góc trắng với cạnh tầng giữa tương ứng thành một "cặp" ở tầng trên, rồi chèn cả cặp vào khe cùng lúc. Có 4 khe, mỗi khe một cặp.',
    f2lTips: [
      'Ý tưởng: tìm góc và cạnh của một cặp, đưa cả 2 lên tầng trên, ghép chúng lại mà không phá cross, rồi chèn bằng 3 hoặc 4 nước.',
      'Chèn chỉ được làm khi cặp đứng ngay trên khe của nó. Xoay U để đưa khe trống vào đúng vị trí (thường là trước-phải).',
      "Nếu góc hoặc cạnh bị kẹt trong khe sai: đưa nó ra bằng R U R' (hoặc tương tự) rồi làm lại.",
      'Đừng học 41 công thức ngay. Tự hiểu F2L trực quan trước, chỉ học công thức cho ca bạn thấy khó (ở tab Chuyên nghiệp).',
    ],
    f2lBasic: '4 trường hợp chèn cơ bản (phần màu xám là chưa giải):',
    f2lMore: (link) => <>Đủ 41 ca F2L có ảnh ở tab Chuyên nghiệp hoặc {link}.</>,
    f2lPage: 'trang F2L riêng',
    oll: 'Bước 3: 2-look OLL (10 công thức)',
    ollIntro:
      'Lần nhìn 1: làm dấu cộng vàng (giống LBL nhưng nhanh hơn). Lần nhìn 2: xoay 4 góc vàng hướng lên. Phần xám trong hình là mặt không phải màu vàng.',
    ollEdges: 'Lần 1: dấu cộng vàng',
    ollCorners: 'Lần 2: xoay góc (OCLL)',
    ollCornersIntro:
      'Đếm số góc vàng đã hướng lên: 0 góc là H hoặc Pi, 1 góc là Sune hoặc Anti-Sune, 2 góc là 3 ca còn lại.',
    pll: 'Bước 4: 2-look PLL (7 công thức)',
    pllIntro:
      'Lần 1: đặt 4 góc đúng chỗ (A hoặc Y). Lần 2: đặt 4 cạnh (U, H hoặc Z). Mũi tên cho biết mảnh sẽ đi đâu khi làm công thức. Sau mỗi công thức có thể cần xoay U để căn.',
    sourcesNote:
      'Công thức không ghi nguồn lấy từ bảng CubeSkills. Các dòng nhỏ bên dưới là những phương án khác tìm được, kèm nguồn: chọn cái bạn thấy xoay thuận tay nhất.',
    tips: 'Tip và trick ở cấp này',
    fingerTricks: 'Finger tricks cơ bản',
    fingerTips: [
      'Cầm khối tự nhiên, ngón cái phía trước, không bóp chặt. Đa số công thức chỉ dùng R, U, F được viết để làm bằng ngón tay, không cần đổi cách cầm.',
      "U: ngón trỏ phải búng. U': ngón trỏ trái búng. U2: búng 2 lần liên tiếp bằng ngón trỏ và ngón giữa phải (double flick).",
      "R/R': dùng cổ tay. F: ngón cái phải đẩy (hoặc đổi cầm). F': ngón trỏ phải kéo từ trên. D: ngón áp út trái kéo.",
      'Tập từng công thức chậm và mượt bằng ngón tay đúng, rồi mới tăng tốc. Làm sai ngón từ đầu sẽ rất khó sửa sau.',
    ],
    saveTime: 'Tiết kiệm thời gian',
    saveTimeTips: [
      'Hạn chế xoay cả khối (y, x). Mỗi lần xoay mất khoảng 0,3 đến 0,5 giây và làm mất dấu mảnh đang theo.',
      'Dùng 15 giây quan sát: tìm đủ cross, và nếu được, tìm luôn cặp F2L đầu tiên.',
      'Nhận diện OLL/PLL bằng hình dạng và vị trí, không đếm từng ô. Ví dụ đèn pha (2 góc cùng màu trên một mặt) giúp nhận ra Aa ngay.',
      'Bấm giờ bằng csTimer, theo dõi trung bình 5 (ao5) và 12 (ao12) lần giải, không quan tâm lần giải may mắn.',
    ],
    nextTitle: 'Mục tiêu và khi nào lên Chuyên nghiệp?',
    next: '4-look CFOP với F2L trực quan đủ để xuống dưới 30 giây, nhiều người đạt dưới 25 giây. Khi đã đều dưới khoảng 30 giây, chuyển sang tab Chuyên nghiệp: học full PLL trước, rồi F2L tốt hơn và lookahead, cuối cùng là full OLL.',
  },
});

export default async function IntermediateTab() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { f2lBasic, ollEdges2Look, ollCorners2Look, pll2Look } = RUBIK_GUIDE[locale];

  return (
    <div>
      <P>{t.intro}</P>

      <H2 id="inter-cross">{t.cross}</H2>
      <div className="flex flex-wrap items-center gap-6">
        <CubePicture image={{ kind: 'iso', view: 'x2', mask: 'cross', caption: t.crossCaption }} />
        <div className="min-w-64 flex-1">
          <Bullets items={t.crossTips} />
          <P>
            {t.crossCases(
              <Link href={`${RUBIK_BASE}?level=beginner#fast-white-face`} className="underline">
                {t.crossCasesLink}
              </Link>
            )}
          </P>
        </div>
      </div>

      <H2 id="inter-f2l">{t.f2l}</H2>
      <P>{t.f2lIntro}</P>
      <Bullets items={t.f2lTips} />
      <P>{t.f2lBasic}</P>
      {f2lBasic.map((a, i) => (
        <AlgRow key={a.alg} {...a} sources={F2L_BASIC_SOURCES[i]} />
      ))}
      <P>
        {t.f2lMore(
          <Link href={`${RUBIK_BASE}/f2l`} className="underline">
            {t.f2lPage}
          </Link>
        )}
      </P>

      <H2 id="inter-oll">{t.oll}</H2>
      <P>{t.ollIntro}</P>
      <P>{t.sourcesNote}</P>
      <H3>{t.ollEdges}</H3>
      <CardGrid>
        {ollEdges2Look.map((a, i) => (
          <CaseCard
            key={a.alg}
            title={a.name}
            image={a.image!}
            algs={[a.alg]}
            sources={OLL_EDGE_SOURCES[i]}
            options={OLL_EDGE_EXTRA_OPTIONS[i]}
          />
        ))}
      </CardGrid>
      <H3>{t.ollCorners}</H3>
      <P>{t.ollCornersIntro}</P>
      <CardGrid>
        {ollCorners2Look.map((c) => {
          const data = OLL_CASES.find((o) => o.id === c.id)!;
          return (
            <CaseCard
              key={c.id}
              title={c.name}
              subtitle={`OLL ${c.id}`}
              image={{ kind: 'top', alg: data.algs[0], mask: 'oll' }}
              algs={data.algs}
              note={c.note}
            />
          );
        })}
      </CardGrid>

      <H2 id="inter-pll">{t.pll}</H2>
      <P>{t.pllIntro}</P>
      <CardGrid>
        {pll2Look.map((c) => {
          const data = PLL_CASES.find((p) => p.id === c.id)!;
          return (
            <CaseCard
              key={c.id}
              title={`${c.id}-perm`}
              image={{ kind: 'top', alg: data.algs[0], arrows: true }}
              algs={data.algs}
              options={PLL_EXTRA_OPTIONS[c.id]}
              note={c.note}
            />
          );
        })}
      </CardGrid>

      <H2 id="inter-tips">{t.tips}</H2>
      <H3>{t.fingerTricks}</H3>
      <Bullets items={t.fingerTips} />
      <H3>{t.saveTime}</H3>
      <Bullets items={t.saveTimeTips} />

      <Callout title={t.nextTitle}>
        <P className="mt-0">{t.next}</P>
      </Callout>
    </div>
  );
}
