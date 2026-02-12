"use client"

/**
 * Question Counter Component
 * Displays current question number with animated transitions
 */

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface QuestionCounterProps {
  currentIndex: number
  totalQuestions: number
  className?: string
}

export function QuestionCounter({
  currentIndex,
  totalQuestions,
  className,
}: QuestionCounterProps) {
  // Display as 1-indexed (1 of 10, not 0 of 10)
  const displayNumber = currentIndex + 1

  return (
    <div 
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-label={`Question ${displayNumber} of ${totalQuestions}`}
    >
      <span className="text-sm font-medium text-muted-foreground">
        Question
      </span>
      <motion.span
        key={displayNumber}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="text-2xl font-bold tabular-nums"
      >
        {displayNumber}
      </motion.span>
      <span className="text-xl font-medium text-muted-foreground">
        of {totalQuestions}
      </span>
    </div>
  )
}
