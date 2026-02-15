"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Camera,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import {
  MODULES,
  ALPHABET_DESCRIPTIONS,
  getVideoPath,
  type ModuleKey,
} from "@/lib/asl-data";
import { getModelUrl, normalizeModelOutput } from "@/lib/ai-models";

// ─── Types from Supabase tables (managed by admin) ────────
interface DBModule {
  id: string;
  module_key: string;
  display_name: string;
  description: string;
  icon: string;
}

interface DBModuleItem {
  id: string;
  module_id: string;
  item_name: string;
  description: string;
  display_order: number;
  video_url: string | null;
  image_url: string | null;
}

interface DBModuleModel {
  id: string;
  module_id: string;
  model_category: string;
  model_file_name: string;
  model_url: string;
  is_active: boolean;
}

// ─── Local fallback helpers (if Supabase is empty) ─────────
function getLocalModules(): DBModule[] {
  return (Object.entries(MODULES) as [ModuleKey, (typeof MODULES)[ModuleKey]][]).map(
    ([key, mod]) => ({
      id: key,
      module_key: key,
      display_name: mod.name,
      description: mod.description,
      icon: mod.emoji,
    })
  );
}

function getLocalItems(moduleKey: string): DBModuleItem[] {
  const mod = MODULES[moduleKey as ModuleKey];
  if (!mod) return [];
  return mod.items.map((item, i) => ({
    id: `local-${moduleKey}-${i}`,
    module_id: moduleKey,
    item_name: item,
    description:
      moduleKey === "alphabet" ? ALPHABET_DESCRIPTIONS[item] || "" : "",
    display_order: i + 1,
    video_url: null,
    image_url: null,
  }));
}

// ─── URL conversion from legacy module-template.js ────────
const GOOGLE_DRIVE_REGEX = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;

/** Convert Google Drive sharing URLs to embed/preview URLs */
function convertToDirectVideoUrl(url: string): string {
  if (!url) return "";
  const driveMatch = url.match(GOOGLE_DRIVE_REGEX);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  const ytMatch = url.match(YOUTUBE_REGEX);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  return url;
}

/** Convert Google Drive sharing URLs to direct image URLs */
function convertToDirectImageUrl(url: string): string {
  if (!url) return "";
  const driveMatch = url.match(GOOGLE_DRIVE_REGEX);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return url;
}

type MediaKind = "video" | "iframe" | "image" | "none";

/** Determine what kind of media element to render */
function getMediaKind(videoUrl: string | null, imageUrl: string | null): MediaKind {
  if (videoUrl) {
    if (GOOGLE_DRIVE_REGEX.test(videoUrl) || YOUTUBE_REGEX.test(videoUrl)) {
      return "iframe";
    }
    return "video";
  }
  if (imageUrl) return "image";
  return "none";
}

/** Video URL: prefer DB url (converted), fallback to local file path */
function resolveVideoUrl(item: DBModuleItem, moduleKey: string): string {
  if (item.video_url) return convertToDirectVideoUrl(item.video_url);
  return getVideoPath(item.item_name, moduleKey);
}

/** Model URL: prefer DB model_url, fallback to hardcoded MODEL_URLS */
function resolveModelUrl(
  moduleKey: string,
  model: DBModuleModel | null
): string {
  if (model?.model_url) return model.model_url;
  return getModelUrl(moduleKey);
}

// ════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════
export default function ModulesPage() {
  // ─── Data state (from Supabase / admin) ─────────
  const [modules, setModules] = React.useState<DBModule[]>([]);
  const [moduleItems, setModuleItems] = React.useState<DBModuleItem[]>([]);
  const [moduleModel, setModuleModel] = React.useState<DBModuleModel | null>(
    null
  );
  const [dataLoading, setDataLoading] = React.useState(true);

  // Module selection
  const [selectedModuleKey, setSelectedModuleKey] = React.useState("alphabet");
  const [selectedItemIdx, setSelectedItemIdx] = React.useState(0);

  // Video player state
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [videoLoaded, setVideoLoaded] = React.useState(false);
  const [videoError, setVideoError] = React.useState<string | null>(null);

  // Practice webcam state
  const [practiceMode, setPracticeMode] = React.useState(false);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [detectedSign, setDetectedSign] = React.useState<string | null>(null);
  const [detectedConfidence, setDetectedConfidence] = React.useState(0);
  const [practiceCorrect, setPracticeCorrect] = React.useState(false);

  // Model state
  const [modelLoading, setModelLoading] = React.useState(false);
  const [modelReady, setModelReady] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [modelError, setModelError] = React.useState<string | null>(null);

  // Refs for webcam/recognition
  const webcamVideoRef = React.useRef<HTMLVideoElement>(null);
  const webcamCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const webcamRunningRef = React.useRef(false);
  const gestureRecognizerRef = React.useRef<unknown>(null);
  const runningModeRef = React.useRef<"IMAGE" | "VIDEO">("IMAGE");
  const lastVideoTimeRef = React.useRef(-1);
  const drawingUtilsClassRef = React.useRef<unknown>(null);
  const gestureRecognizerClassRef = React.useRef<unknown>(null);
  const lastResultsRef = React.useRef<unknown>(null);

  // Audio feedback cooldown
  const lastAudioRef = React.useRef(0);
  const lastDetectionTimeRef = React.useRef(0);
  const currentItemNameRef = React.useRef("");
  const moduleModelRef = React.useRef<DBModuleModel | null>(null);

  // Derived
  const selectedModule = modules.find(
    (m) => m.module_key === selectedModuleKey
  );
  const currentItem = moduleItems[selectedItemIdx] || null;
  const currentItemName = currentItem?.item_name || "";
  const videoPath = currentItem
    ? resolveVideoUrl(currentItem, selectedModuleKey)
    : "";
  const mediaKind: MediaKind = currentItem
    ? getMediaKind(currentItem.video_url, currentItem.image_url)
    : "none";
  const resolvedImageUrl = currentItem?.image_url
    ? convertToDirectImageUrl(currentItem.image_url)
    : "";
  const description = currentItem?.description || "";
  const speeds = [0.5, 1, 1.5, 2];

  // Keep refs in sync
  React.useEffect(() => {
    currentItemNameRef.current = currentItemName;
  }, [currentItemName]);
  React.useEffect(() => {
    moduleModelRef.current = moduleModel;
  }, [moduleModel]);

  // ─── Data loading from Supabase ─────────────────
  React.useEffect(() => {
    loadAllModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAllModules() {
    setDataLoading(true);
    let mods: DBModule[] = [];
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("display_name", { ascending: true });
      if (!error && data && data.length > 0) {
        mods = data;
      } else {
        mods = getLocalModules();
      }
    } catch {
      mods = getLocalModules();
    }
    setModules(mods);
    await loadModuleContent("alphabet", mods);
    setDataLoading(false);
  }

  async function loadModuleContent(
    moduleKey: string,
    allModules?: DBModule[]
  ) {
    const mods = allModules || modules;
    const mod = mods.find((m) => m.module_key === moduleKey);

    // ── Items ──
    let items: DBModuleItem[] = [];
    if (mod) {
      try {
        const { data, error } = await supabase
          .from("module_items")
          .select("*")
          .eq("module_id", mod.id)
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) {
          items = data;
        }
      } catch {
        /* fallback below */
      }
    }
    if (items.length === 0) {
      items = getLocalItems(moduleKey);
    }
    setModuleItems(items);
    setSelectedItemIdx(0);

    // ── Model association ──
    let model: DBModuleModel | null = null;
    if (mod) {
      try {
        const { data, error } = await supabase
          .from("module_models")
          .select("*")
          .eq("module_id", mod.id)
          .eq("is_active", true)
          .limit(1);
        if (!error && data && data.length > 0) {
          model = data[0];
        }
      } catch {
        /* fallback to null */
      }
    }
    setModuleModel(model);
  }

  // ─── Gesture recognizer ─────────────────────────
  const loadGestureRecognizer = React.useCallback(
    async (moduleKey: string, model: DBModuleModel | null) => {
      if (modelLoading) return;
      setModelLoading(true);
      setModelReady(false);
      setModelError(null);
      setLoadingProgress(10);
      try {
        setLoadingProgress(20);
        const { loadMediaPipeVision, getMediaPipeWasm } = await import(
          "@/lib/load-mediapipe"
        );
        const vision = await loadMediaPipeVision();
        const { GestureRecognizer, FilesetResolver, DrawingUtils } = vision;
        gestureRecognizerClassRef.current = GestureRecognizer;
        drawingUtilsClassRef.current = DrawingUtils;
        setLoadingProgress(50);
        const fr = await FilesetResolver.forVisionTasks(getMediaPipeWasm());
        setLoadingProgress(70);
        // Always use cache system for both standard and custom models
        const { getModelBuffer, downloadAndCacheCustomModel, isModelCached, getCachedCustomModelBuffer } = await import("@/lib/model-cache");
        let buffer: ArrayBuffer;
        
        if (!model?.model_url) {
          // Standard category — use built-in cache system
          const isCached = await isModelCached(moduleKey);
          if (!isCached) {
            toast.info("Downloading model for offline use...", {
              description: "This model will be cached for faster future loads.",
            });
          }
          buffer = await getModelBuffer(moduleKey, (progress) => {
            // Update progress: 70-100% for model download
            const modelProgress = 70 + (progress.percent * 0.3);
            setLoadingProgress(Math.round(modelProgress));
          });
          if (!isCached) {
            toast.success("Model cached successfully!", {
              description: "Future loads will be instant.",
            });
          }
        } else {
          // Custom DB model URL — download and cache with progress
          const modelUrl = resolveModelUrl(moduleKey, model);
          const displayName = model.model_file_name || moduleKey;
          const isCached = await getCachedCustomModelBuffer(modelUrl);
          if (!isCached) {
            toast.info("Downloading custom model for offline use...", {
              description: "This model will be cached for faster future loads.",
            });
          }
          buffer = await downloadAndCacheCustomModel(modelUrl, displayName, (progress) => {
            // Update progress: 70-100% for model download
            const modelProgress = 70 + (progress.percent * 0.3);
            setLoadingProgress(Math.round(modelProgress));
          });
          if (!isCached) {
            toast.success("Custom model cached successfully!", {
              description: "Future loads will be instant.",
            });
          }
        }
        
        setLoadingProgress(95);
        gestureRecognizerRef.current =
          await GestureRecognizer.createFromOptions(fr, {
            baseOptions: {
              modelAssetBuffer: new Uint8Array(buffer),
              delegate: "GPU",
            },
            runningMode: runningModeRef.current,
          });
        setLoadingProgress(100);
        setModelReady(true);
      } catch (err) {
        console.error("Model load error:", err);
        setModelError("Failed to load AI model. Please refresh and try again.");
        toast.error("Failed to load AI model", {
          description: "Please check your connection and try again.",
        });
      } finally {
        setModelLoading(false);
      }
    },
    [modelLoading]
  );

  // ─── Prediction loop ───────────────────────────
  const predictWebcam = React.useCallback(() => {
    const video = webcamVideoRef.current;
    const canvas = webcamCanvasRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognizer = gestureRecognizerRef.current as any;
    if (!video || !canvas || !recognizer || !webcamRunningRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

    const nowInMs = Date.now();
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      lastResultsRef.current = recognizer.recognizeForVideo(video, nowInMs);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = lastResultsRef.current as any;

    // Draw landmarks
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GR = gestureRecognizerClassRef.current as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DU = drawingUtilsClassRef.current as any;
    if (results?.landmarks && DU && GR) {
      const drawingUtils = new DU(ctx);
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(landmarks, GR.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });
        drawingUtils.drawLandmarks(landmarks, {
          color: "#FF0000",
          lineWidth: 1,
        });
      }
    }
    ctx.restore();

    if (results?.gestures?.length > 0) {
      const categoryName = results.gestures[0][0].categoryName;
      const score = parseFloat(
        (results.gestures[0][0].score * 100).toFixed(2)
      );

      if (score >= 50) {
        const normalizedSign = normalizeModelOutput(categoryName);
        setDetectedSign(normalizedSign);
        setDetectedConfidence(score);
        lastDetectionTimeRef.current = Date.now();

        // Check if correct
        const normalized = normalizedSign;
        const expected = normalizeModelOutput(currentItemNameRef.current);
        if (normalized === expected && score >= 60) {
          setPracticeCorrect(true);
          const now = Date.now();
          if (now - lastAudioRef.current > 2000) {
            lastAudioRef.current = now;
            try {
              new Audio("/audio/correct.mp3").play().catch(() => {});
            } catch {
              /* no audio */
            }
          }
        } else {
          setPracticeCorrect(false);
        }
      }
    } else {
      if (Date.now() - lastDetectionTimeRef.current > 500) {
        setDetectedSign(null);
        setDetectedConfidence(0);
        setPracticeCorrect(false);
      }
    }

    if (webcamRunningRef.current) {
      window.requestAnimationFrame(predictWebcam);
    }
  }, []);

  // ─── Toggle camera ─────────────────────────────
  const toggleCamera = React.useCallback(async () => {
    if (!gestureRecognizerRef.current) {
      toast.warning("AI model not loaded. Please wait.");
      return;
    }
    if (cameraActive) {
      webcamRunningRef.current = false;
      setCameraActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      runningModeRef.current = "IMAGE";
      lastVideoTimeRef.current = -1;
      lastResultsRef.current = null;
      if (webcamVideoRef.current) webcamVideoRef.current.srcObject = null;
      setDetectedSign(null);
      setDetectedConfidence(0);
      setPracticeCorrect(false);
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognizer = gestureRecognizerRef.current as any;
        if (runningModeRef.current !== "VIDEO") {
          runningModeRef.current = "VIDEO";
          await recognizer.setOptions({ runningMode: "VIDEO" });
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        streamRef.current = stream;
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.addEventListener(
            "loadeddata",
            () => {
              webcamRunningRef.current = true;
              setCameraActive(true);
              predictWebcam();
            },
            { once: true }
          );
        }
      } catch (err) {
        console.error("Camera error:", err);
        toast.error("Could not access camera.");
      }
    }
  }, [cameraActive, predictWebcam]);

  // ─── Navigation / controls ─────────────────────
  const handlePrev = () => {
    setSelectedItemIdx((prev) =>
      prev > 0 ? prev - 1 : moduleItems.length - 1
    );
    setIsPlaying(false);
    setVideoLoaded(false);
    setPracticeCorrect(false);
  };

  const handleNext = () => {
    setSelectedItemIdx((prev) =>
      prev < moduleItems.length - 1 ? prev + 1 : 0
    );
    setIsPlaying(false);
    setVideoLoaded(false);
    setPracticeCorrect(false);
  };

  const handleModuleSelect = async (key: string) => {
    setSelectedModuleKey(key);
    setSelectedItemIdx(0);
    setIsPlaying(false);
    setVideoLoaded(false);
    setVideoError(null);
    setPracticeCorrect(false);
    setDetectedSign(null);
    setDetectedConfidence(0);

    // Load content from Supabase
    await loadModuleContent(key);

    // Reload model if in practice mode
    if (practiceMode) {
      webcamRunningRef.current = false;
      setCameraActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (webcamVideoRef.current) webcamVideoRef.current.srcObject = null;
      runningModeRef.current = "IMAGE";
      lastVideoTimeRef.current = -1;
      lastResultsRef.current = null;
      setModelReady(false);
      // Model will be reloaded after content loads (moduleModel updates)
      // We need to wait for the new module model, so we pass null and let
      // the effect/callback handle it later
    }
  };

  // Reload model when moduleModel changes during practice mode
  React.useEffect(() => {
    if (practiceMode && !modelReady && !modelLoading && modules.length > 0) {
      loadGestureRecognizer(selectedModuleKey, moduleModel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleModel, practiceMode, selectedModuleKey, modelReady]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const enterPractice = React.useCallback(() => {
    setPracticeMode(true);
    if (!modelReady && !modelLoading) {
      loadGestureRecognizer(selectedModuleKey, moduleModelRef.current);
    }
  }, [
    modelReady,
    modelLoading,
    loadGestureRecognizer,
    selectedModuleKey,
  ]);

  const exitPractice = React.useCallback(() => {
    setPracticeMode(false);
    webcamRunningRef.current = false;
    setCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setDetectedSign(null);
    setDetectedConfidence(0);
    setPracticeCorrect(false);
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleItemSelect = (index: number) => {
    setSelectedItemIdx(index);
    setIsPlaying(false);
    setVideoLoaded(false);
    setPracticeCorrect(false);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      webcamRunningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════

  if (dataLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <Loader2 className="size-10 animate-spin mx-auto mb-4 text-(--brand-1)" />
        <p className="text-muted-foreground">Loading modules...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-display md:text-5xl">
          📚{" "}
          <span className="gradient-text">
            Learning Modules
          </span>
        </h1>
        <p className="text-muted-foreground mt-3 text-base md:text-lg">
          Pick a module, watch demonstrations, and practice with live feedback.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Module Sidebar — populated from Supabase modules table */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
            Modules
          </h3>
          {modules.map((mod) => (
            <button
              key={mod.module_key}
              onClick={() => handleModuleSelect(mod.module_key)}
              className={`flex items-center gap-3 w-full rounded-lg px-3 py-3 text-left transition-colors ${
                selectedModuleKey === mod.module_key
                  ? "bg-linear-to-r from-(--brand-1)/10 to-(--brand-2)/10 border border-(--brand-1)/30"
                  : "hover:bg-accent"
              }`}
            >
              <span className="text-2xl">{mod.icon}</span>
              <div>
                <p className="font-medium text-sm">{mod.display_name}</p>
                {mod.description && (
                <p className="text-xs text-muted-foreground">
                  {mod.description.split(" ").slice(0, 5).join(" ")}
                  {mod.description.split(" ").length > 5 ? "..." : ""}
                </p>
              )}
              </div>
            </button>
          ))}

          <Separator className="my-4" />

          {/* Practice mode toggle */}
          <div className="px-2 space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">
              Practice Mode
            </p>
            {!practiceMode ? (
              <Button
                className="w-full rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white"
                size="sm"
                onClick={enterPractice}
              >
                <Camera className="size-4 mr-2" />
                Practice with Webcam
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={exitPractice}
              >
                Exit Practice
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Module Header */}
          {selectedModule && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedModule.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedModule.display_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedModule.description} — {moduleItems.length} signs
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Video Player + Practice side-by-side */}
          <div
            className={`grid gap-6 ${
              practiceMode ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            {/* Video Player */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-xl">
                  Sign: {currentItemName}
                </CardTitle>
                <CardDescription className="text-center">
                  {selectedItemIdx + 1} of {moduleItems.length}
                  {description && (
                    <span className="block mt-1 text-xs italic">
                      {description}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {videoError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{videoError}</AlertDescription>
                  </Alert>
                )}

                <div className="aspect-video rounded-lg bg-black flex items-center justify-center mb-4 border overflow-hidden">
                  {mediaKind === "iframe" ? (
                    /* Google Drive / YouTube — render as iframe */
                    <iframe
                      key={`${selectedModuleKey}-${currentItemName}`}
                      src={videoPath}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      onLoad={() => {
                        setVideoLoaded(true);
                        setVideoError(null);
                      }}
                      style={{ border: 0 }}
                    />
                  ) : mediaKind === "image" ? (
                    /* Image only (no video) */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${selectedModuleKey}-${currentItemName}`}
                      src={resolvedImageUrl}
                      alt={currentItemName}
                      className="w-full h-full object-contain"
                      onLoad={() => {
                        setVideoLoaded(true);
                        setVideoError(null);
                      }}
                      onError={() => {
                        setVideoError(
                          `Image not found for "${currentItemName}".`
                        );
                        setVideoLoaded(false);
                      }}
                    />
                  ) : (
                    /* Direct video file (.mp4 etc) */
                    <video
                      ref={videoRef}
                      key={`${selectedModuleKey}-${currentItemName}`}
                      src={videoPath}
                      onLoadedMetadata={() => {
                        setVideoLoaded(true);
                        setVideoError(null);
                      }}
                      onError={() => {
                        setVideoError(
                          `Video not found for "${currentItemName}". The file may not exist.`
                        );
                        setVideoLoaded(false);
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full h-full object-contain"
                      playsInline
                    />
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrev}
                    >
                      <SkipBack className="size-4" />
                    </Button>
                    <Button
                      size="lg"
                      className="rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white"
                      onClick={togglePlayPause}
                      disabled={!videoLoaded || mediaKind === "iframe"}
                    >
                      {isPlaying ? (
                        <Pause className="size-5" />
                      ) : (
                        <Play className="size-5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNext}
                    >
                      <SkipForward className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRestart}
                      disabled={!videoLoaded || mediaKind === "iframe"}
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  </div>

                  {/* Speed */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Speed:
                    </span>
                    {speeds.map((speed) => (
                      <Button
                        key={speed}
                        variant={
                          playbackSpeed === speed ? "default" : "outline"
                        }
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setPlaybackSpeed(speed)}
                        disabled={!videoLoaded || mediaKind === "iframe"}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Practice Webcam Panel */}
            {practiceMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="size-5" />
                    Practice: Sign &quot;{currentItemName}&quot;
                  </CardTitle>
                  <CardDescription>
                    Show the sign to your webcam to verify
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Model error */}
                  {modelError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{modelError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Model loading */}
                  {modelLoading && (
                    <div>
                      <Progress value={loadingProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Loading AI model... {loadingProgress}%
                      </p>
                    </div>
                  )}

                  <Button
                    variant={cameraActive ? "destructive" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={toggleCamera}
                    disabled={!modelReady}
                  >
                    {cameraActive ? "Stop Camera" : "Start Camera"}
                  </Button>

                  {/* Webcam feed with landmarks */}
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <video
                      ref={webcamVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{
                        display: cameraActive ? "block" : "none",
                      }}
                    />
                    <canvas
                      ref={webcamCanvasRef}
                      className="absolute inset-0 w-full h-full"
                      style={{
                        display: cameraActive ? "block" : "none",
                      }}
                    />
                    {!cameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="size-10 text-muted-foreground opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* Detection result */}
                  {detectedSign && (
                    <div
                      className={`text-center rounded-lg p-3 ${
                        practiceCorrect
                          ? "bg-green-50 dark:bg-green-900/20 border border-green-300"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">
                        Detected:
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          practiceCorrect
                            ? "text-green-600"
                            : "text-(--brand-1)"
                        }`}
                      >
                        {detectedSign}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {detectedConfidence.toFixed(1)}% confidence
                      </p>
                      {practiceCorrect && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          ✅ Correct! Great job!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Model selector for practice */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Module:
                    </span>
                    <Select
                      value={selectedModuleKey}
                      onValueChange={(v) => handleModuleSelect(v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((m) => (
                          <SelectItem key={m.module_key} value={m.module_key}>
                            {m.icon} {m.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sign Cards Grid — items from Supabase module_items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              All Signs in {selectedModule?.display_name || selectedModuleKey}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {moduleItems.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => handleItemSelect(i)}
                  className={`rounded-lg border p-3 text-center transition-all hover:shadow-md ${
                    selectedItemIdx === i
                      ? "border-(--brand-1) bg-(--brand-1)/10 shadow-sm ring-2 ring-(--brand-1)/20"
                      : "hover:border-(--brand-1)/40"
                  }`}
                >
                  <p className="font-semibold text-sm">{item.item_name}</p>
                  {item.description && (
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                      {item.description.split(" ").slice(0, 3).join(" ")}
                      {item.description.split(" ").length > 3 ? "..." : ""}
                    </p>
                  )}
                  {/* Media indicators */}
                  <div className="flex justify-center gap-1 mt-1">
                    {item.video_url && (
                      <span className="text-[9px] text-green-600">🎬</span>
                    )}
                    {item.image_url && (
                      <span className="text-[9px] text-blue-600">🖼️</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
