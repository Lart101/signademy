"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookOpen,
  Camera,
  ChevronDown,
  FileImage,
  Hand,
  HardDrive,
  Home,
  Info,
  Mail,
  Menu,
  Target,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ModelCacheManager } from "./model-cache-manager"
import { ThemeToggle } from "./theme-toggle"

const aboutLinks = [
  { href: "/about", label: "What is Signademy?", icon: Info, description: "The story behind the platform" },
  { href: "/mission", label: "Mission & Vision", icon: Target, description: "Why we built this for learners" },
]

const toolLinks = [
  { href: "/tools/text-to-sign", label: "Text → Sign", icon: Type, description: "Turn text into sign guidance" },
  { href: "/tools/image-to-sign", label: "Image → Sign", icon: FileImage, description: "Detect signs from photos" },
  { href: "/tools/webcam", label: "Webcam → Sign", icon: Camera, description: "Live sign feedback" },
]

const dropdownVariants = {
  hidden: { opacity: 0, y: -4, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.1, ease: "easeIn" as const } },
}

function NavDropdown({
  label,
  links,
  isActive,
}: {
  label: string
  links: typeof aboutLinks
  isActive: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  React.useEffect(() => setOpen(false), [pathname])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
          if (e.key === "ArrowDown" && !open) setOpen(true)
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive && "bg-accent text-accent-foreground"
        )}
      >
        {label}
        <ChevronDown className={cn("size-3 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 mt-2 w-64 rounded-2xl border bg-popover p-2 shadow-xl"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground group",
                  pathname === link.href && "bg-accent text-accent-foreground"
                )}
              >
                <link.icon className="size-4 mt-0.5 text-muted-foreground group-hover:text-[color:var(--brand-1)] transition-colors shrink-0" />
                <div>
                  <div className="font-medium">{link.label}</div>
                  <div className="text-xs text-muted-foreground">{link.description}</div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl transition-shadow duration-300",
        scrolled && "shadow-md shadow-black/5"
      )}
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 rounded-full bg-background px-4 py-2 text-sm shadow"
      >
        Skip to content
      </a>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white shadow-sm">
            <Hand className="size-5 transition-transform group-hover:rotate-12" />
          </span>
          <span className="text-xl font-semibold tracking-tight font-display">
            Signademy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/" && "bg-accent text-accent-foreground"
            )}
          >
            Home
          </Link>

          <NavDropdown
            label="About Signademy"
            links={aboutLinks}
            isActive={pathname === "/about" || pathname === "/mission"}
          />

          <Link
            href="/modules"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground gap-1.5",
              pathname === "/modules" && "bg-accent text-accent-foreground"
            )}
          >
            <BookOpen className="size-3.5" />
            Learn Modules
          </Link>

          <NavDropdown
            label="Tools"
            links={toolLinks}
            isActive={pathname.startsWith("/tools")}
          />

          <Link
            href="/challenge"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground gap-1.5",
              pathname === "/challenge" && "bg-accent text-accent-foreground"
            )}
          >
            <Target className="size-3.5" />
            Challenge
          </Link>

          <Link
            href="/contact"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === "/contact" && "bg-accent text-accent-foreground"
            )}
          >
            Contact Us
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <ModelCacheManager />
            <ThemeToggle />
            <Button
              size="sm"
              className="rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white shadow-lg shadow-black/10 hover:brightness-105"
              asChild
            >
              <Link href="/modules">Get Started</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile: Theme + Menu */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-6 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white">
                    <Hand className="size-4" />
                  </span>
                  <span className="font-display text-lg">Signademy</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === "/" && "bg-accent"
                  )}
                >
                  <Home className="size-4" />
                  Home
                </Link>

                <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  About
                </p>
                {aboutLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === link.href && "bg-accent"
                    )}
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </Link>
                ))}

                <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Learn
                </p>
                <Link
                  href="/modules"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === "/modules" && "bg-accent"
                  )}
                >
                  <BookOpen className="size-4" />
                  Learn Modules
                </Link>
                <Link
                  href="/challenge"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === "/challenge" && "bg-accent"
                  )}
                >
                  <Target className="size-4" />
                  Challenge
                </Link>

                <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tools
                </p>
                {toolLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === link.href && "bg-accent"
                    )}
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </Link>
                ))}

                <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Other
                </p>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === "/contact" && "bg-accent"
                  )}
                >
                  <Mail className="size-4" />
                  Contact Us
                </Link>

                <Separator className="my-2" />

                <ModelCacheManager>
                  <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
                    <HardDrive className="size-4" />
                    Manage Model Cache
                  </button>
                </ModelCacheManager>
                <Button
                  className="mt-2 rounded-full bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] text-white"
                  asChild
                >
                  <Link href="/modules" onClick={() => setOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
