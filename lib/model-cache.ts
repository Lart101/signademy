// lib/model-cache.ts — Browser Cache API manager for AI model files
// Uses the Cache API so models persist across sessions and page reloads.
// Falls back gracefully if the Cache API is unavailable.

import { MODEL_URLS, MODEL_DISPLAY_NAMES } from "./ai-models";

const CACHE_NAME = "signademy-models-v1";

export interface ModelCacheEntry {
  key: string;
  displayName: string;
  url: string;
  cached: boolean;
  size: number | null; // bytes, null if not cached
}

export interface DownloadProgress {
  model: string;
  loaded: number;
  total: number;
  percent: number;
}

// ─── Helpers ───────────────────────────────────────

function cacheAvailable(): boolean {
  return typeof caches !== "undefined";
}

async function openCache(): Promise<Cache | null> {
  if (!cacheAvailable()) return null;
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

// ─── Public API ────────────────────────────────────

/**
 * Check if a specific model is already cached.
 */
export async function isModelCached(category: string): Promise<boolean> {
  const cache = await openCache();
  if (!cache) return false;
  const url = MODEL_URLS[category];
  if (!url) return false;
  const match = await cache.match(url);
  return !!match;
}

/**
 * Get the cached ArrayBuffer for a model (for passing to MediaPipe).
 * Returns null if not cached.
 */
export async function getCachedModelBuffer(
  category: string
): Promise<ArrayBuffer | null> {
  const cache = await openCache();
  if (!cache) return null;
  const url = MODEL_URLS[category];
  if (!url) return null;
  const response = await cache.match(url);
  if (!response) return null;
  return response.arrayBuffer();
}

/**
 * Download and cache a single model. Returns the ArrayBuffer.
 * Calls `onProgress` with download progress if provided.
 */
export async function downloadAndCacheModel(
  category: string,
  onProgress?: (progress: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<ArrayBuffer> {
  const url = MODEL_URLS[category];
  if (!url) throw new Error(`Unknown model category: ${category}`);

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to download model ${category}: ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  const reader = response.body?.getReader();

  if (!reader) {
    // Fallback: no streaming support
    const buffer = await response.arrayBuffer();
    await cacheBuffer(url, buffer);
    return buffer;
  }

  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress?.({
      model: category,
      loaded,
      total: contentLength,
      percent: contentLength ? Math.round((loaded / contentLength) * 100) : 0,
    });
  }

  // Combine chunks into a single ArrayBuffer
  const combined = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  const buffer = combined.buffer;
  await cacheBuffer(url, buffer);
  return buffer;
}

/** Internal: put an ArrayBuffer into the cache */
async function cacheBuffer(url: string, buffer: ArrayBuffer): Promise<void> {
  const cache = await openCache();
  if (!cache) return;
  const response = new Response(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(buffer.byteLength),
      "X-Cached-At": new Date().toISOString(),
    },
  });
  await cache.put(url, response);
}

/**
 * Get a model buffer — tries cache first, then downloads and caches.
 * This is the main function pages should use instead of passing URLs directly.
 */
export async function getModelBuffer(
  category: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<ArrayBuffer> {
  const cached = await getCachedModelBuffer(category);
  if (cached) return cached;
  return downloadAndCacheModel(category, onProgress);
}

/**
 * Download and cache a model from a custom URL (not in MODEL_URLS).
 * Uses the custom URL as the cache key.
 */
export async function downloadAndCacheCustomModel(
  customUrl: string,
  displayName: string,
  onProgress?: (progress: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<ArrayBuffer> {
  const cache = await openCache();
  
  // Check if already cached
  if (cache) {
    const response = await cache.match(customUrl);
    if (response) {
      console.log(`✅ Custom model loaded from cache: ${displayName}`);
      return response.arrayBuffer();
    }
  }

  // Download with progress tracking
  const response = await fetch(customUrl, { signal });
  if (!response.ok) {
    throw new Error(`Failed to download custom model ${displayName}: ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  const reader = response.body?.getReader();

  if (!reader) {
    // Fallback: no streaming support
    const buffer = await response.arrayBuffer();
    await cacheBuffer(customUrl, buffer);
    console.log(`✅ Custom model cached: ${displayName}`);
    return buffer;
  }

  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress?.({
      model: displayName,
      loaded,
      total: contentLength,
      percent: contentLength ? Math.round((loaded / contentLength) * 100) : 0,
    });
  }

  // Combine chunks
  const combined = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  const buffer = combined.buffer;
  await cacheBuffer(customUrl, buffer);
  console.log(`✅ Custom model cached: ${displayName}`);
  return buffer;
}

/**
 * Get a custom model buffer from cache, or null if not cached.
 */
export async function getCachedCustomModelBuffer(
  customUrl: string
): Promise<ArrayBuffer | null> {
  const cache = await openCache();
  if (!cache) return null;
  const response = await cache.match(customUrl);
  if (!response) return null;
  return response.arrayBuffer();
}

/**
 * Download ALL models and cache them.
 * Calls onProgress for each model being downloaded, and onModelComplete when each finishes.
 */
export async function downloadAllModels(options?: {
  onProgress?: (progress: DownloadProgress) => void;
  onModelComplete?: (category: string, index: number, total: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const categories = Object.keys(MODEL_URLS);
  for (let i = 0; i < categories.length; i++) {
    if (options?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const category = categories[i];
    const alreadyCached = await isModelCached(category);
    if (!alreadyCached) {
      await downloadAndCacheModel(category, options?.onProgress, options?.signal);
    }
    options?.onModelComplete?.(category, i + 1, categories.length);
  }
}

/**
 * Remove a single model from the cache.
 */
export async function removeCachedModel(category: string): Promise<void> {
  const cache = await openCache();
  if (!cache) return;
  const url = MODEL_URLS[category];
  if (!url) return;
  await cache.delete(url);
}

/**
 * Clear ALL cached models.
 */
export async function clearModelCache(): Promise<void> {
  if (!cacheAvailable()) return;
  await caches.delete(CACHE_NAME);
}

/**
 * Get the status of all models (cached / not cached / size).
 */
export async function getModelCacheStatus(): Promise<ModelCacheEntry[]> {
  const cache = await openCache();
  const entries: ModelCacheEntry[] = [];

  for (const [key, url] of Object.entries(MODEL_URLS)) {
    let cached = false;
    let size: number | null = null;

    if (cache) {
      const response = await cache.match(url);
      if (response) {
        cached = true;
        const lengthHeader = response.headers.get("content-length");
        if (lengthHeader) {
          size = Number(lengthHeader);
        } else {
          // Read the body to get the size
          const blob = await response.blob();
          size = blob.size;
        }
      }
    }

    entries.push({
      key,
      displayName: MODEL_DISPLAY_NAMES[key] || key,
      url,
      cached,
      size,
    });
  }

  return entries;
}

/**
 * Get total cache size in bytes.
 */
export async function getTotalCacheSize(): Promise<number> {
  const entries = await getModelCacheStatus();
  return entries.reduce((sum, e) => sum + (e.size || 0), 0);
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
