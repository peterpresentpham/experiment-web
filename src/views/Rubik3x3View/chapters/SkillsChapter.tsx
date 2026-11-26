import { ReactNode } from 'react';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { Bullets, P } from '../parts';
import { ChapterHeading, SectionHeading } from './headings';

const TEXT = defineMessages<{
  intro: string;
  fingerTips: Array<string>;
  advancedFingers: string;
  advancedFingerTips: Array<string>;
  saveTimeTips: Array<string>;
  lookaheadIntro: string;
  lookaheadLevels: Array<ReactNode>;
  drills: string;
  drillList: Array<string>;
  lastLayerTips: Array<string>;
  practiceTips: Array<string>;
}>({
  en: {
    intro:
      'Knowing every algorithm is not what separates a 30-second solver from a 10-second one: smooth hands and eyes that read ahead are. These sections apply to every step above. Read the first two when you start CFOP and the rest below 20 seconds.',
    fingerTips: [
      'Hold the cube naturally with your thumbs in front, without squeezing. Most algorithms that only use R, U and F are written to be done with your fingers, without changing your grip.',
      "U: flick with the right index finger. U': flick with the left index finger. U2: two flicks in a row with the right index and middle fingers (double flick).",
      "R/R': use your wrist. F: push with the right thumb (or regrip). F': pull from the top with the right index finger. D: pull with the left ring finger.",
      'Practise each algorithm slowly and smoothly with the right fingers before speeding up. Wrong fingering learned early is very hard to fix later.',
    ],
    advancedFingers: 'Advanced finger tricks:',
    advancedFingerTips: [
      'Double flick U2: flick with the index finger, then the middle finger, in one motion. Learn it on both the left and the right.',
      'Pinch for F and U: use the thumb and index finger to avoid regripping.',
      'M and M2: flick the middle layer from the back with the ring or middle finger. Needed for H, Z and the M versions of Ua/Ub.',
      'Regrip as little as possible: choose algorithms that suit your hands, even if they are 1 move longer.',
      'Set up your cube: medium tension, silicone lube and medium-strength magnets. A good cube helps you avoid lockups.',
    ],
    saveTimeTips: [
      'Avoid whole-cube rotations (y, x). Each one costs about 0.3 to 0.5 seconds and makes you lose track of the pieces you are following.',
      'Use the 15-second inspection: find the whole cross and, if you can, the first F2L pair too.',
      'Recognise OLL/PLL by shapes and positions, not by counting stickers. For example headlights (2 corners of the same colour on one side) identify Aa right away.',
      'Time yourself with csTimer and track the average of 5 (ao5) and 12 (ao12) solves rather than lucky single solves.',
    ],
    lookaheadIntro:
      'Lookahead is planning the next step while your hands are still doing the current one. It is the hardest skill and makes the biggest difference between a 20-second and a 10-second solver. CubeSkills splits it into 3 levels:',
    lookaheadLevels: [
      <>
        <strong>Searching</strong>: finish this pair, then look for the next one. There is a pause
        between pairs.
      </>,
      <>
        <strong>Tracking</strong>: while doing this pair, your eyes already follow the pieces of the
        next pair.
      </>,
      <>
        <strong>Knowing</strong>: you can predict where the next pair&apos;s pieces will be after
        the current pair, so you never pause.
      </>,
    ],
    drills: 'Drills:',
    drillList: [
      'Slow solves: turn really slowly (1 to 2 moves per second) but never stop. Speed comes on its own once your eyes keep up.',
      'Metronome: one move per tick. Increase the tempo as you stop pausing.',
      "Track one piece: pick an edge, close your eyes, do R U R' in your head and guess where it goes. Open your eyes and check.",
      'Two-pair F2L: plan 2 pairs, do them without looking again, then plan the next 2.',
      'Predict OLL: while inserting the last F2L pair, try to predict the yellow edge shape (dot, L, line), then the whole OLL case.',
      'Slow down at the end of each pair to give yourself time to see the next one. F2L should be one continuous flow, not 4 separate pieces.',
    ],
    lastLayerTips: [
      'AUF prediction: while doing PLL, predict which way the final U turn goes so you do not have to look again.',
      'Learn more angles: recognise each OLL/PLL case from 2 sides (front and back) so you do not need a U turn before starting.',
      'COLL (42 cases): when the yellow edges are oriented, orient and place the corners together, leaving only an easy edge PLL (U, H, Z).',
      'ZBLL (493 cases): solve the whole last layer in one algorithm when the edges are oriented. Only for the very dedicated.',
    ],
    practiceTips: [
      'Practise with purpose: focus each session on 1 skill (cross, F2L, OLL recognition), not just solve after solve.',
      'Keep data: use csTimer with split timing to see which step is slowest.',
      'Review your solves: record a video or use an analysis tool to see where you pause.',
      'Drill the rare cases too (dot OLLs, N-perms) so they do not trip you up.',
      'Take breaks: tired hands are when bad habits form.',
    ],
  },
  vi: {
    intro:
      'Thuộc hết công thức không phải điều phân biệt người 30 giây với người 10 giây: tay mượt và mắt nhìn trước mới là điều đó. Các mục này áp dụng cho mọi bước ở trên. Đọc hai mục đầu khi bắt đầu CFOP, phần còn lại khi đã dưới 20 giây.',
    fingerTips: [
      'Cầm khối tự nhiên, ngón cái phía trước, không bóp chặt. Đa số công thức chỉ dùng R, U, F được viết để làm bằng ngón tay, không cần đổi cách cầm.',
      "U: ngón trỏ phải búng. U': ngón trỏ trái búng. U2: búng 2 lần liên tiếp bằng ngón trỏ và ngón giữa phải (double flick).",
      "R/R': dùng cổ tay. F: ngón cái phải đẩy (hoặc đổi cầm). F': ngón trỏ phải kéo từ trên. D: ngón áp út trái kéo.",
      'Tập từng công thức chậm và mượt bằng ngón tay đúng, rồi mới tăng tốc. Làm sai ngón từ đầu sẽ rất khó sửa sau.',
    ],
    advancedFingers: 'Finger tricks nâng cao:',
    advancedFingerTips: [
      'Double flick U2: búng ngón trỏ rồi ngón giữa liên tiếp. Làm được cả bên trái và phải.',
      'Pinch (kẹp) cho F và U: dùng ngón cái và ngón trỏ, tránh đổi cầm khối.',
      'M và M2: búng ngón áp út hoặc ngón giữa vào lớp giữa từ phía sau. Cần cho H, Z, Ua/Ub dạng M.',
      'Regrip ít nhất có thể: chọn công thức phù hợp tay, kể cả khi dài hơn 1 nước.',
      'Điều chỉnh khối: độ căng vừa, dầu bôi trơn (silicone), nam châm vừa lực. Khối tốt giúp tránh vấp (lockup).',
    ],
    saveTimeTips: [
      'Hạn chế xoay cả khối (y, x). Mỗi lần xoay mất khoảng 0,3 đến 0,5 giây và làm mất dấu mảnh đang theo.',
      'Dùng 15 giây quan sát: tìm đủ cross, và nếu được, tìm luôn cặp F2L đầu tiên.',
      'Nhận diện OLL/PLL bằng hình dạng và vị trí, không đếm từng ô. Ví dụ đèn pha (2 góc cùng màu trên một mặt) giúp nhận ra Aa ngay.',
      'Bấm giờ bằng csTimer, theo dõi trung bình 5 (ao5) và 12 (ao12) lần giải, không quan tâm lần giải may mắn.',
    ],
    lookaheadIntro:
      'Lookahead là khả năng lên kế hoạch bước sau trong lúc tay vẫn đang làm bước hiện tại. Đây là kỹ năng khó nhất và tạo khác biệt lớn nhất giữa người 20 giây và người 10 giây. CubeSkills chia làm 3 mức:',
    lookaheadLevels: [
      <>
        <strong>Tìm kiếm</strong>: làm xong cặp này mới tìm cặp tiếp. Có khoảng dừng giữa các cặp.
      </>,
      <>
        <strong>Theo dõi</strong>: trong lúc làm cặp này, mắt đã theo dõi các mảnh của cặp tiếp
        theo.
      </>,
      <>
        <strong>Biết trước</strong>: đoán được mảnh của cặp sau sẽ nằm đâu sau khi làm xong cặp hiện
        tại, nên không cần dừng.
      </>,
    ],
    drills: 'Bài tập:',
    drillList: [
      'Giải chậm: xoay chậm hẳn (1 đến 2 nước/giây) nhưng không bao giờ dừng. Tốc độ sẽ tự tăng khi mắt theo kịp.',
      'Metronome: mỗi tiếng tích là 1 nước. Tăng tốc độ dần khi không còn bị dừng.',
      "Theo dõi một mảnh: chọn 1 cạnh, nhắm mắt làm R U R' trong đầu và đoán nó đi đâu. Mở mắt kiểm tra.",
      'F2L 2 lần nhìn: lên kế hoạch 2 cặp, làm không nhìn lại, rồi mới nhìn tiếp 2 cặp sau.',
      'Đoán OLL: khi chèn cặp F2L cuối, cố đoán hình cạnh vàng (chấm, L, thẳng), sau đó đoán cả ca OLL.',
      'Làm chậm lại ở cuối mỗi cặp để có thời gian nhìn cặp sau. F2L nên là một dòng chảy liên tục, không phải 4 đoạn rời.',
    ],
    lastLayerTips: [
      'Dự đoán AUF: trong lúc làm PLL, đoán trước nên xoay U về phía nào ở cuối để khỏi phải nhìn lại.',
      'Học thêm góc nhìn: mỗi ca OLL/PLL nên nhận ra từ 2 phía (trước và sau) để khỏi xoay U trước khi làm.',
      'COLL (42 ca): khi cạnh vàng đã đúng, xoay và đặt góc cùng lúc, chỉ còn PLL cạnh (U, H, Z) dễ.',
      'ZBLL (493 ca): giải cả tầng cuối bằng 1 công thức khi cạnh đã đúng. Chỉ cho người rất nghiêm túc.',
    ],
    practiceTips: [
      'Luyện có mục đích: mỗi buổi tập trung 1 kỹ năng (cross, F2L, nhận diện OLL), không chỉ giải liên tục.',
      'Ghi lại số liệu: dùng csTimer với chế độ chia giai đoạn để biết bước nào chậm nhất.',
      'Xem lại lần giải: quay video hoặc dùng công cụ phân tích để thấy chỗ dừng.',
      'Tập cả ca hiếm (OLL chấm, N-perm) để không bị vấp khi gặp.',
      'Tập nghỉ: mỏi tay là lúc dễ học thói quen xấu.',
    ],
  },
});

/** Finger tricks, saving time, lookahead and practice: skills that apply to every CFOP step. */
export default async function SkillsChapter() {
  const t = TEXT[await getLocale()];

  return (
    <section>
      <ChapterHeading id="skills" />
      <P>{t.intro}</P>

      <SectionHeading id="skills-fingers" />
      <Bullets items={t.fingerTips} />
      <P>
        <strong>{t.advancedFingers}</strong>
      </P>
      <Bullets items={t.advancedFingerTips} />

      <SectionHeading id="skills-saving" />
      <Bullets items={t.saveTimeTips} />

      <SectionHeading id="skills-lookahead" />
      <P>{t.lookaheadIntro}</P>
      <Bullets items={t.lookaheadLevels} />
      <P>
        <strong>{t.drills}</strong>
      </P>
      <Bullets items={t.drillList} />

      <SectionHeading id="skills-lastlayer" />
      <Bullets items={t.lastLayerTips} />

      <SectionHeading id="skills-practice" />
      <Bullets items={t.practiceTips} />
    </section>
  );
}
