"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ExamProgressHeaderProps {
  answeredCount: number
  correctCount: number
  totalQuestions: number
}

export function ExamProgressHeader({
  answeredCount,
  correctCount,
  totalQuestions,
}: ExamProgressHeaderProps) {
  const progressPercent = totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="outline" aria-label={`Answered ${answeredCount} of ${totalQuestions}`}>
          Answered {answeredCount}/{totalQuestions}
        </Badge>
        <Badge variant="secondary" aria-label={`${correctCount} answers correct so far`}>
          Correct so far: {correctCount}
        </Badge>
      </div>
      <Progress
        value={progressPercent}
        aria-label="Exam progress"
      />
    </div>
  )
}

