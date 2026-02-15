// hooks/use-gesture-recognizer.ts
// React hook for MediaPipe GestureRecognizer - ported from legacy config.js
"use client";

import { useCallback, useRef, useState } from "react";
import { normalizeModelOutput, MODEL_CONFIG } from "@/lib/ai-models";
import { getModelBuffer } from "@/lib/model-cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GestureRecognizerType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DrawingUtilsType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilesetResolverType = any;

interface GestureResult {
  sign: string;
  confidence: number;
  rawName: string;
}

interface UseGestureRecognizerReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  loadingProgress: number;
  loadModel: (category?: string) => Promise<void>;
  recognizeImage: (imageData: ImageData) => GestureResult | null;
  recognizeVideo: (video: HTMLVideoElement, timestamp: number) => GestureResult | null;
  drawLandmarks: (canvas: HTMLCanvasElement, results: unknown) => void;
  getRecognizer: () => GestureRecognizerType;
  currentModel: string;
  setRunningMode: (mode: "IMAGE" | "VIDEO") => Promise<void>;
}

export function useGestureRecognizer(): UseGestureRecognizerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentModel, setCurrentModel] = useState("alphabet");

  const recognizerRef = useRef<GestureRecognizerType>(null);
  const drawingUtilsClassRef = useRef<DrawingUtilsType>(null);
  const gestureRecognizerClassRef = useRef<GestureRecognizerType>(null);
  const runningModeRef = useRef<"IMAGE" | "VIDEO">("IMAGE");

  const loadModel = useCallback(async (category: string = "alphabet") => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setLoadingProgress(10);

    try {
      // Load MediaPipe via helper (avoids Turbopack interception)
      setLoadingProgress(20);
      const { loadMediaPipeVision, getMediaPipeWasm } = await import("@/lib/load-mediapipe");
      const vision = await loadMediaPipeVision();

      const { GestureRecognizer, FilesetResolver, DrawingUtils } = vision;
      gestureRecognizerClassRef.current = GestureRecognizer;
      drawingUtilsClassRef.current = DrawingUtils;

      setLoadingProgress(40);

      // Load FilesetResolver — use resolved WASM path (may differ if fallback CDN was used)
      const filesetResolver: FilesetResolverType = await FilesetResolver.forVisionTasks(getMediaPipeWasm());

      setLoadingProgress(60);

      // Get model — from cache if available, otherwise download & cache
      const modelBuffer = await getModelBuffer(category);

      setLoadingProgress(80);

      // Create gesture recognizer — use buffer instead of URL for instant loads
      recognizerRef.current = await GestureRecognizer.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetBuffer: new Uint8Array(modelBuffer),
          delegate: "GPU",
        },
        runningMode: runningModeRef.current,
      });

      setCurrentModel(category);
      setLoadingProgress(100);
      setIsReady(true);
      setIsLoading(false);

      console.log(`✅ Gesture recognizer loaded for ${category}`);
    } catch (err) {
      console.error("Error loading gesture recognizer:", err);
      setError(err instanceof Error ? err.message : "Failed to load AI model");
      setIsLoading(false);
      setIsReady(false);
    }
  }, [isLoading]);

  const setRunningMode = useCallback(async (mode: "IMAGE" | "VIDEO") => {
    if (recognizerRef.current && runningModeRef.current !== mode) {
      runningModeRef.current = mode;
      await recognizerRef.current.setOptions({ runningMode: mode });
    }
  }, []);

  const recognizeImage = useCallback((imageData: ImageData): GestureResult | null => {
    if (!recognizerRef.current) return null;

    try {
      const results = recognizerRef.current.recognize(imageData);
      if (results?.gestures?.length > 0) {
        const gesture = results.gestures[0][0];
        return {
          sign: normalizeModelOutput(gesture.categoryName),
          confidence: gesture.score * 100,
          rawName: gesture.categoryName,
        };
      }
      return null;
    } catch (err) {
      console.error("Recognition error:", err);
      return null;
    }
  }, []);

  const recognizeVideo = useCallback((video: HTMLVideoElement, timestamp: number): GestureResult | null => {
    if (!recognizerRef.current) return null;

    try {
      const results = recognizerRef.current.recognizeForVideo(video, timestamp);
      if (results?.gestures?.length > 0) {
        const gesture = results.gestures[0][0];
        const confidence = gesture.score * 100;
        if (confidence >= MODEL_CONFIG.minConfidence * 100) {
          return {
            sign: normalizeModelOutput(gesture.categoryName),
            confidence,
            rawName: gesture.categoryName,
          };
        }
      }
      return null;
    } catch (err) {
      console.error("Video recognition error:", err);
      return null;
    }
  }, []);

  const drawLandmarks = useCallback((canvas: HTMLCanvasElement, results: unknown) => {
    const ctx = canvas.getContext("2d");
    if (!ctx || !drawingUtilsClassRef.current || !gestureRecognizerClassRef.current) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawingUtils = new drawingUtilsClassRef.current(ctx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = results as any;

    if (res?.landmarks) {
      for (const landmarks of res.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          gestureRecognizerClassRef.current.HAND_CONNECTIONS,
          { color: "#00FF00", lineWidth: 2 }
        );
        drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
      }
    }

    ctx.restore();
  }, []);

  const getRecognizer = useCallback(() => recognizerRef.current, []);

  return {
    isLoading,
    isReady,
    error,
    loadingProgress,
    loadModel,
    recognizeImage,
    recognizeVideo,
    drawLandmarks,
    getRecognizer,
    currentModel,
    setRunningMode,
  };
}
