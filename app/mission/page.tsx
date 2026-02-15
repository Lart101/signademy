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
    <div className="container mx-auto px-4 lg:px-6 py-20 max-w-4xl">
      {/* Header */}
      <AnimatedSection>
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight font-display md:text-5xl">
            Mission &{" "}
            <span className="gradient-text">Vision</span>
          </h1>
          <p className="text-muted-foreground mt-5 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Our goal is to make American Sign Language accessible and engaging
            for everyone through modern educational technology.
          </p>
        </div>
      </AnimatedSection>

      <Separator className="my-10 opacity-50" />

      {/* Mission Statement */}
      <AnimatedSection>
        <section className="mb-16">
          <Card className="rounded-2xl border border-border/50 glass-panel">
            <CardContent className="flex flex-col items-center text-center gap-4 py-10">
              <div className="size-14 rounded-2xl bg-(--brand-1)/15 flex items-center justify-center">
                <Heart className="size-7 text-(--brand-1)" />
              </div>
              <h2 className="text-xl font-bold font-display sm:text-2xl">Our Mission</h2>
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
          <h2 className="text-xl font-bold mb-6 text-center font-display sm:text-2xl">Project Goals</h2>
        </AnimatedSection>
        <StaggerContainer>
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((goal) => (
              <StaggerItem key={goal.title}>
                <Card className="h-full rounded-2xl border border-border/50 bg-card/80 card-elevated">
                  <CardHeader className="space-y-3">
                    <div className="size-9 rounded-lg bg-(--brand-1)/10 flex items-center justify-center">
                      <goal.icon className="size-4 text-(--brand-1)" />
                    </div>
                    <CardTitle className="text-[15px]">{goal.title}</CardTitle>
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
          <h2 className="text-xl font-bold mb-6 text-center font-display sm:text-2xl">
            Learning Objectives
          </h2>
          <Card className="rounded-2xl border border-border/50 bg-card/80">
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {objectives.map((objective, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Star className="size-4 text-(--brand-1) mt-0.5 shrink-0" />
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
          <h2 className="text-xl font-bold mb-6 text-center font-display sm:text-2xl">
            Educational Impact
          </h2>
        </AnimatedSection>
        <StaggerContainer>
          <div className="grid gap-4 sm:grid-cols-3">
            {impact.map((item) => (
              <StaggerItem key={item.title}>
                <Card className="text-center h-full rounded-2xl border border-border/50 bg-card/80 card-elevated">
                  <CardContent className="pt-6 flex flex-col items-center gap-3">
                    <div className="size-11 rounded-xl bg-(--brand-2)/15 flex items-center justify-center">
                      <item.icon className={`size-5 ${item.color}`} />
                    </div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
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
