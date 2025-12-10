import { AVATAR_WASM_BINARY } from "./wasmBinary";

export interface AvatarWasmExports {
  /**
   * Simple tone adjustment function implemented in WebAssembly.
   * It takes a single 0-255 channel value and returns an adjusted value.
   */
  adjust_channel(value: number): number;
}

let wasmExportsPromise: Promise<AvatarWasmExports> | null = null;

async function instantiateWasm(): Promise<AvatarWasmExports> {
  if (typeof WebAssembly === "undefined") {
    throw new Error("WebAssembly is not available in this environment");
  }

  const { instance } = await WebAssembly.instantiate(AVATAR_WASM_BINARY, {});

  return instance.exports as unknown as AvatarWasmExports;
}

/**
 * Lazily instantiate and cache the avatar WebAssembly module.
 *
 * This helper is safe to call multiple times; it will reuse a single
 * underlying WebAssembly.Instance.
 */
export function getAvatarWasm(): Promise<AvatarWasmExports> {
  if (!wasmExportsPromise) {
    wasmExportsPromise = instantiateWasm();
  }

  return wasmExportsPromise;
}
