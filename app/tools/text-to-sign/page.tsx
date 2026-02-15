"use client";

import * as React from "react";
import {
  Type,
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  ImageIcon,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { getVideoPath, getImagePath } from "@/lib/asl-data";

const MAX_CHARS = 70;

type DisplayMode = "avatar" | "image";

export default function TextToSignPage() {
  // Input state
  const [text, setText] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  // Display mode - exact from legacy (avatar = video, image = static)
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("avatar");

  // Playback state - from legacy combined video player
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [isFading, setIsFading] = React.useState(false);

  // Speech recognition - from legacy SpeechRecognition
  const [isListening, setIsListening] = React.useState(false);
  const [speechSupported, setSpeechSupported] = React.useState(false);

  // Refs
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const recognitionRef = React.useRef<unknown>(null);

  // Parse letters (A-Z only) - exact from legacy filterCharacters()
  const letters = text
    .toUpperCase()
    .split("")
    .filter((c) => /[A-Z]/.test(c));

  const currentLetter = letters[currentIndex] || "";
  const videoPath = getVideoPath(currentLetter, "alphabet");
  const imagePath = getImagePath(currentLetter, "alphabet");

  // Check for speech recognition support on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      const SpeechRecognition =
        win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  // Speed control - exact from legacy
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Handle text submit - from legacy displayResult()
  const handleSubmit = () => {
    if (letters.length > 0) {
      setSubmitted(true);
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setCurrentIndex(0);
    setText("");
    setIsPlaying(false);
    setIsFading(false);
    stopListening();
  };

  // Auto-advance to next letter when video ends - exact from legacy onVideoEnded
  const handleVideoEnded = React.useCallback(() => {
    if (currentIndex < letters.length - 1) {
      // Fade transition between letters - from legacy dissolve effect
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsFading(false);
        // Auto-play next video
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        }, 100);
      }, 300); // 300ms fade transition like legacy
    } else {
      // Completed all letters - auto-reset like legacy
      setIsPlaying(false);
    }
  }, [currentIndex, letters.length]);

  // Play/Pause toggle - from legacy playPause()
  const handlePlayPause = React.useCallback(() => {
    if (!videoRef.current && displayMode === "avatar") return;

    if (displayMode === "avatar") {
      if (isPlaying) {
        videoRef.current?.pause();
        setIsPlaying(false);
      } else {
        videoRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      // Image mode: auto-advance through images
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    }
  }, [isPlaying, displayMode]);

  // Stop button - from legacy stop()
  const handleStop = React.useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Image mode auto-advance timer
  React.useEffect(() => {
    if (displayMode === "image" && isPlaying && submitted) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < letters.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1500 / playbackSpeed); // Adjust speed
      return () => clearInterval(interval);
    }
  }, [displayMode, isPlaying, submitted, letters.length, playbackSpeed]);

  // Apply playback speed - from legacy changeSpeed()
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentIndex]);

  // Click on letter sequence to jump - from legacy letter sequence click handler
  const handleLetterClick = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Speech recognition - exact port from legacy initVoiceRecognition()
  const startListening = React.useCallback(() => {
    if (!speechSupported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognition =
      win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0][0].transcript;
      // Filter to A-Z only, max 70 chars - from legacy
      const filtered = transcript
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, MAX_CHARS);
      if (filtered.length > 0) {
        setText(filtered);
        setCurrentIndex(0);
        setIsPlaying(false);
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [speechSupported]);

  const stopListening = React.useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = recognitionRef.current as any;
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, []);

  // Cleanup speech recognition on unmount
  React.useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = recognitionRef.current as any;
      if (recognition) recognition.stop();
    };
  }, []);

  const progress =
    letters.length > 0 ? ((currentIndex + 1) / letters.length) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-4">
          Learning Tool
        </Badge>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          <span className="bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] bg-clip-text text-transparent">
            Text to Sign
          </span>
        </h1>
        <p className="text-muted-foreground mt-3 text-base md:text-lg">
          Type or speak a word, then follow each letter with clear sign demonstrations.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Step 1
            </p>
            <p className="mt-2 text-sm font-semibold">Type or speak</p>
            <p className="text-xs text-muted-foreground">Use the mic or keyboard to enter A-Z letters.</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Step 2
            </p>
            <p className="mt-2 text-sm font-semibold">Choose a mode</p>
            <p className="text-xs text-muted-foreground">Switch between video or image guidance.</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Step 3
            </p>
            <p className="mt-2 text-sm font-semibold">Play and repeat</p>
            <p className="text-xs text-muted-foreground">Slow it down or replay any letter.</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      {!submitted ? (
        <Card className="max-w-3xl mx-auto rounded-3xl glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="size-5 text-[color:var(--brand-1)]" />
              Enter Your Text
            </CardTitle>
            <CardDescription>
              Type letters (A-Z only, max {MAX_CHARS} characters) or use the
              microphone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={text}
                  onChange={(e) =>
                    setText(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z]/g, "")
                        .slice(0, MAX_CHARS)
                    )
                  }
                  placeholder="Type your text here..."
                  className="text-lg h-12 pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {text.length}/{MAX_CHARS}
                </span>
              </div>
              {/* Mic button - from legacy voice recognition */}
              {speechSupported && (
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className="h-12 w-12"
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? (
                    <MicOff className="size-5" />
                  ) : (
                    <Mic className="size-5" />
                  )}
                </Button>
              )}
            </div>

            {isListening && (
              <p className="text-sm text-orange-600 animate-pulse">
                🎤 Listening... Speak now
              </p>
            )}

            <p className="text-sm text-muted-foreground">
              Letters found:{" "}
              <span className="font-mono font-semibold">
                {letters.join("") || "—"}
              </span>
            </p>

            {/* Display mode selector - from legacy mode tabs */}
            <Separator />
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Display Mode:</span>
              <div className="flex gap-2">
                <Button
                  variant={displayMode === "avatar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDisplayMode("avatar")}
                >
                  <Video className="size-4 mr-1" />
                  Video
                </Button>
                <Button
                  variant={displayMode === "image" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDisplayMode("image")}
                >
                  <ImageIcon className="size-4 mr-1" />
                  Image
                </Button>
              </div>
            </div>

            <Button
              className="w-full rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white"
              size="lg"
              onClick={handleSubmit}
              disabled={letters.length === 0}
            >
              <Play className="size-4 mr-2" />
              Show Signs ({letters.length} letters)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Progress Bar - from legacy progress bar */}
          <Card className="rounded-3xl border border-border/60 bg-card/80">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Letter {currentIndex + 1} of {letters.length}
                </CardTitle>
                <Badge variant="outline">
                  {displayMode === "avatar" ? "Video Mode" : "Image Mode"}
                </Badge>
              </div>
              <Progress value={progress} className="mt-3" />
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            {/* Main display area */}
            <Card className="rounded-3xl border border-border/60 bg-card/80">
              <CardHeader className="text-center pb-2">
                <p
                  className={`text-7xl font-bold text-[color:var(--brand-1)] transition-opacity duration-300 ${
                    isFading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {currentLetter}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video/Image display - from legacy combined player */}
                {displayMode === "avatar" ? (
                  <div
                    className={`aspect-video rounded-lg bg-black flex items-center justify-center border overflow-hidden transition-opacity duration-300 ${
                      isFading ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <video
                      ref={videoRef}
                      key={currentLetter} // Force remount on letter change
                      src={videoPath}
                      className="w-full h-full object-contain"
                      onEnded={handleVideoEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      playsInline
                    />
                  </div>
                ) : (
                  <div
                    className={`aspect-video rounded-lg bg-muted flex items-center justify-center border overflow-hidden transition-opacity duration-300 ${
                      isFading ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePath}
                      alt={`ASL sign for ${currentLetter}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}

                {/* Playback controls - from legacy play/pause/stop */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      size="lg"
                      className="rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="size-4 mr-2" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="size-4 mr-2" /> Play
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleStop}>
                      <Square className="size-4 mr-2" /> Stop
                    </Button>
                  </div>

                  {/* Speed control - from legacy changeSpeed() */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Speed:
                    </span>
                    <Select
                      value={String(playbackSpeed)}
                      onValueChange={(v) => setPlaybackSpeed(parseFloat(v))}
                    >
                      <SelectTrigger className="w-25 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {speeds.map((s) => (
                          <SelectItem key={s} value={String(s)}>
                            {s}x
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar - letter sequence */}
            <div className="space-y-4">
              {/* Display mode toggle */}
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm font-semibold mb-2">Display Mode</p>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        displayMode === "avatar" ? "default" : "outline"
                      }
                      size="sm"
                      className="flex-1"
                      onClick={() => setDisplayMode("avatar")}
                    >
                      <Video className="size-3 mr-1" />
                      Video
                    </Button>
                    <Button
                      variant={displayMode === "image" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setDisplayMode("image")}
                    >
                      <ImageIcon className="size-3 mr-1" />
                      Image
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Letter sequence - from legacy clickable letter sequence */}
              <Card className="rounded-3xl border border-border/60 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Letter Sequence</CardTitle>
                  <CardDescription className="text-xs">
                    Click a letter to jump
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {letters.map((letter, i) => (
                      <button
                        key={i}
                        onClick={() => handleLetterClick(i)}
                        className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                          i === currentIndex
                            ? "bg-[color:var(--brand-1)] text-white scale-110"
                            : i < currentIndex
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Speech input - from legacy voice recognition */}
              {speechSupported && (
                <Card className="rounded-3xl border border-border/60 bg-card/80">
                  <CardContent className="pt-4">
                    <p className="text-sm font-semibold mb-2">Voice Input</p>
                    <Button
                      variant={isListening ? "destructive" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={isListening ? stopListening : startListening}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="size-3 mr-1" /> Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="size-3 mr-1" /> New Voice Input
                        </>
                      )}
                    </Button>
                    {isListening && (
                      <p className="text-xs text-orange-600 animate-pulse mt-2 text-center">
                        🎤 Listening...
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <Button variant="outline" className="w-full" onClick={handleReset}>
            Try Another Text
          </Button>
        </div>
      )}
    </div>
  );
}
