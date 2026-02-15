"use client"

import * as React from "react"
import { motion, type Variant } from "framer-motion"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
}

const directionOffset: Record<string, { x?: number; y?: number }> = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  none: {},
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.5,
}: AnimatedSectionProps) {
  const offset = directionOffset[direction]
  const hidden: Variant = { opacity: 0, ...offset }
  const visible: Variant = { opacity: 1, x: 0, y: 0 }

  return (
    <motion.div
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger wrapper — animates children one by one
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  delay?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      transition={{ staggerChildren: staggerDelay, delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  direction = "up",
}: {
  children: React.ReactNode
  className?: string
  direction?: "up" | "down" | "left" | "right"
}) {
  const offset = directionOffset[direction]
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...offset },
        visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Animated counter — counts up a number on scroll
 */
export function AnimatedCounter({
  value,
  suffix = "",
  className,
}: {
  value: number
  suffix?: string
  className?: string
}) {
  const [count, setCount] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)
  const started = React.useRef(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1200
          const steps = 30
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              current = value
              clearInterval(timer)
            }
            setCount(Math.floor(current))
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  )
}
