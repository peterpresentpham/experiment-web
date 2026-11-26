import { ReactNode } from 'react';
import { NOTATION_IMAGES, RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { Bullets, CubePicture, P } from '../parts';
import { ChapterHeading, SectionHeading } from './headings';

const TEXT = defineMessages<{
  intro: string;
  centersCaption: string;
  pieces: Array<ReactNode>;
  colorScheme: string;
  notationIntro: string;
  notationImages: string;
  gripTips: Array<string>;
}>({
  en: {
    intro:
      'Three things you need before the first move: what the cube is made of, how algorithms are written, and how to hold the cube. Every later chapter uses them without explaining them again.',
    centersCaption: 'Only the 6 centres coloured',
    pieces: [
      <>
        <strong>6 centres</strong>: they never move relative to each other. The centre decides the
        colour of its face, so the face with the red centre is the red face.
      </>,
      <>
        <strong>12 edges</strong>: pieces with 2 colours.
      </>,
      <>
        <strong>8 corners</strong>: pieces with 3 colours.
      </>,
      'When solving, you do not move single stickers; you move whole pieces (edges or corners) to their places.',
    ],
    colorScheme: 'Standard colour scheme (opposite faces):',
    notationIntro:
      'Every algorithm is written in notation. The letter tells you which face to turn; look straight at that face and turn it clockwise.',
    notationImages:
      'Each picture below is a solved cube after exactly 1 move. Try it on a real cube to compare:',
    gripTips: [
      'Hold the cube with both hands, thumbs on the front face and the other fingers on the back. The front face points at you.',
      "Practise R U R' U' (the sexy move) 6 times in a row: the cube returns to where it started. This is the first check that you are reading the notation correctly.",
      "R: push the right wrist up. R': pull the wrist down. U: flick the right index finger from right to left. U': flick the left index finger from left to right.",
      'No need for speed yet. The goal for the first week is to turn correctly without looking back at the notation.',
    ],
  },
  vi: {
    intro:
      'Ba điều cần có trước nước đi đầu tiên: khối được cấu tạo thế nào, công thức được viết ra sao và cách cầm khối. Các chương sau dùng ba điều này mà không giải thích lại.',
    centersCaption: 'Chỉ tô màu 6 tâm',
    pieces: [
      <>
        <strong>6 tâm</strong>: không bao giờ đổi chỗ với nhau. Tâm quyết định màu của mặt đó, nên
        mặt có tâm đỏ là mặt đỏ.
      </>,
      <>
        <strong>12 cạnh</strong>: mảnh có 2 màu.
      </>,
      <>
        <strong>8 góc</strong>: mảnh có 3 màu.
      </>,
      'Khi giải, bạn không di chuyển các ô màu riêng lẻ mà di chuyển cả mảnh (cạnh hoặc góc) về đúng chỗ.',
    ],
    colorScheme: 'Bộ màu chuẩn (các mặt đối diện):',
    notationIntro:
      'Mọi công thức viết bằng ký hiệu. Chữ cái cho biết mặt nào cần xoay; nhìn thẳng vào mặt đó, xoay theo chiều kim đồng hồ.',
    notationImages:
      'Mỗi hình dưới là khối đã giải sau đúng 1 nước. Tự làm theo trên khối thật để so sánh:',
    gripTips: [
      'Cầm khối bằng 2 tay, ngón cái ở mặt trước, các ngón còn lại ở mặt sau. Mặt trước hướng vào bạn.',
      "Tập lặp lại R U R' U' (sexy move) 6 lần liên tục: khối sẽ quay về như cũ. Đây là bài kiểm tra đầu tiên để biết bạn xoay đúng ký hiệu chưa.",
      "R: đẩy cổ tay phải lên. R': kéo cổ tay xuống. U: búng ngón trỏ phải từ phải sang trái. U': búng ngón trỏ trái từ trái sang phải.",
      'Chưa cần nhanh. Mục tiêu tuần đầu là làm đúng, không phải nhìn lại ký hiệu.',
    ],
  },
});

export default async function BasicsChapter() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { colorScheme, notation } = RUBIK_GUIDE[locale];

  return (
    <section>
      <ChapterHeading id="basics" />
      <P>{t.intro}</P>

      <SectionHeading id="basics-structure" />
      <div className="flex flex-wrap items-center gap-6">
        <CubePicture image={{ kind: 'iso', mask: 'centers', caption: t.centersCaption }} />
        <div className="min-w-64 flex-1">
          <Bullets items={t.pieces} />
        </div>
      </div>
      <P>{t.colorScheme}</P>
      <ul className="mt-2 flex flex-wrap gap-3 text-sm">
        {colorScheme.map((c) => (
          <li key={c.color} className="rounded-md border px-3 py-1">
            {c.color} ↔ {c.opposite}
          </li>
        ))}
      </ul>

      <SectionHeading id="basics-notation" />
      <P>{t.notationIntro}</P>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border text-left text-sm">
          <tbody>
            {notation.map((n) => (
              <tr key={n.move} className="border-b">
                <td className="w-40 p-2 font-mono font-bold">{n.move}</td>
                <td className="p-2">{n.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>{t.notationImages}</P>
      <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {NOTATION_IMAGES.map((m) => (
          <div key={m} className="flex flex-col items-center">
            <CubePicture image={{ kind: 'iso', setup: m }} size={84} />
            <p className="font-mono text-lg font-bold">{m}</p>
          </div>
        ))}
      </div>

      <SectionHeading id="basics-grip" />
      <Bullets items={t.gripTips} />
    </section>
  );
}
