# Caro "Hell" level — engines, network and data

The hell level (`Địa ngục`) is played by engines that run in the browser. For each machine move
`src/services/caro-tengen/player.ts` tries, in this order:

1. a **lesson** from an earlier lost game, then the **opening book** (blocked-ends rule only);
2. **Rapfi** (WebAssembly, both rules): the engine that plays almost every move;
3. **Tengen** (WebAssembly) while Rapfi is still downloading, when Rapfi does not answer or
   fails, or where it cannot run;
4. the **hard search** (`search`), when Tengen has no answer either;
5. the **network** below (`network`), only when no engine can run in the browser at all.

The sections after 3 cover the engines, the opening book, the games stored from the deployed site
and the phone checks. Sections 1–3 train the network, which is now just the last fallback.

The network (`src/services/caro-hell`) is a small AlphaZero-style one: a fully convolutional
residual net (64 filters × 6 blocks, ~450k parameters) that outputs a move policy and a win
estimate, guided by PUCT tree search and wrapped in the classic engine's exact tactics (five,
forced block, VCF, and a VCF safety check).

Until `public/models/caro-hell/model.json` exists, the network plays like **Hard**. Once a model
is deployed, a browser that has to use it fine-tunes its own copy after each hell game (IndexedDB,
`indexeddb://caro-hell-*`), replaying recent games so it does not forget; "Clear memory" resets
it. Only a browser where both engines failed to load fine-tunes it, since only there is the
network played.

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

## Rapfi and Tengen: the engines the hell level plays

Since the network plateaued around "a bit stronger than Hard", the hell level plays engines
compiled to WebAssembly. The site sends cross-origin isolation headers (`next.config.ts`) so they
can search on several threads.

- **[Rapfi](https://github.com/dhbloo/rapfi)** (GPL-3.0, `public/engines/rapfi/`, with its NOTICE,
  licence and our patch) plays both rules, thinking 2 s a move (`RAPFI_TURN_MS`). Our patch adds a
  caro rule (`INFO rule 8`) for the blocked-ends rule. The free rule uses Rapfi's own network. The
  blocked-ends rule plays the **classical evaluation**: the caro network of
  `public/models/caro-rapfi/` is switched off (`CARO_NETWORK_ENABLED` in
  `src/services/caro-rapfi/browser.ts`), because the shipped one loses to the classical evaluation
  since the rule fix. When Rapfi has not answered 6 s after its time, Tengen plays that move; Rapfi
  plays again once its late answer arrives.
- **[Tengen](https://github.com/SXKA/tengen)** (GPL-3.0, `public/engines/tengen/`) is the
  fallback. It is small and ready in a moment, so it plays the first moves while Rapfi's files
  download, and it takes over when Rapfi fails or cannot run.
  `src/services/caro-tengen/engine.ts` picks its thread count and measures the device to set its
  time per move.

The `source` of each move in the stored games (below) tells which part played it: a game with
`tengen` moves is one where Rapfi was missing at that moment.

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

`tengen-book` is Tengen behind the opening book. The blocked-ends hell level as the browser
plays it is `rapfi-classical-book`: the book, then Rapfi with its classical evaluation. The
variant `rapfi-caro-book` adds the caro network (`rapfi-caro` copies `public/models/caro-rapfi/`
next to the native Rapfi), which the browser has switched off. To compare two books, pass
`--book <file>`; lost games go to `ml-data/caro-hell/defense/` with the defender's last book move:

```bash
nice node --import tsx scripts/caro-hell/defense-match.ts --defender rapfi-classical-book --attacker rapfi-classical --size 20 --games 40 --workers 2
```

### The opening book

`opening-book.ts` builds `public/models/caro-book/opening-block.json` with a long native search of
Rapfi: by default with the caro network (`--engine rapfi-caro`), or with its classical evaluation
(`--engine rapfi-classical`, which is what the browser plays while the network is switched off)
or with Tengen (`--engine tengen`). The `meta` of the book file records the engine and settings
that built it. Each entry keeps the moves within `--margin` of the best (multi-PV), one of which
the machine picks at random, so a line that beat it once does not win again:

```bash
nice node --import tsx scripts/caro-hell/opening-book.ts --depth 3 --radius 2 --time 5000 --threads 2 --workers 3
```

When the machine moves second, a player who moves first and plays well wins, so its first two
replies decide how hard that win is to find. `book-deepen.ts` re-chooses them with longer
searches (30 s for the candidates, 15 s for the player's answer to each), preferring replies the
player has no forced win against; run `opening-book.ts` again afterwards to fill in the
positions they lead to. `book-check.ts` measures a book where it ends (matches cannot: moving
first wins almost every engine game here):

```bash
nice node --import tsx scripts/caro-hell/book-deepen.ts --stones 3
nice node --import tsx scripts/caro-hell/book-check.ts --player strong --samples 60
```

The plan for further work is in `docs/plans/caro-tengen-roadmap.md`.

## Games from the deployed site

Finished hell-level games are posted anonymously (moves, rule, result only) to `/api/caro/games`
and stored in a Vercel Blob store, one file per game: `caro-games/<hash>.json`.

Each game also carries a `timing` record, to find what makes the machine slow on players'
devices:

- the device kind (`ios`, `android` or `desktop`; nothing else about it) and the thread count;
- when each engine finished loading (`loaded`, in ms after the level was picked; -1 means it
  failed);
- every machine move: its time as the player waited for it, which part chose it (`lesson`,
  `book`, `rapfi`, `tengen` (Rapfi was not there to answer), `search` (the hard search, when
  Tengen had no answer) or `network`), and whether the previous game was still being analysed
  meanwhile.

A game the player left (page closed or hidden) after a machine move of 10 s or more is posted
too, unfinished. Such a game has `winner: null`, and `timing.waitingMs` holds how long the
unanswered move had waited.

1. Vercel dashboard → Storage → Create → Blob, **private**, connected to the project. Vercel sets
   `BLOB_STORE_ID` and signs in with OIDC (older stores set `BLOB_READ_WRITE_TOKEN`). With
   neither, the route answers 404 and stores nothing.
2. Download them: `vercel env pull .env.local`, then `pnpm caro:fetch-games` (into
   `ml-data/caro-games/prod/`; games already there are skipped). The OIDC token expires after a
   few hours: pull again.

## Checking the machine on phones

`docs/plans/caro-mobile-risks.md` lists what made the machine slow or stuck on phones and the
checks K0-K9 that prove each one gone. The browser checks (K1-K9) drive Chrome with a phone's
screen and user agent against a production build:

```bash
pnpm build && pnpm exec next start -p 3007
taskpolicy -b pnpm caro:mobile-check --slow-cpu --baseline-url https://the-deployed-site   # all, ~30 min
pnpm caro:mobile-check --only K9      # the interface delay, on the normal cores
taskpolicy -b pnpm caro:mobile-check --slow-cpu --only K1,K3
```

`taskpolicy -b` keeps Chrome on the efficiency cores, nearer a phone, but there headless Chrome,
which draws pages on the CPU, shows long tasks on any page (even without the engines), so
`--slow-cpu` reports K9's interface delay without judging it. Each check prints ĐẠT
(passed), TRƯỢT (failed) or BỎ QUA (skipped) with its numbers; `--baseline-url` gives K5 the
build to compare memory with. Set `CHROME_PATH` when Chrome is not in `/Applications`.
