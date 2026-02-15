import Link from "next/link"
import { ArrowUp, Hand, Heart } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

function BackToTop() {
  return (
    <Button
      variant="outline"
      size="icon"
      className="size-9 rounded-full"
      asChild
    >
      <a href="#top" aria-label="Back to top">
        <ArrowUp className="size-4" />
      </a>
    </Button>
  )
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[color:var(--brand-1)]/50 to-transparent" />
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white">
                <Hand className="size-5" />
              </span>
              <span className="text-xl font-semibold font-display">Signademy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Learn American Sign Language through an inviting, structured journey and AI-powered practice tools.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                className="rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white"
                asChild
              >
                <Link href="/modules">Start Learning</Link>
              </Button>
              <Button size="sm" variant="outline" className="rounded-full" asChild>
                <Link href="/tools/webcam">Try Live Tool</Link>
              </Button>
            </div>
          </div>

          {/* Learn */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Get Started</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/modules" className="hover:text-[color:var(--brand-1)] transition-colors">
                  Learning Path
                </Link>
              </li>
              <li>
                <Link href="/challenge" className="hover:text-[color:var(--brand-1)] transition-colors">
                  Practice Challenges
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[color:var(--brand-1)] transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/tools/text-to-sign" className="hover:text-[color:var(--brand-1)] transition-colors">
                  Text → Sign
                </Link>
              </li>
              <li>
                <Link href="/tools/image-to-sign" className="hover:text-[color:var(--brand-1)] transition-colors">
                  Image → Sign
                </Link>
              </li>
              <li>
                <Link href="/tools/webcam" className="hover:text-[color:var(--brand-1)] transition-colors">
                  Webcam → Sign
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-[color:var(--brand-1)] transition-colors">
                  About Signademy
                </Link>
              </li>
              <li>
                <Link href="/mission" className="hover:text-[color:var(--brand-1)] transition-colors">
                  Mission & Vision
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[color:var(--brand-1)] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            © {new Date().getFullYear()} Signademy. Made with{" "}
            <Heart className="size-3 text-red-500 fill-red-500 inline" />{" "}
            for the deaf & hard-of-hearing community.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
