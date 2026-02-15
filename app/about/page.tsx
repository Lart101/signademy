import {
  AlertTriangle,
  BookOpen,
  Camera,
  FileImage,
  Hand,
  Monitor,
  Target,
  Type,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/app/components/animated-section"

const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning Modules",
    description:
      "6 structured modules with 50+ sign language demonstration videos covering Alphabet, Numbers, Colors, Basic Words, Family, and Food.",
  },
  {
    icon: Target,
    title: "Challenge Games",
    description:
      "4 game modes including Flash Sign Challenge, Endless Survival Mode, Video Matching Game, and Speed Drill for testing your skills.",
  },
  {
    icon: Camera,
    title: "Webcam Detection",
    description:
      "Real-time sign language detection using your webcam. Practice signs and receive instant AI-powered feedback.",
  },
  {
    icon: Type,
    title: "Text to Sign",
    description:
      "Convert typed text into sign language videos, displaying the corresponding sign for each letter.",
  },
  {
    icon: FileImage,
    title: "Image Detection",
    description:
      "Upload images of hand signs and let AI identify the letter with a confidence score and reference video.",
  },
  {
    icon: Monitor,
    title: "Responsive Design",
    description:
      "Fully responsive interface that works on mobile, tablet, and desktop devices with touch-friendly controls.",
  },
]

const limitations = [
  "Currently limited to ASL alphabet recognition (A-Z) for image and webcam detection tools.",
  "Detection works best with real hands in good lighting conditions.",
  "Only one hand can be detected at a time for letter recognition.",
  "Some interactive tools are in Beta/Prototype stage.",
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      {/* Header */}
      <AnimatedSection>
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Hand className="size-3 mr-1" /> About
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight font-display md:text-5xl">
            About{" "}
            <span className="bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] bg-clip-text text-transparent">
              Signademy
            </span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            An interactive educational platform for learning American Sign
            Language through video lessons, challenges, and AI-powered tools.
          </p>
        </div>
      </AnimatedSection>

      <Separator className="my-8" />

      {/* Project Overview */}
      <AnimatedSection>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 font-display">Project Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            Signademy is a web-based platform designed to make learning American
            Sign Language (ASL) accessible, engaging, and interactive. It provides
            a comprehensive suite of tools and learning modules that cater to
            beginners and intermediate learners alike. Through structured video
            lessons, gamified challenges, and real-time AI-powered detection
            tools, Signademy aims to bridge the communication gap and promote
            inclusivity.
          </p>
        </section>
      </AnimatedSection>

      {/* Features */}
      <section className="mb-12">
        <AnimatedSection>
          <h2 className="text-2xl font-semibold mb-6 font-display">What&apos;s Included</h2>
        </AnimatedSection>
        <StaggerContainer>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="h-full rounded-3xl border border-border/60 bg-card/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="size-9 rounded-lg bg-[color:var(--brand-1)]/10 flex items-center justify-center">
                        <feature.icon className="size-4 text-[color:var(--brand-1)]" />
                      </div>
                      {feature.title}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </section>

      {/* Technology */}
      <AnimatedSection>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 font-display">Technology Approach</h2>
          <p className="text-muted-foreground leading-relaxed">
            Signademy leverages modern web technologies to deliver a seamless
            learning experience. The platform uses AI-powered computer vision
            models for real-time hand sign detection, video processing for
            sign demonstration playback, and responsive design patterns to
            ensure accessibility across all devices.
          </p>
        </section>
      </AnimatedSection>

      {/* Limitations */}
      <AnimatedSection>
        <section>
          <h2 className="text-2xl font-semibold mb-4 font-display">Project Limitations</h2>
          <Card className="rounded-3xl border border-border/60 bg-muted/50">
            <CardContent className="pt-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {limitations.map((limitation, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-yellow-500 mt-0.5 shrink-0" />
                    {limitation}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </AnimatedSection>
    </div>
  )
}
