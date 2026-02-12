"use client"

/**
 * Quiz Progress Bar Component
 * Displays visual progress indicator with percentage and question count
 */

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface QuizProgressBarProps {
  currentIndex: number
  totalQuestions: number
  className?: string
}

export function QuizProgressBar({
  currentIndex,
  totalQuestions,
  className,
}: QuizProgressBarProps) {
  const percentage = totalQuestions > 0 
    ? Math.round((currentIndex / totalQuestions) * 100) 
    : 0

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Progress
        </span>
        <span className="font-semibold text-foreground">
          {percentage}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2 transition-all duration-500"
        aria-label={`Quiz progress: ${percentage}% complete`}
      />
    </div>
  )
}
