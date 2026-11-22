# Tengen

`tengen.wasm` (one thread) and `tengen-mt.wasm` (shared memory, several threads) are builds of
**Tengen**, a gomoku/caro engine by SXKA, licensed under the GNU General Public License v3.0 or
later (see `LICENSE` in this folder).

- Source: https://github.com/SXKA/tengen
- Commit: `dc6f96c09b8870740b1aa413e231585e935788e2`
- Changes: `experiment-web.patch` in this folder:
  - adds `tg_think_dynamic`, Rapfi-style time management for the WebAssembly build;
  - adds `Limits::exclude` and `tg_exclude`, root moves not to play (moves that lost before),
    and `Limits::variety`, `tg_set_variety` and `pbrain-tengen --variety MARGIN[,PLIES]`: a random move
    among those within the margin of the best (the main thread tests every root move that fails
    low against the margin, at the same depth), so games do not repeat;
  - adds `crates/engine/src/weights-freestyle-caro.txt`, evaluation weights for the caro rule
    (Piskvork rule 8, five or more blocked at both ends does not win). They are the freestyle weights
    refined with `tengen-tune fit-local --l2 1e-4` on 40,000 self-play games under that rule, and
    scored +10.8 ± 8.8 Elo against them in 3,100 games at 100 ms a move. Other rules keep the
    original weights.
  - fixes the caro rules (2026-11-22): a four is open only if no single stone stops every five
    (a stone past a run caps it at both ends, so `_xxxx_o` is a block four), a five can be
    answered by such a capping stone and one stone can answer two fives of a line, and defences
    are tried up to five cells from a threat instead of four.
  - makes rule 8 the app's caro rule: five or more wins unless both ends are blocked by stones
    (upstream let six or more win even when blocked).

Build (Rust stable with the `wasm32-unknown-unknown` target and the `rust-src` component), from
the Tengen checkout with the patch applied:

```sh
cargo build -p tengen-wasm --release --target wasm32-unknown-unknown
sh crates/wasm/build-threads.sh target
# target/wasm32-unknown-unknown/release/tengen_wasm.wasm         -> tengen.wasm
# target/threads/wasm32-unknown-unknown/release/tengen_wasm.wasm -> tengen-mt.wasm
```
