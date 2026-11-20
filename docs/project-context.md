# Project Context

Background for agents and contributors: what is where. The rules live in `AGENTS.md`.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript (`strict`), Tailwind CSS v4, shadcn/ui,
Zustand, React Context, XState, Vitest, Testing Library. Package manager: pnpm.

Routes live in `src/app/[lang]/`; `src/proxy.ts` adds the locale, so `/caro` serves `/vi/caro` or
`/en/caro`.

## Domains

Independent features, each under `src/app/[lang]/(dashboard)/`:

- **caro**: board game with machine play, online play and the hell-level engine
- **pikachu**: tile-matching game
- **blog**: master thesis web book, `@peter-present/format-number` docs, Rubik guide
- **process**: process/state machine simulator

## Directories

| Path                                        | Contains                                                        |
| ------------------------------------------- | --------------------------------------------------------------- |
| `src/app/`                                  | Routes, layouts, metadata, providers.                           |
| `src/views/`                                | Page composition and page-level UI.                             |
| `src/components/`                           | Reusable UI and primitives (`shadcn/` included).                |
| `src/services/`                             | Business logic: game rules, engines, transformations.           |
| `src/state-machine/`                        | XState machines and transition logic.                           |
| `src/structure/`                            | Generic data structures (`Queue`, `PriorityQueue`).             |
| `src/states/`, `src/context/`, `src/hooks/` | Zustand stores, providers, hooks.                               |
| `src/workers/`                              | Web Workers (e.g. the caro machine search, Tengen helpers).     |
| `src/i18n/`                                 | Locale config and all UI text (`messages/*.ts`).                |
| `src/types/`                                | Shared types.                                                   |
| `src/configs/`, `src/lib/`                  | Static configuration and small shared utilities.                |
| `src/server/`                               | The WebRTC signaling server.                                    |
| `src/__tests__/<domain>/`                   | Tests.                                                          |
| `scripts/`                                  | Offline tools, e.g. `scripts/caro-hell/` (see its README).      |
| `public/engines/`                           | Third-party WebAssembly engines (GPL), each with a `NOTICE.md`. |
| `ml-data/`                                  | Local training data and engine checkouts (gitignored).          |
