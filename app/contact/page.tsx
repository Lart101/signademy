"use client"

import * as React from "react"
import { ArrowRight, CheckCircle, Github, Mail, MessageSquare, Send } from "lucide-react"
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
    <div className="container mx-auto px-4 lg:px-6 py-20 max-w-4xl">
      {/* Header */}
      <AnimatedSection>
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight font-display md:text-5xl">
            <span className="gradient-text">Contact Us</span>
          </h1>
          <p className="text-muted-foreground mt-5 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Have questions, feedback, or suggestions? We&apos;d love to hear from you.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection direction="up" delay={0.1}>
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          {/* Contact Form */}
          <Card className="rounded-2xl border border-border/50 bg-card/80">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2.5 text-[15px]">
                <div className="size-8 rounded-lg bg-(--brand-1)/10 flex items-center justify-center">
                  <MessageSquare className="size-4 text-(--brand-1)" />
                </div>
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
                      className="min-h-36"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-lg bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white"
                    size="lg"
                  >
                    <Send className="size-4" />
                    Send Message
                  </Button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="size-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="size-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold">Message Sent!</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-lg"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar Info */}
          <div className="space-y-4">
            {/* Project Info */}
            <Card className="rounded-2xl border border-border/50 bg-card/80">
              <CardHeader>
                <CardTitle className="text-sm">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Signademy is an educational platform for learning American Sign
                  Language through interactive tools and AI technology.
                </p>
                <Separator className="opacity-50" />
                <div className="space-y-3">
                  <a
                    href="mailto:contact@signademy.com"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="size-4" />
                    contact@signademy.com
                  </a>
                  <a
                    href="https://github.com/signademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="size-4" />
                    GitHub Repository
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Developer Info */}
            <Card className="rounded-2xl border border-border/50 bg-muted/30">
              <CardContent className="pt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">Developer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
