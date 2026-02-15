"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
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
  hidden: { opacity: 0, y: 6, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.12, ease: "easeIn" as const } },
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
          "relative inline-flex h-9 items-center justify-center rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive && "text-foreground"
        )}
      >
        {label}
        <ChevronDown className={cn("size-3 opacity-50 transition-transform duration-200", open && "rotate-180")} />
        {isActive && (
          <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2)" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl p-1.5 shadow-lg shadow-black/8"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-3 text-sm transition-all hover:bg-accent group",
                  pathname === link.href && "bg-accent"
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--brand-1)/10 text-(--brand-1) group-hover:bg-(--brand-1)/15 transition-colors">
                  <link.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-foreground">{link.label}</div>
                  <div className="text-xs text-muted-foreground leading-snug">{link.description}</div>
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
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/50 shadow-sm shadow-black/3"
          : "bg-transparent"
      )}
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 rounded-lg bg-background px-4 py-2 text-sm shadow-lg"
      >
        Skip to content
      </a>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-(--brand-1) to-(--brand-2) text-white shadow-sm shadow-black/10">
            <Hand className="size-4.5 transition-transform duration-300 group-hover:rotate-12" />
          </span>
          <span className="text-lg font-bold tracking-tight font-display">
            Signademy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5">
          <Link
            href="/"
            className={cn(
              "relative inline-flex h-9 items-center justify-center rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
              pathname === "/" && "text-foreground"
            )}
          >
            Home
            {pathname === "/" && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2)" />
            )}
          </Link>

          <NavDropdown
            label="About"
            links={aboutLinks}
            isActive={pathname === "/about" || pathname === "/mission"}
          />

          <Link
            href="/modules"
            className={cn(
              "relative inline-flex h-9 items-center justify-center rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground gap-1.5",
              pathname === "/modules" && "text-foreground"
            )}
          >
            Modules
            {pathname === "/modules" && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2)" />
            )}
          </Link>

          <NavDropdown
            label="Tools"
            links={toolLinks}
            isActive={pathname.startsWith("/tools")}
          />

          <Link
            href="/challenge"
            className={cn(
              "relative inline-flex h-9 items-center justify-center rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground gap-1.5",
              pathname === "/challenge" && "text-foreground"
            )}
          >
            Challenge
            {pathname === "/challenge" && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2)" />
            )}
          </Link>

          <Link
            href="/contact"
            className={cn(
              "relative inline-flex h-9 items-center justify-center rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
              pathname === "/contact" && "text-foreground"
            )}
          >
            Contact
            {pathname === "/contact" && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2)" />
            )}
          </Link>

          <Separator orientation="vertical" className="mx-2 h-5" />

          <div className="flex items-center gap-1.5">
            <ModelCacheManager />
            <ThemeToggle />
            <Button
              size="sm"
              className="ml-1 rounded-lg bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white shadow-md shadow-black/10 hover:brightness-110 transition-all text-[13px] h-9 px-4 gap-1.5"
              asChild
            >
              <Link href="/modules">
                Get Started
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </nav>

        {/* Mobile: Theme + Menu */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <Menu className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b border-border/50 px-5 py-4">
                <SheetTitle className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-(--brand-1) to-(--brand-2) text-white">
                    <Hand className="size-4" />
                  </span>
                  <span className="font-display text-base font-bold">Signademy</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-0.5 p-3 overflow-y-auto max-h-[calc(100vh-80px)]">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === "/" && "bg-accent text-foreground"
                  )}
                >
                  <Home className="size-4 text-muted-foreground" />
                  Home
                </Link>

                <p className="px-3 pt-5 pb-1.5 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                  About
                </p>
                {aboutLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === link.href && "bg-accent text-foreground"
                    )}
                  >
                    <link.icon className="size-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}

                <p className="px-3 pt-5 pb-1.5 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                  Learn
                </p>
                <Link
                  href="/modules"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === "/modules" && "bg-accent text-foreground"
                  )}
                >
                  <BookOpen className="size-4 text-muted-foreground" />
                  Learn Modules
                </Link>
                <Link
                  href="/challenge"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === "/challenge" && "bg-accent text-foreground"
                  )}
                >
                  <Target className="size-4 text-muted-foreground" />
                  Challenge
                </Link>

                <p className="px-3 pt-5 pb-1.5 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                  Tools
                </p>
                {toolLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === link.href && "bg-accent text-foreground"
                    )}
                  >
                    <link.icon className="size-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}

                <Separator className="my-3" />

                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === "/contact" && "bg-accent text-foreground"
                  )}
                >
                  <Mail className="size-4 text-muted-foreground" />
                  Contact Us
                </Link>

                <ModelCacheManager>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent text-left">
                    <HardDrive className="size-4 text-muted-foreground" />
                    Manage Model Cache
                  </button>
                </ModelCacheManager>

                <div className="mt-3 px-1">
                  <Button
                    className="w-full rounded-lg bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white shadow-md gap-2"
                    asChild
                  >
                    <Link href="/modules" onClick={() => setOpen(false)}>
                      Get Started
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
