"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  ExamQuestionPublic,
  ExamQuestionSubmissionResult,
} from "@/lib/exam-types"
import { ExamOptionGrid } from "./exam-option-grid"
import { ExamProgressHeader } from "./exam-progress-header"

interface ExamRuntimeProgressView {
  currentQuestionIndex: number
  answeredCount: number
  correctCount: number
  totalQuestions: number
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
  const { toast } = useToast()
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => selectedAnswer !== null && !isSubmitting,
    [selectedAnswer, isSubmitting]
  )

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onSubmitAnswer({
        questionIndex: question.questionIndex,
        selectedAnswer,
      })

      setSelectedAnswer(null)

      if (result.isExamComplete) {
        toast({
          title: "Exam completed",
          description: `You answered ${result.correctCount} out of ${result.totalQuestions} correctly.`,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit answer."
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg">
          Question {question.questionIndex + 1} of {progress.totalQuestions}
        </CardTitle>
        <ExamProgressHeader
          answeredCount={progress.answeredCount}
          correctCount={progress.correctCount}
          totalQuestions={progress.totalQuestions}
        />
      </CardHeader>
      <CardContent className="space-y-6">
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
          onSelect={setSelectedAnswer}
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
