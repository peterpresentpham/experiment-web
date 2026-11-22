import { ReactNode } from 'react';
import { RUBIK_GUIDE, NOTATION_IMAGES } from 'src/configs/rubikGuide.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import BeginnerCompare from './BeginnerCompare';
import { AlgRow, Bullets, Callout, CubePicture, H2, H3, P } from './parts';

const TEXT = defineMessages<{
  intro: string;
  basics: string;
  structure: string;
  centersCaption: string;
  pieces: Array<ReactNode>;
  colorScheme: string;
  notation: string;
  notationIntro: string;
  notationImages: string;
  grip: string;
  gripTips: Array<string>;
  steps: string;
  goal: string;
  hold: string;
  tips: string;
  tipList: Array<string>;
  nextTitle: string;
  next: string;
}>({
  en: {
    intro:
      'The Layer By Layer (LBL) method is the most common way to solve the cube for the first time: solve the bottom layer, then the middle layer, then the top layer. You only need to remember about 7 short algorithms. The first solve usually takes a few dozen minutes; after 1 to 2 weeks of practice, most people get under 2 minutes.',
    basics: 'The basics',
    structure: 'How the cube is built',
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
    notation: 'Move notation',
    notationIntro:
      'Every algorithm is written in notation. The letter tells you which face to turn; look straight at that face and turn it clockwise.',
    notationImages:
      'Each picture below is a solved cube after exactly 1 move. Try it on a real cube to compare:',
    grip: 'Holding the cube and finger practice',
    gripTips: [
      'Hold the cube with both hands, thumbs on the front face and the other fingers on the back. The front face points at you.',
      "Practise R U R' U' (the sexy move) 6 times in a row: the cube returns to where it started. This is the first check that you are reading the notation correctly.",
      "R: push the right wrist up. R': pull the wrist down. U: flick the right index finger from right to left. U': flick the left index finger from left to right.",
      'No need for speed yet. The goal for the first week is to turn correctly without looking back at the notation.',
    ],
    steps: 'The 7 steps',
    goal: 'Goal:',
    hold: 'How to hold it:',
    tips: 'Tips and common mistakes',
    tipList: [
      'Always check the centre colours before placing a piece. The white-red edge belongs between the white and red centres, nowhere else.',
      'One wrong move in the middle of an algorithm is the number 1 reason the cube gets "more scrambled". If it happens, do not try to fix it: go back to the last layer that is still solved and redo that step.',
      'Step 7 needs you to keep the same grip. The most common mistake is rotating the whole cube halfway, which breaks the first two layers.',
      'Saying the algorithm out loud while doing it ("R, U, R prime, U prime") helps you remember it faster.',
      "Understanding what an algorithm does (for example R U R' U' takes a corner up and back down) matters more than memorising it. You will be able to fix your own mistakes.",
      'Solved it 5 times in a row without the guide? Start timing yourself with csTimer (cstimer.net).',
    ],
    nextTitle: 'When to move on to Intermediate?',
    next: 'When you can solve without the guide, consistently under about 1 to 2 minutes. At that point LBL will not get you much faster because it uses too many moves (about 100 to 120). Switch to the Intermediate tab to learn CFOP.',
  },
  vi: {
    intro:
      'Phương pháp từng tầng (Layer By Layer, LBL) là cách phổ biến nhất để giải khối lần đầu: giải tầng dưới, rồi tầng giữa, rồi tầng trên. Bạn chỉ cần nhớ khoảng 7 công thức ngắn. Lần đầu thường mất vài chục phút; sau 1 đến 2 tuần luyện, đa số người xuống dưới 2 phút.',
    basics: 'Kiến thức nền',
    structure: 'Cấu tạo khối',
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
    notation: 'Ký hiệu nước đi',
    notationIntro:
      'Mọi công thức viết bằng ký hiệu. Chữ cái cho biết mặt nào cần xoay; nhìn thẳng vào mặt đó, xoay theo chiều kim đồng hồ.',
    notationImages:
      'Mỗi hình dưới là khối đã giải sau đúng 1 nước. Tự làm theo trên khối thật để so sánh:',
    grip: 'Cách cầm và tập ngón tay',
    gripTips: [
      'Cầm khối bằng 2 tay, ngón cái ở mặt trước, các ngón còn lại ở mặt sau. Mặt trước hướng vào bạn.',
      "Tập lặp lại R U R' U' (sexy move) 6 lần liên tục: khối sẽ quay về như cũ. Đây là bài kiểm tra đầu tiên để biết bạn xoay đúng ký hiệu chưa.",
      "R: đẩy cổ tay phải lên. R': kéo cổ tay xuống. U: búng ngón trỏ phải từ phải sang trái. U': búng ngón trỏ trái từ trái sang phải.",
      'Chưa cần nhanh. Mục tiêu tuần đầu là làm đúng, không phải nhìn lại ký hiệu.',
    ],
    steps: '7 bước giải',
    goal: 'Mục tiêu:',
    hold: 'Cách cầm:',
    tips: 'Mẹo và lỗi hay gặp',
    tipList: [
      'Luôn kiểm tra màu tâm trước khi đặt mảnh. Cạnh trắng-đỏ phải nằm giữa tâm trắng và tâm đỏ, không phải chỗ khác.',
      'Làm sai một nước giữa công thức là nguyên nhân số 1 khiến khối "rối hơn". Nếu bị, đừng cố sửa: quay lại tầng cuối cùng còn đúng và làm lại bước đó.',
      'Bước 7 cần giữ nguyên cách cầm. Lỗi phổ biến nhất là xoay cả khối giữa chừng, làm hỏng 2 tầng dưới.',
      'Đọc to công thức khi làm ("R, U, R phẩy, U phẩy") giúp nhớ nhanh hơn.',
      "Hiểu công thức làm gì (ví dụ R U R' U' đưa góc lên rồi xuống) quan trọng hơn thuộc lòng. Bạn sẽ tự sửa lỗi được.",
      'Đã giải được 5 lần liên tiếp không nhìn hướng dẫn? Bắt đầu bấm giờ bằng csTimer (cstimer.net).',
    ],
    nextTitle: 'Khi nào lên Trung cấp?',
    next: 'Khi bạn giải được không cần nhìn hướng dẫn, đều đặn dưới khoảng 1 đến 2 phút. Lúc này LBL không giúp nhanh thêm nhiều nữa vì nó dùng quá nhiều nước (khoảng 100 đến 120). Chuyển sang tab Trung cấp để học CFOP.',
  },
});

export default async function BeginnerTab() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { colorScheme, notation, beginnerSteps } = RUBIK_GUIDE[locale];

  return (
    <div>
      <P>{t.intro}</P>

      <H2 id="beginner-basics">{t.basics}</H2>
      <H3>{t.structure}</H3>
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

      <H3>{t.notation}</H3>
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

      <H3>{t.grip}</H3>
      <Bullets items={t.gripTips} />

      <H2 id="beginner-steps">{t.steps}</H2>
      {beginnerSteps.map((step) => (
        <section key={step.title}>
          <H3>{step.title}</H3>
          <P>
            <strong>{t.goal}</strong> {step.goal}
          </P>
          <P>
            <strong>{t.hold}</strong> {step.hold}
          </P>
          {step.images && (
            <div className="mt-3 flex flex-wrap gap-6">
              {step.images.map((img, i) => (
                <CubePicture key={i} image={img} />
              ))}
            </div>
          )}
          <Bullets items={step.tips} />
          {step.algs?.map((a) => (
            <AlgRow key={a.alg} {...a} />
          ))}
        </section>
      ))}

      <BeginnerCompare />

      <H2 id="beginner-tips">{t.tips}</H2>
      <Bullets items={t.tipList} />

      <Callout title={t.nextTitle}>
        <P className="mt-0">{t.next}</P>
      </Callout>
    </div>
  );
}
