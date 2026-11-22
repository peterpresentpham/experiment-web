# Experiment Web

Nơi mình thử nghiệm ý tưởng web: vài trò chơi, một trình mô phỏng và một blog. Viết bằng
**Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 4** và **shadcn/ui**;
trạng thái quản lý bằng **Zustand** và **XState**. Giao diện có tiếng Việt và tiếng Anh.

## Có gì bên trong

- **Caro**: chơi với bạn trên cùng máy, chơi online qua WebRTC, hoặc đấu với máy ở bốn mức. Mức
  Địa ngục chạy engine caro (Rapfi, Tengen) bằng WebAssembly ngay trong trình duyệt, hỗ trợ cả
  luật chặn hai đầu.
- **Pikachu**: trò nối hình cổ điển.
- **Process**: mô phỏng lập lịch tiến trình (MLFQ) với các nhân CPU, log và vòng đời tiến trình.
- **Blog**: luận văn thạc sĩ, tài liệu thư viện `@peter-present/format-number` và hướng dẫn giải
  Rubik 3x3.

Bố cục thư mục và quy ước code: [docs/project-context.md](docs/project-context.md) và
[AGENTS.md](AGENTS.md).

## Chạy local

Cần Node.js 20+ và pnpm (`corepack enable` để dùng đúng phiên bản trong `packageManager`).

```bash
pnpm install
cp .env-example .env   # điền các biến cần thiết
pnpm dev               # http://localhost:3007
```

Muốn thử caro online thì chạy thêm signaling server ở một terminal khác, rồi mở hai tab: một tab
bấm **Host** lấy mã phòng, tab kia bấm **Guest** và nhập mã.

```bash
pnpm signal            # http://localhost:4001
```

`NEXT_PUBLIC_GAME_SIGNAL_URL` (mặc định `http://localhost:4001`) được nhúng vào bundle lúc build,
nên phải đặt trước `pnpm build`. Chi tiết: [docs/game-signaling.md](docs/game-signaling.md).

### Bằng Docker

```bash
docker compose up --build   # web: http://localhost:4004, signal: http://localhost:4005
```

## Lệnh thường dùng

| Lệnh                        | Việc                    |
| --------------------------- | ----------------------- |
| `pnpm dev`                  | Chạy dev                |
| `pnpm build` / `pnpm start` | Build / chạy production |
| `pnpm signal`               | Chạy signaling server   |
| `pnpm test`                 | Chạy test (Vitest)      |
| `pnpm eslint`               | Lint                    |
| `pnpm format`               | Format bằng Prettier    |
