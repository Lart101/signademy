// lib/model-cache-context.tsx — React context for model cache state
"use client";

import * as React from "react";
import {
  getModelCacheStatus,
  getTotalCacheSize,
  type ModelCacheEntry,
} from "./model-cache";

interface ModelCacheContextValue {
  /** Current cache status of all models */
  entries: ModelCacheEntry[];
  /** Total cached size in bytes */
  totalSize: number;
  /** Number of cached models */
  cachedCount: number;
  /** Total number of models */
  totalCount: number;
  /** Whether we're currently loading cache status */
  loading: boolean;
  /** Refresh cache status (call after download/delete) */
  refresh: () => Promise<void>;
}

const ModelCacheContext = React.createContext<ModelCacheContextValue>({
  entries: [],
  totalSize: 0,
  cachedCount: 0,
  totalCount: 0,
  loading: true,
  refresh: async () => {},
});

export function useModelCache() {
  return React.useContext(ModelCacheContext);
}

export function ModelCacheProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<ModelCacheEntry[]>([]);
  const [totalSize, setTotalSize] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [status, size] = await Promise.all([
        getModelCacheStatus(),
        getTotalCacheSize(),
      ]);
      setEntries(status);
      setTotalSize(size);
    } catch (err) {
      console.error("Failed to load model cache status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const cachedCount = entries.filter((e) => e.cached).length;
  const totalCount = entries.length;

  return (
    <ModelCacheContext.Provider
      value={{ entries, totalSize, cachedCount, totalCount, loading, refresh }}
    >
      {children}
    </ModelCacheContext.Provider>
  );
}
