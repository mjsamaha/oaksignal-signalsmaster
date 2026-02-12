"use client"

/**
 * Streak Indicator Component
 * Displays current consecutive correct answer streak with fire icon
 * Includes pulse animation on increment
 */

import { Flame } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StreakIndicatorProps {
  streak: number
  className?: string
}

export function StreakIndicator({ streak, className }: StreakIndicatorProps) {
  // Hide when streak is 0
  if (streak === 0) {
    return null
  }

  return (
    <motion.div
      key={streak}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
      className={cn("inline-flex", className)}
    >
      <Badge 
        variant={streak >= 5 ? "default" : "secondary"}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-base font-semibold",
          streak >= 5 && "bg-orange-500 hover:bg-orange-600"
        )}
      >
        <Flame 
          className={cn(
            "h-4 w-4",
            streak >= 5 && "animate-pulse text-yellow-200"
          )} 
        />
        <span className="tabular-nums">{streak}</span>
        <span className="text-xs font-normal opacity-90">
          streak
        </span>
      </Badge>
    </motion.div>
  )
}
