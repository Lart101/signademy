// app/components/model-cache-manager.tsx — Cache management UI
"use client";

import * as React from "react";
import {
  Download,
  Trash2,
  HardDrive,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  DownloadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useModelCache } from "@/lib/model-cache-context";
import {
  downloadAndCacheModel,
  downloadAllModels,
  removeCachedModel,
  clearModelCache,
  formatBytes,
  type DownloadProgress,
} from "@/lib/model-cache";

export function ModelCacheManager({ children }: { children?: React.ReactNode }) {
  const { entries, totalSize, cachedCount, totalCount, loading, refresh } =
    useModelCache();

  const [open, setOpen] = React.useState(false);
  const [downloadingModel, setDownloadingModel] = React.useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = React.useState(0);
  const [downloadingAll, setDownloadingAll] = React.useState(false);
  const [allProgress, setAllProgress] = React.useState({ done: 0, total: 0 });
  const [currentModelProgress, setCurrentModelProgress] = React.useState(0);
  const [deletingModel, setDeletingModel] = React.useState<string | null>(null);
  const [clearingAll, setClearingAll] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const allCached = cachedCount === totalCount && totalCount > 0;

  // ─── Single model download ──────────────────────
  async function handleDownloadOne(category: string) {
    if (downloadingModel || downloadingAll) return;
    setDownloadingModel(category);
    setDownloadProgress(0);
    try {
      await downloadAndCacheModel(category, (p: DownloadProgress) => {
        setDownloadProgress(p.percent);
      });
      await refresh();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingModel(null);
      setDownloadProgress(0);
    }
  }

  // ─── Download all ───────────────────────────────
  async function handleDownloadAll() {
    if (downloadingAll || downloadingModel) return;
    setDownloadingAll(true);
    setAllProgress({ done: 0, total: totalCount });
    setCurrentModelProgress(0);

    abortRef.current = new AbortController();

    try {
      await downloadAllModels({
        onProgress: (p: DownloadProgress) => {
          setCurrentModelProgress(p.percent);
        },
        onModelComplete: (_category, index, total) => {
          setAllProgress({ done: index, total });
          setCurrentModelProgress(0);
        },
        signal: abortRef.current.signal,
      });
      await refresh();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled
      } else {
        console.error("Download all failed:", err);
      }
    } finally {
      setDownloadingAll(false);
      setAllProgress({ done: 0, total: 0 });
      setCurrentModelProgress(0);
      abortRef.current = null;
      await refresh();
    }
  }

  function handleCancelAll() {
    abortRef.current?.abort();
  }

  // ─── Delete single model ───────────────────────
  async function handleDeleteOne(category: string) {
    setDeletingModel(category);
    try {
      await removeCachedModel(category);
      await refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingModel(null);
    }
  }

  // ─── Clear all ─────────────────────────────────
  async function handleClearAll() {
    setClearingAll(true);
    try {
      await clearModelCache();
      await refresh();
    } catch (err) {
      console.error("Clear cache failed:", err);
    } finally {
      setClearingAll(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="relative">
            <HardDrive className="size-5" />
            {cachedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                {cachedCount}
              </span>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="size-5" />
            AI Model Cache
          </DialogTitle>
          <DialogDescription>
            Download models for instant offline loading. Cached models load
            significantly faster and work without re-downloading.
          </DialogDescription>
        </DialogHeader>

        {/* Summary bar */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {cachedCount}/{totalCount} models cached
            </span>
            <span className="text-xs text-muted-foreground">
              {totalSize > 0 ? formatBytes(totalSize) : "No data cached"}
            </span>
          </div>
          <div className="flex gap-2">
            {!allCached && (
              <Button
                size="sm"
                onClick={handleDownloadAll}
                disabled={downloadingAll || !!downloadingModel || loading}
              >
                {downloadingAll ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <DownloadCloud className="mr-1 size-4" />
                )}
                {downloadingAll ? "Downloading…" : "Download All"}
              </Button>
            )}
            {cachedCount > 0 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClearAll}
                disabled={clearingAll || downloadingAll || !!downloadingModel}
              >
                {clearingAll ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 size-4" />
                )}
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Download all progress */}
        {downloadingAll && (
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Downloading {allProgress.done}/{allProgress.total}…
              </span>
              <Button size="sm" variant="ghost" onClick={handleCancelAll}>
                <XCircle className="mr-1 size-4" />
                Cancel
              </Button>
            </div>
            <Progress
              value={
                allProgress.total > 0
                  ? ((allProgress.done / allProgress.total) * 100 +
                      currentModelProgress / allProgress.total)
                  : 0
              }
            />
          </div>
        )}

        <Separator />

        {/* Model list */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            entries.map((entry) => {
              const isDownloading = downloadingModel === entry.key;
              const isDeleting = deletingModel === entry.key;

              return (
                <div
                  key={entry.key}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {entry.cached ? (
                      <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <span className="text-sm font-medium">
                        {entry.displayName}
                      </span>
                      <div className="flex items-center gap-2">
                        {entry.cached && entry.size != null && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {formatBytes(entry.size)}
                          </Badge>
                        )}
                        {entry.cached && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-200">
                            Cached
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isDownloading && (
                      <div className="w-16 mr-2">
                        <Progress value={downloadProgress} className="h-1.5" />
                      </div>
                    )}
                    {entry.cached ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteOne(entry.key)}
                        disabled={isDeleting || downloadingAll}
                      >
                        {isDeleting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => handleDownloadOne(entry.key)}
                        disabled={isDownloading || downloadingAll}
                      >
                        {isDownloading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Separator />

        {/* Info footer */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Models are stored in your browser cache. They persist across sessions
          and make loading instant. Clearing your browser data will also remove
          cached models.
        </p>
      </DialogContent>
    </Dialog>
  );
}
