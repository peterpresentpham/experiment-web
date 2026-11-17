/* eslint-disable quotes */
import Link from 'next/link';
import { RUBIK_BASE } from 'src/configs/blog.config';
import {
  F2L_BASIC,
  OLL_CORNERS_2LOOK,
  OLL_EDGES_2LOOK,
  PLL_2LOOK,
} from 'src/configs/rubikGuide.config';
import { OLL_CASES, PLL_CASES } from 'src/configs/rubikLL.config';
import { AlgRow, Bullets, Callout, CardGrid, CaseCard, CubePicture, H2, H3, P } from './parts';

export default function IntermediateTab() {
  return (
    <div>
      <P>
        CFOP (còn gọi Fridrich) là phương pháp được đa số người thi đấu dùng. Tên gồm 4 bước:{' '}
        <strong>C</strong>ross (dấu cộng), <strong>F</strong>2L (2 tầng đầu), <strong>O</strong>LL
        (xoay tầng cuối), <strong>P</strong>LL (hoán vị tầng cuối). CFOP đầy đủ cần khoảng 55 đến 60
        nước, so với hơn 100 của LBL. Ở cấp này bạn học bản rút gọn &quot;4-look&quot;: OLL và PLL
        mỗi bước làm 2 lần, chỉ cần 17 công thức (nhiều cái đã quen từ LBL).
      </P>

      <H2 id="inter-cross">Bước 1: Cross ở mặt dưới</H2>
      <div className="flex flex-wrap items-center gap-6">
        <CubePicture
          image={{
            kind: 'iso',
            view: 'x2',
            mask: 'cross',
            caption: 'Cross trắng, nhìn từ mặt dưới',
          }}
        />
        <div className="min-w-64 flex-1">
          <Bullets
            items={[
              'Bỏ "bông hoa". Giải dấu cộng trắng trực tiếp ở mặt dưới, để không mất thời gian lật khối.',
              'Mọi cross đều giải được trong tối đa 8 nước, trung bình khoảng 6. Mục tiêu: tính toàn bộ cross trong 15 giây quan sát (inspection) trước khi bấm giờ, theo luật WCA.',
              'Cách tập: lúc đầu làm cross ở trên (nhìn được), rồi chuyển dần xuống dưới. Mỗi ngày giải 20 cross chỉ nhìn, không xoay, rồi mới làm và kiểm tra.',
              'Ưu tiên đặt các cạnh theo thứ tự tương đối với nhau (ví dụ xanh lá cạnh đỏ) rồi xoay D một lần, thay vì căn từng cạnh.',
            ]}
          />
        </div>
      </div>

      <H2 id="inter-f2l">Bước 2: F2L trực quan</H2>
      <P>
        Thay vì làm góc trắng rồi cạnh tầng giữa riêng, F2L ghép 1 góc trắng với cạnh tầng giữa
        tương ứng thành một &quot;cặp&quot; ở tầng trên, rồi chèn cả cặp vào khe cùng lúc. Có 4 khe,
        mỗi khe một cặp.
      </P>
      <Bullets
        items={[
          'Ý tưởng: tìm góc và cạnh của một cặp, đưa cả 2 lên tầng trên, ghép chúng lại mà không phá cross, rồi chèn bằng 3 hoặc 4 nước.',
          'Chèn chỉ được làm khi cặp đứng ngay trên khe của nó. Xoay U để đưa khe trống vào đúng vị trí (thường là trước-phải).',
          "Nếu góc hoặc cạnh bị kẹt trong khe sai: đưa nó ra bằng R U R' (hoặc tương tự) rồi làm lại.",
          'Đừng học 41 công thức ngay. Tự hiểu F2L trực quan trước, chỉ học công thức cho ca bạn thấy khó (ở tab Chuyên nghiệp).',
        ]}
      />
      <P>4 trường hợp chèn cơ bản (phần màu xám là chưa giải):</P>
      {F2L_BASIC.map((a) => (
        <AlgRow key={a.alg} {...a} />
      ))}
      <P>
        Đủ 41 ca F2L có ảnh ở tab Chuyên nghiệp hoặc{' '}
        <Link href={`${RUBIK_BASE}/f2l`} className="underline">
          trang F2L riêng
        </Link>
        .
      </P>

      <H2 id="inter-oll">Bước 3: 2-look OLL (10 công thức)</H2>
      <P>
        Lần nhìn 1: làm dấu cộng vàng (giống LBL nhưng nhanh hơn). Lần nhìn 2: xoay 4 góc vàng hướng
        lên. Phần xám trong hình là mặt không phải màu vàng.
      </P>
      <H3>Lần 1: dấu cộng vàng</H3>
      <CardGrid>
        {OLL_EDGES_2LOOK.map((a) => (
          <CaseCard key={a.name} title={a.name} image={a.image!} algs={[a.alg]} />
        ))}
      </CardGrid>
      <H3>Lần 2: xoay góc (OCLL)</H3>
      <P>
        Đếm số góc vàng đã hướng lên: 0 góc là H hoặc Pi, 1 góc là Sune hoặc Anti-Sune, 2 góc là 3
        ca còn lại.
      </P>
      <CardGrid>
        {OLL_CORNERS_2LOOK.map((c) => {
          const data = OLL_CASES.find((o) => o.id === c.id)!;
          return (
            <CaseCard
              key={c.id}
              title={c.name}
              subtitle={`OLL ${c.id}`}
              image={{ kind: 'top', alg: data.algs[0], mask: 'oll' }}
              algs={[data.algs[0]]}
              note={c.note}
            />
          );
        })}
      </CardGrid>

      <H2 id="inter-pll">Bước 4: 2-look PLL (7 công thức)</H2>
      <P>
        Lần 1: đặt 4 góc đúng chỗ (A hoặc Y). Lần 2: đặt 4 cạnh (U, H hoặc Z). Mũi tên cho biết mảnh
        sẽ đi đâu khi làm công thức. Sau mỗi công thức có thể cần xoay U để căn.
      </P>
      <CardGrid>
        {PLL_2LOOK.map((c) => {
          const data = PLL_CASES.find((p) => p.id === c.id)!;
          return (
            <CaseCard
              key={c.id}
              title={`${c.id}-perm`}
              image={{ kind: 'top', alg: data.algs[0], arrows: true }}
              algs={[data.algs[0]]}
              note={c.note}
            />
          );
        })}
      </CardGrid>

      <H2 id="inter-tips">Tip và trick ở cấp này</H2>
      <H3>Finger tricks cơ bản</H3>
      <Bullets
        items={[
          'Cầm khối tự nhiên, ngón cái phía trước, không bóp chặt. Đa số công thức chỉ dùng R, U, F được viết để làm bằng ngón tay, không cần đổi cách cầm.',
          "U: ngón trỏ phải búng. U': ngón trỏ trái búng. U2: búng 2 lần liên tiếp bằng ngón trỏ và ngón giữa phải (double flick).",
          "R/R': dùng cổ tay. F: ngón cái phải đẩy (hoặc đổi cầm). F': ngón trỏ phải kéo từ trên. D: ngón áp út trái kéo.",
          'Tập từng công thức chậm và mượt bằng ngón tay đúng, rồi mới tăng tốc. Làm sai ngón từ đầu sẽ rất khó sửa sau.',
        ]}
      />
      <H3>Tiết kiệm thời gian</H3>
      <Bullets
        items={[
          'Hạn chế xoay cả khối (y, x). Mỗi lần xoay mất khoảng 0,3 đến 0,5 giây và làm mất dấu mảnh đang theo.',
          'Dùng 15 giây quan sát: tìm đủ cross, và nếu được, tìm luôn cặp F2L đầu tiên.',
          'Nhận diện OLL/PLL bằng hình dạng và vị trí, không đếm từng ô. Ví dụ đèn pha (2 góc cùng màu trên một mặt) giúp nhận ra Aa ngay.',
          'Bấm giờ bằng csTimer, theo dõi trung bình 5 (ao5) và 12 (ao12) lần giải, không quan tâm lần giải may mắn.',
        ]}
      />

      <Callout title="Mục tiêu và khi nào lên Chuyên nghiệp?">
        <P className="mt-0">
          4-look CFOP với F2L trực quan đủ để xuống dưới 30 giây, nhiều người đạt dưới 25 giây. Khi
          đã đều dưới khoảng 30 giây, chuyển sang tab Chuyên nghiệp: học full PLL trước, rồi F2L tốt
          hơn và lookahead, cuối cùng là full OLL.
        </P>
      </Callout>
    </div>
  );
}
