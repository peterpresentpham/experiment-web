# Kế hoạch tăng sức mạnh cấp Địa ngục (Tengen)

Cập nhật: 2026-11-20. Mọi thay đổi về engine phải thắng SPRT (`tengen-arena`, luật
`freestyle-caro`) trước khi lên web.

## Mục tiêu

Máy phải thắng được dù **đi trước hay đi sau**. Người chơi hiện luôn đi trước, nên trọng tâm là
**phòng thủ khi đi sau**: chặn đúng, không để lọt chuỗi thắng ép buộc, và phản công khi người chơi
sơ hở.

Lưu ý: với luật gomoku tự do, bên đi trước được chứng minh là thắng nếu chơi hoàn hảo; luật chặn
hai đầu nhiều khả năng cũng vậy. Bên đi sau không thể "luôn thắng" trước một người chơi hoàn hảo,
nên mục tiêu thực tế là khiến việc tìm ra đường thắng khó tới mức gần như không ai làm được.

## Hiện trạng

- Cấp Địa ngục chạy Tengen (GPL-3.0) bằng WebAssembly trong worker: 1 luồng (Safari, iPhone) đến
  4 luồng (Chrome, Firefox), khoảng 1,5–4 giây mỗi nước tuỳ máy.
- Luật chặn hai đầu (Piskvork rule 8) dùng trọng số đã tinh chỉnh
  `weights-freestyle-caro.txt`: +10,8 ± 8,8 Elo so với bản gốc (3.100 ván). Luật không chặn dùng
  bản gốc.
- Search: PVS + Lazy SMP; quiescence chỉ xét nước bốn (VCF), **chưa có VCT**. Tham số search
  (`tuning/spsa.txt`) được tinh chỉnh cho freestyle, **chưa tinh chỉnh cho luật chặn hai đầu**.
- Build WASM **chưa bật SIMD** (`+simd128`); worker không đặt kích thước bảng băm (`tg_set_hash`).
- Sách khai cuộc: 743 thế cờ (3 nước đầu của máy, Tengen 10 giây × 2 luồng), dùng chung cho
  15×15 và 20×20.
- Sổ kinh nghiệm (`src/services/caro-machine/experience.ts`) học từ ván thua, nhưng **riêng
  từng trình duyệt** (localStorage), không chia sẻ giữa người chơi.

## Bài học đã rút ra

- **Tinh chỉnh trọng số không ràng buộc làm engine yếu đi** (−40 Elo): 85% ván tự đánh có thắng
  ép buộc nên dữ liệu lệch. Chỉ refine nhẹ (`fit-local --l2 1e-4`) mới có lợi.
- **Lợi thế đi trước rất lớn**: Tengen 1 giây/nước tự đánh, bên đi trước thắng **80/80 ván**.
  Vì vậy đo bằng các ván từ bàn gần trống không phân biệt được hai bản engine: phải đo từ bộ
  khai cuộc cân bằng, và đo riêng khả năng phòng thủ khi đi sau.
- **Sách khai cuộc không giúp được gì đo được**: trận đo 80 ván ra đúng 50% vì bên đi trước luôn
  thắng; đo phòng thủ (bên dưới) cũng không khác bản không sách. Giữ trên web vì không có hại và
  máy đi ngay các nước đầu; không đầu tư thêm.
- **Mốc phòng thủ (bước 1, 2026-11-20)**: máy đi sau, 1 giây/nước, 1 luồng; đối thủ Tengen 4
  giây/nước, 2 nước đầu ngẫu nhiên gần quân; 40 ván mỗi dòng.

  | Bàn   | Bên phòng thủ | T–H–B  | Không thua (95%) | Số nước trụ được khi thua |
  | ----- | ------------- | ------ | ---------------- | ------------------------- |
  | 15×15 | Tengen        | 0–3–37 | 8% (3–20%)       | 44,2                      |
  | 15×15 | Tengen + sách | 1–1–38 | 5% (1–17%)       | 41,7                      |
  | 20×20 | Tengen        | 1–0–39 | 3% (0–13%)       | 39,5                      |
  | 20×20 | Tengen + sách | 3–0–37 | 8% (3–20%)       | 37,6                      |

  Tỉ lệ không thua quá thấp nên phép đo này chỉ thấy được cải tiến lớn (như VCT); cải tiến nhỏ
  đo bằng SPRT từ khai cuộc cân bằng (`scripts/caro-hell/tengen-sprt.sh`).

- **Tăng tốc khi build không có tác dụng (bước 2)**: bật SIMD (`+simd128`) và `wasm-opt -O3/-O4`
  đều cho cùng tốc độ (khoảng 1,04 triệu node/giây, cùng số node; đo bằng
  `scripts/caro-hell/wasm-bench.ts`). WASM đã đạt khoảng 80% tốc độ native. Bảng băm mặc định 64 MB
  là đủ với số node mỗi nước hiện tại.
- **Thời gian nghĩ là đòn bẩy lớn (bước 2)**: Tengen đấu với chính nó từ khai cuộc cân bằng 15×15,
  200 ván mỗi trận: 1 giây so với 0,5 giây **+69 ± 52 Elo**; 2 giây so với 1 giây **+89 ± 52 Elo**.
  Mỗi lần gấp đôi thời gian được khoảng +70–90 Elo, chưa thấy giảm dần ở mức 2 giây.

---

## Thứ tự ưu tiên

| #   | Việc                                                          | Loại      | Công sức               | Kỳ vọng                            |
| --- | ------------------------------------------------------------- | --------- | ---------------------- | ---------------------------------- |
| 1   | Bộ đo chuẩn, gồm đo phòng thủ khi đi sau                      | Hạ tầng   | Nhỏ                    | Điều kiện để đo mọi bước sau       |
| 2   | Tăng tốc WASM: SIMD, bảng băm, số luồng, thời gian            | Tốc độ    | Nhỏ                    | +10–40% node mỗi giây              |
| 3   | SPSA tham số search cho luật chặn hai đầu                     | Search    | Vừa (máy chạy vài giờ) | +10–30 Elo                         |
| 4   | Tinh chỉnh trọng số nhiều vòng + các bảng khác                | Đánh giá  | Vừa                    | +5–15 Elo mỗi vòng                 |
| 5   | VCT (thắng và phòng thủ chuỗi ba + bốn)                       | Search    | Lớn (vài ngày)         | Vừa đến lớn, nhất là khi phòng thủ |
| 6   | NNUE (mạng nơ-ron nhỏ)                                        | Đánh giá  | Rất lớn (vài tuần)     | Lớn nhất về lâu dài                |
| 7   | Chống học thuộc: chọn ngẫu nhiên nước gần bằng nhau, sổ chung | Với người | Vừa đến lớn            | Chặn việc lặp lại một đường thắng  |

Con số kỳ vọng chỉ là ước tính; mỗi bước được giữ lại chỉ khi SPRT xác nhận.

---

## 1. Bộ đo chuẩn

- **Khai cuộc cân bằng** cho luật chặn hai đầu: `tengen-tune openings --rule freestyle-caro
--brain "pbrain-tengen" --ms 2000 --count 400` (không có Rapfi cho luật này, nên dùng chính
  Tengen nghĩ lâu làm trọng tài). Mọi SPRT dùng `--openings` với bộ đó.
- **Đo phòng thủ khi đi sau**: bản cần đo luôn đi sau, đối thủ cố định đi trước với nhiều thời gian
  hơn (ví dụ gấp 3–5 lần). So tỉ lệ không thua và số nước trụ được. Đây là chỉ số gần nhất với
  tình huống thật (người chơi đi trước).
- Đo cả bàn 15×15 và 20×20 (mặc định của app là 20×20).
- Ghi kết quả từng lần đo vào mục "Bài học" của file này.

## 2. Tăng tốc WebAssembly và thời gian nghĩ (đã đo, chưa áp dụng)

- Đã làm: SIMD và `wasm-opt` không nhanh hơn; bảng băm 64 MB giữ nguyên (xem "Bài học").
- Thời gian nghĩ: mỗi lần gấp đôi được khoảng +70–90 Elo. **Quyết định 2026-11-20: tạm giữ nguyên**
  1,5 / 3 giây (máy chậm tối đa 2,5 / 4 giây). Các phương án để chọn sau, sửa ở
  `src/services/caro-tengen/engine.ts` (`OPTIMUM_MS`, `HARD_MS`, `MAX_OPTIMUM_MS`, `MAX_HARD_MS`):

  | Phương án         | Khi đã chắc / tối đa | Chờ trung bình    | Ước tính so với hiện tại   |
  | ----------------- | -------------------- | ----------------- | -------------------------- |
  | Giữ nguyên        | 1,5 / 3 giây         | khoảng 1,5–2 giây | —                          |
  | Gấp 1,5 lần       | 2,25 / 4,5 giây      | khoảng 2,5–3 giây | khoảng +45 Elo             |
  | Gấp đôi (đề xuất) | 3 / 6 giây           | khoảng 3–4 giây   | khoảng +80 Elo (đã đo +89) |
  | Gấp 3 lần         | 4,5 / 9 giây         | khoảng 5–6 giây   | khoảng +130 Elo            |

  Máy chậm được nới tương ứng (với gấp đôi: tối đa khoảng 5 / 8 giây). Khi áp dụng: cập nhật test
  `src/__tests__/caro/tengen.test.ts` và thử lại trên trình duyệt.

- Chưa đo: 1 / 2 / 4 luồng (tengen-arena cố định 1 luồng; cần đo riêng nếu muốn).

## 3. SPSA tham số search

- `tengen-spsa` (`crates/arena/src/bin/spsa.rs`) với `tuning/spsa.txt`, `--rule freestyle-caro`,
  khai cuộc từ bước 1. Chạy cục bộ vài giờ, sau đó SPRT bản mới với bản cũ.
- Tham số được đưa vào Tengen theo luật (như trọng số), ghi trong `experiment-web.patch`.
- **Kết quả 2026-11-20: không cải thiện, giữ nguyên tham số gốc.** SPSA chạy đủ 10.000 cặp ván
  (50 ms/nước, trên trọng số `weights-freestyle-caro.txt`; log `ml-data/engines/tune/spsa/run-*.log`,
  bộ cuối ở `final-params.txt`). Thay đổi chính: `rfp_margin` 70→55, `futility_margin` 100→109,
  `lmp_base` 3→5, `razor_margin` 120→126. SPRT [0, 10] ở 100 ms/nước từ khai cuộc cân bằng:
  2.470 ván, +1067 =292 −1111, **−6,2 ± 11,9 Elo**, H0 được chấp nhận (`spsa/sprt.log`).
- Tham số gốc của Tengen đã gần tối ưu cho luật này; nếu thử lại thì nên tune ở thời gian dài hơn
  (≥ 200 ms/nước) và chỉ với vài tham số cắt tỉa, nhưng kỳ vọng thấp. Ưu tiên chuyển sang bước 4–5.

## 4. Tinh chỉnh trọng số theo vòng lặp

- Tự đánh bằng trọng số mới → refine nhẹ lại → SPRT; dừng khi không còn tiến bộ.
- Thử các chế độ khác: `fit-threat`, `fit-policy`, `fit-window`, cùng ràng buộc mạnh.
- Tự đánh từ khai cuộc cân bằng để dữ liệu ít lệch về bên đi trước.
- **Vòng 2 (2026-11-21): không cải thiện, giữ trọng số vòng 1.** Tự đánh 40.000 ván bằng
  `weights-freestyle-caro.txt`, fit-local trên 80.000 ván (vòng 1 + 2): validation 0,099330 →
  0,098994 với `l2 1e-4`; `l2 3e-4` không đổi gì. SPRT [0, 10] từ khai cuộc cân bằng: 2.810 ván,
  +1219 =334 −1257, **−4,7 ± 11,4 Elo**, LLR −2,85 (gần mức bác bỏ). Dữ liệu và log:
  `ml-data/engines/tune/iter2/`.
- Kết luận: fit-local trên bảng mẫu hình đã bão hòa; lần lặp thêm không đáng công. Muốn đánh giá
  tốt hơn cần mô hình khác (bước 6).

## 5. VCT

- Bộ giải riêng trong Rust: kẻ tấn công chỉ đi nước tạo bốn hoặc ba mở, người phòng thủ chỉ đi
  nước chặn; proof-number search hoặc DFS giới hạn độ sâu, bảng băm riêng.
- Gọi ở gốc với khoảng 10–15% thời gian, cho cả hai bên: nếu đối thủ có VCT thì chỉ xét các nước
  phòng thủ phá được nó (quan trọng nhất khi máy đi sau). Thử trong quiescence ở độ sâu nhỏ.
- Đối chiếu với `findThreatWin` (TypeScript, `src/services/caro-machine/threat.ts`); bộ test thế
  cờ có VCT đã biết; SPRT; đo NPS.
- **Kết quả 2026-11-20: không cải thiện, tắt mặc định.** Đã viết `crates/engine/src/vct.rs` (chỉ
  trong `ml-data`, chưa vào patch): DFS sâu dần, bảng băm riêng; nước phòng thủ lấy từ
  `movegen::generate` nên mọi chiến thắng tìm được là chắc chắn (test: 400 thế ngẫu nhiên, search
  độ sâu 12 xác nhận hết). Gọi ở gốc trong 15% thời gian: tự thắng thì đi ngay; đối thủ có VCT thì
  loại các nước không phá được. Bật bằng `--params vct_time=150`.
  - SPRT [0, 10] ở 100 ms/nước: 2.350 ván, +1025 =269 −1056, **−4,6 ± 11,1 Elo**, H0
    (`ml-data/engines/tune/vct-sprt.log`).
  - `vct-probe` (`crates/arena/src/bin/vct-probe.rs`) trên 30 ván tự đấu (954 thế yên tĩnh): VCT của mình tìm thấy 89 lần,
    **cả 89 lần search chính cũng đã thấy thắng**; đối thủ có VCT 281 lần, nhưng nước search chọn
    chỉ bị VCT bác **3 lần**. Search chính (VCF trong quiescence + sinh nước phòng thủ chính xác) đã
    lo gần hết, VCT chỉ tốn thời gian.
  - Kết luận: điểm yếu khi đi sau không nằm ở việc không nhìn thấy chuỗi đe dọa, mà ở lợi thế đi
    trước của luật này. Hướng còn lại đáng thử là đánh giá tốt hơn (bước 4, 6).

## 6. NNUE

- Dữ liệu: hàng triệu thế cờ Tengen tự đánh (luật chặn hai đầu, từ khai cuộc cân bằng), nhãn là
  kết quả ván + điểm search sâu.
- Kiến trúc theo Rapfi mix9 / trainer trong `ml-data/engines/rapfi/Trainer`: đặc trưng mẫu cờ 4
  hướng → vài lớp nhỏ → giá trị + chính sách.
- Suy luận trong Tengen (Rust): cập nhật tăng dần, lượng tử hoá int8/int16, SIMD cho WASM.
- Vòng lặp train → SPRT → sinh dữ liệu bằng bản mới. Rủi ro: công sức lớn, WASM nặng hơn, NPS
  giảm.

### Bản thử (2026-11-21, tạm dừng)

- Code (chỉ trong `ml-data`, chưa vào patch):
  - `crates/engine/src/nnue.rs`: mỗi ô trống gần quân nhìn 4 đường × 8 ô (trống / mình / đối thủ /
    ngoài bàn), mỗi hình đường có vector 32 chiều học được → cắt [0, 1] → cộng trên bàn → lớp ẩn
    16 → **hiệu chỉnh cộng thêm** vào đánh giá cổ điển (lớp ra khởi tạo 0 = đúng bản hiện tại).
    Hiệu chỉnh = điểm theo góc nhìn bên đi − điểm theo góc nhìn đối thủ (phản đối xứng).
  - `pbrain-tengen --nnue FILE`; `tengen-nnue samples | train | inspect`
    (`crates/arena/src/bin/nnue.rs`).
- Pipeline có checkpoint: `ml-data/engines/nnue/run.sh` — dừng lúc nào cũng được, chạy lại là
  tiếp tục: mẫu theo từng shard (`samples/*.bin`), train lưu `train.ckpt` sau mỗi epoch và
  `net.nnue` tốt nhất, trận 4× thời gian và SPRT bỏ qua khi đã có kết quả. Mỗi phiên bản ở thư mục
  riêng (`RUN=v3`).
- Kết quả:
  - v1 (nhãn = kết quả ván): validation 0,0993 → 0,0729 nhưng SPRT **−131 Elo**; cho 4× thời gian
    vẫn chỉ +75 (NPS giảm ~4×). Mạng học được bên nào đi trước và không đối xứng (lệch ngưỡng cắt
    tỉa của search).
  - v2 (phản đối xứng, nhãn = kết quả ván): validation 0,0669 nhưng 4× thời gian **−165 Elo**.
    Nhãn kết quả ván dạy mạng "dấu hiệu của bên thua" (bên thua thường phải chặn) thay vì nước tốt.
  - v3: nhãn = 0,75 × điểm search 20k node + 0,25 × kết quả ván. Validation 0,0205 → 0,0122.
    Cùng thời gian SPRT **≈ −220 Elo** (dừng sau 110 ván); 4× thời gian **−31 ± 36**.
  - Mốc so sánh: bản cổ điển được 4× thời gian là **+118 ± 45** (`nnue/baseline-4x.log`). Vì NNUE
    chậm ~4×, trận 4× gần như cùng số node: v3 vẫn kém cổ điển ~150 Elo ở cùng số node, tức
    đánh giá của mạng còn tệ hơn đánh giá cổ điển, chưa đáng làm tối ưu tốc độ.

- Code VCT + NNUE đã gỡ khỏi `ml-data/engines/tengen` (để patch gửi lên web gọn) và lưu ở
  `ml-data/engines/experiments/nnue-vct/experiments.patch` (diff từ commit gốc của Tengen, gồm cả
  phần đã có trong `experiment-web.patch`). Dùng lại: `git checkout . && git apply` patch đó.

## 7. Chống học thuộc đường thắng

- Chọn ngẫu nhiên giữa các nước có điểm gần bằng nhau (trong sách, và ở gốc search khi chênh
  lệch rất nhỏ).
- Đã làm (2026-11-21): `Limits::variety` / `tg_set_variety` / `pbrain-tengen --variety MARGIN[,PLIES]`.
  Luồng chính của search thử thêm 6 nước gốc đầu tiên bị fail-low với cửa sổ hạ xuống `MARGIN`
  (search rút gọn trước, xác nhận ở cùng độ sâu); nước nào lọt vào biên thì có thể được chọn ngẫu
  nhiên. Không áp dụng khi điểm là thắng/thua chắc. App dùng biên 20, chỉ khi dưới 20 quân.
  - Đo (100 ms, `ml-data/engines/variety/`): chia thời gian cho search phụ sau search chính
    −40 Elo; kiểm tra mọi nước gốc ở cả ván −54; giới hạn 6 nước + 20 quân đầu **−2,0 ± 9,4**
    (4000 ván, SPRT [−10, 0] chưa kết luận, LLR 1,30) → chấp nhận.
- Nước từng làm thua (sổ kinh nghiệm trên máy người chơi) được gửi cho Tengen để tránh
  (`Limits::exclude` / `tg_exclude`) thay vì chuyển sang mạng cũ yếu hơn.
- Chưa làm: sách khai cuộc vẫn một nước mỗi thế (3 nước đầu của máy cố định).
- Sổ kinh nghiệm chung: gửi ván máy thua về server (API + nơi lưu, ví dụ Vercel KV/Postgres),
  phân tích định kỳ, đưa vào sách khi deploy.

## 8. Rapfi + NNUE (2026-11-21)

- Luật **không chặn hai đầu**: cấp Địa ngục chạy Rapfi (GPL-3.0) với mạng mix9svq freestyle, bản
  WebAssembly (`public/engines/rapfi/`, xem `NOTICE.md`): nhiều luồng khi có cross-origin
  isolation, 1 luồng khi không; 2 giây mỗi nước. Không chạy được thì quay về Tengen.
- Đo native trước khi dùng: Rapfi 1 luồng vs Tengen, 300 ms/nước, khai cuộc cân bằng: 88 thắng,
  1 hoà, 11 thua (**+354 ± 107 Elo**).
- Rapfi không có biến hoá ngẫu nhiên như Tengen (bước 7); bản nhiều luồng tự nhiên ít lặp lại hơn.
  Nước từng thua vẫn được tránh (`YXBLOCK`).
- Luật **chặn hai đầu**: Rapfi chưa có luật này. Muốn dùng phải thêm luật vào Rapfi (C++), sinh
  dữ liệu tự đánh và huấn luyện mạng mới bằng `ml-data/engines/rapfi/Trainer`.
- Rapfi **chỉ đánh giá cổ điển** (bỏ NNUE) vs Tengen, luật không chặn, 300 ms/nước: 42 thắng, 2 hoà,
  16 thua (**+161 ± 96 Elo**, `ml-data/engines/rapfi-classical/`). Riêng search của Rapfi đã hơn
  Tengen, nên thêm luật chặn hai đầu vào Rapfi có thể có lợi ngay cả trước khi có mạng riêng.

## 9. Rapfi cho luật chặn hai đầu (2026-11-21)

- Thêm luật `CARO` vào Rapfi (`INFO rule 8`, patch ở `public/engines/rapfi/experiment-web.patch`):
  năm quân trở lên thắng trừ khi hai ô ngay ngoài dãy đều là quân đối thủ; mép bàn không chặn.
  Bảng mẫu hình khớp với luật của app trên toàn bộ 264.992 đường 11 ô (kiểm tra độc lập; cùng bộ
  kiểm tra chạy trên bảng standard thì lệch 21.116). Benchmark các luật cũ giữ nguyên số node.
- Chưa có mạng riêng: bảng đánh giá cổ điển và tham số search chép từ freestyle.
- Rapfi-caro vs Tengen, luật chặn, 300 ms/nước, 100 ván: 65 thắng, 4 hoà, 31 thua
  (**+123 ± 65 Elo**, `ml-data/engines/rapfi-caro/`). App dùng Rapfi cho cả hai luật, Tengen là
  dự phòng.
- Lưu ý: trọng tài của arena (Tengen rule 8) cho dãy từ 6 quân bị chặn hai đầu là thắng, app thì
  không; trường hợp này rất hiếm.
- Tiếp theo (giai đoạn 2): `pbrain-rapfi selfplay` sinh dữ liệu (đã mã hoá luật caro = 3 trong
  định dạng dữ liệu), thêm luật vào Trainer, huấn luyện mix9 cho caro.

### Giai đoạn 2: mạng NNUE cho luật chặn (đang chạy, 2026-11-21)

- Pipeline trong `ml-data/engines/rapfi-train/` (`run.sh`, dừng/chạy lại được ở từng bước):
  tự đánh (`selfplay.sh`: 64 shard × 400 ván, 50k node/nước, multipv 4; bàn 20×20 một nửa,
  15×15 ba phần tám, 10×10 một phần tám) → huấn luyện mix9s trên GPU Mac (MPS) → xuất mix9svq
  (`export_caro.py`: codebook 65.536 bằng k-means thay cho lớp VQ cần pykeops/CUDA) → 200 ván với
  Rapfi cổ điển. Vòng N tự đánh bằng mạng của vòng N−1.
- Sửa thêm trong Rapfi: tên luật Caro khi in (`iohelper.cpp`) và lỗi kiểu tham số `balance1-node`
  trên macOS (`argutils.cpp`). Trainer: luật caro (mã 3 trong dữ liệu, bit 8 trong file mạng),
  patch ở `ml-data/engines/rapfi-train/trainer.patch`.
- Đã thử trọn quy trình trên dữ liệu nhỏ: mạng xuất ra khớp ArchHash của engine và nạp được.
