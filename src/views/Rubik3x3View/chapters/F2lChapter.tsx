import { ReactNode } from 'react';
import Link from 'next/link';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { F2L_BASIC_SOURCES } from 'src/configs/rubikAlgOptions.config';
import { CORNER_CASES, LEFT_CORNER_CASES } from 'src/configs/rubikFirstLayer.config';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { AlgRow, Bullets, Callout, P } from '../parts';
import { FirstLayerCaseGrid, TCaseText } from './FirstLayerCases';
import { ChapterHeading, SectionHeading } from './headings';

const TEXT = defineMessages<{
  intro: string;
  cornersIntro: string;
  cornerCases: TCaseText;
  leftLabel: string;
  leftIntro: string;
  cornerTips: Array<string>;
  drillsLabel: string;
  drills: Array<string>;
  targetTitle: string;
  target: string;
  pairsIntro: string;
  pairsTips: Array<string>;
  pairsBasic: string;
  algsIntro: string;
  algsTips: Array<string>;
  algsMore: (link: ReactNode) => ReactNode;
  algsLink: string;
}>({
  en: {
    intro:
      'After the cross, LBL fills the white corners and then the middle edges separately. F2L does both together: it joins a white corner with its matching middle edge into a "pair" in the top layer, then inserts the whole pair into its slot at once. There are 4 slots, one pair each. This chapter builds up to that in 3 steps: short corner inserts, then pairs found by eye (intuitive F2L), then the algorithms for the hard cases.',
    cornersIntro:
      'Hold white on the bottom. Turn U until the corner is above its slot (the slot between its 2 other colours), and turn the cube so the slot is front-right-bottom. Then look at where the white sticker of the corner faces.',
    cornerCases: {
      whiteRight: {
        title: 'White facing right',
        note: 'The basic insert: 3 moves.',
      },
      whiteFront: {
        title: 'White facing front',
        note: 'Mirror of the first case, done with the front face.',
      },
      whiteUp: {
        title: 'White facing up',
        note: 'The longest case. Avoid it when another corner is ready.',
      },
      stuckWhiteRight: {
        title: 'In its slot, white facing right',
        note: "R U R' U' lifts it out with white facing right, then R U R' inserts it.",
      },
      stuckWhiteFront: {
        title: 'In its slot, white facing front',
        note: "R U' R' lifts it out the right way, then U R U' R' inserts it.",
      },
      leftWhiteLeft: {
        title: 'Front-left, white facing left',
        note: "Mirror of R U R', done with the left hand.",
      },
      leftWhiteFront: {
        title: 'Front-left, white facing front',
        note: "Mirror of F' U' F.",
      },
      leftWhiteUp: {
        title: 'Front-left, white facing up',
        note: 'Mirror of the long case.',
      },
    },
    leftLabel: 'Front-left slot: no need to turn the cube',
    leftIntro:
      'If the corner belongs in the front-left slot, use the mirrored algorithms with your left hand instead of rotating the cube. The pictures are turned so you can see the left face.',
    cornerTips: [
      'Pick the easiest corner first: one whose white faces sideways (3 moves) beats one whose white faces up (7 moves). Feliks Zemdegs recommends this in the CubeSkills tutorial.',
      "A corner stuck in the wrong bottom slot: bring that slot to front-right, take the corner out with R U R', then solve it like a top-layer corner.",
      'Use the right-slot algorithms with your right hand and the left-slot ones with your left hand. You only need U turns, never y.',
      'While inserting one corner, look for where the next one is. The white face should be one smooth flow, not 4 stops.',
      'These inserts are exactly the last moves of F2L. When you move to F2L, you join each corner with its middle edge before inserting them together.',
    ],
    drillsLabel: 'Practice drills',
    drills: [
      'White face sprint: solve only the white face and time it with csTimer. Track the average of 5, not your best single.',
      'Do not rush the cross. A slower cross where you already see the first corner is faster overall than a fast cross followed by a long search.',
    ],
    targetTitle: 'How fast should this be?',
    target:
      'A suggested practice goal: plan every cross in inspection and keep it to 8 moves or fewer, then get the whole white face (cross plus 4 corners) under 15 seconds. After that, most of your time is in the middle layer, which the next section speeds up.',
    pairsIntro:
      'Idea: find the corner and edge of a pair, bring both to the top layer, join them without breaking the cross, then insert with 3 or 4 moves. Do not learn all 41 algorithms yet: understand F2L by eye first.',
    pairsTips: [
      'Only insert when the pair is right above its slot. Turn U to bring the empty slot into place (usually front-right).',
      "If a corner or edge is stuck in the wrong slot: take it out with R U R' (or similar), then try again.",
      'Look for the pair that is easiest to join first, not the slot that comes first in order.',
      'Only learn algorithms for the cases you find hard (next section).',
    ],
    pairsBasic: 'The 4 basic insertions (grey stickers are not solved yet):',
    algsIntro:
      'Every F2L case inserts into the front-right slot. Do not memorise blindly: understanding how each algorithm builds the pair lets you work out the other slots yourself.',
    algsTips: [
      "Insert into the back slots without rotating: use algorithms with U, R and L moves and the matching fingers (for example R' U R for the back-right slot).",
      'Edge control: when inserting the last pair, pick the insertion that also orients the yellow edges, which avoids the hard OLL cases.',
      'Multiple options: when 2 pairs are ready, pick the one that inserts fastest without breaking the other.',
      'Prefer cases with no cube rotations and lots of R and U moves.',
    ],
    algsMore: (link) => <>All 41 cases, with pictures and a search box, are on the {link}.</>,
    algsLink: 'algorithm lookup page',
  },
  vi: {
    intro:
      'Sau cross, LBL làm các góc trắng rồi mới làm các cạnh tầng giữa, mỗi thứ riêng. F2L làm cả hai cùng lúc: ghép 1 góc trắng với cạnh tầng giữa tương ứng thành một "cặp" ở tầng trên, rồi chèn cả cặp vào khe cùng lúc. Có 4 khe, mỗi khe một cặp. Chương này đi đến đó qua 3 bước: chèn góc bằng công thức ngắn, rồi ghép cặp bằng mắt (F2L trực quan), rồi công thức cho các ca khó.',
    cornersIntro:
      'Cầm trắng ở dưới. Xoay U đến khi góc nằm ngay trên khe của nó (khe nằm giữa 2 màu còn lại của góc), và xoay khối để khe đó ở trước-phải-dưới. Rồi nhìn xem ô trắng của góc hướng về đâu.',
    cornerCases: {
      whiteRight: {
        title: 'Trắng nhìn sang phải',
        note: 'Công thức chèn cơ bản: 3 nước.',
      },
      whiteFront: {
        title: 'Trắng nhìn ra trước',
        note: 'Đối xứng của ca đầu, làm bằng mặt trước.',
      },
      whiteUp: {
        title: 'Trắng nhìn lên',
        note: 'Ca dài nhất. Tránh ca này khi đang có góc khác dễ hơn.',
      },
      stuckWhiteRight: {
        title: 'Kẹt trong khe, trắng nhìn sang phải',
        note: "R U R' U' nhấc góc ra với trắng nhìn sang phải, rồi R U R' chèn vào.",
      },
      stuckWhiteFront: {
        title: 'Kẹt trong khe, trắng nhìn ra trước',
        note: "R U' R' nhấc góc ra đúng chiều, rồi U R U' R' chèn vào.",
      },
      leftWhiteLeft: {
        title: 'Trước-trái, trắng nhìn sang trái',
        note: "Đối xứng của R U R', làm bằng tay trái.",
      },
      leftWhiteFront: {
        title: 'Trước-trái, trắng nhìn ra trước',
        note: "Đối xứng của F' U' F.",
      },
      leftWhiteUp: {
        title: 'Trước-trái, trắng nhìn lên',
        note: 'Đối xứng của ca dài.',
      },
    },
    leftLabel: 'Khe trước-trái: không cần xoay khối',
    leftIntro:
      'Nếu góc thuộc khe trước-trái, dùng công thức đối xứng bằng tay trái thay vì xoay cả khối. Hình được xoay để bạn thấy mặt trái.',
    cornerTips: [
      'Chọn góc dễ nhất trước: góc có trắng nhìn sang bên (3 nước) tốt hơn góc có trắng nhìn lên (7 nước). Feliks Zemdegs khuyên điều này trong bài hướng dẫn của CubeSkills.',
      "Góc bị kẹt ở khe đáy sai: đưa khe đó về trước-phải, nhấc góc ra bằng R U R', rồi giải như góc ở tầng trên.",
      'Khe bên phải dùng tay phải, khe bên trái dùng tay trái. Chỉ cần xoay U, không bao giờ cần y.',
      'Trong lúc chèn một góc, tìm xem góc tiếp theo ở đâu. Mặt trắng nên là một dòng liền mạch, không phải 4 lần dừng.',
      'Các công thức chèn này chính là các nước cuối của F2L. Khi chuyển sang F2L, bạn ghép mỗi góc với cạnh tầng giữa của nó trước, rồi chèn cả 2 cùng lúc.',
    ],
    drillsLabel: 'Bài tập',
    drills: [
      'Chạy nước rút mặt trắng: chỉ giải mặt trắng và bấm giờ bằng csTimer. Theo dõi trung bình 5 lần, không phải lần nhanh nhất.',
      'Đừng vội làm dấu cộng. Làm chậm mà đã thấy góc đầu tiên vẫn nhanh hơn làm thật nhanh rồi mất công tìm.',
    ],
    targetTitle: 'Phần này nên nhanh đến mức nào?',
    target:
      'Mục tiêu tập gợi ý: tính xong mọi dấu cộng trong lúc quan sát và giữ ở mức 8 nước trở xuống, rồi đưa cả mặt trắng (dấu cộng và 4 góc) xuống dưới 15 giây. Sau đó thời gian chủ yếu nằm ở tầng giữa, là phần mục tiếp theo giúp nhanh hơn.',
    pairsIntro:
      'Ý tưởng: tìm góc và cạnh của một cặp, đưa cả 2 lên tầng trên, ghép chúng lại mà không phá cross, rồi chèn bằng 3 hoặc 4 nước. Đừng học 41 công thức ngay: hiểu F2L bằng mắt trước.',
    pairsTips: [
      'Chèn chỉ được làm khi cặp đứng ngay trên khe của nó. Xoay U để đưa khe trống vào đúng vị trí (thường là trước-phải).',
      "Nếu góc hoặc cạnh bị kẹt trong khe sai: đưa nó ra bằng R U R' (hoặc tương tự) rồi làm lại.",
      'Tìm cặp dễ ghép nhất trước, không cần theo thứ tự các khe.',
      'Chỉ học công thức cho ca bạn thấy khó (ở mục tiếp theo).',
    ],
    pairsBasic: '4 trường hợp chèn cơ bản (phần màu xám là chưa giải):',
    algsIntro:
      'Mỗi ca F2L chèn vào khe trước-phải. Đừng học thuộc máy móc: hiểu cách mỗi công thức ghép cặp sẽ giúp bạn tự suy ra cho khe khác.',
    algsTips: [
      "Chèn vào khe sau mà không xoay khối: dùng các công thức với nước U, R, L, cùng với ngón tay tương ứng (ví dụ R' U R cho khe sau-phải).",
      'Edge control: khi chèn cặp cuối, chọn cách chèn giúp cạnh vàng được định hướng sẵn, giảm số ca OLL khó.',
      'Khe nhiều lựa chọn: khi có 2 cặp sẵn, chọn cặp chèn nhanh nhất và không phá cặp kia.',
      'Ưu tiên ca không có xoay khối và có nhiều nước R, U.',
    ],
    algsMore: (link) => <>Đủ 41 ca, có hình và ô tìm kiếm, nằm ở {link}.</>,
    algsLink: 'trang tra cứu công thức',
  },
});

/** White corners with short inserts, then intuitive pairs, then the 41 algorithms. */
export default async function F2lChapter() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { f2lBasic } = RUBIK_GUIDE[locale];

  return (
    <section>
      <ChapterHeading id="f2l" />
      <P>{t.intro}</P>

      <SectionHeading id="f2l-corners" />
      <P>{t.cornersIntro}</P>
      <FirstLayerCaseGrid cases={CORNER_CASES} text={t.cornerCases} />
      <P>
        <strong>{t.leftLabel}</strong>
      </P>
      <P className="mt-1">{t.leftIntro}</P>
      <FirstLayerCaseGrid cases={LEFT_CORNER_CASES} text={t.cornerCases} />
      <Bullets items={t.cornerTips} />
      <P>
        <strong>{t.drillsLabel}</strong>
      </P>
      <Bullets items={t.drills} />
      <Callout title={t.targetTitle}>
        <P className="mt-0">{t.target}</P>
      </Callout>

      <SectionHeading id="f2l-pairs" />
      <P>{t.pairsIntro}</P>
      <Bullets items={t.pairsTips} />
      <P>{t.pairsBasic}</P>
      {f2lBasic.map((a, i) => (
        <AlgRow key={a.alg} {...a} sources={F2L_BASIC_SOURCES[i]} />
      ))}

      <SectionHeading id="f2l-algs" />
      <P>{t.algsIntro}</P>
      <Bullets items={t.algsTips} />
      <P>
        {t.algsMore(
          <Link href={`${RUBIK_BASE}/algorithms?type=f2l`} className="underline">
            {t.algsLink}
          </Link>
        )}
      </P>
    </section>
  );
}
