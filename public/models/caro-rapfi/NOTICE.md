# Caro network for Rapfi

`caro.bin.lz4` is a mix9svq network for Rapfi's caro rule (blocked ends, `INFO rule 8`), board
sizes 10 to 20, trained in this repository; `config.toml` is the engine config of
`public/engines/rapfi/networks/config.toml` with this network listed after the free-rule one.
The app writes both files into the engine's file system and sends `RELOADCONFIG config-caro.toml`
the first time a blocked-ends game starts (`src/services/caro-rapfi/engine.ts`).

How it was made (iteration 0 of the pipeline in `ml-data/engines/rapfi-train`, not in git):

- training data: 25,600 self-play games of classical Rapfi under the caro rule on
  10x10, 15x15 and 20x20 boards;
- network: mix9s trained with Rapfi's Trainer for 15,000 iterations, then exported with a
  k-means codebook as mix9svq.

Measured natively before adoption: Rapfi with this network against classical Rapfi, caro rule,
15x15, 300 ms a move, 200 games from balanced openings: 125 wins, 8 draws, 67 losses
(+104 ± 42 Elo).
