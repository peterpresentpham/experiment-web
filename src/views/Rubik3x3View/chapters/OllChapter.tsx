import Link from 'next/link';
import { ReactNode } from 'react';
import { RUBIK_BASE } from 'src/configs/blog.config';
import { OLL_EDGE_EXTRA_OPTIONS, OLL_EDGE_SOURCES } from 'src/configs/rubikAlgOptions.config';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { OLL_CASES } from 'src/configs/rubikLL.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { CardGrid, CaseCard, P } from '../parts';
import { ChapterHeading, SectionHeading } from './headings';

const TEXT = defineMessages<{
  intro: string;
  ollIntro: string;
  sourcesNote: string;
  edges: string;
  corners: string;
  cornersIntro: string;
  fullIntro: string;
  fullOrder: string;
  fullMore: (link: ReactNode) => ReactNode;
  fullLink: string;
}>({
  en: {
    intro:
      'After F2L only the top layer is left. OLL (orient the last layer) turns every yellow sticker to face up, without caring yet where each piece sits. PLL, the next chapter, then moves the pieces to their places.',
    ollIntro:
      'Look 1: make the yellow cross (like LBL, but faster). Look 2: twist the 4 yellow corners to face up. Grey stickers in the pictures are not yellow.',
    sourcesNote:
      'Algorithms without a source label come from the CubeSkills sheets. The smaller ones under them are the other options found, with their source: pick the one that feels best in your hands.',
    edges: 'Look 1: yellow cross',
    corners: 'Look 2: orient the corners (OCLL)',
    cornersIntro:
      'Count the yellow corners already facing up: 0 corners means H or Pi, 1 corner means Sune or Anti-Sune, 2 corners means one of the other 3 cases.',
    fullIntro:
      'Full OLL solves the whole yellow face in one algorithm: 57 cases, of which you already know 10 from 2-look. Pictures only colour yellow; grey is any other colour. Group codes and numbers follow the CubeSkills table (Feliks Zemdegs).',
    fullOrder:
      'Learn by group, easy groups first (T, P, square, C, W...), the dot cases last. Recognise a case from its shape, not by counting stickers.',
    fullMore: (link) => <>All 57 cases, grouped and searchable, are on the {link}.</>,
    fullLink: 'algorithm lookup page',
  },
  vi: {
    intro:
      'Sau F2L chỉ còn tầng trên. OLL (xoay tầng cuối) làm mọi ô vàng hướng lên, chưa quan tâm mảnh nào nằm đâu. PLL, chương kế tiếp, sẽ đưa các mảnh về đúng chỗ.',
    ollIntro:
      'Lần nhìn 1: làm dấu cộng vàng (giống LBL nhưng nhanh hơn). Lần nhìn 2: xoay 4 góc vàng hướng lên. Phần xám trong hình là mặt không phải màu vàng.',
    sourcesNote:
      'Công thức không ghi nguồn lấy từ bảng CubeSkills. Các dòng nhỏ bên dưới là những phương án khác tìm được, kèm nguồn: chọn cái bạn thấy xoay thuận tay nhất.',
    edges: 'Lần 1: dấu cộng vàng',
    corners: 'Lần 2: xoay góc (OCLL)',
    cornersIntro:
      'Đếm số góc vàng đã hướng lên: 0 góc là H hoặc Pi, 1 góc là Sune hoặc Anti-Sune, 2 góc là 3 ca còn lại.',
    fullIntro:
      'Full OLL làm xong cả mặt vàng bằng một công thức: 57 ca, trong đó bạn đã biết 10 ca từ 2-look. Hình chỉ tô màu vàng; xám là màu khác. Mã nhóm và số thứ tự theo bảng của CubeSkills (Feliks Zemdegs).',
    fullOrder:
      'Học theo nhóm, nhóm dễ trước (chữ T, P, vuông, C, W...), nhóm chấm học cuối. Nhận ca bằng hình dạng, không đếm từng ô.',
    fullMore: (link) => <>Đủ 57 ca, chia nhóm và có ô tìm kiếm, nằm ở {link}.</>,
    fullLink: 'trang tra cứu công thức',
  },
});

/** 2-look OLL with its 10 algorithms, then a pointer to the 57 full cases. */
export default async function OllChapter() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { ollEdges2Look, ollCorners2Look } = RUBIK_GUIDE[locale];

  return (
    <section>
      <ChapterHeading id="oll" />
      <P>{t.intro}</P>

      <SectionHeading id="oll-2look" />
      <P>{t.ollIntro}</P>
      <P>{t.sourcesNote}</P>
      <P>
        <strong>{t.edges}</strong>
      </P>
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
      <P>
        <strong>{t.corners}</strong> {t.cornersIntro}
      </P>
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

      <SectionHeading id="oll-full" />
      <P>{t.fullIntro}</P>
      <P>{t.fullOrder}</P>
      <P>
        {t.fullMore(
          <Link href={`${RUBIK_BASE}/algorithms?type=oll`} className="underline">
            {t.fullLink}
          </Link>
        )}
      </P>
    </section>
  );
}
