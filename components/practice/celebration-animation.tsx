"use client"

/**
 * Celebration Animation Component
 * Triggers confetti effects for correct answers and achievements
 * Uses canvas-confetti for performance-optimized animations
 */

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"
import { StreakCelebration } from "@/lib/streak-utils"

interface CelebrationAnimationProps {
  trigger: boolean
  intensity?: "low" | "medium" | "high"
  onComplete?: () => void
}

export function CelebrationAnimation({
  trigger,
  intensity = "medium",
  onComplete,
}: CelebrationAnimationProps) {
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (!trigger || hasTriggered.current) {
      return
    }

    hasTriggered.current = true

    // Different confetti configurations based on intensity
    const configs = {
      low: {
        particleCount: 50,
        spread: 45,
        startVelocity: 30,
        decay: 0.9,
        scalar: 0.8,
      },
      medium: {
        particleCount: 100,
        spread: 70,
        startVelocity: 45,
        decay: 0.9,
        scalar: 1,
      },
      high: {
        particleCount: 200,
        spread: 100,
        startVelocity: 60,
        decay: 0.85,
        scalar: 1.2,
      },
    }

    const config = configs[intensity]

    // Fire confetti from both sides
    const fireConfetti = () => {
      // Left side
      confetti({
        ...config,
        angle: 60,
        origin: { x: 0, y: 0.6 },
        colors: ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'],
      })

      // Right side
      confetti({
        ...config,
        angle: 120,
        origin: { x: 1, y: 0.6 },
        colors: ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'],
      })
    }

    // Fire initial burst
    fireConfetti()

    // For high intensity, add extra bursts
    if (intensity === "high") {
      setTimeout(() => fireConfetti(), 150)
      setTimeout(() => fireConfetti(), 300)
    }

    // Call onComplete callback after animation
    const timeout = setTimeout(() => {
      hasTriggered.current = false
      onComplete?.()
    }, intensity === "high" ? 800 : 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [trigger, intensity, onComplete])

  // This component doesn't render anything visible
  return null
}

/**
 * Perfect Score Celebration
 * Special celebration for 100% accuracy or completing session perfectly
 */
export function PerfectScoreCelebration({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (!trigger) return

    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Fire from random positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#ec4899'],
      })

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#8b5cf6', '#7c3aed', '#6366f1', '#3b82f6', '#06b6d4'],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [trigger])

  return null
}

/**
 * Streak Milestone Celebration
 * Enhanced celebrations for achieving streak milestones (5, 10, 15, 20)
 * Progressively more impressive effects for higher streaks
 */
interface StreakMilestoneCelebrationProps {
  celebration: StreakCelebration | null
  trigger: boolean
  onComplete?: () => void
}

export function StreakMilestoneCelebration({
  celebration,
  trigger,
  onComplete,
}: StreakMilestoneCelebrationProps) {
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (!trigger || !celebration || hasTriggered.current) {
      return
    }

    hasTriggered.current = true

    const { celebrationType, color, particleCount = 100, duration = 2000 } = celebration

    // Convert hex color to array for confetti
    const colors = [
      color,
      adjustBrightness(color, 20),
      adjustBrightness(color, -20),
    ]

    // Different animation patterns based on celebration type
    switch (celebrationType) {
      case "confetti":
        fireConfettiCelebration(particleCount, colors)
        break
      case "fireworks":
        fireFireworksCelebration(particleCount, colors, duration)
        break
      case "sparkles":
        fireSparklesCelebration(particleCount, colors)
        break
      case "mega":
        fireMegaCelebration(particleCount, colors, duration)
        break
    }

    // Reset trigger after animation completes
    const timeout = setTimeout(() => {
      hasTriggered.current = false
      onComplete?.()
    }, duration)

    return () => {
      clearTimeout(timeout)
    }
  }, [trigger, celebration, onComplete])

  return null
}

/**
 * Standard confetti burst from both sides
 */
function fireConfettiCelebration(particleCount: number, colors: string[]) {
  const config = {
    particleCount,
    spread: 80,
    startVelocity: 50,
    decay: 0.9,
    scalar: 1.1,
    colors,
    zIndex: 100,
  }

  // Left side
  confetti({
    ...config,
    angle: 60,
    origin: { x: 0, y: 0.6 },
  })

  // Right side
  confetti({
    ...config,
    angle: 120,
    origin: { x: 1, y: 0.6 },
  })
}

/**
 * Fireworks - explosive bursts from center
 */
function fireFireworksCelebration(
  particleCount: number,
  colors: string[],
  duration: number
) {
  const baseConfig = {
    spread: 360,
    ticks: 100,
    gravity: 0.8,
    decay: 0.94,
    startVelocity: 40,
    colors,
    zIndex: 100,
  }

  // Fire multiple bursts
  const burstCount = 5
  const interval = duration / burstCount

  for (let i = 0; i < burstCount; i++) {
    setTimeout(() => {
      confetti({
        ...baseConfig,
        particleCount: particleCount / burstCount,
        origin: {
          x: Math.random() * 0.6 + 0.2, // Random x between 0.2 and 0.8
          y: Math.random() * 0.4 + 0.3, // Random y between 0.3 and 0.7
        },
      })
    }, i * interval)
  }
}

/**
 * Sparkles - gentle floating particles
 */
function fireSparklesCelebration(particleCount: number, colors: string[]) {
  confetti({
    particleCount,
    spread: 180,
    startVelocity: 20,
    decay: 0.95,
    gravity: 0.5,
    scalar: 0.8,
    drift: 1,
    colors,
    origin: { x: 0.5, y: 0.3 },
    zIndex: 100,
  })
}

/**
 * Mega celebration - continuous explosive effect
 */
function fireMegaCelebration(
  particleCount: number,
  colors: string[],
  duration: number
) {
  const animationEnd = Date.now() + duration
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 80,
    zIndex: 100,
    colors,
  }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      clearInterval(interval)
      return
    }

    const currentParticleCount = (particleCount / 4) * (timeLeft / duration)

    // Fire from multiple positions simultaneously
    confetti({
      ...defaults,
      particleCount: currentParticleCount,
      origin: { x: randomInRange(0.1, 0.4), y: Math.random() * 0.5 + 0.3 },
    })

    confetti({
      ...defaults,
      particleCount: currentParticleCount,
      origin: { x: randomInRange(0.6, 0.9), y: Math.random() * 0.5 + 0.3 },
    })

    confetti({
      ...defaults,
      particleCount: currentParticleCount,
      origin: { x: 0.5, y: randomInRange(0.2, 0.5) },
    })
  }, 150)
}

/**
 * Utility: Adjust hex color brightness
 */
function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '')

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Adjust brightness
  const adjust = (value: number) => {
    const adjusted = value + (percent / 100) * 255
    return Math.max(0, Math.min(255, Math.round(adjusted)))
  }

  // Convert back to hex
  const toHex = (value: number) => value.toString(16).padStart(2, '0')

  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`
}
