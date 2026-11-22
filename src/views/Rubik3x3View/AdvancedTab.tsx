import { ReactNode } from 'react';
import { PLL_LEARNING_ORDER, RUBIK_GUIDE } from 'src/configs/rubikGuide.config';
import { LLCase, OLL_CASES, PLL_CASES } from 'src/configs/rubikLL.config';
import { defineMessages } from 'src/i18n/define';
import { getLocale } from 'src/i18n/server';
import F2lView from './F2lView';
import { Bullets, Callout, CardGrid, CaseCard, H2, H3, P } from './parts';

function groupBy(cases: Array<LLCase>) {
  const groups = new Map<string, Array<LLCase>>();
  for (const c of cases) groups.set(c.group, [...(groups.get(c.group) ?? []), c]);
  return [...groups.entries()];
}

const TEXT = defineMessages<{
  intro: string;
  roadmap: string;
  roadmapItems: (pllOrder: string) => Array<ReactNode>;
  pace: string;
  pll: string;
  pllIntro: ReactNode;
  probability: (value?: string) => string;
  oll: string;
  ollIntro: string;
  f2l: string;
  f2lIntro: string;
  f2lTips: Array<string>;
  lookahead: string;
  lookaheadIntro: string;
  lookaheadLevels: Array<ReactNode>;
  drills: string;
  drillList: Array<string>;
  tricks: string;
  crossStart: string;
  crossTips: Array<string>;
  lastLayer: string;
  lastLayerTips: Array<string>;
  advancedFingers: string;
  advancedFingerTips: Array<string>;
  practice: string;
  practiceTips: Array<string>;
  methods: string;
  methodList: Array<ReactNode>;
  goalsTitle: string;
  goals: Array<string>;
}>({
  en: {
    intro:
      'At this level you learn every CFOP algorithm (1-look OLL, 1-look PLL, algorithmic F2L) and, more importantly, practise lookahead and finger tricks. Below 20 seconds, the number of algorithms is no longer what matters most: smooth F2L without pauses is.',
    roadmap: 'Suggested learning order',
    roadmapItems: (pllOrder) => [
      <>
        <strong>Full PLL (21 cases)</strong>: you already know 7, so only 14 more. Every solve has a
        PLL, so learn it before OLL. Suggested order: {pllOrder}.
      </>,
      <>
        <strong>Better F2L</strong>: learn algorithms for the cases where you often pause, practise
        inserting into the back slots without rotating, and lookahead.
      </>,
      <>
        <strong>Full OLL (57 cases)</strong>: you already know 10 from 2-look. Learn by group, easy
        groups first (T, P, square, C, W...), the dot cases last.
      </>,
      <>
        <strong>After that (optional)</strong>: COLL, ZBLL, extended cross (XCross), AUF prediction.
      </>,
    ],
    pace: 'Learn about 3 to 5 algorithms a week. Only move on once you recognise a case within 1 second and execute it without stumbling. Click an algorithm to copy it; the smaller lines below are alternatives.',
    pll: 'Full PLL: 21 cases',
    pllIntro: (
      <>
        How to recognise them: look at 2 sides (front and right) at once. Look for{' '}
        <strong>headlights</strong> (2 corners of the same colour on one side),{' '}
        <strong>blocks</strong> (a corner and edge next to each other with the same colour) and{' '}
        <strong>bars</strong> (a whole 1x3 side in one colour). These three signs are enough to tell
        the 21 cases apart without looking at the back.
      </>
    ),
    probability: (value) => `Probability ${value}`,
    oll: 'Full OLL: 57 cases',
    ollIntro:
      'Pictures only colour yellow; grey is any other colour. Group codes and numbers follow the CubeSkills table (Feliks Zemdegs).',
    f2l: 'F2L: 41 cases with algorithms',
    f2lIntro:
      'Every case inserts into the front-right slot. Do not memorise blindly: understanding how each algorithm builds the pair lets you work out the other slots yourself.',
    f2lTips: [
      "Insert into the back slots without rotating: use algorithms with U, R and L moves and the matching fingers (for example R' U R for the back-right slot).",
      'Edge control: when inserting the last pair, pick the insertion that also orients the yellow edges, which avoids the hard OLL cases.',
      'Multiple options: when 2 pairs are ready, pick the one that inserts fastest without breaking the other.',
      'Prefer cases with no cube rotations and lots of R and U moves.',
    ],
    lookahead: 'Lookahead',
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
    drills: 'Drills',
    drillList: [
      'Slow solves: turn really slowly (1 to 2 moves per second) but never stop. Speed comes on its own once your eyes keep up.',
      'Metronome: one move per tick. Increase the tempo as you stop pausing.',
      "Track one piece: pick an edge, close your eyes, do R U R' in your head and guess where it goes. Open your eyes and check.",
      'Two-pair F2L: plan 2 pairs, do them without looking again, then plan the next 2.',
      'Predict OLL: while inserting the last F2L pair, try to predict the yellow edge shape (dot, L, line), then the whole OLL case.',
      'Slow down at the end of each pair to give yourself time to see the next one. F2L should be one continuous flow, not 4 separate pieces.',
    ],
    tricks: 'Tricks to cut your time',
    crossStart: 'Cross and the start',
    crossTips: [
      'XCross: during the 15-second inspection, find the cross and the first F2L pair together and solve both in one go.',
      'Colour neutrality: being able to solve the cross on 2 colours (white and yellow) or all 6 lets you pick the shortest cross. Top solvers usually do this.',
      'Do the cross slowly while looking ahead to the first pair, instead of rushing it and then pausing to search.',
    ],
    lastLayer: 'Last layer',
    lastLayerTips: [
      'AUF prediction: while doing PLL, predict which way the final U turn goes so you do not have to look again.',
      'Learn more angles: recognise each OLL/PLL case from 2 sides (front and back) so you do not need a U turn before starting.',
      'COLL (42 cases): when the yellow edges are oriented, orient and place the corners together, leaving only an easy edge PLL (U, H, Z).',
      'ZBLL (493 cases): solve the whole last layer in one algorithm when the edges are oriented. Only for the very dedicated.',
    ],
    advancedFingers: 'Advanced finger tricks',
    advancedFingerTips: [
      'Double flick U2: flick with the index finger, then the middle finger, in one motion. Learn it on both the left and the right.',
      'Pinch for F and U: use the thumb and index finger to avoid regripping.',
      'M and M2: flick the middle layer from the back with the ring or middle finger. Needed for H, Z and the M versions of Ua/Ub.',
      'Regrip as little as possible: choose algorithms that suit your hands, even if they are 1 move longer.',
      'Set up your cube: medium tension, silicone lube and medium-strength magnets. A good cube helps you avoid lockups.',
    ],
    practice: 'Practising the right way',
    practiceTips: [
      'Practise with purpose: focus each session on 1 skill (cross, F2L, OLL recognition), not just solve after solve.',
      'Keep data: use csTimer with split timing to see which step is slowest.',
      'Review your solves: record a video or use an analysis tool to see where you pause.',
      'Drill the rare cases too (dot OLLs, N-perms) so they do not trip you up.',
      'Take breaks: tired hands are when bad habits form.',
    ],
    methods: 'Other methods',
    methodList: [
      <>
        <strong>Roux</strong>: build 1x2x3 blocks on both sides, then the last-layer corners (CMLL),
        then the edges with M moves. Fewer moves, fewer algorithms and great for lookahead. But it
        uses many M moves, which are harder to finger trick.
      </>,
      <>
        <strong>ZZ</strong>: orient all edges first (EOLine/EOCross), then F2L uses only R, U and L
        with no rotations, and the OLL always has oriented edges.
      </>,
      <>
        <strong>Petrus, Mehta</strong>: block-based, used by fewer people.
      </>,
      'General advice: pick 1 method and stick with it. Switching back and forth wastes the most time. CFOP has the most learning material.',
    ],
    goalsTitle: 'Goals',
    goals: [
      'Under 20 seconds: full PLL, good F2L, the start of lookahead.',
      'Under 15 seconds: full OLL, smooth F2L, lookahead at the "tracking" level.',
      'Under 10 seconds: lookahead at the "knowing" level, good finger tricks, usually an XCross. This is the level of strong competitors.',
      'The single-solve world record is currently around 3 to 4 seconds (see the latest results at worldcubeassociation.org).',
    ],
  },
  vi: {
    intro:
      'Ở cấp này bạn học đủ công thức của CFOP (1-look OLL, 1-look PLL, F2L công thức) và, quan trọng hơn, luyện lookahead và finger tricks. Từ dưới 20 giây trở xuống, số công thức không còn là yếu tố chính: F2L mượt, không dừng mới là điều quyết định.',
    roadmap: 'Thứ tự học đề xuất',
    roadmapItems: (pllOrder) => [
      <>
        <strong>Full PLL (21 ca)</strong>: bạn đã có 7, chỉ thêm 14. Mỗi lần giải đều có PLL, nên
        học trước OLL. Thứ tự gợi ý: {pllOrder}.
      </>,
      <>
        <strong>F2L tốt hơn</strong>: học công thức cho các ca bạn hay dừng, tập chèn vào khe sau mà
        không xoay khối, và lookahead.
      </>,
      <>
        <strong>Full OLL (57 ca)</strong>: bạn đã có 10 từ 2-look. Học theo nhóm, nhóm dễ trước (chữ
        T, P, vuông, C, W...), nhóm chấm học cuối.
      </>,
      <>
        <strong>Sau đó (tuỳ chọn)</strong>: COLL, ZBLL, cross-chéo (XCross), dự đoán AUF.
      </>,
    ],
    pace: 'Mỗi tuần học khoảng 3 đến 5 công thức. Chỉ học tiếp khi đã nhận ra ca trong vòng 1 giây và làm không vấp. Bấm vào công thức để sao chép; dòng nhỏ bên dưới là công thức thay thế.',
    pll: 'Full PLL: 21 ca',
    pllIntro: (
      <>
        Cách nhận diện: nhìn 2 mặt bên (trước và phải) cùng lúc. Tìm <strong>đèn pha</strong> (2 góc
        cùng màu trên một mặt), <strong>khối</strong> (góc và cạnh cạnh nhau cùng màu) và{' '}
        <strong>thanh</strong> (cả mặt 1x3 cùng màu). Ba dấu hiệu này đủ để phân biệt 21 ca mà không
        cần nhìn mặt sau.
      </>
    ),
    probability: (value) => `Xác suất ${value}`,
    oll: 'Full OLL: 57 ca',
    ollIntro:
      'Hình chỉ tô màu vàng; xám là màu khác. Mã nhóm và số thứ tự theo bảng của CubeSkills (Feliks Zemdegs).',
    f2l: 'F2L: 41 ca có công thức',
    f2lIntro:
      'Mỗi ca chèn vào khe trước-phải. Đừng học thuộc máy móc: hiểu cách mỗi công thức ghép cặp sẽ giúp bạn tự suy ra cho khe khác.',
    f2lTips: [
      "Chèn vào khe sau mà không xoay khối: dùng các công thức với nước U, R, L, cùng với ngón tay tương ứng (ví dụ R' U R cho khe sau-phải).",
      'Edge control: khi chèn cặp cuối, chọn cách chèn giúp cạnh vàng được định hướng sẵn, giảm số ca OLL khó.',
      'Khe nhiều lựa chọn: khi có 2 cặp sẵn, chọn cặp chèn nhanh nhất và không phá cặp kia.',
      'Ưu tiên ca không có xoay khối và có nhiều nước R, U.',
    ],
    lookahead: 'Lookahead (nhìn trước)',
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
    drills: 'Bài tập',
    drillList: [
      'Giải chậm: xoay chậm hẳn (1 đến 2 nước/giây) nhưng không bao giờ dừng. Tốc độ sẽ tự tăng khi mắt theo kịp.',
      'Metronome: mỗi tiếng tích là 1 nước. Tăng tốc độ dần khi không còn bị dừng.',
      "Theo dõi một mảnh: chọn 1 cạnh, nhắm mắt làm R U R' trong đầu và đoán nó đi đâu. Mở mắt kiểm tra.",
      'F2L 2 lần nhìn: lên kế hoạch 2 cặp, làm không nhìn lại, rồi mới nhìn tiếp 2 cặp sau.',
      'Đoán OLL: khi chèn cặp F2L cuối, cố đoán hình cạnh vàng (chấm, L, thẳng), sau đó đoán cả ca OLL.',
      'Làm chậm lại ở cuối mỗi cặp để có thời gian nhìn cặp sau. F2L nên là một dòng chảy liên tục, không phải 4 đoạn rời.',
    ],
    tricks: 'Trick để giảm thời gian',
    crossStart: 'Cross và bắt đầu',
    crossTips: [
      'XCross: trong 15 giây quan sát, tìm cross và cặp F2L đầu tiên cùng lúc, giải cả 2 trong một lần.',
      'Cross không màu cố định (color neutral): giải được cross ở 2 màu (trắng và vàng) hoặc cả 6 màu giúp chọn cross ngắn nhất. Dân chuyên nghiệp thường dùng.',
      'Làm cross chậm và nhìn trước cặp đầu tiên, thay vì làm thật nhanh rồi dừng để tìm.',
    ],
    lastLayer: 'Tầng cuối',
    lastLayerTips: [
      'Dự đoán AUF: trong lúc làm PLL, đoán trước nên xoay U về phía nào ở cuối để khỏi phải nhìn lại.',
      'Học thêm góc nhìn: mỗi ca OLL/PLL nên nhận ra từ 2 phía (trước và sau) để khỏi xoay U trước khi làm.',
      'COLL (42 ca): khi cạnh vàng đã đúng, xoay và đặt góc cùng lúc, chỉ còn PLL cạnh (U, H, Z) dễ.',
      'ZBLL (493 ca): giải cả tầng cuối bằng 1 công thức khi cạnh đã đúng. Chỉ cho người rất nghiêm túc.',
    ],
    advancedFingers: 'Finger tricks nâng cao',
    advancedFingerTips: [
      'Double flick U2: búng ngón trỏ rồi ngón giữa liên tiếp. Làm được cả bên trái và phải.',
      'Pinch (kẹp) cho F và U: dùng ngón cái và ngón trỏ, tránh đổi cầm khối.',
      'M và M2: búng ngón áp út hoặc ngón giữa vào lớp giữa từ phía sau. Cần cho H, Z, Ua/Ub dạng M.',
      'Regrip ít nhất có thể: chọn công thức phù hợp tay, kể cả khi dài hơn 1 nước.',
      'Điều chỉnh khối: độ căng vừa, dầu bôi trơn (silicone), nam châm vừa lực. Khối tốt giúp tránh vấp (lockup).',
    ],
    practice: 'Luyện tập đúng cách',
    practiceTips: [
      'Luyện có mục đích: mỗi buổi tập trung 1 kỹ năng (cross, F2L, nhận diện OLL), không chỉ giải liên tục.',
      'Ghi lại số liệu: dùng csTimer với chế độ chia giai đoạn để biết bước nào chậm nhất.',
      'Xem lại lần giải: quay video hoặc dùng công cụ phân tích để thấy chỗ dừng.',
      'Tập cả ca hiếm (OLL chấm, N-perm) để không bị vấp khi gặp.',
      'Tập nghỉ: mỏi tay là lúc dễ học thói quen xấu.',
    ],
    methods: 'Các phương pháp khác',
    methodList: [
      <>
        <strong>Roux</strong>: ghép khối 1x2x3 hai bên, rồi góc tầng cuối (CMLL), rồi cạnh bằng lớp
        M. Ít nước hơn, ít công thức, rất hợp lookahead. Nhưng dùng nhiều M, khó finger trick hơn.
      </>,
      <>
        <strong>ZZ</strong>: định hướng tất cả cạnh trước (EOLine/EOCross), sau đó F2L chỉ dùng R,
        U, L, không xoay khối, và OLL luôn có cạnh đúng.
      </>,
      <>
        <strong>Petrus, Mehta</strong>: dựa trên khối, ít người dùng hơn.
      </>,
      'Lời khuyên chung: chọn 1 phương pháp và đi đến cùng. Đổi qua đổi lại là cách phí thời gian nhất. CFOP có nhiều tài liệu nhất.',
    ],
    goalsTitle: 'Mục tiêu',
    goals: [
      'Dưới 20 giây: full PLL, F2L tốt, bắt đầu có lookahead.',
      'Dưới 15 giây: full OLL, F2L mượt, lookahead mức "theo dõi".',
      'Dưới 10 giây: lookahead mức "biết trước", finger tricks tốt, cross thường là XCross. Đây là mức của người thi đấu giỏi.',
      'Kỷ lục thế giới 1 lần giải hiện quanh 3 đến 4 giây (xem bảng mới nhất tại worldcubeassociation.org).',
    ],
  },
});

export default async function AdvancedTab() {
  const locale = await getLocale();
  const t = TEXT[locale];
  const { ollGroupLabels, pllGroupLabels } = RUBIK_GUIDE[locale];

  return (
    <div>
      <P>{t.intro}</P>

      <H2 id="adv-roadmap">{t.roadmap}</H2>
      <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">
        {t.roadmapItems(PLL_LEARNING_ORDER.join(', ')).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
      <P>{t.pace}</P>

      <H2 id="adv-pll">{t.pll}</H2>
      <P>{t.pllIntro}</P>
      {groupBy(PLL_CASES).map(([group, cases]) => (
        <section key={group}>
          <H3>{pllGroupLabels[group]}</H3>
          <CardGrid>
            {cases.map((c) => (
              <CaseCard
                key={c.id}
                title={`${c.id}-perm`}
                subtitle={t.probability(c.probability)}
                image={{ kind: 'top', alg: c.algs[0], arrows: true }}
                algs={c.algs}
              />
            ))}
          </CardGrid>
        </section>
      ))}

      <H2 id="adv-oll">{t.oll}</H2>
      <P>{t.ollIntro}</P>
      {groupBy(OLL_CASES).map(([group, cases]) => (
        <section key={group}>
          <H3>{ollGroupLabels[group]}</H3>
          <CardGrid>
            {cases.map((c) => (
              <CaseCard
                key={c.id}
                title={`OLL ${c.id}`}
                subtitle={`${c.code} · ${c.probability}`}
                image={{ kind: 'top', alg: c.algs[0], mask: 'oll' }}
                algs={c.algs}
              />
            ))}
          </CardGrid>
        </section>
      ))}

      <H2 id="adv-f2l">{t.f2l}</H2>
      <P>{t.f2lIntro}</P>
      <Bullets items={t.f2lTips} />
      <F2lView />

      <H2 id="adv-lookahead">{t.lookahead}</H2>
      <P>{t.lookaheadIntro}</P>
      <Bullets items={t.lookaheadLevels} />
      <H3>{t.drills}</H3>
      <Bullets items={t.drillList} />

      <H2 id="adv-tricks">{t.tricks}</H2>
      <H3>{t.crossStart}</H3>
      <Bullets items={t.crossTips} />
      <H3>{t.lastLayer}</H3>
      <Bullets items={t.lastLayerTips} />
      <H3>{t.advancedFingers}</H3>
      <Bullets items={t.advancedFingerTips} />

      <H2 id="adv-practice">{t.practice}</H2>
      <Bullets items={t.practiceTips} />

      <H2 id="adv-methods">{t.methods}</H2>
      <Bullets items={t.methodList} />

      <Callout title={t.goalsTitle}>
        <Bullets items={t.goals} />
      </Callout>
    </div>
  );
}
