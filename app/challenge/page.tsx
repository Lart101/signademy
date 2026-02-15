"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Clock,
  Flame,
  Play,
  RotateCcw,
  SkipForward,
  Trophy,
  Video,
  Heart,
  Eye,
  Camera,
} from "lucide-react";
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
import {
  CHALLENGE_WORDS,
  MODULES,
  getVideoPath,
  type ModuleKey,
} from "@/lib/asl-data";
import { getAvailableModels, normalizeModelOutput } from "@/lib/ai-models";

// Challenge modes - exact from legacy challenge.js
type ChallengeMode = "flash-sign" | "sign-match" | "endless" | null;

interface QuestionItem {
  word: string;
  category: string;
}

interface GameState {
  mode: ChallengeMode;
  questions: QuestionItem[];
  currentIndex: number;
  score: number;
  correct: number;
  wrong: number;
  skipped: number;
  lives: number;
  timeLeft: number;
  isActive: boolean;
  showResult: boolean;
  lastCorrect: boolean;
  revealUsed: boolean;
  showReveal: boolean;
  // sign-match specific
  signMatchOptions: string[];
  signMatchSelected: string | null;
  signMatchPhase: "select" | "demonstrate"; // select video then demonstrate via webcam
  // webcam detection
  detectedSign: string | null;
  detectedConfidence: number;
}

const TOTAL_QUESTIONS = 10;
const TIMER_SECONDS = 10;
const ENDLESS_LIVES = 3;

export default function ChallengePage() {
  // Page state
  const [pageState, setPageState] = React.useState<
    "menu" | "playing" | "results"
  >("menu");
  const [modelCategory, setModelCategory] = React.useState("alphabet");

  // Game state
  const [game, setGame] = React.useState<GameState>({
    mode: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    skipped: 0,
    lives: ENDLESS_LIVES,
    timeLeft: TIMER_SECONDS,
    isActive: false,
    showResult: false,
    lastCorrect: false,
    revealUsed: false,
    showReveal: false,
    signMatchOptions: [],
    signMatchSelected: null,
    signMatchPhase: "select",
    detectedSign: null,
    detectedConfidence: 0,
  });

  // Webcam refs
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const webcamRunningRef = React.useRef(false);
  const gestureRecognizerRef = React.useRef<unknown>(null);
  const runningModeRef = React.useRef<"IMAGE" | "VIDEO">("IMAGE");
  const lastVideoTimeRef = React.useRef(-1);
  const drawingUtilsClassRef = React.useRef<unknown>(null);
  const gestureRecognizerClassRef = React.useRef<unknown>(null);
  const lastResultsRef = React.useRef<unknown>(null);

  // Model loading
  const [modelLoading, setModelLoading] = React.useState(false);
  const [modelReady, setModelReady] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [modelError, setModelError] = React.useState<string | null>(null);
  const [cameraActive, setCameraActive] = React.useState(false);

  // Debounce ref for gesture detection
  const lastDetectionRef = React.useRef(0);
  const correctDetectedRef = React.useRef(false);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const models = getAvailableModels();

  // Load gesture recognizer - from legacy createGestureRecognizer()
  const loadGestureRecognizer = React.useCallback(
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
        const fr = await FilesetResolver.forVisionTasks(
          getMediaPipeWasm()
        );
        setLoadingProgress(70);
        const { getModelBuffer } = await import("@/lib/model-cache");
        const modelBuffer = await getModelBuffer(category);
        gestureRecognizerRef.current =
          await GestureRecognizer.createFromOptions(fr, {
            baseOptions: {
              modelAssetBuffer: new Uint8Array(modelBuffer),
              delegate: "GPU",
            },
            runningMode: runningModeRef.current,
          });
        setLoadingProgress(100);
        setModelReady(true);
        setModelLoading(false);
        setModelCategory(category);
      } catch (err) {
        console.error("Model load error:", err);
        setModelError("Failed to load AI model. Please refresh and try again.");
        setModelLoading(false);
      }
    },
    [modelLoading]
  );

  // Init model on mount
  React.useEffect(() => {
    loadGestureRecognizer("alphabet");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate questions for a mode - from legacy generateQuestions() / initializeEndlessQueue()
  const generateQuestions = React.useCallback(
    (mode: ChallengeMode, category: string): QuestionItem[] => {
      if (mode === "endless") {
        // Endless: shuffle 3 from each category - from legacy initializeEndlessQueue()
        const queue: QuestionItem[] = [];
        const categories = Object.keys(CHALLENGE_WORDS);
        for (const cat of categories) {
          const words = [...CHALLENGE_WORDS[cat]];
          const shuffled = words.sort(() => Math.random() - 0.5);
          const picked = shuffled.slice(0, 3);
          for (const word of picked) {
            queue.push({ word, category: cat });
          }
        }
        return queue.sort(() => Math.random() - 0.5);
      } else {
        // flash-sign and sign-match: 10 questions from selected category
        const words = [...(CHALLENGE_WORDS[category] || [])];
        const shuffled = words.sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, TOTAL_QUESTIONS);
        return picked.map((w) => ({ word: w, category }));
      }
    },
    []
  );

  // Generate sign-match options (2 videos, one correct) - from legacy
  const generateSignMatchOptions = React.useCallback(
    (correctWord: string, category: string): string[] => {
      const words = CHALLENGE_WORDS[category] || [];
      const others = words.filter((w) => w !== correctWord);
      const wrong = others[Math.floor(Math.random() * others.length)] || "A";
      const options = [correctWord, wrong].sort(() => Math.random() - 0.5);
      return options;
    },
    []
  );

  // Start game - from legacy startGame()
  const startGame = React.useCallback(
    (mode: ChallengeMode) => {
      if (!mode) return;
      const questions = generateQuestions(mode, modelCategory);
      if (questions.length === 0) return;

      const firstQ = questions[0];
      const signMatchOpts =
        mode === "sign-match"
          ? generateSignMatchOptions(firstQ.word, firstQ.category)
          : [];

      setGame({
        mode,
        questions,
        currentIndex: 0,
        score: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        lives: mode === "endless" ? ENDLESS_LIVES : 0,
        timeLeft: TIMER_SECONDS,
        isActive: true,
        showResult: false,
        lastCorrect: false,
        revealUsed: false,
        showReveal: false,
        signMatchOptions: signMatchOpts,
        signMatchSelected: null,
        signMatchPhase: "select",
        detectedSign: null,
        detectedConfidence: 0,
      });
      setPageState("playing");
      correctDetectedRef.current = false;
    },
    [modelCategory, generateQuestions, generateSignMatchOptions]
  );

  // Timer - from legacy startTimer() / 10 second countdown
  React.useEffect(() => {
    if (
      pageState !== "playing" ||
      !game.isActive ||
      game.showResult ||
      game.mode === "sign-match" // sign-match doesn't use timer
    )
      return;

    timerRef.current = setInterval(() => {
      setGame((prev) => {
        // Guard: if result is already shown, don't double-count
        if (prev.showResult) return prev;
        if (prev.timeLeft <= 1) {
          // Time's up - wrong answer
          return {
            ...prev,
            timeLeft: 0,
            showResult: true,
            lastCorrect: false,
            wrong: prev.wrong + 1,
            lives:
              prev.mode === "endless" ? prev.lives - 1 : prev.lives,
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pageState, game.isActive, game.showResult, game.mode]);

  // Webcam prediction loop - from legacy predictWebcam() adapted for challenge
  const predictWebcam = React.useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
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

    // Draw landmarks (using cached results to prevent flicker)
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

    // Check gestures with debounce to prevent flickering
    if (results?.gestures?.length > 0) {
      const categoryName = results.gestures[0][0].categoryName;
      const score = parseFloat(
        (results.gestures[0][0].score * 100).toFixed(2)
      );

      if (score >= 50) {
        const normalizedSign = normalizeModelOutput(categoryName);
        setGame((prev) => ({
          ...prev,
          detectedSign: normalizedSign,
          detectedConfidence: score,
        }));
        lastDetectionRef.current = Date.now();

        // Auto-verify: check if detected sign matches current question
        if (!correctDetectedRef.current) {
          setGame((prev) => {
            if (prev.showResult || !prev.isActive) return prev;
            const currentQ = prev.questions[prev.currentIndex];
            if (!currentQ) return prev;
            const normalized = normalizedSign;
            const expected = normalizeModelOutput(currentQ.word);
            if (normalized === expected && score >= 60) {
              correctDetectedRef.current = true;
              return {
                ...prev,
                showResult: true,
                lastCorrect: true,
                correct: prev.correct + 1,
                score: prev.score + 10,
              };
            }
            return prev;
          });
        }
      }
    } else {
      // Only clear after 500ms of no detection to prevent flicker
      if (Date.now() - lastDetectionRef.current > 500) {
        setGame((prev) => ({
          ...prev,
          detectedSign: null,
          detectedConfidence: 0,
        }));
      }
    }

    if (webcamRunningRef.current) {
      window.requestAnimationFrame(predictWebcam);
    }
  }, []);

  // Toggle camera
  const toggleCamera = React.useCallback(async () => {
    if (!gestureRecognizerRef.current) {
      toast.warning("AI model not loaded yet.");
      return;
    }

    if (cameraActive) {
      webcamRunningRef.current = false;
      setCameraActive(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      // Reset mode for next activation
      runningModeRef.current = "IMAGE";
      lastVideoTimeRef.current = -1;
      lastResultsRef.current = null;
    } else {
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

  // Next question - from legacy nextQuestion()
  const nextQuestion = React.useCallback(() => {
    setGame((prev) => {
      // Check end conditions
      if (prev.mode === "endless" && prev.lives <= 0) {
        setPageState("results");
        return prev;
      }
      if (
        prev.mode !== "endless" &&
        prev.currentIndex >= prev.questions.length - 1
      ) {
        setPageState("results");
        return prev;
      }
      // Endless: add more questions if running low
      let questions = prev.questions;
      if (
        prev.mode === "endless" &&
        prev.currentIndex >= questions.length - 2
      ) {
        // Add 3 more random questions per category
        const cats = Object.keys(CHALLENGE_WORDS);
        const extra: QuestionItem[] = [];
        for (const cat of cats) {
          const words = [...CHALLENGE_WORDS[cat]];
          const shuffled = words.sort(() => Math.random() - 0.5);
          extra.push(
            ...shuffled.slice(0, 2).map((w) => ({ word: w, category: cat }))
          );
        }
        questions = [...questions, ...extra.sort(() => Math.random() - 0.5)];
      }

      const nextIdx = prev.currentIndex + 1;
      const nextQ = questions[nextIdx];
      const signMatchOpts =
        prev.mode === "sign-match" && nextQ
          ? (() => {
              const others = CHALLENGE_WORDS[nextQ.category]?.filter(
                (w) => w !== nextQ.word
              ) || [];
              const wrong = others.length > 0
                ? others[Math.floor(Math.random() * others.length)]
                : "A";
              return [nextQ.word, wrong].sort(() => Math.random() - 0.5);
            })()
          : [];

      correctDetectedRef.current = false;

      return {
        ...prev,
        questions,
        currentIndex: nextIdx,
        timeLeft: TIMER_SECONDS,
        showResult: false,
        lastCorrect: false,
        showReveal: false,
        signMatchOptions: signMatchOpts,
        signMatchSelected: null,
        signMatchPhase: "select",
        detectedSign: null,
        detectedConfidence: 0,
      };
    });
  }, []);

  // Skip question - from legacy skipQuestion()
  const skipQuestion = React.useCallback(() => {
    if (game.mode === "endless") return; // Can't skip in endless
    setGame((prev) => ({
      ...prev,
      showResult: true,
      lastCorrect: false,
      skipped: prev.skipped + 1,
    }));
  }, [game.mode]);

  // Reveal answer - from legacy revealSign() (once per game)
  const revealAnswer = React.useCallback(() => {
    setGame((prev) => ({
      ...prev,
      showReveal: true,
      revealUsed: true,
    }));
  }, []);

  // Sign-match: user selects a video option
  const handleSignMatchSelect = React.useCallback(
    (selected: string) => {
      const currentQ = game.questions[game.currentIndex];
      if (!currentQ) return;
      const isCorrect = selected === currentQ.word;

      if (isCorrect) {
        // Move to "demonstrate" phase - user must sign it via webcam
        setGame((prev) => ({
          ...prev,
          signMatchSelected: selected,
          signMatchPhase: "demonstrate",
        }));
      } else {
        setGame((prev) => ({
          ...prev,
          signMatchSelected: selected,
          showResult: true,
          lastCorrect: false,
          wrong: prev.wrong + 1,
        }));
      }
    },
    [game.questions, game.currentIndex]
  );

  // Handle model change
  const handleModelChange = React.useCallback(
    async (newModel: string) => {
      runningModeRef.current = "IMAGE";
      lastVideoTimeRef.current = -1;
      await loadGestureRecognizer(newModel);
    },
    [loadGestureRecognizer]
  );

  // Reset
  const resetGame = React.useCallback(() => {
    setPageState("menu");
    webcamRunningRef.current = false;
    setCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    correctDetectedRef.current = false;
    setGame({
      mode: null,
      questions: [],
      currentIndex: 0,
      score: 0,
      correct: 0,
      wrong: 0,
      skipped: 0,
      lives: ENDLESS_LIVES,
      timeLeft: TIMER_SECONDS,
      isActive: false,
      showResult: false,
      lastCorrect: false,
      revealUsed: false,
      showReveal: false,
      signMatchOptions: [],
      signMatchSelected: null,
      signMatchPhase: "select",
      detectedSign: null,
      detectedConfidence: 0,
    });
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      webcamRunningRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = game.questions[game.currentIndex];
  const isTimerWarning = game.timeLeft <= 5;

  // Results calculations - from legacy showResults()
  const totalAnswered = game.correct + game.wrong + game.skipped;
  const accuracy =
    totalAnswered > 0 ? Math.round((game.correct / totalAnswered) * 100) : 0;
  const performanceMessage =
    accuracy >= 80
      ? "🌟 Excellent work!"
      : accuracy >= 50
      ? "👍 Good effort!"
      : "💪 Keep practicing!";

  // Challenge mode definitions - exact from legacy
  const challengeModes = [
    {
      id: "flash-sign" as const,
      name: "Flash Sign",
      emoji: "⚡",
      icon: Flame,
      description:
        "10 questions, 10 seconds each. Show the correct sign via webcam!",
      color: "from-red-500 to-orange-500",
      rules: [
        "10 questions total",
        "10 seconds per question",
        "Sign the answer via webcam",
        "One reveal power per game",
      ],
    },
    {
      id: "sign-match" as const,
      name: "Sign Match",
      emoji: "🎬",
      icon: Video,
      description:
        "Pick the correct video, then demonstrate the sign via webcam.",
      color: "from-blue-500 to-cyan-500",
      rules: [
        "Choose the correct video",
        "Then demonstrate via webcam",
        "No time limit",
        "10 questions per round",
      ],
    },
    {
      id: "endless" as const,
      name: "Endless Mode",
      emoji: "♾️",
      icon: Trophy,
      description:
        "Mixed categories, 3 lives. Keep going until you run out!",
      color: "from-yellow-500 to-amber-500",
      rules: [
        "3 lives total",
        "Mixed categories",
        "Cannot skip",
        "Shuffled question queue",
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold tracking-tight font-display md:text-5xl">
          🎯{" "}
          <span className="bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] bg-clip-text text-transparent">
            Challenge Games
          </span>
        </h1>
        <p className="text-muted-foreground mt-3 text-base md:text-lg">
          Test your ASL knowledge with webcam-based challenges.
        </p>
      </div>

      {/* ═══════ MODE SELECTION MENU ═══════ */}
      {pageState === "menu" && (
        <div className="space-y-6">
          {/* Model selector */}
          <Card className="rounded-3xl border border-border/60 bg-card/80">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-medium">AI Model:</label>
                <Select
                  value={modelCategory}
                  onValueChange={handleModelChange}
                >
                  <SelectTrigger className="w-[200px]">
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
                  <div className="flex-1 min-w-[200px]">
                    <Progress value={loadingProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Loading... {loadingProgress}%
                    </p>
                  </div>
                )}
                {modelReady && !modelLoading && (
                  <Badge variant="outline" className="text-green-600">
                    ✅ Ready
                  </Badge>
                )}
                {modelError && (
                  <p className="text-sm text-red-600">{modelError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mode cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {challengeModes.map((mode) => (
              <Card
                key={mode.id}
                className="group rounded-3xl border border-border/60 bg-card/80 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => startGame(mode.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mode.emoji}</span>
                    <div>
                      <CardTitle className="text-lg">{mode.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {mode.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {mode.rules.map((rule, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-[color:var(--brand-1)]" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ GAME PLAYING ═══════ */}
      {pageState === "playing" && currentQ && (
        <div className="space-y-6">
          {/* Top stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Score</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{game.score}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Question</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {game.currentIndex + 1}
                  {game.mode !== "endless"
                    ? `/${game.questions.length}`
                    : ""}
                </p>
              </CardContent>
            </Card>
            {game.mode === "endless" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Lives</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-1">
                  {Array.from({ length: ENDLESS_LIVES }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`size-6 ${
                        i < game.lives
                          ? "fill-red-500 text-red-500"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
            {game.mode !== "sign-match" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-bold ${
                      isTimerWarning ? "text-red-500 animate-pulse" : ""
                    }`}
                  >
                    <Clock className="inline size-5 mr-1" />
                    {game.timeLeft}s
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            {/* Main question area */}
            <Card className="border-2 rounded-3xl">
              <CardHeader className="text-center">
                <Badge className="w-fit mx-auto mb-2">
                  {game.mode === "flash-sign"
                    ? "⚡ Flash Sign"
                    : game.mode === "sign-match"
                    ? "🎬 Sign Match"
                    : "♾️ Endless"}
                </Badge>
                <CardTitle className="text-2xl">
                  {game.mode === "sign-match" &&
                  game.signMatchPhase === "select"
                    ? "Which video shows:"
                    : "Sign this:"}
                </CardTitle>
                <p className="text-5xl font-bold text-[color:var(--brand-1)] mt-2">
                  {currentQ.word}
                </p>
                {game.mode === "endless" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Category:{" "}
                    {MODULES[currentQ.category as ModuleKey]?.name ||
                      currentQ.category}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Sign-match: show 2 video options - from legacy */}
                {game.mode === "sign-match" &&
                  game.signMatchPhase === "select" &&
                  !game.showResult && (
                    <div className="grid grid-cols-2 gap-4">
                      {game.signMatchOptions.map((opt, i) => (
                        <button
                          key={opt}
                          onClick={() => handleSignMatchSelect(opt)}
                          className={`rounded-lg border-2 p-2 transition-all hover:border-[color:var(--brand-1)] ${
                            game.signMatchSelected === opt
                              ? opt === currentQ.word
                                ? "border-green-500"
                                : "border-red-500"
                              : "border-muted"
                          }`}
                        >
                          <div className="aspect-video bg-black rounded overflow-hidden">
                            <video
                              src={getVideoPath(opt, currentQ.category)}
                              className="w-full h-full object-contain"
                              muted
                              autoPlay
                              loop
                              playsInline
                            />
                          </div>
                          <p className="text-sm font-medium text-center mt-1">
                            Option {i + 1}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                {/* Reveal video - from legacy revealSign() */}
                {game.showReveal && (
                  <div className="rounded-lg border overflow-hidden">
                    <video
                      src={getVideoPath(currentQ.word, currentQ.category)}
                      className="w-full aspect-video object-contain bg-black"
                      autoPlay
                      playsInline
                    />
                    <p className="text-center text-sm text-muted-foreground py-1">
                      Demonstration of &quot;{currentQ.word}&quot;
                    </p>
                  </div>
                )}

                {/* Result feedback */}
                {game.showResult && (
                  <div
                    className={`rounded-lg p-6 text-center ${
                      game.lastCorrect
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        game.lastCorrect ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {game.lastCorrect ? "✓ Correct!" : "✗ Incorrect"}
                    </p>
                    <p className="mt-2">
                      Answer:{" "}
                      <span className="font-bold">{currentQ.word}</span>
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {!game.showResult &&
                  !(
                    game.mode === "sign-match" &&
                    game.signMatchPhase === "select"
                  ) && (
                    <div className="flex gap-2 flex-wrap justify-center">
                      {/* Reveal button - once per game */}
                      {!game.revealUsed && !game.showReveal && (
                        <Button
                          variant="outline"
                          onClick={revealAnswer}
                        >
                          <Eye className="size-4 mr-2" />
                          Reveal Sign
                        </Button>
                      )}
                      {/* Skip - not in endless */}
                      {game.mode !== "endless" && (
                        <Button variant="outline" onClick={skipQuestion}>
                          <SkipForward className="size-4 mr-2" />
                          Skip
                        </Button>
                      )}
                    </div>
                  )}

                {/* Next button after result */}
                {game.showResult && (
                  <Button
                    onClick={nextQuestion}
                    className="w-full rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white"
                    size="lg"
                  >
                    {game.mode === "endless" && game.lives <= 0
                      ? "See Results"
                      : game.mode !== "endless" &&
                        game.currentIndex >= game.questions.length - 1
                      ? "See Results"
                      : "Next Question →"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Webcam sidebar */}
            <div className="space-y-4">
              <Card className="rounded-3xl border border-border/60 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Camera className="size-4" />
                    Webcam Detection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant={cameraActive ? "destructive" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={toggleCamera}
                    disabled={!modelReady}
                  >
                    {cameraActive ? "Stop Camera" : "Start Camera"}
                  </Button>

                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{
                        display: cameraActive ? "block" : "none",
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                      style={{
                        display: cameraActive ? "block" : "none",
                      }}
                    />
                    {!cameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <Camera className="size-8 opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* Detection display */}
                  {game.detectedSign && (
                    <div className="text-center rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">
                        Detected:
                      </p>
                      <p className="text-xl font-bold text-[color:var(--brand-1)]">
                        {game.detectedSign}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {game.detectedConfidence.toFixed(1)}% confidence
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Game info */}
              <Card className="rounded-3xl border border-border/60 bg-card/80">
                <CardContent className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <p>✅ Correct: {game.correct}</p>
                  <p>❌ Wrong: {game.wrong}</p>
                  <p>⏭️ Skipped: {game.skipped}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ RESULTS SCREEN ═══════ */}
      {pageState === "results" && (
        <div className="max-w-2xl mx-auto">
          <Card className="text-center border-2 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-3xl mb-2">🎉 Game Over!</CardTitle>
              <CardDescription className="text-lg">
                {game.mode &&
                  challengeModes.find((m) => m.id === game.mode)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Performance message - from legacy */}
              <p className="text-xl">{performanceMessage}</p>

              {/* Score */}
              <div>
                <p className="text-muted-foreground">Final Score</p>
                <p className="text-5xl font-bold text-[color:var(--brand-1)]">
                  {game.score}
                </p>
              </div>

              <Separator />

              {/* Stats grid - from legacy showResults() */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-2xl font-bold text-green-600">
                    {game.correct}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-sm text-muted-foreground">Wrong</p>
                  <p className="text-2xl font-bold text-red-600">
                    {game.wrong}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-sm text-muted-foreground">Skipped</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {game.skipped}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {accuracy}%
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-6">
                <Button
                  onClick={() => startGame(game.mode)}
                  className="rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white"
                  size="lg"
                >
                  <RotateCcw className="size-4 mr-2" />
                  Play Again
                </Button>
                <Button onClick={resetGame} variant="outline" size="lg">
                  Return to Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
