import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { Callout, P } from './parts';

const TEXT = defineMessages<{
  compareTitle: string;
  compareIntro: string;
  compareHead: [string, string, string];
  compareRows: Array<[string, string, string]>;
  compareNote: string;
}>({
  en: {
    compareTitle: 'Why do other guides use different algorithms?',
    compareIntro:
      'Layer by layer has several variants. The first 3 steps are nearly the same everywhere; guides differ mostly in the top layer, in the order of the steps and the algorithms. None of them is wrong: just follow one guide all the way and do not mix steps from different guides.',
    compareHead: ['Top layer', 'This guide', 'A common variant'],
    compareRows: [
      ['1', "Yellow cross: F R U R' U' F'", 'Yellow cross: the same'],
      [
        '2',
        "Match the edges: R U' R U R U R U' R' U' R2",
        "Whole top yellow: R U R' U R U2 R' (Sune)",
      ],
      ['3', "Place the corners: U R U' L' U R' U' L", 'Swap corners: a longer algorithm'],
      ['4', "Twist the corners: repeat R' D' R D", 'Swap edges: 1 to 2 more algorithms'],
    ],
    compareNote:
      'This guide picks the variant with the fewest algorithms to remember: the last step only repeats one 4-move algorithm.',
  },
  vi: {
    compareTitle: 'Vì sao công thức ở đây khác một số trang khác?',
    compareIntro:
      'Phương pháp từng tầng có nhiều biến thể. 3 bước đầu gần như giống nhau ở mọi nơi; khác nhau chủ yếu ở tầng trên cùng, về thứ tự các bước và công thức. Không bên nào sai: chỉ cần theo trọn một hướng dẫn, đừng trộn bước của hướng dẫn này với hướng dẫn khác.',
    compareHead: ['Tầng trên', 'Hướng dẫn này', 'Một biến thể phổ biến'],
    compareRows: [
      ['1', "Dấu cộng vàng: F R U R' U' F'", 'Dấu cộng vàng: giống nhau'],
      [
        '2',
        "Khớp màu cạnh: R U' R U R U R U' R' U' R2",
        "Làm vàng cả mặt trên: R U R' U R U2 R' (Sune)",
      ],
      ['3', "Đặt góc đúng chỗ: U R U' L' U R' U' L", 'Đổi chỗ góc: một công thức dài hơn'],
      ['4', "Xoay góc: lặp R' D' R D", 'Đổi chỗ cạnh: thêm 1 đến 2 công thức'],
    ],
    compareNote:
      'Hướng dẫn này chọn biến thể cần nhớ ít công thức nhất: bước cuối chỉ lặp lại một công thức 4 nước.',
  },
});

/**
 * Why the beginner algorithms differ from other guides: layer-by-layer variants mostly differ in
 * the top layer, and readers comparing guides tend to think one of them is wrong.
 */
export default async function BeginnerCompare() {
  const t = TEXT[await getLocale()];

  return (
    <Callout title={t.compareTitle}>
      <P className="mt-0">{t.compareIntro}</P>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border text-left text-sm">
          <thead>
            <tr className="border-b">
              {t.compareHead.map((head) => (
                <th key={head} className="p-2 font-semibold">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.compareRows.map((row) => (
              <tr key={row[0]} className="border-b">
                {row.map((cell, i) => (
                  <td key={i} className="p-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>{t.compareNote}</P>
    </Callout>
  );
}
