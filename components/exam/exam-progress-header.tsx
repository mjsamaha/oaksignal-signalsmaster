"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ExamProgressHeaderProps {
  currentQuestionNumber: number
  answeredCount: number
  remainingCount: number
  totalQuestions: number
  completionPercent: number
  elapsedMs: number
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function ExamProgressHeader({
  currentQuestionNumber,
  answeredCount,
  remainingCount,
  totalQuestions,
  completionPercent,
  elapsedMs,
}: ExamProgressHeaderProps) {
  const answeredIndicators = Array.from({ length: totalQuestions }, (_, index) => index < answeredCount)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="outline" aria-label={`Answered ${answeredCount} of ${totalQuestions}`}>
          Answered {answeredCount}/{totalQuestions}
        </Badge>
        <Badge variant="secondary" aria-label={`${completionPercent}% completed`}>
          Progress {completionPercent}%
        </Badge>
        <Badge variant="outline" aria-label={`${remainingCount} questions remaining`}>
          Remaining {remainingCount}
        </Badge>
        <Badge variant="outline" aria-label={`Elapsed time ${formatElapsed(elapsedMs)}`}>
          Elapsed {formatElapsed(elapsedMs)}
        </Badge>
        <Badge variant="secondary" aria-label={`Current question ${currentQuestionNumber}`}>
          Current #{currentQuestionNumber}
        </Badge>
      </div>
      <div className="grid grid-cols-10 gap-1" aria-label="Answered question progress indicators">
        {answeredIndicators.map((isAnswered, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full border",
              isAnswered ? "border-primary bg-primary" : "border-muted-foreground/30 bg-transparent"
            )}
          />
        ))}
      </div>
      <Progress
        value={completionPercent}
        aria-label="Exam progress"
      />
    </div>
  )
}
