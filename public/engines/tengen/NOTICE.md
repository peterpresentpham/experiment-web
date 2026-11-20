# Tengen

`tengen.wasm` (one thread) and `tengen-mt.wasm` (shared memory, several threads) are builds of
**Tengen**, a gomoku/caro engine by SXKA, licensed under the GNU General Public License v3.0 or
later (see `LICENSE` in this folder).

- Source: https://github.com/SXKA/tengen
- Commit: `dc6f96c09b8870740b1aa413e231585e935788e2`
- Changes: `experiment-web.patch` in this folder (adds `tg_think_dynamic`, Rapfi-style time
  management for the WebAssembly build).

Build (Rust stable with the `wasm32-unknown-unknown` target and the `rust-src` component), from
the Tengen checkout with the patch applied:

```sh
cargo build -p tengen-wasm --release --target wasm32-unknown-unknown
sh crates/wasm/build-threads.sh target
# target/wasm32-unknown-unknown/release/tengen_wasm.wasm         -> tengen.wasm
# target/threads/wasm32-unknown-unknown/release/tengen_wasm.wasm -> tengen-mt.wasm
```
