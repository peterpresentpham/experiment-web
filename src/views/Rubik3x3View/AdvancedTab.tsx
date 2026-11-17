/* eslint-disable quotes */
import {
  OLL_GROUP_LABELS,
  PLL_GROUP_LABELS,
  PLL_LEARNING_ORDER,
} from 'src/configs/rubikGuide.config';
import { LLCase, OLL_CASES, PLL_CASES } from 'src/configs/rubikLL.config';
import F2lView from './F2lView';
import { Bullets, Callout, CardGrid, CaseCard, H2, H3, P } from './parts';

function groupBy(cases: Array<LLCase>) {
  const groups = new Map<string, Array<LLCase>>();
  for (const c of cases) groups.set(c.group, [...(groups.get(c.group) ?? []), c]);
  return [...groups.entries()];
}

export default function AdvancedTab() {
  return (
    <div>
      <P>
        Ở cấp này bạn học đủ công thức của CFOP (1-look OLL, 1-look PLL, F2L công thức) và, quan
        trọng hơn, luyện lookahead và finger tricks. Từ dưới 20 giây trở xuống, số công thức không
        còn là yếu tố chính: F2L mượt, không dừng mới là điều quyết định.
      </P>

      <H2 id="adv-roadmap">Thứ tự học đề xuất</H2>
      <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">
        <li>
          <strong>Full PLL (21 ca)</strong>: bạn đã có 7, chỉ thêm 14. Mỗi lần giải đều có PLL, nên
          học trước OLL. Thứ tự gợi ý: {PLL_LEARNING_ORDER.join(', ')}.
        </li>
        <li>
          <strong>F2L tốt hơn</strong>: học công thức cho các ca bạn hay dừng, tập chèn vào khe sau
          mà không xoay khối, và lookahead.
        </li>
        <li>
          <strong>Full OLL (57 ca)</strong>: bạn đã có 10 từ 2-look. Học theo nhóm, nhóm dễ trước
          (chữ T, P, vuông, C, W...), nhóm chấm học cuối.
        </li>
        <li>
          <strong>Sau đó (tuỳ chọn)</strong>: COLL, ZBLL, cross-chéo (XCross), dự đoán AUF.
        </li>
      </ol>
      <P>
        Mỗi tuần học khoảng 3 đến 5 công thức. Chỉ học tiếp khi đã nhận ra ca trong vòng 1 giây và
        làm không vấp. Bấm vào công thức để sao chép; dòng nhỏ bên dưới là công thức thay thế.
      </P>

      <H2 id="adv-pll">Full PLL: 21 ca</H2>
      <P>
        Cách nhận diện: nhìn 2 mặt bên (trước và phải) cùng lúc. Tìm <strong>đèn pha</strong> (2 góc
        cùng màu trên một mặt), <strong>khối</strong> (góc và cạnh cạnh nhau cùng màu) và{' '}
        <strong>thanh</strong> (cả mặt 1x3 cùng màu). Ba dấu hiệu này đủ để phân biệt 21 ca mà không
        cần nhìn mặt sau.
      </P>
      {groupBy(PLL_CASES).map(([group, cases]) => (
        <section key={group}>
          <H3>{PLL_GROUP_LABELS[group]}</H3>
          <CardGrid>
            {cases.map((c) => (
              <CaseCard
                key={c.id}
                title={`${c.id}-perm`}
                subtitle={`Xác suất ${c.probability}`}
                image={{ kind: 'top', alg: c.algs[0], arrows: true }}
                algs={c.algs}
              />
            ))}
          </CardGrid>
        </section>
      ))}

      <H2 id="adv-oll">Full OLL: 57 ca</H2>
      <P>
        Hình chỉ tô màu vàng; xám là màu khác. Mã nhóm và số thứ tự theo bảng của CubeSkills (Feliks
        Zemdegs).
      </P>
      {groupBy(OLL_CASES).map(([group, cases]) => (
        <section key={group}>
          <H3>{OLL_GROUP_LABELS[group]}</H3>
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

      <H2 id="adv-f2l">F2L: 41 ca có công thức</H2>
      <P>
        Mỗi ca chèn vào khe trước-phải. Đừng học thuộc máy móc: hiểu cách mỗi công thức ghép cặp sẽ
        giúp bạn tự suy ra cho khe khác.
      </P>
      <Bullets
        items={[
          "Chèn vào khe sau mà không xoay khối: dùng các công thức với nước U, R, L, cùng với ngón tay tương ứng (ví dụ R' U R cho khe sau-phải).",
          'Edge control: khi chèn cặp cuối, chọn cách chèn giúp cạnh vàng được định hướng sẵn, giảm số ca OLL khó.',
          'Khe nhiều lựa chọn: khi có 2 cặp sẵn, chọn cặp chèn nhanh nhất và không phá cặp kia.',
          'Ưu tiên ca không có xoay khối và có nhiều nước R, U.',
        ]}
      />
      <F2lView />

      <H2 id="adv-lookahead">Lookahead (nhìn trước)</H2>
      <P>
        Lookahead là khả năng lên kế hoạch bước sau trong lúc tay vẫn đang làm bước hiện tại. Đây là
        kỹ năng khó nhất và tạo khác biệt lớn nhất giữa người 20 giây và người 10 giây. CubeSkills
        chia làm 3 mức:
      </P>
      <Bullets
        items={[
          <>
            <strong>Tìm kiếm</strong>: làm xong cặp này mới tìm cặp tiếp. Có khoảng dừng giữa các
            cặp.
          </>,
          <>
            <strong>Theo dõi</strong>: trong lúc làm cặp này, mắt đã theo dõi các mảnh của cặp tiếp
            theo.
          </>,
          <>
            <strong>Biết trước</strong>: đoán được mảnh của cặp sau sẽ nằm đâu sau khi làm xong cặp
            hiện tại, nên không cần dừng.
          </>,
        ]}
      />
      <H3>Bài tập</H3>
      <Bullets
        items={[
          'Giải chậm: xoay chậm hẳn (1 đến 2 nước/giây) nhưng không bao giờ dừng. Tốc độ sẽ tự tăng khi mắt theo kịp.',
          'Metronome: mỗi tiếng tích là 1 nước. Tăng tốc độ dần khi không còn bị dừng.',
          "Theo dõi một mảnh: chọn 1 cạnh, nhắm mắt làm R U R' trong đầu và đoán nó đi đâu. Mở mắt kiểm tra.",
          'F2L 2 lần nhìn: lên kế hoạch 2 cặp, làm không nhìn lại, rồi mới nhìn tiếp 2 cặp sau.',
          'Đoán OLL: khi chèn cặp F2L cuối, cố đoán hình cạnh vàng (chấm, L, thẳng), sau đó đoán cả ca OLL.',
          'Làm chậm lại ở cuối mỗi cặp để có thời gian nhìn cặp sau. F2L nên là một dòng chảy liên tục, không phải 4 đoạn rời.',
        ]}
      />

      <H2 id="adv-tricks">Trick để giảm thời gian</H2>
      <H3>Cross và bắt đầu</H3>
      <Bullets
        items={[
          'XCross: trong 15 giây quan sát, tìm cross và cặp F2L đầu tiên cùng lúc, giải cả 2 trong một lần.',
          'Cross không màu cố định (color neutral): giải được cross ở 2 màu (trắng và vàng) hoặc cả 6 màu giúp chọn cross ngắn nhất. Dân chuyên nghiệp thường dùng.',
          'Làm cross chậm và nhìn trước cặp đầu tiên, thay vì làm thật nhanh rồi dừng để tìm.',
        ]}
      />
      <H3>Tầng cuối</H3>
      <Bullets
        items={[
          'Dự đoán AUF: trong lúc làm PLL, đoán trước nên xoay U về phía nào ở cuối để khỏi phải nhìn lại.',
          'Học thêm góc nhìn: mỗi ca OLL/PLL nên nhận ra từ 2 phía (trước và sau) để khỏi xoay U trước khi làm.',
          'COLL (42 ca): khi cạnh vàng đã đúng, xoay và đặt góc cùng lúc, chỉ còn PLL cạnh (U, H, Z) dễ.',
          'ZBLL (493 ca): giải cả tầng cuối bằng 1 công thức khi cạnh đã đúng. Chỉ cho người rất nghiêm túc.',
        ]}
      />
      <H3>Finger tricks nâng cao</H3>
      <Bullets
        items={[
          'Double flick U2: búng ngón trỏ rồi ngón giữa liên tiếp. Làm được cả bên trái và phải.',
          'Pinch (kẹp) cho F và U: dùng ngón cái và ngón trỏ, tránh đổi cầm khối.',
          'M và M2: búng ngón áp út hoặc ngón giữa vào lớp giữa từ phía sau. Cần cho H, Z, Ua/Ub dạng M.',
          'Regrip ít nhất có thể: chọn công thức phù hợp tay, kể cả khi dài hơn 1 nước.',
          'Điều chỉnh khối: độ căng vừa, dầu bôi trơn (silicone), nam châm vừa lực. Khối tốt giúp tránh vấp (lockup).',
        ]}
      />

      <H2 id="adv-practice">Luyện tập đúng cách</H2>
      <Bullets
        items={[
          'Luyện có mục đích: mỗi buổi tập trung 1 kỹ năng (cross, F2L, nhận diện OLL), không chỉ giải liên tục.',
          'Ghi lại số liệu: dùng csTimer với chế độ chia giai đoạn để biết bước nào chậm nhất.',
          'Xem lại lần giải: quay video hoặc dùng công cụ phân tích để thấy chỗ dừng.',
          'Tập cả ca hiếm (OLL chấm, N-perm) để không bị vấp khi gặp.',
          'Tập nghỉ: mỏi tay là lúc dễ học thói quen xấu.',
        ]}
      />

      <H2 id="adv-methods">Các phương pháp khác</H2>
      <Bullets
        items={[
          <>
            <strong>Roux</strong>: ghép khối 1x2x3 hai bên, rồi góc tầng cuối (CMLL), rồi cạnh bằng
            lớp M. Ít nước hơn, ít công thức, rất hợp lookahead. Nhưng dùng nhiều M, khó finger
            trick hơn.
          </>,
          <>
            <strong>ZZ</strong>: định hướng tất cả cạnh trước (EOLine/EOCross), sau đó F2L chỉ dùng
            R, U, L, không xoay khối, và OLL luôn có cạnh đúng.
          </>,
          <>
            <strong>Petrus, Mehta</strong>: dựa trên khối, ít người dùng hơn.
          </>,
          'Lời khuyên chung: chọn 1 phương pháp và đi đến cùng. Đổi qua đổi lại là cách phí thời gian nhất. CFOP có nhiều tài liệu nhất.',
        ]}
      />

      <Callout title="Mục tiêu">
        <Bullets
          items={[
            'Dưới 20 giây: full PLL, F2L tốt, bắt đầu có lookahead.',
            'Dưới 15 giây: full OLL, F2L mượt, lookahead mức "theo dõi".',
            'Dưới 10 giây: lookahead mức "biết trước", finger tricks tốt, cross thường là XCross. Đây là mức của người thi đấu giỏi.',
            'Kỷ lục thế giới 1 lần giải hiện quanh 3 đến 4 giây (xem bảng mới nhất tại worldcubeassociation.org).',
          ]}
        />
      </Callout>
    </div>
  );
}
