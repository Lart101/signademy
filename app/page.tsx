import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
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
    tag: "Core",
  },
  {
    icon: Target,
    title: "Challenge Modes",
    description:
      "Use 4 fast-paced challenges to reinforce memory and build speed with immediate feedback.",
    href: "/challenge",
    tag: "Practice",
  },
  {
    icon: Camera,
    title: "Live Practice",
    description:
      "Get real-time AI feedback with webcam detection that confirms your signs instantly.",
    href: "/tools/webcam",
    tag: "AI",
  },
  {
    icon: Type,
    title: "Text to Sign",
    description:
      "Convert any sentence into sign guidance and learn each letter with clear, paced videos.",
    href: "/tools/text-to-sign",
    tag: "Tool",
  },
  {
    icon: FileImage,
    title: "Image Detection",
    description:
      "Upload photos of hand signs and let AI identify the letter with confidence scoring.",
    href: "/tools/image-to-sign",
    tag: "AI",
  },
  {
    icon: Zap,
    title: "Sign Library",
    description:
      "Explore 50+ sign videos across 6 categories and revisit any sign instantly.",
    href: "/modules",
    tag: "Library",
  },
]

const modules = [
  { name: "Alphabet", count: 26, icon: Hand, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Numbers", count: 10, icon: Hash, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" },
  { name: "Colors", count: 8, icon: Palette, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  { name: "Basic Words", count: 6, icon: MessageSquare, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  { name: "Family", count: 5, icon: Users, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  { name: "Food", count: 6, icon: UtensilsCrossed, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
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
    title: "Learn the basics",
    description: "Begin with the alphabet and numbers, then move into real-world phrases at your own pace.",
    step: "01",
  },
  {
    icon: Camera,
    title: "Practice with AI",
    description: "Use the webcam tool to get instant AI feedback on your signing accuracy in real time.",
    step: "02",
  },
  {
    icon: Sparkles,
    title: "Challenge yourself",
    description: "Reinforce memory with fast challenge modes designed for building confidence and speed.",
    step: "03",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_20%,var(--page-glow-1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_15%,var(--page-glow-2),transparent)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full bg-(--brand-1)/3 blur-3xl" />

        <div className="container mx-auto px-4 lg:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-24 md:pb-28 relative">
          <HomeHero>
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Eyebrow */}
              <div className="flex items-center justify-center gap-3">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs rounded-lg">
                  <Sparkles className="size-3" />
                  Built for first-time learners
                </Badge>
                <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
                  Free · No signup required
                </span>
              </div>

              {/* Heading */}
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
                Learn sign language,{" "}
                <span className="gradient-text">one step at a time</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Signademy combines structured lessons with AI practice tools so you can learn ASL at your own pace — no experience needed.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-lg bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white shadow-lg shadow-(--brand-1)/20 hover:shadow-xl hover:shadow-(--brand-1)/25 transition-all hover:brightness-110 gap-2"
                  asChild
                >
                  <Link href="/modules">
                    <BookOpen className="size-4" />
                    Start Learning
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-lg group gap-2" asChild>
                  <Link href="/tools/webcam">
                    <Camera className="size-4" />
                    Try Live Practice
                    <ArrowRight className="size-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  </Link>
                </Button>
              </div>

              {/* Quick highlights */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-(--brand-1)" />
                  50+ sign videos
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-(--brand-1)" />
                  AI-powered feedback
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-(--brand-1)" />
                  Works on any device
                </span>
              </div>
            </div>
          </HomeHero>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="border-y border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 lg:px-6 py-10 sm:py-12">
          <HomeStats stats={stats} />
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="container mx-auto px-4 lg:px-6 py-20 sm:py-24">
        <HomeSectionHeader
          title="A simple way to get started"
          description="Follow three steps and you'll be signing in minutes, not days."
        />
        <HomeStagger className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <HomeStaggerChild key={step.title}>
              <Card className="group h-full rounded-2xl border border-border/50 bg-card/80 card-elevated">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-(--brand-1)/10 text-(--brand-1) group-hover:bg-(--brand-1)/15 transition-colors">
                      <step.icon className="size-5" />
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/20 font-display">{step.step}</span>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{step.description}</CardDescription>
                </CardHeader>
              </Card>
            </HomeStaggerChild>
          ))}
        </HomeStagger>
      </section>

      {/* ─── Features Section ─── */}
      <section className="border-t border-border/40 bg-muted/10">
        <div className="container mx-auto px-4 lg:px-6 py-20 sm:py-24">
          <HomeSectionHeader
            title="Everything you need to learn ASL"
            description="A complete toolkit for learning, practicing, and building confidence."
          />
          <HomeStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <HomeStaggerChild key={feature.title}>
                <Link href={feature.href} className="block h-full">
                  <Card className="group h-full rounded-2xl border border-border/50 bg-card/80 card-elevated gradient-border">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="size-11 rounded-xl bg-(--brand-1)/10 flex items-center justify-center group-hover:bg-(--brand-1)/15 transition-colors">
                          <feature.icon className="size-5 text-(--brand-1)" />
                        </div>
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium text-muted-foreground">
                          {feature.tag}
                        </Badge>
                      </div>
                      <CardTitle className="text-base group-hover:text-(--brand-1) transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed">{feature.description}</CardDescription>
                      <span className="inline-flex items-center text-xs font-medium text-(--brand-1) gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ArrowRight className="size-3" />
                      </span>
                    </CardHeader>
                  </Card>
                </Link>
              </HomeStaggerChild>
            ))}
          </HomeStagger>
        </div>
      </section>

      {/* ─── Modules Preview ─── */}
      <section className="container mx-auto px-4 lg:px-6 py-20 sm:py-24">
        <HomeSectionHeader
          title="6 modules, one clear path"
          description="From the alphabet to real-world phrases — progress at your own pace."
        />
        <HomeStagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <HomeStaggerChild key={mod.name}>
              <Link href="/modules">
                <Card className="group rounded-xl border border-border/50 bg-card/80 hover:shadow-md transition-all duration-300 cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-4 px-5">
                    <div className={`size-11 rounded-xl ${mod.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                      <mod.icon className={`size-5 ${mod.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] group-hover:text-(--brand-1) transition-colors">
                        {mod.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mod.count} signs
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/40 -translate-x-1 group-hover:translate-x-0 group-hover:text-muted-foreground transition-all" />
                  </CardContent>
                </Card>
              </Link>
            </HomeStaggerChild>
          ))}
        </HomeStagger>
        <HomeFadeIn className="text-center mt-8">
          <Button asChild variant="outline" size="lg" className="group rounded-lg w-full sm:w-auto gap-2">
            <Link href="/modules">
              <BookOpen className="size-4" />
              Explore All Modules
              <ArrowRight className="size-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
          </Button>
        </HomeFadeIn>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="container mx-auto px-4 lg:px-6 py-16 sm:py-20">
        <HomeFadeIn>
          <Card className="border-0 overflow-hidden relative rounded-2xl bg-linear-to-br from-(--brand-1) to-(--brand-2) text-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_80%,rgba(255,255,255,0.15),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_20%,rgba(255,255,255,0.1),transparent)]" />
            <CardContent className="flex flex-col items-center text-center gap-6 py-14 sm:py-18 relative">
              <div className="size-14 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Hand className="size-7" />
              </div>
              <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl font-display leading-tight">
                Ready to make your<br className="hidden sm:inline" /> first sign?
              </h2>
              <p className="text-white/80 max-w-md text-base sm:text-lg">
                Start your guided sign language journey today. It&apos;s free, no signup required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white text-foreground hover:bg-white/90 shadow-xl rounded-lg gap-2"
                  asChild
                >
                  <Link href="/modules">
                    Start Learning Now
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="w-full sm:w-auto border border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg"
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
