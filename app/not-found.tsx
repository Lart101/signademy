import Link from "next/link"
import { BookOpen, Hand, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="size-20 rounded-2xl bg-linear-to-br from-[color:var(--brand-1)]/15 to-[color:var(--brand-2)]/20 flex items-center justify-center mb-6">
        <Hand className="size-10 text-[color:var(--brand-1)]" />
      </div>
      <div className="text-8xl font-bold bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] bg-clip-text text-transparent mb-4">
        404
      </div>
      <h1 className="text-3xl font-semibold tracking-tight mb-3 font-display">
        Page Not Found
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been
        moved or the URL may be incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          className="rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white shadow-lg shadow-black/10"
          asChild
        >
          <Link href="/">
            <Home className="size-4" />
            Back to Home
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="group rounded-full" asChild>
          <Link href="/modules">
            <BookOpen className="size-4" />
            Browse Modules
          </Link>
        </Button>
      </div>
    </div>
  )
}
