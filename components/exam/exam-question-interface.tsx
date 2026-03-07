"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ExamQuestionPublic,
  ExamQuestionSubmissionResult,
} from "@/lib/exam-types"
import { ExamOptionGrid } from "./exam-option-grid"
import { ExamProgressHeader } from "./exam-progress-header"

interface ExamRuntimeProgressView {
  answeredCount: number
  remainingCount: number
  totalQuestions: number
  completionPercent: number
  elapsedMs: number
}

interface ExamQuestionInterfaceProps {
  progress: ExamRuntimeProgressView
  question: ExamQuestionPublic
  onSubmitAnswer: (input: {
    questionIndex: number
    selectedAnswer: string
  }) => Promise<ExamQuestionSubmissionResult>
}

export function ExamQuestionInterface({
  progress,
  question,
  onSubmitAnswer,
}: ExamQuestionInterfaceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const canSubmit = useMemo(
    () => selectedAnswer !== null && !isSubmitting,
    [selectedAnswer, isSubmitting]
  )

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmitAnswer({
        questionIndex: question.questionIndex,
        selectedAnswer,
      })

      setSelectedAnswer(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit answer."
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg" aria-live="polite">
          Question {question.questionIndex + 1} of {progress.totalQuestions}
        </CardTitle>
        <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border text-base font-bold">
            {question.questionIndex + 1}
          </span>
          <p className="text-sm font-medium">Current Question Number</p>
        </div>
        <ExamProgressHeader
          currentQuestionNumber={question.questionIndex + 1}
          answeredCount={progress.answeredCount}
          remainingCount={progress.remainingCount}
          totalQuestions={progress.totalQuestions}
          completionPercent={progress.completionPercent}
          elapsedMs={progress.elapsedMs}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {submitError && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {submitError}
          </div>
        )}

        {question.mode === "learn" ? (
          <div className="rounded-md border p-4">
            <p className="mb-3 text-sm text-muted-foreground">Identify this flag:</p>
            <div className="relative mx-auto h-56 w-full max-w-md">
              {question.prompt.imagePath ? (
                <Image
                  src={question.prompt.imagePath}
                  alt={`Signal flag ${question.flagKey}`}
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Flag image unavailable
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border p-6 text-center">
            <p className="text-sm text-muted-foreground">Match meaning to flag:</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {question.prompt.meaning ?? "Unknown meaning"}
            </p>
          </div>
        )}

        <ExamOptionGrid
          options={question.options}
          mode={question.mode}
          selectedAnswer={selectedAnswer}
          disabled={isSubmitting}
          onSelect={(optionId) => {
            setSubmitError(null)
            setSelectedAnswer(optionId)
          }}
        />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Submit selected answer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Answer"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
