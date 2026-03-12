"use client";

import * as React from "react";

interface SoundContextValue {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (name: "correct" | "incorrect" | "select" | "camera") => void;
  startBgm: () => void;
  stopBgm: () => void;
}

const SoundContext = React.createContext<SoundContextValue | null>(null);

const STORAGE_KEY = "signademy-sound-enabled";

const SFX_PATHS: Record<string, string> = {
  correct: "/audio/correct.mp3",
  incorrect: "/audio/incorrect.mp3",
  select: "/audio/select.mp3",
  camera: "/audio/camera.mp3",
};

const BGM_PATH = "/audio/bgm-loop.mp3";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const bgmRef = React.useRef<HTMLAudioElement | null>(null);
  const mounted = React.useRef(false);

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    mounted.current = true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setSoundEnabled(stored === "true");
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Persist to localStorage on change
  React.useEffect(() => {
    if (!mounted.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, String(soundEnabled));
    } catch {
      // localStorage unavailable
    }
  }, [soundEnabled]);

  // Mute/unmute BGM when toggle changes
  React.useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.muted = !soundEnabled;
    }
  }, [soundEnabled]);

  const toggleSound = React.useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const playSound = React.useCallback(
    (name: "correct" | "incorrect" | "select" | "camera") => {
      if (!soundEnabled) return;
      const path = SFX_PATHS[name];
      if (!path) return;
      try {
        const audio = new Audio(path);
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Autoplay blocked — user hasn't interacted yet
        });
      } catch {
        // Audio API unavailable
      }
    },
    [soundEnabled]
  );

  const startBgm = React.useCallback(() => {
    try {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
      const audio = new Audio(BGM_PATH);
      audio.loop = true;
      audio.volume = 0.15;
      audio.muted = !soundEnabled;
      bgmRef.current = audio;
      audio.play().catch(() => {
        // Autoplay blocked
      });
    } catch {
      // Audio API unavailable
    }
  }, [soundEnabled]);

  const stopBgm = React.useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      bgmRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  const value = React.useMemo(
    () => ({ soundEnabled, toggleSound, playSound, startBgm, stopBgm }),
    [soundEnabled, toggleSound, playSound, startBgm, stopBgm]
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = React.useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return ctx;
}
