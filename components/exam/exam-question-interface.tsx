"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { AlertTriangle, Loader2 } from "lucide-react"

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

function extractErrorText(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Failed to submit answer."
}

function normalizeExamSubmitError(rawMessage: string): string {
  const normalized = rawMessage.toLowerCase()

  if (
    normalized.includes("suspicious response timing") ||
    normalized.includes("suspiciously fast")
  ) {
    return "That answer was submitted too quickly to validate. Please read the prompt carefully and submit again."
  }

  if (normalized.includes("submitting too quickly")) {
    return "Please wait a moment before submitting your next answer."
  }

  if (normalized.includes("too many submissions in a short period")) {
    return "You're submitting too frequently. Pause briefly, then try again."
  }

  if (normalized.includes("session validation failed")) {
    return "Your secure exam session needs to be refreshed before continuing."
  }

  if (normalized.includes("question index mismatch")) {
    return "Question order changed unexpectedly. Please try submitting again."
  }

  if (normalized.includes("already been answered")) {
    return "This question has already been submitted. Moving to the next question."
  }

  if (normalized.includes("ended due to inactivity")) {
    return "This attempt ended due to inactivity. Return to Exam Start to begin a new attempt."
  }

  if (normalized.includes("invalid answer option")) {
    return "That option is no longer valid. Please reselect your answer and submit again."
  }

  if (normalized.includes("exam question integrity check failed")) {
    return "Question data could not be validated. Refresh the page and try again."
  }

  return "We could not submit your answer right now. Please try again."
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
      const rawMessage = extractErrorText(error)
      setSubmitError(normalizeExamSubmitError(rawMessage))
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
            className="rounded-lg border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium text-destructive">Submission blocked</p>
                <p className="text-destructive/90">{submitError}</p>
              </div>
            </div>
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
