"use client"

import { motion, type Variants } from "framer-motion"
import { AnimatedCounter } from "./animated-section"
import type { ReactNode } from "react"

const ease = [0.25, 0.46, 0.45, 0.94] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

function Hero({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
      }}
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.7, ease }}>
        {children}
      </motion.div>
    </motion.div>
  )
}

function Stats({ stats }: { stats: { value: number; suffix: string; label: string }[] }) {
  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} className="text-center" variants={staggerChild}>
          <p className="text-3xl font-semibold bg-linear-to-r from-[color:var(--brand-1)] to-[color:var(--brand-2)] bg-clip-text text-transparent">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
          </p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      className="text-center mb-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUp}
      transition={{ duration: 0.6, ease }}
    >
      <p className="section-kicker">Signademy</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight font-display md:text-4xl">
        {title}
      </h2>
      <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-base md:text-lg">
        {description}
      </p>
    </motion.div>
  )
}

function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  )
}

function StaggerChild({ children }: { children: ReactNode }) {
  return <motion.div variants={staggerChild}>{children}</motion.div>
}

function FadeIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={fadeUp}
      transition={{ duration: 0.6, ease }}
    >
      {children}
    </motion.div>
  )
}

export {
  Hero as HomeHero,
  Stats as HomeStats,
  SectionHeader as HomeSectionHeader,
  Stagger as HomeStagger,
  StaggerChild as HomeStaggerChild,
  FadeIn as HomeFadeIn,
}
