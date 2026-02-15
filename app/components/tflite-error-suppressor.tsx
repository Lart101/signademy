"use client";

import { useEffect } from "react";

/**
 * Suppresses the TensorFlow Lite XNNPACK info message that MediaPipe
 * logs via console.error. This is not a real error — it's an info log
 * from the WASM binary indicating CPU fallback, which is normal.
 */
export function TFLiteErrorSuppressor() {
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === "string" ? args[0] : "";
      if (msg.includes("Created TensorFlow Lite XNNPACK delegate for CPU")) {
        // Downgrade to console.info so it doesn't trigger the Next.js error overlay
        console.info("[MediaPipe]", ...args);
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
