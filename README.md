# Experiment Web

Sân chơi thử nghiệm xây bằng **Next.js 16**, **React 19**, **XState 5**, **Zustand** và **Tailwind CSS 4**.

## Nội dung

- **Process Management**: mô phỏng lập lịch tiến trình (MLFQ), dashboard CPU core, terminal log và vòng đời tiến trình.
- **Games**: Caro (chơi online P2P qua WebRTC) và Pikachu.
- **Blog** (`/blog`): luận văn thạc sĩ (`/blog/master-thesis`) và tài liệu thư viện `@peter-present/format-number` (`/blog/format-number/*`) và bảng F2L Rubik 3x3 (`/blog/rubik3x3`), chuyển từ `my-next-app`.

## Cấu trúc

```
src/
├── app/            # Next.js App Router
├── components/     # UI dùng chung
├── state-machine/  # XState machines (scheduler, games)
├── views/          # Màn hình theo tính năng
├── states/         # Zustand stores
├── hooks/          # Custom hooks
├── server/         # Signaling server (Socket.IO)
└── types/          # TypeScript types
```

## Chạy dev

Yêu cầu Node.js 20+ và npm.

```bash
npm install
cp .env-example .env   # điền các biến cần thiết
npm run dev            # frontend  → http://localhost:3007
npm run signal         # signaling → http://localhost:4001 (terminal khác)
```

Signaling server là process Node riêng, chỉ trao đổi room code và offer/answer WebRTC cho Caro online (chi tiết: [docs/game-signaling.md](docs/game-signaling.md)). Để thử online: chạy cả hai, mở 2 tab, một tab bấm **Host** lấy room code, tab kia bấm **Guest** và nhập code.

## Scripts

| Lệnh                              | Mô tả                   |
| --------------------------------- | ----------------------- |
| `npm run dev`                     | Chạy Next.js dev        |
| `npm run build` / `npm run start` | Build / chạy production |
| `npm run signal`                  | Chạy signaling server   |
| `npm run eslint`                  | Lint                    |
| `npm run format`                  | Format bằng Prettier    |
| `npm test`                        | Chạy test (Vitest)      |

## Biến môi trường

Xem `.env-example`. `NEXT_PUBLIC_GAME_SIGNAL_URL` (mặc định `http://localhost:4001`) được nhúng vào bundle lúc build nên phải set trước `npm run build`.

## Docker

```bash
docker compose up --build
# web: http://localhost:4004, signal: http://localhost:4005
```

## Deploy

Bản live: https://experiment.peter-present.xyz/ (self-host bằng Docker). Frontend deploy lên Vercel được bình thường; signaling server cần host chạy process Node liên tục (VPS, Fly.io, Railway, Render hoặc `Dockerfile.signal`), rồi set `NEXT_PUBLIC_GAME_SIGNAL_URL` trỏ tới nó.
