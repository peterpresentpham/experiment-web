import { ReactNode } from 'react';
import { CROSS_EDGE_CASES } from 'src/configs/rubikFirstLayer.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { Bullets, Callout, CubePicture, P } from '../parts';
import { FirstLayerCaseGrid, TCaseText } from './FirstLayerCases';
import { ChapterHeading, SectionHeading } from './headings';

const TEXT = defineMessages<{
  intro: ReactNode;
  directIntro: string;
  goalCaption: string;
  crossIntro: string;
  crossCases: TCaseText;
  crossTips: Array<string>;
  drillsLabel: string;
  drills: Array<string>;
  inspection: Array<string>;
  xcross: Array<string>;
  nextTitle: string;
  next: string;
}>({
  en: {
    intro: (
      <>
        From here on the guide teaches CFOP (also called Fridrich), the method most competitors use.
        The name lists its 4 steps: <strong>C</strong>ross, <strong>F</strong>2L (first two layers),{' '}
        <strong>O</strong>LL (orient the last layer), <strong>P</strong>LL (permute the last layer).
        Full CFOP takes about 55 to 60 moves, compared with over 100 for LBL. The next four chapters
        follow those 4 steps in order, starting with the cross.
      </>
    ),
    directIntro:
      'In LBL you built a daisy, flipped the cube and repeated the sexy move up to 5 times per corner, which is often 50 to 60 moves for the white face. The faster way starts here: build the white cross directly on the bottom, in about 6 to 8 moves, with no daisy and no flip.',
    goalCaption: 'White cross, seen from the bottom',
    crossIntro:
      'Hold white on the bottom and yellow on top the whole time. In every picture the edge belongs in the front-bottom slot (between the white and green centres), and the other cross edges are already solved: the cases never break them. Turn U or D first to bring your edge into the same position as the picture.',
    crossCases: {
      topWhiteUp: {
        title: 'Top layer, white facing up',
        note: 'Turn U until the edge sits above its centre, then turn that face twice.',
      },
      topWhiteFront: {
        title: 'Top layer, white facing out',
        note: "U' moves the edge to the right, R' F R flips it in. R' takes the right cross edge out of the way and R puts it back.",
      },
      middleWhiteSide: {
        title: 'Middle layer, white on the side',
        note: 'One turn of the face the coloured sticker is on.',
      },
      middleWhiteFront: {
        title: 'Middle layer, white facing front',
        note: "D brings the empty slot under the edge, R' drops it in, D' brings everything back.",
      },
      bottomFlipped: {
        title: 'In its slot but flipped',
        note: "From the CubeSkills tutorial. F' lifts the edge out the right way round, D R' D' puts it back.",
      },
      bottomWrongSlot: {
        title: 'On the bottom, wrong slot',
        note: 'R2 lifts it to the top, U moves it over, F2 drops it in. The edge that belongs in the slot you emptied is still to be solved.',
      },
    },
    crossTips: [
      'Learn the colour order. With yellow on top, going clockwise seen from above: green, red, blue, orange. So if green is in front, red is on the left and orange on the right.',
      'Edges only need to be right relative to each other. Place two edges next to each other in the right order, and one D turn at the end lines all of them up with their centres. This is the main idea that takes the cross from about 12 moves to 6 or 7.',
      'Look for 2 edges you can solve with the same move. For example F R2 D2 places two edges at once (Ruwix). These patterns come with practice; do not memorise them.',
      'Recognise each case from any side. If you can only see a case from the front, you will waste time on y rotations.',
      'Solve the hardest edge first, while the bottom is still empty and you can move freely. Leave the easy edges (white up on top, F2 or R2) for last.',
      'How to practise: first build the cross on top (where you can see it), then gradually move it to the bottom. Each day, plan 20 crosses by looking only, without turning, then do them and check.',
    ],
    drillsLabel: 'Practice drills',
    drills: [
      'Cross only: scramble, plan in 15 seconds, then solve the cross with your eyes closed. Open them and check. 20 times a day.',
      'Count moves: write down your cross solution and try to find a shorter one. Aim for 8 moves or fewer every time.',
    ],
    inspection: [
      'Seconds 1 to 5: find the 4 white edges.',
      'Seconds 5 to 10: plan the whole cross, move by move, in your head.',
      'Seconds 10 to 15: go through the plan once more and find where the first corner (or F2L pair) is.',
      'Every cross can be solved in at most 8 moves. If your plan is longer, look for a better one.',
      'Practise with unlimited inspection at first and shorten it later. If you cannot plan the whole cross, plan the first 2 or 3 edges, then look again.',
    ],
    xcross: [
      'XCross: during the 15-second inspection, find the cross and the first F2L pair together and solve both in one go.',
      'Colour neutrality: being able to solve the cross on 2 colours (white and yellow) or all 6 lets you pick the shortest cross. Top solvers usually do this.',
      'Do the cross slowly while looking ahead to the first pair, instead of rushing it and then pausing to search.',
    ],
    nextTitle: 'Next: the first two layers',
    next: 'Once you can plan a cross in the inspection and solve it in 8 moves or fewer, move on to F2L. It starts with the white corners, using the same hold: white on the bottom.',
  },
  vi: {
    intro: (
      <>
        Từ đây hướng dẫn dạy CFOP (còn gọi Fridrich), phương pháp được đa số người thi đấu dùng. Tên
        gồm 4 bước: <strong>C</strong>ross (dấu cộng), <strong>F</strong>2L (2 tầng đầu),{' '}
        <strong>O</strong>LL (xoay tầng cuối), <strong>P</strong>LL (hoán vị tầng cuối). CFOP đầy đủ
        cần khoảng 55 đến 60 nước, so với hơn 100 của LBL. Bốn chương tiếp theo đi đúng theo 4 bước
        đó, bắt đầu từ cross.
      </>
    ),
    directIntro:
      'Trong LBL bạn làm bông hoa, lật khối và lặp sexy move đến 5 lần cho mỗi góc, nên mặt trắng thường tốn 50 đến 60 nước. Cách nhanh hơn bắt đầu từ đây: làm dấu cộng trắng thẳng ở mặt dưới, khoảng 6 đến 8 nước, không bông hoa và không lật khối.',
    goalCaption: 'Dấu cộng trắng, nhìn từ mặt dưới',
    crossIntro:
      'Luôn cầm trắng ở dưới, vàng ở trên. Trong mọi hình, cạnh cần đặt thuộc về khe trước-dưới (giữa tâm trắng và tâm xanh lá), và các cạnh dấu cộng khác đã đúng: các công thức không bao giờ phá chúng. Xoay U hoặc D trước để đưa cạnh của bạn về đúng vị trí như hình.',
    crossCases: {
      topWhiteUp: {
        title: 'Tầng trên, trắng nhìn lên',
        note: 'Xoay U cho đến khi cạnh nằm trên tâm cùng màu, rồi xoay mặt đó 2 lần.',
      },
      topWhiteFront: {
        title: 'Tầng trên, trắng nhìn ra ngoài',
        note: "U' đưa cạnh sang phải, R' F R lật nó vào. R' tạm đưa cạnh dấu cộng bên phải ra khỏi đường đi, R đưa nó về.",
      },
      middleWhiteSide: {
        title: 'Tầng giữa, trắng nhìn sang bên',
        note: 'Chỉ cần xoay 1 lần mặt có ô màu còn lại của cạnh.',
      },
      middleWhiteFront: {
        title: 'Tầng giữa, trắng nhìn ra trước',
        note: "D đưa khe trống xuống dưới cạnh, R' thả cạnh vào, D' trả mọi thứ về chỗ cũ.",
      },
      bottomFlipped: {
        title: 'Đúng khe nhưng bị lật',
        note: "Theo bài hướng dẫn của CubeSkills. F' nhấc cạnh ra đúng chiều, D R' D' đặt nó lại.",
      },
      bottomWrongSlot: {
        title: 'Ở đáy nhưng sai khe',
        note: 'R2 nhấc cạnh lên trên, U đưa nó sang, F2 thả nó xuống. Cạnh thuộc khe vừa trống vẫn cần giải sau.',
      },
    },
    crossTips: [
      'Thuộc thứ tự màu. Vàng ở trên, nhìn từ trên xuống theo chiều kim đồng hồ: xanh lá, đỏ, xanh dương, cam. Vậy khi xanh lá ở trước thì đỏ ở trái, cam ở phải.',
      'Các cạnh chỉ cần đúng vị trí so với nhau. Đặt 2 cạnh cạnh nhau đúng thứ tự, cuối cùng 1 lần xoay D sẽ căn tất cả khớp với tâm. Đây là ý chính giúp dấu cộng giảm từ khoảng 12 nước xuống 6 hoặc 7.',
      'Tìm 2 cạnh giải được bằng cùng một nước. Ví dụ F R2 D2 đặt 2 cạnh cùng lúc (theo Ruwix). Các mẫu này tự có khi luyện nhiều, không cần học thuộc.',
      'Nhận ra mỗi ca từ mọi phía. Nếu chỉ nhận ra khi cạnh ở phía trước, bạn sẽ mất thời gian xoay cả khối (y).',
      'Giải cạnh khó nhất trước, khi đáy còn trống và bạn xoay thoải mái. Để các cạnh dễ (trắng nhìn lên ở tầng trên, chỉ cần F2 hoặc R2) làm cuối.',
      'Cách tập: lúc đầu làm cross ở trên (nhìn được), rồi chuyển dần xuống dưới. Mỗi ngày giải 20 cross chỉ nhìn, không xoay, rồi mới làm và kiểm tra.',
    ],
    drillsLabel: 'Bài tập',
    drills: [
      'Chỉ làm dấu cộng: xáo khối, tính trong 15 giây, rồi nhắm mắt làm dấu cộng. Mở mắt kiểm tra. Mỗi ngày 20 lần.',
      'Đếm nước: ghi lại lời giải dấu cộng của bạn rồi thử tìm cách ngắn hơn. Mục tiêu luôn từ 8 nước trở xuống.',
    ],
    inspection: [
      'Giây 1 đến 5: tìm 4 cạnh trắng.',
      'Giây 5 đến 10: tính toàn bộ dấu cộng trong đầu, từng nước một.',
      'Giây 10 đến 15: đi lại kế hoạch một lần nữa và tìm xem góc đầu tiên (hoặc cặp F2L đầu tiên) ở đâu.',
      'Mọi dấu cộng đều giải được trong tối đa 8 nước. Nếu kế hoạch của bạn dài hơn, hãy tìm cách khác.',
      'Lúc đầu tập không giới hạn thời gian quan sát, sau đó rút ngắn dần. Nếu chưa tính hết được, tính trước 2 hoặc 3 cạnh rồi nhìn lại.',
    ],
    xcross: [
      'XCross: trong 15 giây quan sát, tìm cross và cặp F2L đầu tiên cùng lúc, giải cả 2 trong một lần.',
      'Cross không màu cố định (color neutral): giải được cross ở 2 màu (trắng và vàng) hoặc cả 6 màu giúp chọn cross ngắn nhất. Dân chuyên nghiệp thường dùng.',
      'Làm cross chậm và nhìn trước cặp đầu tiên, thay vì làm thật nhanh rồi dừng để tìm.',
    ],
    nextTitle: 'Tiếp theo: hai tầng đầu',
    next: 'Khi bạn tính được cross trong lúc quan sát và giải trong 8 nước trở xuống, chuyển sang F2L. F2L bắt đầu bằng các góc trắng, vẫn với cách cầm cũ: trắng ở dưới.',
  },
});

/** Cross straight on the bottom, planning it, the inspection, and XCross for fast solvers. */
export default async function CrossChapter() {
  const t = TEXT[await getLocale()];

  return (
    <section>
      <ChapterHeading id="cross" />
      <P>{t.intro}</P>

      <SectionHeading id="cross-direct" />
      <div className="flex flex-wrap items-center gap-6">
        <CubePicture image={{ kind: 'iso', view: 'x2', mask: 'cross', caption: t.goalCaption }} />
        <P className="min-w-64 flex-1">{t.directIntro}</P>
      </div>
      <P>{t.crossIntro}</P>
      <FirstLayerCaseGrid cases={CROSS_EDGE_CASES} text={t.crossCases} />

      <SectionHeading id="cross-planning" />
      <Bullets items={t.crossTips} />
      <P>
        <strong>{t.drillsLabel}</strong>
      </P>
      <Bullets items={t.drills} />

      <SectionHeading id="cross-inspection" />
      <Bullets items={t.inspection} />

      <SectionHeading id="cross-xcross" />
      <Bullets items={t.xcross} />

      <Callout title={t.nextTitle}>
        <P className="mt-0">{t.next}</P>
      </Callout>
    </section>
  );
}
