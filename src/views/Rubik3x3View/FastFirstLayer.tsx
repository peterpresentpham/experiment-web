import {
  CORNER_CASES,
  CROSS_EDGE_CASES,
  LEFT_CORNER_CASES,
  TFirstLayerCase,
} from 'src/configs/rubikFirstLayer.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import { Bullets, Callout, CardGrid, CaseCard, CubePicture, H2, H3, P } from './parts';

type TCaseText = Record<string, { title: string; note: string }>;

const TEXT = defineMessages<{
  title: string;
  intro: string;
  goalCaption: string;
  crossTitle: string;
  crossIntro: string;
  crossCases: TCaseText;
  crossTipsTitle: string;
  crossTips: Array<string>;
  inspectionTitle: string;
  inspection: Array<string>;
  cornersTitle: string;
  cornersIntro: string;
  cornerCases: TCaseText;
  leftTitle: string;
  leftIntro: string;
  cornerTipsTitle: string;
  cornerTips: Array<string>;
  drillsTitle: string;
  drills: Array<string>;
  targetTitle: string;
  target: string;
}>({
  en: {
    title: 'Solving the white face fast',
    intro:
      'In LBL you build a daisy, flip the cube and repeat the sexy move up to 5 times per corner. That is often 50 to 60 moves for the white face. Here is the faster way: build the cross directly on the bottom (about 6 to 8 moves), then insert each corner with 3 to 7 moves. This also prepares you for F2L.',
    goalCaption: 'Goal: white face done, seen from below',
    crossTitle: 'Cross edges straight onto the bottom',
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
    crossTipsTitle: 'Thinking about the cross as a whole',
    crossTips: [
      'Learn the colour order. With yellow on top, going clockwise seen from above: green, red, blue, orange. So if green is in front, red is on the left and orange on the right.',
      'Edges only need to be right relative to each other. Place two edges next to each other in the right order, and one D turn at the end lines all of them up with their centres. This is the main idea that takes the cross from about 12 moves to 6 or 7.',
      'Look for 2 edges you can solve with the same move. For example F R2 D2 places two edges at once (Ruwix). These patterns come with practice; do not memorise them.',
      'Recognise each case from any side. If you can only see a case from the front, you will waste time on y rotations.',
      'Solve the hardest edge first, while the bottom is still empty and you can move freely. Leave the easy edges (white up on top, F2 or R2) for last.',
    ],
    inspectionTitle: 'Using the 15-second inspection',
    inspection: [
      'Seconds 1 to 5: find the 4 white edges.',
      'Seconds 5 to 10: plan the whole cross, move by move, in your head.',
      'Seconds 10 to 15: go through the plan once more and find where the first corner (or F2L pair) is.',
      'Every cross can be solved in at most 8 moves. If your plan is longer, look for a better one.',
      'Practise with unlimited inspection at first and shorten it later. If you cannot plan the whole cross, plan the first 2 or 3 edges, then look again.',
    ],
    cornersTitle: 'White corners with short inserts',
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
    leftTitle: 'Front-left slot: no need to turn the cube',
    leftIntro:
      'If the corner belongs in the front-left slot, use the mirrored algorithms with your left hand instead of rotating the cube. The pictures are turned so you can see the left face.',
    cornerTipsTitle: 'Tips for the corners',
    cornerTips: [
      'Pick the easiest corner first: one whose white faces sideways (3 moves) beats one whose white faces up (7 moves). Feliks Zemdegs recommends this in the CubeSkills tutorial.',
      "A corner stuck in the wrong bottom slot: bring that slot to front-right, take the corner out with R U R', then solve it like a top-layer corner.",
      'Use the right-slot algorithms with your right hand and the left-slot ones with your left hand. You only need U turns, never y.',
      'While inserting one corner, look for where the next one is. The white face should be one smooth flow, not 4 stops.',
      'These inserts are exactly the last moves of F2L. When you move to F2L, you join each corner with its middle edge before inserting them together.',
    ],
    drillsTitle: 'Practice drills',
    drills: [
      'Cross only: scramble, plan in 15 seconds, then solve the cross with your eyes closed. Open them and check. 20 times a day.',
      'Count moves: write down your cross solution and try to find a shorter one. Aim for 8 moves or fewer every time.',
      'White face sprint: solve only the white face and time it with csTimer. Track the average of 5, not your best single.',
      'Do not rush the cross. A slower cross where you already see the first corner is faster overall than a fast cross followed by a long search.',
    ],
    targetTitle: 'How fast should this be?',
    target:
      'A suggested practice goal: plan every cross in inspection and keep it to 8 moves or fewer, then get the whole white face (cross plus 4 corners) under 15 seconds. After that, most of your time is in the middle and last layers, which CFOP in the Intermediate tab speeds up.',
  },
  vi: {
    title: 'Giải mặt trắng nhanh',
    intro:
      'Trong LBL bạn làm bông hoa, lật khối và lặp sexy move đến 5 lần cho mỗi góc. Như vậy mặt trắng thường tốn 50 đến 60 nước. Đây là cách nhanh hơn: làm dấu cộng thẳng ở mặt dưới (khoảng 6 đến 8 nước), rồi đưa mỗi góc vào bằng 3 đến 7 nước. Cách này cũng chuẩn bị sẵn cho F2L.',
    goalCaption: 'Mục tiêu: xong mặt trắng, nhìn từ dưới lên',
    crossTitle: 'Đưa cạnh dấu cộng thẳng xuống đáy',
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
    crossTipsTitle: 'Nhìn cả dấu cộng, không làm từng cạnh',
    crossTips: [
      'Thuộc thứ tự màu. Vàng ở trên, nhìn từ trên xuống theo chiều kim đồng hồ: xanh lá, đỏ, xanh dương, cam. Vậy khi xanh lá ở trước thì đỏ ở trái, cam ở phải.',
      'Các cạnh chỉ cần đúng vị trí so với nhau. Đặt 2 cạnh cạnh nhau đúng thứ tự, cuối cùng 1 lần xoay D sẽ căn tất cả khớp với tâm. Đây là ý chính giúp dấu cộng giảm từ khoảng 12 nước xuống 6 hoặc 7.',
      'Tìm 2 cạnh giải được bằng cùng một nước. Ví dụ F R2 D2 đặt 2 cạnh cùng lúc (theo Ruwix). Các mẫu này tự có khi luyện nhiều, không cần học thuộc.',
      'Nhận ra mỗi ca từ mọi phía. Nếu chỉ nhận ra khi cạnh ở phía trước, bạn sẽ mất thời gian xoay cả khối (y).',
      'Giải cạnh khó nhất trước, khi đáy còn trống và bạn xoay thoải mái. Để các cạnh dễ (trắng nhìn lên ở tầng trên, chỉ cần F2 hoặc R2) làm cuối.',
    ],
    inspectionTitle: 'Dùng 15 giây quan sát',
    inspection: [
      'Giây 1 đến 5: tìm 4 cạnh trắng.',
      'Giây 5 đến 10: tính toàn bộ dấu cộng trong đầu, từng nước một.',
      'Giây 10 đến 15: đi lại kế hoạch một lần nữa và tìm xem góc đầu tiên (hoặc cặp F2L đầu tiên) ở đâu.',
      'Mọi dấu cộng đều giải được trong tối đa 8 nước. Nếu kế hoạch của bạn dài hơn, hãy tìm cách khác.',
      'Lúc đầu tập không giới hạn thời gian quan sát, sau đó rút ngắn dần. Nếu chưa tính hết được, tính trước 2 hoặc 3 cạnh rồi nhìn lại.',
    ],
    cornersTitle: 'Góc trắng bằng công thức ngắn',
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
    leftTitle: 'Khe trước-trái: không cần xoay khối',
    leftIntro:
      'Nếu góc thuộc khe trước-trái, dùng công thức đối xứng bằng tay trái thay vì xoay cả khối. Hình được xoay để bạn thấy mặt trái.',
    cornerTipsTitle: 'Mẹo cho phần góc',
    cornerTips: [
      'Chọn góc dễ nhất trước: góc có trắng nhìn sang bên (3 nước) tốt hơn góc có trắng nhìn lên (7 nước). Feliks Zemdegs khuyên điều này trong bài hướng dẫn của CubeSkills.',
      "Góc bị kẹt ở khe đáy sai: đưa khe đó về trước-phải, nhấc góc ra bằng R U R', rồi giải như góc ở tầng trên.",
      'Khe bên phải dùng tay phải, khe bên trái dùng tay trái. Chỉ cần xoay U, không bao giờ cần y.',
      'Trong lúc chèn một góc, tìm xem góc tiếp theo ở đâu. Mặt trắng nên là một dòng liền mạch, không phải 4 lần dừng.',
      'Các công thức chèn này chính là các nước cuối của F2L. Khi chuyển sang F2L, bạn ghép mỗi góc với cạnh tầng giữa của nó trước, rồi chèn cả 2 cùng lúc.',
    ],
    drillsTitle: 'Bài tập',
    drills: [
      'Chỉ làm dấu cộng: xáo khối, tính trong 15 giây, rồi nhắm mắt làm dấu cộng. Mở mắt kiểm tra. Mỗi ngày 20 lần.',
      'Đếm nước: ghi lại lời giải dấu cộng của bạn rồi thử tìm cách ngắn hơn. Mục tiêu luôn từ 8 nước trở xuống.',
      'Chạy nước rút mặt trắng: chỉ giải mặt trắng và bấm giờ bằng csTimer. Theo dõi trung bình 5 lần, không phải lần nhanh nhất.',
      'Đừng vội làm dấu cộng. Làm chậm mà đã thấy góc đầu tiên vẫn nhanh hơn làm thật nhanh rồi mất công tìm.',
    ],
    targetTitle: 'Phần này nên nhanh đến mức nào?',
    target:
      'Mục tiêu tập gợi ý: tính xong mọi dấu cộng trong lúc quan sát và giữ ở mức 8 nước trở xuống, rồi đưa cả mặt trắng (dấu cộng và 4 góc) xuống dưới 15 giây. Sau đó thời gian chủ yếu nằm ở tầng giữa và tầng cuối, là phần CFOP ở tab Trung cấp giúp nhanh hơn.',
  },
});

function CaseGrid({ cases, text }: { cases: Array<TFirstLayerCase>; text: TCaseText }) {
  return (
    <CardGrid>
      {cases.map((c) => (
        <CaseCard
          key={c.id}
          title={text[c.id].title}
          image={c.image}
          algs={c.algs}
          note={text[c.id].note}
        />
      ))}
    </CardGrid>
  );
}

/** Cross edges straight onto the bottom and short corner inserts, with planning tips. */
export default async function FastFirstLayer() {
  const t = TEXT[await getLocale()];

  return (
    <section>
      <H2 id="fast-white-face">{t.title}</H2>
      <div className="flex flex-wrap items-center gap-6">
        <CubePicture
          image={{ kind: 'iso', view: 'x2', mask: 'firstLayer', caption: t.goalCaption }}
        />
        <P className="min-w-64 flex-1">{t.intro}</P>
      </div>

      <H3>{t.crossTitle}</H3>
      <P>{t.crossIntro}</P>
      <CaseGrid cases={CROSS_EDGE_CASES} text={t.crossCases} />

      <H3>{t.crossTipsTitle}</H3>
      <Bullets items={t.crossTips} />

      <H3>{t.inspectionTitle}</H3>
      <Bullets items={t.inspection} />

      <H3>{t.cornersTitle}</H3>
      <P>{t.cornersIntro}</P>
      <CaseGrid cases={CORNER_CASES} text={t.cornerCases} />

      <H3>{t.leftTitle}</H3>
      <P>{t.leftIntro}</P>
      <CaseGrid cases={LEFT_CORNER_CASES} text={t.cornerCases} />

      <H3>{t.cornerTipsTitle}</H3>
      <Bullets items={t.cornerTips} />

      <H3>{t.drillsTitle}</H3>
      <Bullets items={t.drills} />

      <Callout title={t.targetTitle}>
        <P className="mt-0">{t.target}</P>
      </Callout>
    </section>
  );
}
