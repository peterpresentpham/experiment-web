# Experiment Web - Advanced Playground

A sophisticated experimental playground showcasing high-performance web engineering, complex state management, and real-time visualization. Built with a premium stack featuring **Next.js 16**, **React 19**, and **XState 5**.

## 🖥️ Process Management System

A robust simulation of a modern operating system's process scheduling and execution environment.

- **MLFQ Scheduler**: Robust implementation of a **Multi-Level Feedback Queue** algorithm with dynamic priority aging and preemption.
- **CPU Core Dashboard**: Real-time visual monitoring of CPU cores, showing active process execution, idle states, and core utilization metrics.
- **System Terminal Log**: Animated, auto-scrolling terminal capturing the full history of process state transitions and execution events.
- **Process Lifecycle**: Full simulation of process states: `NEW` ➔ `READY` ➔ `RUNNING` ➔ `WAITING` ➔ `TERMINATED`.

## 🎮 Experimental Games

High-quality game implementations focusing on complex logic and interactive user experiences.

- **Caro (Tic-Tac-Toe)**: A feature-rich implementation with multiple competitive modes and optimized game-state management.
- **Connect4**: Tactical strategy game featuring a sophisticated win-detection engine and smooth piece-drop animations.
- **Pikachu**: Dynamic tile-matching puzzle system with complex board transformations and pathfinding logic.

## 🛠️ Modern Utilities & Web3

Cutting-edge tools and integrations for the decentralized and secure web.

- **Web3 Ecosystem**: Seamless wallet integration across Solana and EVM chains using the **Reown AppKit** (formerly WalletConnect).
- **Security Tools (Crypt)**: Professional-grade text encryption and decryption utility powered by `crypto-js`.

---

## 💻 Technical Excellence

This project leverages a cutting-edge stack to ensure speed, type safety, and a premium developer experience.

### Core Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Logic**: [XState 5](https://stately.ai/) (Complex state orchestration)
- **State**: [Zustand](https://github.com/pmndrs/zustand) (Global state)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### UI & Aesthetics

- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide](https://lucide.dev/) & Iconsax

---

## 📂 Project Structure

```bash
src/
├── app/            # Next.js App Router (Pages & API)
├── components/     # Reusable UI system & Design tokens
├── state-machine/  # XState machine definitions (Scheduler & Games)
├── views/          # Feature-specific dashboards and views
├── states/         # Zustand global stores
├── hooks/          # Custom hooks for real-time state & logic
└── types/          # Strict TypeScript definitions
```

## 🛠 Getting Started

### Prerequisites

Ensure you have [Node.js 20+](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed.

### Installation & Development

```bash
git clone https://github.com/phamhongphuc1999/experiment-web
cd experiment-web
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the playground. (Any
package manager works the same way — `yarn`/`yarn dev`, `npm install`/`npm run dev`,
etc.; the repo's lockfile is `yarn.lock`.)

## 🔌 Caro / Connect4 real-time server (Socket.IO signaling)

The Caro and Connect4 online modes connect two browsers peer-to-peer via WebRTC
(`simple-peer`). To set up that connection automatically (no manual copy-paste of
connection data), the app talks to a small, **standalone Socket.IO signaling server**
(`signaling-server.mjs` → `src/server/signaling.mjs`) on the `/game-signal` namespace,
which only relays a short-lived room code and the WebRTC offer/answer between the two
players — actual game moves/chat always flow directly peer-to-peer afterwards, never
through this server.

This signaling server is a **separate process from the Next.js app** — plain Node +
Socket.IO, no dependency on Next.js at all. That means the frontend runs with the
standard `next dev` / `next start` commands, and the signaling server is started with
its own command, independently:

```bash
bun run dev      # Next.js frontend only — http://localhost:3000
bun run signal   # Signaling server only  — http://localhost:4001
```

Run both (in two terminals) to try a full Caro online match locally: open two browser
tabs/windows against `http://localhost:3000`, click **Host** in one to get a room code,
then **Guest** in the other and enter that code to connect. The frontend finds the
signaling server via the `NEXT_PUBLIC_GAME_SIGNAL_URL` env var (defaults to
`http://localhost:4001` in `.env-example`) — if you run the signaling server on a
different port/host, update this accordingly.

For a production-like run:

```bash
bun run build
bun run start    # Next.js frontend
bun run signal   # signaling server, in another terminal/process
```

Or via Docker (two services, matching how the app is self-hosted in production):

```bash
docker compose up --build
# frontend: http://localhost:4004
# signaling server: http://localhost:4005
```

`docker-compose.yaml` builds `web` from `Dockerfile` (the Next.js app) and `signal`
from `Dockerfile.signal` (a minimal Node image with just the signaling server), and
passes `NEXT_PUBLIC_GAME_SIGNAL_URL` as a **build arg** to `web` — this env var is
inlined into the browser bundle at build time, so it must be set before `next build`
runs, not just as a runtime container variable.

## 📜 Deployment

The project is live at: [https://experiment.peter-present.xyz/](https://experiment.peter-present.xyz/),
self-hosted from the `Dockerfile`/`Dockerfile.signal`/`docker-compose.yaml` above,
each running as a normal long-lived Node process.

### Deploying on Vercel

Because the signaling server is now a fully independent process with no dependency on
Next.js, the frontend needs **no custom server** and deploys to Vercel exactly like any
other Next.js app — `next build`/`vercel deploy` work out of the box, no special
configuration required for the app itself.

The signaling server (`signaling-server.mjs`) still needs to run somewhere that keeps a
persistent Node process alive — Vercel's serverless Functions don't fit that model as
implemented here. So:

1. Run the signaling server on a host that supports a long-lived process — a small VPS,
   Fly.io, Railway, Render, or by deploying `Dockerfile.signal` from this repo. It
   exposes the `/game-signal` Socket.IO namespace with an open CORS policy (safe here,
   since it carries no auth — only ephemeral room codes and WebRTC signaling payloads).
2. In the Vercel project settings, add the build-time environment variable:
   ```
   NEXT_PUBLIC_GAME_SIGNAL_URL=https://your-signaling-host.example.com
   ```
3. Deploy the Next.js app to Vercel as usual (`vercel deploy` / Git integration). The
   browser will connect to that URL for signaling while everything else is served by
   Vercel.

A fully Vercel-native alternative — rewriting the signaling relay with Vercel
Functions' native WebSocket support (Fluid Compute, `experimental_upgradeWebSocket()`
from `@vercel/functions`) instead of a standalone Socket.IO server — is possible but not
implemented in this repo yet.
