import Link from "next/link"
import { ArrowRight, ArrowUp, Hand, Heart } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

function BackToTop() {
  return (
    <Button
      variant="outline"
      size="icon"
      className="size-8 rounded-lg"
      asChild
    >
      <a href="#top" aria-label="Back to top">
        <ArrowUp className="size-3.5" />
      </a>
    </Button>
  )
}

const footerLinks = {
  learn: [
    { href: "/modules", label: "Learning Modules" },
    { href: "/challenge", label: "Challenges" },
    { href: "/about", label: "How It Works" },
  ],
  tools: [
    { href: "/tools/text-to-sign", label: "Text → Sign" },
    { href: "/tools/image-to-sign", label: "Image → Sign" },
    { href: "/tools/webcam", label: "Webcam → Sign" },
  ],
  about: [
    { href: "/about", label: "About Signademy" },
    { href: "/mission", label: "Mission & Vision" },
    { href: "/contact", label: "Contact Us" },
  ],
}

export function Footer() {
  return (
    <footer className="relative border-t border-border/40">
      {/* Gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-(--brand-1)/40 to-transparent" />

      <div className="container mx-auto px-4 lg:px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand Column */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-(--brand-1) to-(--brand-2) text-white shadow-sm">
                <Hand className="size-4.5" />
              </span>
              <span className="text-lg font-bold font-display">Signademy</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Learn American Sign Language through guided modules, AI-powered tools, and engaging challenges.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="rounded-lg bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white shadow-sm text-xs h-8 gap-1.5"
                asChild
              >
                <Link href="/modules">
                  Start Learning
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg text-xs h-8" asChild>
                <Link href="/tools/webcam">Try Live Tool</Link>
              </Button>
            </div>
          </div>

          {/* Learn */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Get Started</h4>
            <ul className="space-y-2.5">
              {footerLinks.learn.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Tools</h4>
            <ul className="space-y-2.5">
              {footerLinks.tools.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">About</h4>
            <ul className="space-y-2.5">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-10 opacity-50" />

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
            © {new Date().getFullYear()} Signademy · Made with{" "}
            <Heart className="size-3 text-red-500 fill-red-500" />{" "}
            for the deaf & hard-of-hearing community
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
