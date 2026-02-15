"use client";

import * as React from "react";
import { Upload, FileImage, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableModels } from "@/lib/ai-models";

export default function ImageToSignPage() {
  // State
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<{
    sign: string;
    confidence: number;
  } | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [modelCategory, setModelCategory] = React.useState("alphabet");
  const [modelLoading, setModelLoading] = React.useState(false);
  const [modelReady, setModelReady] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  // Refs
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gestureRecognizerRef = React.useRef<unknown>(null);
  const drawingUtilsClassRef = React.useRef<unknown>(null);
  const gestureRecognizerClassRef = React.useRef<unknown>(null);

  const models = getAvailableModels();

  // Load model - exact port from legacy createGestureRecognizer()
  const loadGestureRecognizer = React.useCallback(
    async (category: string) => {
      if (modelLoading) return;
      setModelLoading(true);
      setModelReady(false);
      setLoadingProgress(10);

      try {
        setLoadingProgress(20);
        const { loadMediaPipeVision, getMediaPipeWasm } = await import("@/lib/load-mediapipe");
        const vision = await loadMediaPipeVision();
        const { GestureRecognizer, FilesetResolver, DrawingUtils } = vision;
        gestureRecognizerClassRef.current = GestureRecognizer;
        drawingUtilsClassRef.current = DrawingUtils;

        setLoadingProgress(50);
        const filesetResolver = await FilesetResolver.forVisionTasks(
          getMediaPipeWasm()
        );

        setLoadingProgress(70);
        const { getModelBuffer } = await import("@/lib/model-cache");
        const modelBuffer = await getModelBuffer(category);

        gestureRecognizerRef.current =
          await GestureRecognizer.createFromOptions(filesetResolver, {
            baseOptions: { modelAssetBuffer: new Uint8Array(modelBuffer), delegate: "GPU" },
            runningMode: "IMAGE",
          });

        setLoadingProgress(100);
        setModelReady(true);
        setModelLoading(false);
        setModelCategory(category);
        console.log(`✅ Gesture recognizer created for ${category}`);
      } catch (err) {
        console.error("Error creating gesture recognizer:", err);
        setModelLoading(false);
        toast.error("Failed to load AI model. Please refresh the page and try again.");
      }
    },
    [modelLoading]
  );

  // Initialize on mount
  React.useEffect(() => {
    loadGestureRecognizer("alphabet");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup blob URL on unmount
  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Cancellation ref to prevent stale analysis results after reset
  const analysisIdRef = React.useRef(0);

  const handleFile = (f: File) => {
    if (f && (f.type === "image/jpeg" || f.type === "image/png" || f.type === "image/webp")) {
      setFile(f);
      // Revoke previous blob URL to prevent memory leak
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // Analyze image - exact port from legacy upload-form submit handler
  const handleAnalyze = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognizer = gestureRecognizerRef.current as any;
    if (!recognizer) {
      toast.warning("AI model is not loaded yet. Please wait and try again.");
      return;
    }
    if (!file || !preview) return;

    setIsAnalyzing(true);
    setResult(null);

    const currentAnalysisId = ++analysisIdRef.current;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Bail if analysis was cancelled (e.g. user clicked Clear)
        if (analysisIdRef.current !== currentAnalysisId) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Calculate dimensions while maintaining aspect ratio - exact from legacy
        const maxWidth = 640;
        const maxHeight = 480;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);

        try {
          const results = recognizer.recognize(imageData);
          console.log("Recognition results:", results);

          // Draw landmarks if detected - exact from legacy
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const GR = gestureRecognizerClassRef.current as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const DU = drawingUtilsClassRef.current as any;

          if (results?.landmarks?.length > 0 && DU && GR) {
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

          if (results?.gestures?.length > 0) {
            const categoryName = results.gestures[0][0].categoryName;
            const categoryScore = parseFloat(
              (results.gestures[0][0].score * 100).toFixed(2)
            );
            setResult({ sign: categoryName, confidence: categoryScore });
          } else {
            setResult({ sign: "No hand detected", confidence: 0 });
          }
        } catch (recognitionError) {
          console.error("Recognition error:", recognitionError);
          setResult({ sign: "Error analyzing image", confidence: 0 });
        }

        setIsAnalyzing(false);
        URL.revokeObjectURL(preview);
      };

      img.onerror = () => {
        setIsAnalyzing(false);
        toast.error("Error loading the image.");
        URL.revokeObjectURL(preview);
      };

      img.src = preview;
    } catch (error) {
      console.error("Processing error:", error);
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    analysisIdRef.current++; // cancel any pending analysis
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setIsAnalyzing(false);
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setResult(null);
    await loadGestureRecognizer(newModel);
  };

  const hasValidResult = result && result.confidence > 0;

  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-4">
          AI Tool
        </Badge>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          <span className="gradient-text">
            Image to Sign Detection
          </span>
        </h1>
        <p className="text-muted-foreground mt-3 text-base md:text-lg">
          Upload a hand sign image and let AI identify the closest match.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 1</p>
            <p className="mt-2 text-sm font-semibold">Pick a model</p>
            <p className="text-xs text-muted-foreground">Choose alphabet or another category.</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 2</p>
            <p className="mt-2 text-sm font-semibold">Upload a photo</p>
            <p className="text-xs text-muted-foreground">Clear lighting improves accuracy.</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 3</p>
            <p className="mt-2 text-sm font-semibold">Review the match</p>
            <p className="text-xs text-muted-foreground">Confidence scores explain the result.</p>
          </div>
        </div>
      </div>

      {/* Model Selector - from legacy createModelSelector() */}
      <Card className="mb-6 rounded-2xl glass-panel">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium">Select Model:</label>
            <Select value={modelCategory} onValueChange={handleModelChange}>
              <SelectTrigger className="w-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modelLoading && (
              <div className="flex-1 min-w-50">
                <Progress value={loadingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Loading model... {loadingProgress}%
                </p>
              </div>
            )}
            {modelReady && !modelLoading && (
              <Badge variant="outline" className="text-green-600">
                ✅ Model Ready
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload / Canvas Area */}
        <Card className="rounded-2xl border border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="size-5 text-(--brand-1)" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Drag & drop or click to upload a JPG/PNG image
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!preview ? (
              <label
                className={`flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                  dragActive
                    ? "border-(--brand-1) bg-(--brand-1)/10"
                    : "border-muted-foreground/25 hover:border-(--brand-1)/60"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                <Upload className="size-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">
                  Drop image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG / PNG / WebP
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
            ) : (
              <div className="relative">
                {/* Canvas for drawing + landmarks - exact from legacy output_canvas */}
                <canvas
                  ref={canvasRef}
                  className="w-full rounded-lg border bg-black"
                  style={{ display: result ? "block" : "none" }}
                />
                {/* Preview image before analysis */}
                {!result && (
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Uploaded hand sign"
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleReset}
                >
                  <X className="size-3 mr-1" /> Clear
                </Button>
              </div>
            )}

            {preview && !result && (
              <Button
                className="w-full mt-4 rounded-lg bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !modelReady}
              >
                {isAnalyzing ? (
                  <>Analyzing...</>
                ) : (
                  <>
                    <ImageIcon className="size-4 mr-2" />
                    Detect Sign
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Area - exact from legacy gesture_output */}
        <Card className="rounded-2xl border border-border/50 bg-card/80">
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
            <CardDescription>AI analysis of the uploaded image</CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="size-12 rounded-full border-4 border-(--brand-1)/20 border-t-(--brand-1) animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Analyzing image...
                </p>
              </div>
            )}

            {!result && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileImage className="size-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Upload an image to see detection results
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {hasValidResult ? "Detected Sign" : "Result"}
                  </p>
                  <p className="text-6xl font-bold text-(--brand-1) mt-2">
                    {result.sign}
                  </p>
                </div>

                {hasValidResult && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-semibold">{result.confidence}%</span>
                    </div>
                    <Progress value={result.confidence} />
                  </div>
                )}

                <Separator />

                <p className="text-sm text-muted-foreground text-center">
                  {hasValidResult
                    ? "Hand landmarks are drawn on the canvas above."
                    : "No hand signs detected. Please ensure your hand is clearly visible in the image."}
                </p>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReset}
                >
                  Upload Another Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Limitations */}
      <Card className="mt-8 rounded-2xl bg-muted/60 border border-border/50">
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold mb-3">Tips</h3>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <li className="flex items-start gap-2">
              <span>💡</span> Ensure good lighting in the image
            </li>
            <li className="flex items-start gap-2">
              <span>✋</span> Hand should be clearly visible
            </li>
            <li className="flex items-start gap-2">
              <span>🎯</span> Use plain background for best results
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
