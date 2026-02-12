"use client"

/**
 * Quiz Loading State Component
 * Displays skeleton loaders while quiz data is being fetched
 */

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizLoadingStateProps {
  className?: string
}

export function QuizLoadingState({ className }: QuizLoadingStateProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress bar skeleton */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Question counter skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-6 w-16" />
      </div>

      {/* Flag display skeleton */}
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="space-y-4 text-center">
            <Skeleton className="mx-auto h-48 w-64" />
            <Skeleton className="mx-auto h-6 w-48" />
          </div>
        </CardContent>
      </Card>

      {/* Options skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>

      {/* Submit button skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-12 w-48" />
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading question...</span>
      </div>
    </div>
  )
}
