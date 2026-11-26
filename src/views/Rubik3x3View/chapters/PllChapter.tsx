import Link from 'next/link';
import { ReactNode } from 'react';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { PLL_EXTRA_OPTIONS } from 'src/configs/rubikAlgOptions.config';
import { PLL_LEARNING_ORDER, RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { PLL_CASES } from 'src/configs/rubikLL.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { CardGrid, CaseCard, P } from '../parts';
import { ChapterHeading, SectionHeading } from './headings';

const TEXT = defineMessages<{
  intro: string;
  pllIntro: string;
  fullIntro: ReactNode;
  fullOrder: (order: string) => string;
  fullMore: (link: ReactNode) => ReactNode;
  fullLink: string;
}>({
  en: {
    intro:
      'OLL left the top face all yellow, with the pieces still in the wrong places. PLL (permute the last layer) moves them into place and finishes the cube. Every solve ends with a PLL, so it is the last step you practise and the first full set most people learn.',
    pllIntro:
      'Look 1: put the 4 corners in place (A or Y). Look 2: put the 4 edges in place (U, H or Z). Arrows show where each piece goes when you do the algorithm. After each algorithm you may need a U turn to align.',
    fullIntro: (
      <>
        Full PLL solves the whole layer in one algorithm: 21 cases, of which you already know 7. To
        recognise them, look at 2 sides (front and right) at once. Look for{' '}
        <strong>headlights</strong> (2 corners of the same colour on one side),{' '}
        <strong>blocks</strong> (a corner and edge next to each other with the same colour) and{' '}
        <strong>bars</strong> (a whole 1x3 side in one colour). These three signs are enough to tell
        the 21 cases apart without looking at the back.
      </>
    ),
    fullOrder: (order) => `Suggested order for the 14 new cases: ${order}.`,
    fullMore: (link) => (
      <>All 21 cases, with their probabilities and a search box, are on the {link}.</>
    ),
    fullLink: 'algorithm lookup page',
  },
  vi: {
    intro:
      'OLL để lại mặt trên toàn màu vàng nhưng các mảnh vẫn sai chỗ. PLL (hoán vị tầng cuối) đưa chúng về đúng chỗ và hoàn thành khối. Lần giải nào cũng kết thúc bằng một PLL, nên đây là bước tập cuối cùng và cũng là bộ đầy đủ đầu tiên mà đa số người học.',
    pllIntro:
      'Lần 1: đặt 4 góc đúng chỗ (A hoặc Y). Lần 2: đặt 4 cạnh (U, H hoặc Z). Mũi tên cho biết mảnh sẽ đi đâu khi làm công thức. Sau mỗi công thức có thể cần xoay U để căn.',
    fullIntro: (
      <>
        Full PLL giải cả tầng bằng một công thức: 21 ca, trong đó bạn đã biết 7. Cách nhận diện:
        nhìn 2 mặt bên (trước và phải) cùng lúc. Tìm <strong>đèn pha</strong> (2 góc cùng màu trên
        một mặt), <strong>khối</strong> (góc và cạnh cạnh nhau cùng màu) và <strong>thanh</strong>{' '}
        (cả mặt 1x3 cùng màu). Ba dấu hiệu này đủ để phân biệt 21 ca mà không cần nhìn mặt sau.
      </>
    ),
    fullOrder: (order) => `Thứ tự gợi ý cho 14 ca mới: ${order}.`,
    fullMore: (link) => <>Đủ 21 ca, kèm xác suất và ô tìm kiếm, nằm ở {link}.</>,
    fullLink: 'trang tra cứu công thức',
  },
});

/** 2-look PLL with its 7 algorithms, then a pointer to the 21 full cases. */
export default async function PllChapter() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { pll2Look } = RUBIK_GUIDE[locale];

  return (
    <section>
      <ChapterHeading id="pll" />
      <P>{t.intro}</P>

      <SectionHeading id="pll-2look" />
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

      <SectionHeading id="pll-full" />
      <P>{t.fullIntro}</P>
      <P>{t.fullOrder(PLL_LEARNING_ORDER.join(', '))}</P>
      <P>
        {t.fullMore(
          <Link href={`${RUBIK_BASE}/algorithms?type=pll`} className="underline">
            {t.fullLink}
          </Link>
        )}
      </P>
    </section>
  );
}
