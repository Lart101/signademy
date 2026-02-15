import { Heart, Lightbulb, GraduationCap, Globe, Users, Star, Handshake, Brain, Earth } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/app/components/animated-section"

const goals = [
  {
    icon: GraduationCap,
    title: "Accessible Education",
    description:
      "Make ASL learning available to everyone, regardless of location or background, through a free web-based platform.",
  },
  {
    icon: Lightbulb,
    title: "Interactive Learning",
    description:
      "Combine video demonstrations, AI feedback, and gamification to create an engaging and effective learning experience.",
  },
  {
    icon: Globe,
    title: "Bridge Communication Gaps",
    description:
      "Help hearing individuals learn ASL to communicate with the Deaf and Hard of Hearing community.",
  },
  {
    icon: Users,
    title: "Promote Inclusivity",
    description:
      "Foster understanding and inclusion by making sign language a more widely known and practiced skill.",
  },
]

const objectives = [
  "Provide 50+ high-quality sign language video demonstrations across 6 categories.",
  "Offer multiple practice modalities: video lessons, challenges, and real-time detection.",
  "Deliver instant AI-powered feedback on sign accuracy through webcam and image tools.",
  "Create an engaging gamified experience that motivates continued learning.",
  "Ensure the platform is responsive and accessible across all devices.",
  "Cover foundational ASL including alphabet, numbers, colors, basic words, family, and food signs.",
]

const impact = [
  {
    icon: Handshake,
    title: "Inclusivity",
    description: "Breaking down communication barriers between hearing and Deaf communities.",
    color: "text-emerald-600",
  },
  {
    icon: Brain,
    title: "Cognitive Growth",
    description: "Learning sign language enhances spatial awareness, memory, and cognitive flexibility.",
    color: "text-sky-600",
  },
  {
    icon: Earth,
    title: "Global Awareness",
    description: "Fostering empathy and understanding of diverse communication needs worldwide.",
    color: "text-green-600",
  },
]

export default function MissionPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      {/* Header */}
      <AnimatedSection>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight font-display md:text-5xl">
            Mission &{" "}
            <span className="bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] bg-clip-text text-transparent">
              Vision
            </span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Our goal is to make American Sign Language accessible and engaging
            for everyone through modern educational technology.
          </p>
        </div>
      </AnimatedSection>

      <Separator className="my-8" />

      {/* Mission Statement */}
      <AnimatedSection>
        <section className="mb-16">
          <Card className="rounded-3xl border border-border/60 glass-panel">
            <CardContent className="flex flex-col items-center text-center gap-4 py-10">
              <div className="size-14 rounded-2xl bg-[color:var(--brand-1)]/15 flex items-center justify-center">
                <Heart className="size-7 text-[color:var(--brand-1)]" />
              </div>
              <h2 className="text-2xl font-semibold font-display">Our Mission</h2>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                To democratize sign language education by providing a free,
                interactive, and technology-driven platform that empowers
                individuals to learn American Sign Language at their own pace.
                We believe that communication should have no barriers, and
                learning ASL is a step towards a more inclusive world.
              </p>
            </CardContent>
          </Card>
        </section>
      </AnimatedSection>

      {/* Project Goals */}
      <section className="mb-16">
        <AnimatedSection>
          <h2 className="text-2xl font-semibold mb-6 text-center font-display">Project Goals</h2>
        </AnimatedSection>
        <StaggerContainer>
          <div className="grid gap-6 md:grid-cols-2">
            {goals.map((goal) => (
              <StaggerItem key={goal.title}>
                <Card className="h-full rounded-3xl border border-border/60 bg-card/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <CardHeader>
                    <div className="size-10 rounded-lg bg-[color:var(--brand-1)]/10 flex items-center justify-center mb-1">
                      <goal.icon className="size-5 text-[color:var(--brand-1)]" />
                    </div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </section>

      {/* Learning Objectives */}
      <AnimatedSection>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center font-display">
            Learning Objectives
          </h2>
          <Card className="rounded-3xl border border-border/60 bg-card/80">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {objectives.map((objective, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Star className="size-4 text-[color:var(--brand-1)] mt-0.5 shrink-0" />
                    <span className="text-muted-foreground text-sm">
                      {objective}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </AnimatedSection>

      {/* Educational Impact */}
      <section>
        <AnimatedSection>
          <h2 className="text-2xl font-semibold mb-6 text-center font-display">
            Educational Impact
          </h2>
        </AnimatedSection>
        <StaggerContainer>
          <div className="grid gap-6 md:grid-cols-3">
            {impact.map((item) => (
              <StaggerItem key={item.title}>
                <Card className="text-center h-full rounded-3xl border border-border/60 bg-card/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <CardContent className="pt-6 flex flex-col items-center gap-3">
                    <div className="size-12 rounded-xl bg-[color:var(--brand-2)]/20 flex items-center justify-center">
                      <item.icon className={`size-6 ${item.color}`} />
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      </section>
    </div>
  )
}
