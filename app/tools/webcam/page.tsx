"use client";

import * as React from "react";
import { Camera, Power, PowerOff, Sun } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableModels, normalizeModelOutput } from "@/lib/ai-models";

export default function WebcamPage() {
  // State
  const [streaming, setStreaming] = React.useState(false);
  const [detectedSign, setDetectedSign] = React.useState<string | null>(null);
  const [confidence, setConfidence] = React.useState(0);
  const [modelCategory, setModelCategory] = React.useState("alphabet");
  const [modelLoading, setModelLoading] = React.useState(false);
  const [modelReady, setModelReady] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [modelError, setModelError] = React.useState<string | null>(null);

  // Refs
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const webcamRunningRef = React.useRef(false);
  const gestureRecognizerRef = React.useRef<unknown>(null);
  const runningModeRef = React.useRef<"IMAGE" | "VIDEO">("IMAGE");
  const lastVideoTimeRef = React.useRef(-1);
  const drawingUtilsClassRef = React.useRef<unknown>(null);
  const gestureRecognizerClassRef = React.useRef<unknown>(null);
  const lastDetectionTimeRef = React.useRef(0);
  const lastResultsRef = React.useRef<unknown>(null);

  const models = getAvailableModels();

  // Load MediaPipe model - exact port from legacy createGestureRecognizer()
  const loadModel = React.useCallback(
    async (category: string) => {
      if (modelLoading) return;
      setModelLoading(true);
      setModelReady(false);
      setModelError(null);
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
            runningMode: runningModeRef.current,
          });

        setLoadingProgress(100);
        setModelReady(true);
        setModelLoading(false);
        setModelCategory(category);
        console.log(`✅ Model loaded: ${category}`);
      } catch (err) {
        console.error("Model load error:", err);
        setModelError("Failed to load AI model. Please refresh and try again.");
        setModelLoading(false);
        setModelReady(false);
      }
    },
    [modelLoading]
  );

  // Initialize model on mount
  React.useEffect(() => {
    loadModel("alphabet");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prediction loop - exact port from legacy predictWebcam()
  const predictWebcam = React.useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognizer = gestureRecognizerRef.current as any;

    if (!video || !canvas || !recognizer || !webcamRunningRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas to video dimensions
    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

    // Switch to VIDEO mode if needed (handled in toggleCamera before starting)

    const nowInMs = Date.now();
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      lastResultsRef.current = recognizer.recognizeForVideo(video, nowInMs);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = lastResultsRef.current as any;

    // Draw landmarks (only clear + redraw, using cached results)
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

    // Check for gestures with debounce to prevent flickering
    if (results?.gestures?.length > 0) {
      const categoryName = results.gestures[0][0].categoryName;
      const categoryScore = parseFloat(
        (results.gestures[0][0].score * 100).toFixed(2)
      );
      if (categoryScore >= 50) {
        setDetectedSign(normalizeModelOutput(categoryName));
        setConfidence(categoryScore);
        lastDetectionTimeRef.current = Date.now();
      }
    } else {
      // Only clear after 500ms of no detection to prevent flicker
      if (Date.now() - lastDetectionTimeRef.current > 500) {
        setDetectedSign(null);
        setConfidence(0);
      }
    }

    if (webcamRunningRef.current) {
      window.requestAnimationFrame(predictWebcam);
    }
  }, []);

  // Enable/disable camera - exact port from legacy enableCam()
  const toggleCamera = React.useCallback(async () => {
    if (!gestureRecognizerRef.current) {
      toast.warning("AI model is not loaded yet. Please wait and try again.");
      return;
    }

    if (streaming) {
      // Disable webcam
      webcamRunningRef.current = false;
      setStreaming(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      // Reset mode for next activation
      runningModeRef.current = "IMAGE";
      lastVideoTimeRef.current = -1;
      lastResultsRef.current = null;
      setDetectedSign(null);
      setConfidence(0);
    } else {
      // Enable webcam
      try {
        // Set running mode to VIDEO before starting prediction loop
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
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener(
            "loadeddata",
            () => {
              webcamRunningRef.current = true;
              setStreaming(true);
              predictWebcam();
            },
            { once: true }
          );
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        toast.error("Error accessing webcam. Please make sure you have granted camera permissions.");
      }
    }
  }, [streaming, predictWebcam]);

  // Handle model change - exact from legacy onModelChange()
  const handleModelChange = React.useCallback(
    async (newModel: string) => {
      setDetectedSign(null);
      setConfidence(0);

      // Stop prediction loop while loading new model to prevent
      // recognizeForVideo() on an IMAGE-mode recognizer crash
      const wasStreaming = streaming;
      if (wasStreaming) {
        webcamRunningRef.current = false;
      }

      runningModeRef.current = "IMAGE";
      lastVideoTimeRef.current = -1;
      lastResultsRef.current = null;
      await loadModel(newModel);

      // Restore VIDEO mode and restart prediction if camera was active
      if (wasStreaming && gestureRecognizerRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognizer = gestureRecognizerRef.current as any;
        runningModeRef.current = "VIDEO";
        await recognizer.setOptions({ runningMode: "VIDEO" });
        webcamRunningRef.current = true;
        predictWebcam();
      }
    },
    [loadModel, streaming, predictWebcam]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      webcamRunningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-4">
          AI Tool
        </Badge>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          <span className="bg-linear-to-r from-(--brand-1) to-(--brand-2) bg-clip-text text-transparent">
            Webcam Sign Detection
          </span>
        </h1>
        <p className="text-muted-foreground mt-3 text-base md:text-lg">
          Turn on your camera and get real-time AI feedback on your signs.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 1</p>
            <p className="mt-2 text-sm font-semibold">Pick a model</p>
            <p className="text-xs text-muted-foreground">Alphabet is a great place to start.</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 2</p>
            <p className="mt-2 text-sm font-semibold">Enable your camera</p>
            <p className="text-xs text-muted-foreground">Stay centered and well-lit.</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step 3</p>
            <p className="mt-2 text-sm font-semibold">Practice live</p>
            <p className="text-xs text-muted-foreground">Watch confidence scores update instantly.</p>
          </div>
        </div>
      </div>

      {/* Model Selector - from legacy createModelSelector() */}
      <Card className="mb-6 rounded-3xl glass-panel">
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
            {modelError && (
              <p className="text-sm text-red-600">{modelError}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Webcam Feed */}
        <Card className="rounded-3xl border border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="size-5 text-(--brand-1)" />
              Live Camera Feed
            </CardTitle>
            <CardDescription>
              {streaming
                ? "Camera is active — perform signs in front of the camera"
                : "Click Start to begin webcam detection"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Video + Canvas overlay - exact from legacy HTML structure */}
            <div className="relative aspect-video rounded-lg bg-black border overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ display: streaming ? "block" : "none" }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ display: streaming ? "block" : "none" }}
              />
              {!streaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="size-16 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      Camera is off
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center gap-3 mt-4">
              {!streaming ? (
                <Button
                  size="lg"
                  className="rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white"
                  onClick={toggleCamera}
                  disabled={!modelReady}
                >
                  <Power className="size-4 mr-2" />
                  Enable Camera
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={toggleCamera}
                >
                  <PowerOff className="size-4 mr-2" />
                  Disable Camera
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detection Sidebar - exact from legacy gesture_output */}
        <div className="space-y-6">
          <Card className="rounded-3xl border border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle className="text-base">Detection Result</CardTitle>
            </CardHeader>
            <CardContent>
              {detectedSign ? (
                <div className="text-center space-y-4">
                  <p className="text-6xl font-bold text-(--brand-1)">
                    {detectedSign}
                  </p>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-semibold">{confidence}%</span>
                    </div>
                    <Progress value={confidence} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-4xl text-muted-foreground/30 mb-2">?</p>
                  <p className="text-sm text-muted-foreground">
                    {streaming
                      ? "Waiting for sign detection..."
                      : "Start camera to detect signs"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="rounded-3xl border border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="size-4 text-yellow-500" />
                Tips for Best Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span>💡</span> Ensure good lighting
                </li>
                <li className="flex items-start gap-2">
                  <span>✋</span> Keep hand centered in frame
                </li>
                <li className="flex items-start gap-2">
                  <span>🎯</span> Use a plain background
                </li>
                <li className="flex items-start gap-2">
                  <span>📏</span> Keep hand close to camera
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
