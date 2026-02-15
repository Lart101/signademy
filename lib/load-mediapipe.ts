// lib/load-mediapipe.ts
// Loads MediaPipe vision module via dynamic import to avoid Turbopack
// intercepting the import() call. Includes retry + fallback CDN logic.

const MEDIAPIPE_CDN = process.env.NEXT_PUBLIC_MEDIAPIPE_CDN!;
const MEDIAPIPE_WASM = process.env.NEXT_PUBLIC_MEDIAPIPE_WASM!;

// Fallback CDNs in case the primary (jsdelivr) is down or connection-resets
const FALLBACK_CDNS = [
  MEDIAPIPE_CDN,
  "https://unpkg.com/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs",
  "https://esm.sh/@mediapipe/tasks-vision@0.10.3",
];

const FALLBACK_WASM_PATHS = [
  MEDIAPIPE_WASM,
  "https://unpkg.com/@mediapipe/tasks-vision@0.10.3/wasm",
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
];

// Validate required env vars
if (typeof window !== "undefined" && (!MEDIAPIPE_CDN || !MEDIAPIPE_WASM)) {
  console.error(
    "[Signademy] Missing NEXT_PUBLIC_MEDIAPIPE_CDN or NEXT_PUBLIC_MEDIAPIPE_WASM env vars. " +
    "Check your .env.local file."
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedVision: any = null;
let loadingPromise: Promise<unknown> | null = null;
let resolvedWasmPath: string = MEDIAPIPE_WASM;

/** Small delay helper for retry backoff */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Attempt to dynamically import a URL using the Function constructor
 * so Turbopack won't statically analyze it.
 */
async function tryImport(url: string): Promise<unknown> {
  const dynamicImport = new Function(
    "url",
    "return import(url)"
  ) as (url: string) => Promise<unknown>;
  return dynamicImport(url);
}

/**
 * Load the MediaPipe tasks-vision module from CDN with retry + fallback.
 * Tries each CDN with up to 2 retries (exponential backoff) before
 * moving to the next fallback.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadMediaPipeVision(): Promise<any> {
  if (cachedVision) return cachedVision;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const MAX_RETRIES = 2;
    const errors: string[] = [];

    for (let cdnIndex = 0; cdnIndex < FALLBACK_CDNS.length; cdnIndex++) {
      const cdnUrl = FALLBACK_CDNS[cdnIndex];
      if (!cdnUrl) continue;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
            console.log(
              `[Signademy] Retry ${attempt}/${MAX_RETRIES} for MediaPipe from: ${cdnUrl}`
            );
            await delay(backoff);
          }

          cachedVision = await tryImport(cdnUrl);
          resolvedWasmPath = FALLBACK_WASM_PATHS[cdnIndex] || MEDIAPIPE_WASM;

          if (cdnIndex > 0) {
            console.log(
              `[Signademy] MediaPipe loaded from fallback CDN: ${cdnUrl}`
            );
          }
          return cachedVision;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${cdnUrl} (attempt ${attempt + 1}): ${msg}`);
        }
      }
    }

    // All CDNs + retries exhausted
    loadingPromise = null;
    throw new Error(
      `[Signademy] Failed to load MediaPipe from all CDNs.\n` +
      errors.map((e) => `  • ${e}`).join("\n")
    );
  })();

  return loadingPromise;
}

/**
 * Returns the WASM path matching whichever CDN successfully loaded.
 */
export function getMediaPipeWasm(): string {
  return resolvedWasmPath;
}

export { MEDIAPIPE_WASM };
