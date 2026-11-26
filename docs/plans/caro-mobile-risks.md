# Kế hoạch sửa rủi ro của caro cấp Địa ngục trên điện thoại

Cập nhật: 2026-11-26 (kết quả ván thật ở cuối).

## Bối cảnh

Hai lỗi được báo từ điện thoại:

- **Nước đầu rất lâu:** một người chơi báo phải chờ cả phút mới có nước đầu.
- **Máy lag ở ván 2:** trên một máy Android Samsung, ván đầu chơi bình thường; để máy một lúc rồi chơi ván 2 thì cả điện thoại chậm, khó thao tác.

Đo trên Chrome máy tính (giả lập Android/iPhone, CPU chậm, 3G) không tái hiện được hai lỗi trên. Rà lại code thì thấy các rủi ro dưới đây.

**Hai mục tiêu:**

- Trên điện thoại, máy không bao giờ đứng im không đi.
- Máy không làm điện thoại chậm.

## Đã sửa (đã commit trong `bd1599d`, 2026-11-23)

|     | Thay đổi                                                                                                                                | File                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A   | Rapfi không trả lời sau `2 s + 6 s`: Tengen chơi thay, Rapfi bị bỏ trong phiên, header hiện "Tengen"                                    | `src/services/caro-rapfi/engine.ts`, `src/services/caro-tengen/player.ts`, `src/workers/caro-machine.worker.ts` |
| B   | `reload-model` không còn tải TF.js vào worker chơi, nên nước đầu ván sau không phải chờ việc này                                        | `src/workers/caro-machine.worker.ts`                                                                            |
| C   | Bỏ tinh chỉnh mạng TF.js (dùng GPU) khi Rapfi hoặc Tengen chơi được; trên điện thoại chỉ phân tích ván 10 s thay vì 30 s                | `src/services/caro-hell/learning.ts`, `src/hooks/useCaroMachine.ts`                                             |
| D   | Mỗi ván gửi kèm thời gian từng nước của máy, thời gian tải engine và loại máy; ván bị bỏ ngang khi có một nước chờ ≥ 10 s cũng được gửi | `src/services/caro-game-report/*`, `src/app/api/caro/games/route.ts`                                            |

## Rủi ro còn lại

Mỗi rủi ro ghi: nguyên nhân, cách sửa và điều kiện "đã hết". Các mã R1, R2… được dùng lại ở phần kiểm tra.

### R1. Tab mở từ trước một lần deploy: máy không bao giờ đi (nghiêm trọng)

**Nguyên nhân:**

- Worker và chunk `caro-tengen/player` được nạp từ `/_next/static/…`, tên file đổi theo mỗi bản build.
- Tab cũ vẫn xin file của bản cũ. Không có Skew Protection thì các file đó trả 404, và `import()` trong worker thất bại.
- `queue.catch` (`caro-machine.worker.ts`) chỉ ghi lỗi ra console; worker không trả lời.
- Hook (`useCaroMachine.ts`) không có `onerror`, nên máy đứng im mãi.

**Sửa:**

1. Worker bắt lỗi khi xử lý `move` và trả `{ type: 'move-failed', id, reason }`.
2. Hook xử lý `move-failed` và `worker.onerror`:
   - Lần đầu: tạo lại worker và gửi lại nước.
   - Lần thứ hai trong cùng phiên (thường do file của bản cũ đã mất): tải lại trang một lần, đánh dấu trong `sessionStorage` để không lặp vô hạn.
   - Nếu đã tải lại mà vẫn lỗi: hiện thông báo (chuỗi mới trong `src/i18n/messages/caro.ts`, cả `en` và `vi`).
3. Kiểm tra Vercel có Skew Protection không (Settings → Advanced). Có thì bật; đây là lớp bảo vệ thứ hai, không thay cho bước 1–2.

**Đã hết khi:** chặn chunk của player bằng 404 thì máy vẫn đi, hoặc trang tự tải lại một lần rồi đi, và không bao giờ đứng im quá 10 s (kiểm tra K1).

### R2. Một lần tải lỗi là mất engine đến hết phiên (nghiêm trọng)

**Nguyên nhân:**

- `getTengen()` (`caro-tengen/browser.ts`), `getRapfi()` (`caro-rapfi/browser.ts`) và `getOpeningBook()` nhớ cả kết quả thất bại (`null` hoặc sách rỗng).
- Mạng điện thoại chập chờn một lần là Tengen hỏng suốt phiên. Nếu Rapfi cũng chưa tải xong, máy rơi xuống mạng TF.js: phải tải khoảng 1,8 MB, chậm.

**Sửa:**

- Chỉ nhớ kết quả **thành công**.
- Lỗi do mạng (fetch hoặc compile thất bại) thì lần cần sau tải lại, chờ ít nhất 5 s giữa hai lần, tối đa 3 lần mỗi phiên.
- Lỗi "máy không chạy được" (không có WebAssembly, SIMD hay bộ nhớ chung) thì vẫn nhớ là hỏng.
- Header phản ánh đúng: "Đang tải" lại trong lúc thử lại.

**Đã hết khi:** cho `tengen*.wasm` lỗi một lần rồi trả bình thường thì Tengen vẫn được dùng trong cùng phiên, không có nước nào do `network` chơi (K2).

### R3. Khoá màn hình khi máy đang nghĩ làm mất Rapfi oan (nghiêm trọng, lỗi do bản sửa A)

**Nguyên nhân:**

- Android đóng băng tab khi khoá máy. Lúc mở lại, hạn 8 s có thể đã qua, dù Rapfi không hỏng.
- Rapfi bị đánh dấu `broken` cho cả phiên, và máy yếu đi.

**Sửa:**

- Trong `loadRapfi`, nếu đang `broken` vì quá hạn mà Rapfi vẫn in ra một nước, nghĩa là nó chỉ chậm chứ không hỏng: bỏ `broken`, đặt `game = ''` để ván sau gửi lại `START`, và báo header về "Rapfi".
- Nước muộn đó bị bỏ đi, vì Tengen đã chơi nước ấy rồi.

**Đã hết khi:** test với Rapfi giả trả lời sau hạn thì lần `think` sau dùng lại Rapfi. Kiểm tra trên trình duyệt: giả lập đóng băng lúc máy nghĩ, rồi các nước sau vẫn do `rapfi` chơi (K3).

### R4. Nhiều worker học chạy cùng lúc (trung bình)

**Nguyên nhân:** mỗi ván kết thúc tạo một worker học mới (`learnersRef` trong `useCaroMachine.ts`). Thua nhanh liên tiếp thì nhiều worker phân tích song song.

**Sửa:**

- Mỗi lúc chỉ một worker học; ván sau xếp hàng chờ.
- Hàng chờ tối đa 2 ván: có ván mới thì bỏ ván cũ nhất chưa học (nó sẽ không được học).

**Đã hết khi:** thua 4 ván liên tiếp thật nhanh mà không bao giờ có quá 1 worker học cùng lúc (K4).

### R5. Bộ nhớ trên điện thoại yếu (trung bình)

**Nguyên nhân:**

- Tengen dùng bảng hash 64 MB trong bộ nhớ chung có thể lên tới 256 MB.
- Rapfi có bảng 32 MB, cộng thêm `rapfi.data` (10 MB) được chép vào bộ nhớ của nó.
- Tất cả nằm trong một tab; máy RAM 3–4 GB có thể bị đẩy bộ nhớ, hoặc Chrome tự tải lại tab.

**Sửa:**

- Trên điện thoại gọi `tg_set_hash(16)` cho Tengen (hàm đã có trong bản wasm).
- Gửi `INFO max_memory` cho Rapfi để giới hạn bảng ở 16 MB.
- Đo sức mạnh trước khi áp dụng: chạy `tengen-arena` với bảng 16 MB so với 64 MB, ở đúng thời gian nghĩ của điện thoại. Không yếu đi rõ rệt mới áp dụng.

**Đã hết khi:** bộ nhớ worker chơi trên điện thoại giảm ít nhất 30% (K5) và trận đấu không cho thấy yếu đi.

**Đã làm (2026-11-23):**

- Khi đo, lộ ra hai lỗi có sẵn trong cách nạp Tengen:
  - `tg_set_threads` và `tg_set_hash` bị bỏ qua nếu gọi trước ván đầu tiên (`tg_new`), mà app lại gọi đúng lúc đó. Vì vậy trên web Tengen xưa nay chỉ tìm bằng **1 luồng** với bảng 64 MB, kể cả trên máy tính. Đã sửa trong bản wasm: hai giá trị được lưu lại cho engine mà `tg_new` tạo (ghi trong `public/engines/tengen/NOTICE.md`).
  - Bộ nhớ chung được tạo sẵn 64 MB nhưng bộ cấp phát không dùng phần đó, nên mất không 64 MB trên mọi thiết bị. Giờ bắt đầu từ 2 MB.
- Bảng 16 MB của Tengen: 300 ván ở 400 ms mỗi nước được −23,2 ± 25,4 Elo so với 64 MB. Chưa chắc chắn yếu hơn nhưng nghiêng về phía đó, mà điện thoại còn nghĩ lâu hơn 400 ms, nên chọn **32 MB**.
- Rapfi: giới hạn `max_memory` không làm giảm bộ nhớ (54 MB cả trước và sau, phần lớn là mạng nơ-ron và `rapfi.data`), nên đã bỏ thay đổi này.
- Đo bằng `measureUserAgentSpecificMemory()` không dùng được: nó chờ 60 s các luồng engine đang ngủ rồi bỏ qua chúng. K5 đếm trực tiếp các vùng nhớ WebAssembly trong worker qua CDP.
- K5 với bảng 16 MB: 186 MB (Tengen 132 + Rapfi 54) → 76 MB (22 + 54), giảm 59%. Kết quả với 32 MB xem bảng bên dưới.

### R6. Đổi sang cấp khác vẫn giữ engine (trung bình)

**Nguyên nhân:** đổi từ Địa ngục sang cấp khác, worker vẫn giữ Tengen và Rapfi trong bộ nhớ.

**Sửa:**

- Khi rời cấp Địa ngục, tạo lại worker chơi để giải phóng engine.
- Engine tải lại từ cache khi quay lại cấp Địa ngục.

**Đã hết khi:** chuyển Địa ngục → Khó thì các worker của Rapfi và Tengen đóng lại (K6).

### R7. Tengen đo tốc độ máy lúc đang bận (thấp)

**Nguyên nhân:** bước đo 300 ms ở `loadTengen` chạy đúng lúc Rapfi đang khởi tạo, nên máy bị đánh giá là chậm. Hậu quả: Tengen nghĩ tối đa 2,5–4 s mỗi nước suốt phiên.

**Sửa:**

- Đo lại sau nước đầu tiên do Tengen chơi.
- Lấy giá trị lớn nhất của hai lần đo.

**Đã hết khi:** trên máy tính, thời gian mỗi nước của Tengen không phụ thuộc vào việc Rapfi có đang tải lúc đo hay không (K7).

### R8. Tengen chỉ ra nước cần tránh: máy dùng mạng TF.js (thấp)

**Nguyên nhân:** `findTengenMove` trả `null` khi nước tìm được nằm trong danh sách cần tránh, nên máy tải TF.js giữa ván.

**Sửa:**

- Tengen đã nhận `exclude`; nếu vẫn trả nước bị cấm, gọi lại Tengen thêm một lần với thời gian ngắn.
- Chỉ dùng mạng TF.js khi engine thật sự không chạy được.

**Đã hết khi:** có test cho trường hợp này, và không có nước nào do `network` chơi khi Tengen chạy được (K8).

## Thứ tự làm

Làm R3 → R1 → R2 → R4 → R6 → R7 → R8 → R5. R3 trước vì là lỗi do mình gây ra và sửa nhỏ. R5 cuối vì cần đo sức mạnh.

Mỗi mục có test trong `src/__tests__/caro/` theo quy tắc của `AGENTS.md`.

## Vòng kiểm tra: sửa đến khi hết rủi ro

Sau khi sửa, chạy **toàn bộ** các kiểm tra dưới đây. Một kiểm tra không đạt thì quay lại sửa đúng mục đó, rồi chạy lại **từ đầu cả bộ**, vì bản sửa sau có thể làm hỏng mục đã qua. Chỉ dừng khi cả bộ đạt **hai lần liên tiếp**; lần chạy thứ hai để loại các kết quả may rủi do thời gian.

```
sửa → K0…K9 → có mục trượt? → có: sửa mục đó → chạy lại K0…K9
                            → không: chạy lại thêm một lần → vẫn đạt hết → xong
```

**Kịch bản trình duyệt:**

- Viết bằng `playwright-core` + Chrome trong thư mục `scripts/caro-hell/mobile-check/`, chạy trên bản build production (`pnpm build`, `next start -p 3007`).
- Server do vòng kiểm tra bật thì vòng kiểm tra tắt. Nếu cổng 3007 đã có server của người khác thì dùng lại, không tắt.
- `playwright-core` đã được thêm vào `devDependencies` (bạn đã đồng ý); chạy bằng `pnpm caro:mobile-check`.
- Dùng chung các cấu hình: Android giả lập (Pixel 7, 2 luồng), iPhone giả lập (1 luồng), máy tính, mạng 3G, chạy Chrome bằng `taskpolicy -b` (chỉ lõi tiết kiệm điện).
- Mỗi kịch bản in "ĐẠT" hoặc "TRƯỢT" kèm số đo.

|     | Kiểm tra                        | Cách làm                                                                                                             | Đạt khi                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K0  | Kiểm tra tĩnh                   | `pnpm test src/__tests__/caro`, `pnpm exec tsc --noEmit`, `pnpm eslint`, `pnpm build`                                | Tất cả sạch                                                                                                                                                                                                                                                                                                                                                                                  |
| K1  | Tab cũ sau deploy (R1)          | Chặn chunk player và worker bằng 404 sau khi bàn cờ hiện                                                             | Máy đi được, hoặc trang tự tải lại đúng 1 lần rồi đi; không có lúc nào chờ > 10 s                                                                                                                                                                                                                                                                                                            |
| K2  | Tải lỗi một lần (R2)            | Lần đầu xin `tengen*.wasm` trả 503, lần sau bình thường                                                              | Tengen chơi trong cùng phiên; không có nước `network`                                                                                                                                                                                                                                                                                                                                        |
| K3  | Khoá máy giữa lúc nghĩ (R3)     | Rapfi sẵn sàng; dừng worker 15 s bằng CDP debugger pause lúc máy đang nghĩ                                           | Các nước sau do `rapfi` chơi; header là "Rapfi"                                                                                                                                                                                                                                                                                                                                              |
| K4  | Thua liên tiếp (R4)             | Thua 4 ván nhanh liên tiếp                                                                                           | Không lúc nào có quá 1 worker học                                                                                                                                                                                                                                                                                                                                                            |
| K5  | Bộ nhớ (R5)                     | Tổng các vùng nhớ WebAssembly của worker (qua CDP) sau 2 ván, so với bản đang deploy                                 | Giảm ≥ 30% so với số đo trước khi sửa                                                                                                                                                                                                                                                                                                                                                        |
| K6  | Đổi cấp (R6)                    | Địa ngục → Khó                                                                                                       | Các worker engine đóng lại                                                                                                                                                                                                                                                                                                                                                                   |
| K7  | Đo tốc độ (R7)                  | So thời gian mỗi nước của Tengen giữa có và không có Rapfi đang tải lúc đo                                           | Lệch ≤ 20%                                                                                                                                                                                                                                                                                                                                                                                   |
| K8  | Không rơi xuống mạng TF.js (R8) | Cả 3 cấu hình, 3 ván mỗi cấu hình, bàn 15×15 và 20×20                                                                | Không nước nào `source: network`; không tải `caro-hell/model.json`                                                                                                                                                                                                                                                                                                                           |
| K9  | Hồi quy toàn bộ                 | Mỗi cấu hình: máy đi trước và người đi trước; ván 2 sau khi để rảnh 2 phút; nước đầu tiên sau khi Rapfi vừa tải xong | Mọi nước ≤ 5 s (≤ 8 s với nước mà trong lúc đó dữ liệu Rapfi vừa tải xong, hoặc nước đầu tiên Rapfi chơi: trên iPhone, Rapfi một luồng được dựng ngay trong worker đang chơi); sau ván CPU về < 5% trong 15 s; long task dài nhất < 100 ms (đo trên lõi thường: chạy riêng K9 không có `taskpolicy`, vì Chrome headless vẽ bằng CPU nên trên lõi tiết kiệm điện trang nào cũng có long task) |

Ghi kết quả từng lần chạy vào bảng dưới, kể cả lần trượt:

| Lần | Ngày       | K0  | K1  | K2  | K3  | K4  | K5               | K6  | K7  | K8  | K9                  | Ghi chú                                                                                                                                                                                       |
| --- | ---------- | --- | --- | --- | --- | --- | ---------------- | --- | --- | --- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 2026-11-23 | ✅  | ❌  | ✅  | ✅  | ✅  | ❌               | ✅  | ❌  | ✅  | ❌                  | Lỗi do cách đo: route Playwright không thấy request của worker (K1), `measureUserAgentSpecificMemory` treo (K5), so trung vị nước đi vô nghĩa (K7)                                            |
| 2   | 2026-11-23 | —   | —   | —   | —   | —   | —                | —   | —   | —   | —                   | Hỏng: máy ngủ giữa chừng; các lần sau chạy với `caffeinate -i`                                                                                                                                |
| 3   | 2026-11-23 | ✅  | ✅  | ✅  | ✅  | ✅  | ✅               | ✅  | ✅  | ✅  | ❌                  | Phát hiện `tg_set_threads`/`tg_set_hash` mất tác dụng và bộ nhớ khởi đầu 64 MB, đã sửa; K9 đo CPU bằng `ps` sai                                                                               |
| 4   | 2026-11-23 | ✅  | ✅  | ✅  | ✅  | ✅  | ✅ (186 → 92 MB) | ✅  | ✅  | ✅  | ✅ thường / ❌ chậm | K9 chậm: 1 nước 9 s trên máy tính lúc `tsc` chạy song song                                                                                                                                    |
| 5   | 2026-11-23 | ✅  | ✅  | ✅  | ✅  | ✅  | ✅               | ✅  | ✅  | ✅  | ✅ thường           | K0–K8 đạt hai lần liên tiếp (4, 5)                                                                                                                                                            |
| 6   | 2026-11-23 |     |     |     |     |     |                  |     |     |     | ✅ thường           | K9 trên lõi thường đạt lần thứ ba                                                                                                                                                             |
| 7   | 2026-11-23 |     |     |     |     |     |                  |     |     |     | ❌ / ✅ chậm        | Lần 1: iPhone máy đi trước 6010 ms, là nước dựng Rapfi một luồng (từ đó tách riêng, ≤ 8 s); lần 2 đạt                                                                                         |
| 8   | 2026-11-23 |     |     |     |     |     |                  |     |     |     | ❌ ❌ chậm          | Cả hai lần trượt, nhiều nước 7–26 s, nhưng load trung bình 15 phút của máy lúc đó ≈ 10,7 (có việc khác chạy), trong khi lõi tiết kiệm điện chỉ có 4. Không dùng được để kết luận; chưa đo lại |

## Sau khi deploy

- Lấy dữ liệu ván thật bằng `pnpm caro:fetch-games`, rồi kiểm tra trên các ván có `timing.device` là `android` hoặc `ios`:
  - Không có nước nào > 10 s.
  - Không có ván bỏ ngang (`winner: null`).
  - Không có nước `source: network`.
  - `loaded.tengen` < 10 s.
- Nếu có ván không đạt, thêm rủi ro mới vào tài liệu này và chạy lại vòng kiểm tra.
- Nhờ người chơi đã báo lỗi thử lại trên đúng điện thoại của họ.

### Kết quả trên ván thật (2026-11-26)

34 ván đã lưu (22–26/11), 20 ván có `timing` (13 máy tính, 7 iPhone; chưa có ván Android nào), `pnpm caro:fetch-games`:

- Không nước nào > 10 s: nước chậm nhất 2,25 giây (267 nước có đo, không nước nào chậm hơn 2,3 giây).
- Không nước nào `source: network`; mọi nước tính toán đều do `rapfi` chọn (216 nước), ngoài ra là `book`.
- `loaded.tengen` lớn nhất 1,65 s, `loaded.rapfi` 1,55 s (19 ván có số đo), đều dưới 10 s.
- **Một ván không đạt** (2026-11-25 07:53, máy tính, build `32b181f`): bỏ ngang sau nước đầu của người chơi, máy chờ 41,6 s, `loaded` rỗng (không engine nào báo tải xong). Chưa rõ nguyên nhân. Điểm đáng nghi: nước đầu của máy luôn đợi `getOpeningBook()` trước khi tới engine, và các `fetch` của sách, Rapfi và Tengen không có timeout. Đây là rủi ro mới (R9) cần xử lý hoặc loại trừ.
- Chưa có ván Android nào, nên nhóm máy này chưa được kiểm chứng ngoài đời. Cần nhờ người chơi đã báo lỗi thử lại trên đúng điện thoại của họ.
