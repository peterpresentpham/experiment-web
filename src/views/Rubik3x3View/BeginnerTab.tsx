/* eslint-disable quotes */
import {
  BEGINNER_STEPS,
  COLOR_SCHEME,
  NOTATION,
  NOTATION_IMAGES,
} from 'src/configs/rubikGuide.config';
import { AlgRow, Bullets, Callout, CubePicture, H2, H3, P } from './parts';

export default function BeginnerTab() {
  return (
    <div>
      <P>
        Phương pháp từng tầng (Layer By Layer, LBL) là cách phổ biến nhất để giải khối lần đầu: giải
        tầng dưới, rồi tầng giữa, rồi tầng trên. Bạn chỉ cần nhớ khoảng 7 công thức ngắn. Lần đầu
        thường mất vài chục phút; sau 1 đến 2 tuần luyện, đa số người xuống dưới 2 phút.
      </P>

      <H2 id="beginner-basics">Kiến thức nền</H2>
      <H3>Cấu tạo khối</H3>
      <div className="flex flex-wrap items-center gap-6">
        <CubePicture image={{ kind: 'iso', mask: 'centers', caption: 'Chỉ tô màu 6 tâm' }} />
        <div className="min-w-64 flex-1">
          <Bullets
            items={[
              <>
                <strong>6 tâm</strong>: không bao giờ đổi chỗ với nhau. Tâm quyết định màu của mặt
                đó, nên mặt có tâm đỏ là mặt đỏ.
              </>,
              <>
                <strong>12 cạnh</strong>: mảnh có 2 màu.
              </>,
              <>
                <strong>8 góc</strong>: mảnh có 3 màu.
              </>,
              'Khi giải, bạn không di chuyển các ô màu riêng lẻ mà di chuyển cả mảnh (cạnh hoặc góc) về đúng chỗ.',
            ]}
          />
        </div>
      </div>
      <P>Bộ màu chuẩn (các mặt đối diện):</P>
      <ul className="mt-2 flex flex-wrap gap-3 text-sm">
        {COLOR_SCHEME.map((c) => (
          <li key={c.color} className="rounded-md border px-3 py-1">
            {c.color} ↔ {c.opposite}
          </li>
        ))}
      </ul>

      <H3>Ký hiệu nước đi</H3>
      <P>
        Mọi công thức viết bằng ký hiệu. Chữ cái cho biết mặt nào cần xoay; nhìn thẳng vào mặt đó,
        xoay theo chiều kim đồng hồ.
      </P>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border text-left text-sm">
          <tbody>
            {NOTATION.map((n) => (
              <tr key={n.move} className="border-b">
                <td className="w-40 p-2 font-mono font-bold">{n.move}</td>
                <td className="p-2">{n.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>Mỗi hình dưới là khối đã giải sau đúng 1 nước. Tự làm theo trên khối thật để so sánh:</P>
      <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {NOTATION_IMAGES.map((m) => (
          <div key={m} className="flex flex-col items-center">
            <CubePicture image={{ kind: 'iso', setup: m }} size={84} />
            <p className="font-mono text-lg font-bold">{m}</p>
          </div>
        ))}
      </div>

      <H3>Cách cầm và tập ngón tay</H3>
      <Bullets
        items={[
          'Cầm khối bằng 2 tay, ngón cái ở mặt trước, các ngón còn lại ở mặt sau. Mặt trước hướng vào bạn.',
          "Tập lặp lại R U R' U' (sexy move) 6 lần liên tục: khối sẽ quay về như cũ. Đây là bài kiểm tra đầu tiên để biết bạn xoay đúng ký hiệu chưa.",
          "R: đẩy cổ tay phải lên. R': kéo cổ tay xuống. U: búng ngón trỏ phải từ phải sang trái. U': búng ngón trỏ trái từ trái sang phải.",
          'Chưa cần nhanh. Mục tiêu tuần đầu là làm đúng, không phải nhìn lại ký hiệu.',
        ]}
      />

      <H2 id="beginner-steps">7 bước giải</H2>
      {BEGINNER_STEPS.map((step) => (
        <section key={step.title}>
          <H3>{step.title}</H3>
          <P>
            <strong>Mục tiêu:</strong> {step.goal}
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

      <H2 id="beginner-tips">Mẹo và lỗi hay gặp</H2>
      <Bullets
        items={[
          'Luôn kiểm tra màu tâm trước khi đặt mảnh. Cạnh trắng-đỏ phải nằm giữa tâm trắng và tâm đỏ, không phải chỗ khác.',
          'Làm sai một nước giữa công thức là nguyên nhân số 1 khiến khối "rối hơn". Nếu bị, đừng cố sửa: quay lại tầng cuối cùng còn đúng và làm lại bước đó.',
          'Bước 7 cần giữ nguyên cách cầm. Lỗi phổ biến nhất là xoay cả khối giữa chừng, làm hỏng 2 tầng dưới.',
          'Đọc to công thức khi làm ("R, U, R phẩy, U phẩy") giúp nhớ nhanh hơn.',
          "Hiểu công thức làm gì (ví dụ R U R' U' đưa góc lên rồi xuống) quan trọng hơn thuộc lòng. Bạn sẽ tự sửa lỗi được.",
          'Đã giải được 5 lần liên tiếp không nhìn hướng dẫn? Bắt đầu bấm giờ bằng csTimer (cstimer.net).',
        ]}
      />

      <Callout title="Khi nào lên Trung cấp?">
        <P className="mt-0">
          Khi bạn giải được không cần nhìn hướng dẫn, đều đặn dưới khoảng 1 đến 2 phút. Lúc này LBL
          không giúp nhanh thêm nhiều nữa vì nó dùng quá nhiều nước (khoảng 100 đến 120). Chuyển
          sang tab Trung cấp để học CFOP.
        </P>
      </Callout>
    </div>
  );
}
