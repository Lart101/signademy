"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/lib/sound-context";

export function SoundToggle() {
  const { soundEnabled, toggleSound } = useSound();

  return (
    <button
      onClick={toggleSound}
      aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
      title={soundEnabled ? "Sound ON — click to mute" : "Sound OFF — click to unmute"}
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center size-12 rounded-full border border-border/60 bg-background/80 backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl hover:bg-background/95 active:scale-95 cursor-pointer"
    >
      {soundEnabled ? (
        <Volume2 className="size-5 text-foreground" />
      ) : (
        <VolumeX className="size-5 text-muted-foreground" />
      )}
    </button>
  );
}
