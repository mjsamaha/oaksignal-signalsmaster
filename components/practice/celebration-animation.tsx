"use client"

/**
 * Celebration Animation Component
 * Triggers confetti effects for correct answers and achievements
 * Uses canvas-confetti for performance-optimized animations
 */

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

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
