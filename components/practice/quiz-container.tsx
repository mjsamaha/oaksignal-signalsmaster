/**
 * Quiz Container Component
 * Provides responsive layout wrapper for quiz interface
 * Ensures consistent spacing and max-width across devices
 */

import { cn } from "@/lib/utils"

interface QuizContainerProps {
  children: React.ReactNode
  className?: string
}

export function QuizContainer({ children, className }: QuizContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto max-w-4xl px-4 py-6 space-y-6",
        "md:px-6 md:py-8 md:space-y-8",
        "lg:max-w-5xl",
        className
      )}
    >
      {children}
    </div>
  )
}
