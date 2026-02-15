"use client"

import * as React from "react"
import { CheckCircle, Github, Mail, MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AnimatedSection } from "@/app/components/animated-section"

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    toast.success("Message sent! We'll get back to you soon.")
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      {/* Header */}
      <AnimatedSection>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold tracking-tight font-display md:text-5xl">
            <span className="bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] bg-clip-text text-transparent">
              Contact Us
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 text-base md:text-lg">
            Have questions, feedback, or suggestions? We&apos;d love to hear from you.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection direction="up" delay={0.1}>
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          {/* Contact Form */}
          <Card className="rounded-3xl border border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="size-5 text-[color:var(--brand-1)]" />
                Send a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What is this about?"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white"
                    size="lg"
                  >
                    <Send className="size-4" />
                    Send Message
                  </Button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="size-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Message Sent!</h3>
                  <p className="text-muted-foreground mt-2">
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-full"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className="rounded-3xl border border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Signademy is an educational platform for learning American Sign
                  Language through interactive tools and AI technology.
                </p>
                <Separator />
                <div className="space-y-3">
                  <a
                    href="mailto:contact@signademy.com"
                    className="flex items-center gap-2 text-sm hover:text-[color:var(--brand-1)] transition-colors"
                  >
                    <Mail className="size-4 text-muted-foreground" />
                    contact@signademy.com
                  </a>
                  <a
                    href="https://github.com/signademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-[color:var(--brand-1)] transition-colors"
                  >
                    <Github className="size-4 text-muted-foreground" />
                    GitHub Repository
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Developer Info */}
            <Card className="rounded-3xl border border-border/60 bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold mb-2">Developer</h3>
                <p className="text-sm text-muted-foreground">
                  Built as an educational project to make sign language learning
                  accessible through modern web technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
