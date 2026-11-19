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
