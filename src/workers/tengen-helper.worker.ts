import type { TTengenHelperSetup } from 'src/services/caro-tengen/engine';

/**
 * A search helper thread for the multi-threaded Tengen build: a second instance of the module on
 * the same shared memory, with its own stack and thread-local storage. It never returns from
 * `tg_helper`.
 */
self.onmessage = async (event: MessageEvent<TTengenHelperSetup>) => {
  const { module, memory, stackTop, tls, id } = event.data;
  const instance = await WebAssembly.instantiate(module, {
    env: {
      memory,
      tg_now: () => performance.timeOrigin + performance.now(),
      tg_info: () => {},
    },
  });
  const exports = instance.exports as unknown as {
    __stack_pointer: WebAssembly.Global;
    __wasm_init_tls(pointer: number): void;
    tg_helper(id: number): void;
  };
  // The instance starts with the main thread's stack pointer; move it to this thread's own
  // stack before running any code.
  exports.__stack_pointer.value = stackTop;
  exports.__wasm_init_tls(tls);
  exports.tg_helper(id);
};
