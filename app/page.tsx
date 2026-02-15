import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Camera,
  FileImage,
  Hand,
  Hash,
  MessageSquare,
  Palette,
  Sparkles,
  Target,
  Type,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  HomeHero,
  HomeStats,
  HomeSectionHeader,
  HomeStagger,
  HomeStaggerChild,
  HomeFadeIn,
} from "./components/home-animations"

const features = [
  {
    icon: BookOpen,
    title: "Guided Learning Path",
    description:
      "Follow 6 structured modules that move from the alphabet to everyday ASL with a clear next step.",
    href: "/modules",
  },
  {
    icon: Target,
    title: "Challenge Modes",
    description:
      "Use 4 fast-paced challenges to reinforce memory and build speed with immediate feedback.",
    href: "/challenge",
  },
  {
    icon: Camera,
    title: "Live Practice",
    description:
      "Get real-time AI feedback with webcam detection that confirms your signs instantly.",
    href: "/tools/webcam",
  },
  {
    icon: Type,
    title: "Text to Sign",
    description:
      "Convert any sentence into sign guidance and learn each letter with clear, paced videos.",
    href: "/tools/text-to-sign",
  },
  {
    icon: FileImage,
    title: "Image Detection",
    description:
      "Upload photos of hand signs and let AI identify the letter with confidence scoring.",
    href: "/tools/image-to-sign",
  },
  {
    icon: Zap,
    title: "Sign Library",
    description:
      "Explore 50+ sign videos across 6 categories and revisit any sign instantly.",
    href: "/modules",
  },
]

const modules = [
  { name: "Alphabet", count: 26, icon: Hand, color: "text-emerald-600" },
  { name: "Numbers", count: 10, icon: Hash, color: "text-sky-600" },
  { name: "Colors", count: 8, icon: Palette, color: "text-amber-600" },
  { name: "Basic Words", count: 6, icon: MessageSquare, color: "text-teal-600" },
  { name: "Family", count: 5, icon: Users, color: "text-rose-600" },
  { name: "Food", count: 6, icon: UtensilsCrossed, color: "text-orange-600" },
]

const stats = [
  { value: 50, suffix: "+", label: "Sign Videos" },
  { value: 6, suffix: "", label: "Learning Modules" },
  { value: 4, suffix: "", label: "Challenge Modes" },
  { value: 3, suffix: "", label: "AI Tools" },
]

const steps = [
  {
    icon: BookOpen,
    title: "Start simple",
    description: "Begin with the alphabet and numbers, then move into real-world phrases.",
  },
  {
    icon: Camera,
    title: "Practice live",
    description: "Use the webcam tool to get instant AI feedback on your signing accuracy.",
  },
  {
    icon: Sparkles,
    title: "Lock it in",
    description: "Reinforce memory with fast challenge modes designed for confidence and speed.",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(28,148,148,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(240,180,70,0.18),transparent_60%)]" />
        <div className="container mx-auto px-4 py-16 sm:py-20 md:py-28 relative">
          <HomeHero>
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs">
                    <Sparkles className="size-3" />
                    Built for first-time learners
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">
                    No signup required
                  </span>
                </div>
                <h1 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Learn sign language, one step at a time.
                </h1>
                <p className="text-base text-muted-foreground max-w-xl sm:text-lg md:text-xl mx-auto lg:mx-0">
                  Signademy pairs clear lessons with AI practice tools. ASL is available now, with more languages coming soon.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white shadow-lg shadow-black/10 hover:brightness-105"
                    asChild
                  >
                    <Link href="/modules">
                      <BookOpen className="size-4" />
                      Start Learning
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full group" asChild>
                    <Link href="/tools/webcam">
                      <Camera className="size-4" />
                      Try Live Practice
                      <ArrowRight className="size-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-5 sm:pt-6 md:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-semibold text-foreground">
                        {stat.value}
                        {stat.suffix}
                      </p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="glass-panel rounded-3xl p-5 sm:p-6 md:p-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-(--brand-1)/15 text-(--brand-1)">
                        <Camera className="size-6" />
                      </span>
                      <div>
                        <p className="text-base font-semibold">Live practice feedback</p>
                        <p className="text-sm text-muted-foreground">
                          Practice signs and see helpful feedback as you learn.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-(--brand-2)/20 text-(--brand-2)">
                        <BookOpen className="size-6" />
                      </span>
                      <div>
                        <p className="text-base font-semibold">Structured learning path</p>
                        <p className="text-sm text-muted-foreground">
                          Progress from letters to real words with a clear next step.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-(--brand-3)/15 text-(--brand-3)">
                        <Target className="size-6" />
                      </span>
                      <div>
                        <p className="text-base font-semibold">Challenges for practice</p>
                        <p className="text-sm text-muted-foreground">
                          Short drills help reinforce what you just learned.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-muted/70 p-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        A gentle start
                      </p>
                      <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <li>1. Learn the alphabet in a short session.</li>
                        <li>2. Try live webcam feedback.</li>
                        <li>3. Play a challenge to reinforce it.</li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-6 hidden h-32 w-32 rounded-full bg-(--brand-2)/30 blur-3xl lg:block" />
              </div>
            </div>
          </HomeHero>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12 sm:py-14">
          <HomeStats stats={stats} />
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <HomeSectionHeader
          title="A simple way to learn sign language"
          description="Start where you are, practice with care, and grow your skills day by day."
        />
        <HomeStagger className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <HomeStaggerChild key={step.title}>
              <Card className="glass-panel h-full rounded-3xl border border-border/60">
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-(--brand-1)/10 text-(--brand-1)">
                    <step.icon className="size-6" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            </HomeStaggerChild>
          ))}
        </HomeStagger>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <HomeSectionHeader
          title="Tools that support steady practice"
          description="A practical toolkit for learning, testing, and staying motivated." 
        />
        <HomeStagger className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <HomeStaggerChild key={feature.title}>
              <Link href={feature.href} className="block h-full">
                <Card className="group h-full rounded-3xl border border-border/60 bg-card/70 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="size-12 rounded-2xl bg-(--brand-2)/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                      <feature.icon className="size-5 text-(--brand-1)" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-(--brand-1) transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </HomeStaggerChild>
          ))}
        </HomeStagger>
      </section>

      {/* Modules Preview Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <HomeSectionHeader
            title="6 modules, a clear progression"
            description="Move from the alphabet to real-world phrases at a calm, steady pace."
          />
          <HomeStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <HomeStaggerChild key={mod.name}>
                <Link href="/modules">
                  <Card className="group rounded-2xl border border-border/60 bg-card/80 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="size-12 rounded-2xl bg-background/70 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <mod.icon className={`size-6 ${mod.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold group-hover:text-(--brand-1) transition-colors">
                          {mod.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {mod.count} signs
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              </HomeStaggerChild>
            ))}
          </HomeStagger>
          <HomeFadeIn className="text-center mt-6 sm:mt-8">
            <Button asChild variant="outline" size="lg" className="group rounded-full w-full sm:w-auto">
              <Link href="/modules">
                <BookOpen className="size-4" />
                Explore the Learning Path
                <ArrowRight className="size-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </Link>
            </Button>
          </HomeFadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <HomeFadeIn>
          <Card className="border-0 overflow-hidden relative bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_60%,rgba(255,255,255,0.18),transparent_55%)]" />
            <CardContent className="flex flex-col items-center text-center gap-5 py-10 sm:py-14 relative">
              <div className="size-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Users className="size-8" />
              </div>
              <h2 className="text-3xl font-semibold md:text-4xl font-display">
                Ready to make your first sign?
              </h2>
              <p className="text-white/85 max-w-lg text-lg">
                Join Signademy and start a guided sign language journey built for everyday learners.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white text-(--brand-1) hover:bg-white/90 shadow-lg"
                  asChild
                >
                  <Link href="/modules">
                    Start Learning Now
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="w-full sm:w-auto border border-white/50 bg-transparent text-white hover:bg-white/15"
                  asChild
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </HomeFadeIn>
      </section>
    </div>
  )
}
