# AGENTS.md

## Framework and Environment

This project uses:

- Next.js 16.x (App Router)
- React 19
- TypeScript (`strict: true`)
- Tailwind CSS v4
- Zustand
- React Context
- XState
- Vitest
- Testing Library

All code must follow current Next.js App Router conventions.

Do not introduce:

- Pages Router patterns
- legacy data fetching APIs
- outdated Next.js conventions

Routes must live under:

```txt
src/app/
```

---

# Priority Order

When rules conflict, follow this order:

1. Existing project architecture
2. Existing feature/module conventions
3. Rules in this document
4. Personal preference

Prefer consistency over theoretical improvements.

---

# Project Structure

The repository contains multiple independent domains:

- Caro
- Pikachu
- Process/State Machine Simulator
- Utility Tools

Do not merge unrelated domains into shared abstractions.

Only extract shared code when real reuse exists.

---

# Directory Responsibilities

## Routing

```txt
src/app/
```

Responsibilities:

- routes
- layouts
- metadata
- providers
- guards

Keep route files thin.

---

## Views

```txt
src/views/
```

Responsibilities:

- page composition
- page-level UI

Move large UI trees here instead of route files.

---

## Components

```txt
src/components/
```

Responsibilities:

- reusable UI
- reusable visual primitives

Avoid business logic.

---

## Services

```txt
src/services/
```

Responsibilities:

- pure business logic
- calculations
- transformations
- helpers

Prefer pure functions.

---

## State Machine

```txt
src/state-machine/
```

Responsibilities:

- XState machines
- transition logic
- process simulation logic

Do not move machine logic into React components.

---

## State

```txt
src/states/
src/context/
src/hooks/
```

Responsibilities:

- client state
- providers
- reusable hooks

Follow the existing pattern used by the feature.

---

# Component Rules

Components should:

- have a single responsibility
- stay focused
- be easy to test

Prefer:

```txt
1 file
1 primary component
```

If a component becomes too large:

- extract hooks
- extract subcomponents
- extract business logic

---

# React Rules

Use Client Components only when required.

Add:

```ts
'use client';
```

only when using:

- browser APIs
- React hooks
- interactivity

Default to Server Components.

---

# Business Logic Rules

Keep logic outside render paths whenever possible.

Examples:

- board game rules
- state transitions
- queue logic
- data transformations

These belong in:

```txt
services/
state-machine/
structure/
```

not inside JSX.

---

# TypeScript Rules

## Shared Types

Shared types belong in:

```txt
src/types/
```

or a clearly scoped domain type file.

Reuse existing types before creating new ones.

---

## Naming

Prefer existing project conventions.

Examples:

```ts
TConversation;
TProcessItem;
```

Component props:

```ts
type TProps = {};
```

Do not rename stable types purely for style reasons.

---

# Import Rules

Prefer path aliases:

```ts
import { X } from 'src/...';
```

Avoid deep relative imports:

```ts
../../../
```

when an alias already exists.

---

# Styling Rules

Use Tailwind first.

Prefer:

- design system utilities
- shared UI primitives
- existing shadcn components

Avoid arbitrary values unless necessary.

---

# State Management Rules

Match the architecture already used by the feature.

Examples:

- Zustand area → extend Zustand
- XState area → extend XState

Do not introduce a second pattern without a strong reason.

---

# Comment Standards

All comments must be written in English.

Never introduce:

- Vietnamese comments
- mixed-language comments

Comments should explain:

- intent
- constraints
- business rules
- non-obvious decisions

Avoid comments that merely repeat the code.

---

# Refactoring Rules

Prefer minimal, local changes.

Do not:

- rewrite entire modules
- introduce large abstractions
- change architecture without requirement

Refactor only when it clearly improves:

- maintainability
- reuse
- readability

while preserving behavior.

---

# Testing Rules

When changing business logic:

- update tests
- add tests when missing

Prefer:

- Vitest for logic
- Testing Library for UI behavior

---

# Validation Checklist

Before completing work:

1. Run the narrowest relevant test.
2. Run linting if affected.
3. Run build validation when changes are broad.

Typical commands:

```bash
npm run test -- <pattern>
npm run eslint
npm run build
```

---

# Golden Rule

Make the smallest change that:

- solves the problem
- matches the existing architecture
- preserves current behavior
- remains easy to maintain

# Mandatory Rule

- All source code comments, documentation comments (JSDoc/TSDoc), TODOs, FIXMEs, and notes must be written in English.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
