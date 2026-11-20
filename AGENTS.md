# AGENTS.md

Rules for working in this repo. For what is where (stack, domains, directories), see
`docs/project-context.md`.

## Priority

When rules conflict:

1. The existing architecture of the feature you are changing
2. This document
3. Your own preference (lowest)

Consistency beats theoretical improvements.

---

## Architecture

- App Router only: no Pages Router, no legacy data-fetching APIs.
- Domains (caro, pikachu, blog, process) are independent: do not merge them into shared
  abstractions. Extract shared code only when it is already reused.
- Keep route files in `src/app/` thin; compose pages in `src/views/`.
- `src/components/` holds reusable UI only, no business logic.
- Game rules, state transitions, queues and data transformations go in `src/services/` (pure
  functions), `src/state-machine/` (XState) or `src/structure/`, never in JSX.
- Do not edit `public/engines/`: rebuild the engines as their `NOTICE.md` says.
- Never import from `ml-data/` in app code.

---

## Code Rules

**Components**

- One primary component per file, one responsibility.
- Over ~200 lines or doing several jobs: extract hooks, subcomponents or logic into `services/`.
- Server Components by default; add `'use client'` only for hooks, browser APIs or interactivity.

**State**

- Extend the pattern the feature already uses (Zustand stays Zustand, XState stays XState). Ask
  before introducing another one.

**TypeScript**

- Reuse types in `src/types/` (or the domain's type file) before adding new ones.
- Names: types start with `T` (`TCaroWinMode`, `TTurn`); component props are `type TProps`.
- Do not rename stable types for style.

**Imports**

- Use the `src/...` alias, not deep relative paths (`../../../`).

**Styling**

- Tailwind first, with existing design tokens and shadcn components.
- Avoid arbitrary values (`w-[37px]`) when a token or utility exists.

**Text (i18n)**

- No hard-coded UI text. Add every string to `src/i18n/messages/<domain>.ts` in **both `en` and
  `vi`**.

**Comments**

- English only: comments, JSDoc/TSDoc, TODO/FIXME and notes. No Vietnamese or mixed language.
- Explain intent, constraints, business rules and non-obvious decisions; do not repeat the code.

---

## Changes

Make the smallest change that solves the problem, fits the existing architecture, preserves
behavior and stays easy to maintain.

- No module rewrites, large abstractions or architecture changes unless asked.
- Refactor only when it clearly improves maintainability, reuse or readability.
- When business logic changes, update or add tests in `src/__tests__/<domain>/` (Vitest for logic,
  Testing Library for UI).

---

## Validation

Before finishing:

| When                                            | Run                                              |
| ----------------------------------------------- | ------------------------------------------------ |
| Always                                          | The related tests: `pnpm test <path or pattern>` |
| Any `.ts`/`.tsx` change                         | `pnpm exec tsc --noEmit` and `pnpm eslint`       |
| Config, routes, workers or dependencies changed | `pnpm build`                                     |

Report failures as they are; do not claim a check you did not run.

---

## Dev Server

- Run the dev server on port **3007** (`pnpm dev`).
- Never use ports 3000/3001 and never kill all `next dev` processes: other projects run there.
- Stop any server you started when you are done.

---

## Git

- Never commit unless the user explicitly asks in that message. A plan step or "go ahead" is not
  a request to commit.
- The same goes for branching to commit, amending, rebasing and pushing. Never force-push or
  rewrite pushed history.
- When work is done, summarise what changed and how it was checked, then ask whether to commit.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
