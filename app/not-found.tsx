import Link from "next/link"
import { ArrowRight, BookOpen, Hand, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-24 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="size-16 rounded-2xl bg-(--brand-1)/10 flex items-center justify-center mb-8">
        <Hand className="size-8 text-(--brand-1)" />
      </div>
      <div className="text-8xl font-bold gradient-text mb-4 font-display">
        404
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-3 font-display sm:text-3xl">
        Page Not Found
      </h1>
      <p className="text-muted-foreground max-w-sm mb-8 text-sm sm:text-base leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="rounded-lg bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white shadow-md gap-2"
          asChild
        >
          <Link href="/">
            <Home className="size-4" />
            Back to Home
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="group rounded-lg gap-2" asChild>
          <Link href="/modules">
            <BookOpen className="size-4" />
            Browse Modules
            <ArrowRight className="size-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
