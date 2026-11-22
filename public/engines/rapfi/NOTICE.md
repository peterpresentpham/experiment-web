# Rapfi

`rapfi-multi-simd128.{js,wasm}` (shared memory, several threads) and
`rapfi-single-simd128.{js,wasm}` (one thread) are WebAssembly builds of **Rapfi**, a gomoku/renju
engine by dhbloo and contributors, licensed under the GNU General Public License v3.0 (see
`LICENSE` in this folder). The caro hell level plays it in both rules.

- Source: https://github.com/dhbloo/rapfi
- Commit: `1387d11312190ec66665d361ff07a7c70221b78a`
- Changes (`experiment-web.patch` in this folder):
  - a caro rule (`Rule::CARO`, protocol `INFO rule 8`): five or more in a row wins unless both
    cells past the run hold opponent stones; the board edge does not block. Its line patterns
    were checked against the app's rule on every 11-cell line. Its classical tables and search
    parameters start as copies of freestyle's; the model file format is unchanged. Under this rule
    one stone can stop several fives (a stone past a run closes it at both ends), so a four is
    open only when no single stone stops all its fives, and the defences against a five, a
    flex-four threat and a four-three are found by trying the cells on the threat's lines rather
    than by the freestyle shapes (fixed 2026-11-22: before, the engine announced mates that did
    not exist and missed defences such as capping an open three two cells away);
  - the build can preload another set of network files (`NETWORKS_DIR`).

`rapfi.data` holds the files preloaded into the engine, listed in `networks/wasm_preloads.txt`:

- `config.toml`: `networks/config.toml`, the Gomocalc mix9svq config with only the free-rule
  network and Piskvork coordinates (`coord_conversion_mode = "none"`); under caro no network
  matches, so the classical evaluation plays;
- `model210901.bin` (classical evaluation) and `mix9svqfreestyle_bsmix.bin.lz4` (NNUE), from
  https://github.com/dhbloo/rapfi-networks at commit `7eeb19b55219a48138756293f92211a1539bab4d`,
  released under CC0 1.0 (`NETWORKS-LICENSE`).

Build (Emscripten 4.0.10, CMake, Ninja), from the Rapfi checkout with the patch applied and the
three files above plus `wasm_preloads.txt` in a folder `$NETWORKS`:

```sh
cd Rapfi && mkdir -p build/wasm-multi-simd128 && cd build/wasm-multi-simd128
emcmake cmake ../.. -G Ninja -DCMAKE_BUILD_TYPE=Release -DNO_COMMAND_MODULES=ON \
  -DUSE_WASM_SIMD=ON -DUSE_WASM_SIMD_RELAXED=OFF -DNETWORKS_DIR=$NETWORKS \
  -DCMAKE_EXE_LINKER_FLAGS="-sEXPORT_ES6=1"
ninja
# The same with -DNO_MULTI_THREADING=ON in build/wasm-single-simd128.
# rapfi-multi-simd128.data and rapfi-single-simd128.data are identical -> rapfi.data
```

Measured natively before adoption: Rapfi with this network, one thread, against Tengen in the free
rule at 300 ms a move, from balanced openings: 88 wins, 1 draw, 11 losses (+354 ± 107 Elo).
