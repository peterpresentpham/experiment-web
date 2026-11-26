import { BEGINNER_OPTIONS } from 'src/configs/rubikAlgOptions.config';
import { RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { AlgOptionGrid } from '../AlgOptions';
import BeginnerCompare from '../BeginnerCompare';
import { AlgRow, Bullets, Callout, CubePicture, P } from '../parts';
import { ChapterHeading, SectionHeading } from './headings';

const TEXT = defineMessages<{
  intro: string;
  goal: string;
  hold: string;
  tipList: Array<string>;
  nextTitle: string;
  next: string;
}>({
  en: {
    intro:
      'The Layer By Layer (LBL) method is the most common way to solve the cube for the first time: solve the bottom layer, then the middle layer, then the top layer in 7 steps. You only need to remember about 7 short algorithms. The first solve usually takes a few dozen minutes; after 1 to 2 weeks of practice, most people get under 2 minutes.',
    goal: 'Goal:',
    hold: 'How to hold it:',
    tipList: [
      'Always check the centre colours before placing a piece. The white-red edge belongs between the white and red centres, nowhere else.',
      'One wrong move in the middle of an algorithm is the number 1 reason the cube gets "more scrambled". If it happens, do not try to fix it: go back to the last layer that is still solved and redo that step.',
      'Step 7 needs you to keep the same grip. The most common mistake is rotating the whole cube halfway, which breaks the first two layers.',
      'Saying the algorithm out loud while doing it ("R, U, R prime, U prime") helps you remember it faster.',
      "Understanding what an algorithm does (for example R U R' U' takes a corner up and back down) matters more than memorising it. You will be able to fix your own mistakes.",
      'Solved it 5 times in a row without the guide? Start timing yourself with csTimer (cstimer.net).',
    ],
    nextTitle: 'When to move on?',
    next: 'When you can solve without the guide, consistently under about 1 to 2 minutes. At that point LBL will not get you much faster because it uses too many moves (about 100 to 120). The next chapters teach CFOP, which needs about half as many: start with the cross.',
  },
  vi: {
    intro:
      'Phương pháp từng tầng (Layer By Layer, LBL) là cách phổ biến nhất để giải khối lần đầu: giải tầng dưới, rồi tầng giữa, rồi tầng trên, qua 7 bước. Bạn chỉ cần nhớ khoảng 7 công thức ngắn. Lần đầu thường mất vài chục phút; sau 1 đến 2 tuần luyện, đa số người xuống dưới 2 phút.',
    goal: 'Mục tiêu:',
    hold: 'Cách cầm:',
    tipList: [
      'Luôn kiểm tra màu tâm trước khi đặt mảnh. Cạnh trắng-đỏ phải nằm giữa tâm trắng và tâm đỏ, không phải chỗ khác.',
      'Làm sai một nước giữa công thức là nguyên nhân số 1 khiến khối "rối hơn". Nếu bị, đừng cố sửa: quay lại tầng cuối cùng còn đúng và làm lại bước đó.',
      'Bước 7 cần giữ nguyên cách cầm. Lỗi phổ biến nhất là xoay cả khối giữa chừng, làm hỏng 2 tầng dưới.',
      'Đọc to công thức khi làm ("R, U, R phẩy, U phẩy") giúp nhớ nhanh hơn.',
      "Hiểu công thức làm gì (ví dụ R U R' U' đưa góc lên rồi xuống) quan trọng hơn thuộc lòng. Bạn sẽ tự sửa lỗi được.",
      'Đã giải được 5 lần liên tiếp không nhìn hướng dẫn? Bắt đầu bấm giờ bằng csTimer (cstimer.net).',
    ],
    nextTitle: 'Khi nào đi tiếp?',
    next: 'Khi bạn giải được không cần nhìn hướng dẫn, đều đặn dưới khoảng 1 đến 2 phút. Lúc này LBL không giúp nhanh thêm nhiều nữa vì nó dùng quá nhiều nước (khoảng 100 đến 120). Các chương sau dạy CFOP, chỉ cần khoảng một nửa số nước đó: bắt đầu với cross.',
  },
});

/** The 7-step beginner method, then why other guides differ, then tips. */
export default async function LblChapter() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { beginnerSteps } = RUBIK_GUIDE[locale];

  return (
    <section>
      <ChapterHeading id="lbl" />
      <P>{t.intro}</P>

      {beginnerSteps.map((step, index) => (
        <div key={step.title}>
          <SectionHeading id={`lbl-step-${index + 1}`} />
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
          <AlgOptionGrid group={BEGINNER_OPTIONS[index]} />
        </div>
      ))}

      <SectionHeading id="lbl-variants" />
      <BeginnerCompare />

      <SectionHeading id="lbl-tips" />
      <Bullets items={t.tipList} />

      <Callout title={t.nextTitle}>
        <P className="mt-0">{t.next}</P>
      </Callout>
    </section>
  );
}
