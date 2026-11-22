# Caro "Hell" level — training the network

The hell level (`Địa ngục`) plays with a small AlphaZero-style network
(`src/services/caro-hell`): a fully convolutional residual net (64 filters × 6 blocks, ~450k
parameters) that outputs a move policy and a win estimate, guided by PUCT tree search and wrapped
in the classic engine's exact tactics (five, forced block, VCF, and a VCF safety check).

Until `public/models/caro-hell/model.json` exists, the hell level plays like **Hard**. Once a
model is deployed, every browser fine-tunes its own copy after each hell game (IndexedDB,
`indexeddb://caro-hell-*`), replaying recent games so it does not forget; "Clear memory" resets it.

## 1. One-off setup: native TensorFlow (CPU, no GPU needed)

```bash
pnpm hell:setup
```

Compiles TensorFlow's Node binding (needs `xcode-select --install` and python3). Without it the
scripts fall back to pure JavaScript, where one training step takes minutes instead of 0.6 s —
not usable. pnpm skips this build on purpose (`pnpm-workspace.yaml`) to keep Vercel lean; run
the setup again after a fresh `pnpm install`.

## 2. Train: one resumable command

```bash
pnpm hell:run                         # half the cores, lowest CPU priority
pnpm hell:run --threads 2 --rest 1    # gentle: 2 cores, rests as long as it works
pnpm hell:run --hours 3               # stops by itself after 3 hours
pnpm hell:run --until 07:30           # stops by itself at 07:30
pnpm hell:run --patience 20           # give up only after 20 rounds in a row without progress
pnpm hell:status                      # where it is, without running anything
```

**Stop whenever you like** — Ctrl+C (it finishes the current step and saves; a second Ctrl+C
two seconds later quits at once), `--hours`/`--until`, or even closing the laptop lid. Run the
same command again and it continues where it left off. Even a hard kill loses at most a couple of
hundred training steps or one game: checkpoints (weights **and** optimizer state) are written
every 200 steps to `ml-data/caro-hell/checkpoints/`, and every finished game is appended to disk.

The run goes through three stages on its own:

| Stage               | What happens                                                                                 | Default size | Time at 4 threads (M1 Pro) |
| ------------------- | -------------------------------------------------------------------------------------------- | ------------ | -------------------------- |
| 1. teacher          | the hard engine plays itself                                                                 | 3000 games   | ~2 h                       |
| 2. pretrain         | the network imitates it, then is deployed                                                    | 15000 steps  | ~3 h                       |
| 3. self-play rounds | play 40 games with tree search → train 1000 steps → arena vs the deployed network (16 games) | forever      | ~35 min per round          |

Stage 3 is where it keeps improving: a round's network replaces the deployed one only if it
scores ≥ 55% in its arena, so the deployed model never gets worse. Leave it running across many
evenings; `pnpm hell:status` shows how many rounds were accepted. `--rest 1` roughly doubles every
time above.

Stage 3 ends by itself once the network stops improving: after `--patience` rounds in a row
(default 10) are rejected, the run stops and says so. Running it again stops straight away; pass a
larger `--patience` to keep trying, or a bigger `--filters`/`--blocks` network (a fresh run) to go
further.

Useful options (see `scripts/caro-hell/run.ts`): `--teacher-games`, `--pretrain-steps`,
`--games`, `--sims`, `--temperature-plies` (opening moves self-play picks at random, default 3), `--round-steps`, `--arena-games`, `--rounds N` (stop after round N), and
`--filters 32 --blocks 4` (smaller, ~4× faster network; only when the run starts).

## 3. Measure

```bash
pnpm hell:arena --games 20 --time 2500   # deployed network vs the hard engine
```

## Deploying

Commit `public/models/caro-hell/` (≈2 MB) whenever you are happy with it. The model's `trainedAt`
metadata changes on every deploy, so browsers drop their old fine-tuned copies and start from the
new base model. `ml-data/` stays local (gitignored); delete it to start over.

Single-purpose tools also exist: `pnpm hell:generate` (teacher games only) and `pnpm hell:train`
(one-off training on recorded games).

## Tengen: the engine the hell level plays

Since the network plateaued around "a bit stronger than Hard", the hell level plays
[Tengen](https://github.com/SXKA/tengen) (GPL-3.0), a classical caro engine compiled to WebAssembly
(`public/engines/tengen/`, with its NOTICE, licence and our patch). The network stays as the
fallback when WebAssembly cannot run. The site sends cross-origin isolation headers
(`next.config.ts`) so the engine can search on several threads; `src/services/caro-tengen/engine.ts`
picks the thread count and measures the device to set the time per move.

To measure engines natively against our players (engines built into `ml-data/engines/bin/`):

```bash
node --import tsx scripts/caro-hell/engine-match.ts --a tengen --b hell --mode block --games 20 --time 2000 --threads 1
```

### Measuring Tengen changes

Under the blocked-ends rule the side that moves first wins almost every engine game from a
near-empty board (80/80 in a test), so plain matches cannot tell two builds apart. Use:

- **SPRT from balanced openings** (`openings/caro-15.txt`, `openings/caro-20.txt`: 400 openings
  each that Tengen, thinking 2 s, judges close to even; made with `tengen-tune openings`):

  ```bash
  sh scripts/caro-hell/tengen-sprt.sh "ml-data/engines/tengen/target/release/pbrain-tengen --weights new.txt"
  ```

- **Defence when moving second** (the hell level's usual situation): the defender always moves
  second against Tengen with more time, whose first moves are random cells near the stones.

  ```bash
  node --import tsx scripts/caro-hell/defense-match.ts --defender tengen-book --defender-time 1000 --attacker-time 4000 --size 15 --games 40
  ```

`tengen-book` is Tengen behind the opening book (`opening-book.ts` builds it into
`public/models/caro-book/`). The plan for further work is in `docs/plans/caro-tengen-roadmap.md`.

## Games from the deployed site

Finished hell-level games are posted anonymously (moves, rule, result only) to `/api/caro/games`
and stored in a Vercel Blob store, one file per game: `caro-games/<hash>.json`.

1. Vercel dashboard → Storage → Create → Blob, **private**, connected to the project. Vercel sets
   `BLOB_STORE_ID` and signs in with OIDC (older stores set `BLOB_READ_WRITE_TOKEN`). With
   neither, the route answers 404 and stores nothing.
2. Download them: `vercel env pull .env.local`, then `pnpm caro:fetch-games` (into
   `ml-data/caro-games/prod/`; games already there are skipped). The OIDC token expires after a
   few hours: pull again.
