"use client"

import Link from "next/link"
import { useMutation, useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"
import { ClipboardCheck, Clock3, Lock, ShieldCheck } from "lucide-react"

import { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import {
  ExamAttemptDetail,
  ExamAttemptRuntimeProgress,
  ExamQuestionPublic,
  ExamQuestionSubmissionResult,
} from "@/lib/exam-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExamQuestionInterface } from "@/components/exam"
import { useExamImagePreload } from "@/hooks/use-exam-image-preload"

interface ExamAttemptClientProps {
  attemptId: Id<"examAttempts">
}

export function ExamAttemptClient({ attemptId }: ExamAttemptClientProps) {
  const attempt = useQuery(api.exams.getAttemptById, { examAttemptId: attemptId }) as
    | ExamAttemptDetail
    | null
    | undefined
  const runtimeProgress = useQuery(api.exams.getAttemptRuntimeProgress, {
    examAttemptId: attemptId,
  }) as ExamAttemptRuntimeProgress | null | undefined
  const currentQuestion = useQuery(api.exams.getCurrentAttemptQuestion, {
    examAttemptId: attemptId,
  }) as ExamQuestionPublic | null | undefined
  const preload = useQuery(api.exams.getAttemptPreload, {
    examAttemptId: attemptId,
  }) as { currentQuestionImages: string[]; nextQuestionImages: string[] } | null | undefined
  const submitExamAnswer = useMutation(api.exams.submitExamAnswer)

  useExamImagePreload({
    currentQuestionImages: preload?.currentQuestionImages,
    nextQuestionImages: preload?.nextQuestionImages,
  })

  if (attempt === undefined || runtimeProgress === undefined || currentQuestion === undefined) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading official attempt...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fetching your official exam attempt details.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (attempt === null || runtimeProgress === null) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Attempt unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This exam attempt does not exist or you do not have access to it.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/exam">Return to Exam Start</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmitAnswer = async (input: {
    questionIndex: number
    selectedAnswer: string
  }): Promise<ExamQuestionSubmissionResult> => {
    return submitExamAnswer({
      examAttemptId: attemptId,
      questionIndex: input.questionIndex,
      selectedAnswer: input.selectedAnswer,
    }) as Promise<ExamQuestionSubmissionResult>
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6">
      <div className="space-y-2">
        <Badge variant="destructive" className="uppercase tracking-wide">
          Official Examination
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Attempt #{attempt.attemptNumber}</h1>
        <p className="text-muted-foreground">
          Exam attempt initialized {formatDistanceToNow(attempt.startedAt, { addSuffix: true })}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5" />
            Attempt Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <span>Status: <span className="font-semibold text-foreground">{attempt.status}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <span>
              Rules reviewed for {Math.round(attempt.rulesViewDurationMs / 1000)} seconds before start.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>
              Policy locked at start: {attempt.policySnapshot.totalQuestions} questions,{" "}
              {attempt.policySnapshot.passThresholdPercent}% pass threshold, no pause/resume.
            </span>
          </div>
          {attempt.generationSnapshot && (
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              <span>
                Questions generated in {attempt.generationSnapshot.generationTimeMs}ms with
                seed {attempt.generationSnapshot.seed}.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {runtimeProgress.status === "completed" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exam Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You completed this official exam{" "}
              {attempt.completedAt
                ? formatDistanceToNow(attempt.completedAt, { addSuffix: true })
                : "recently"}
              .
            </p>
            {attempt.result && (
              <div className="rounded-md border bg-muted/40 p-4 text-sm">
                <p>Score: <span className="font-semibold">{attempt.result.scorePercent}%</span></p>
                <p>
                  Correct answers: <span className="font-semibold">
                    {attempt.result.correctCount}/{attempt.result.totalQuestions}
                  </span>
                </p>
                <p>Status: <span className="font-semibold">{attempt.result.passed ? "Passed" : "Not Passed"}</span></p>
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/dashboard/exam">Back to Exam Start</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/practice">Practice Mode</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : currentQuestion ? (
        <ExamQuestionInterface
          progress={{
            currentQuestionIndex: runtimeProgress.currentQuestionIndex ?? 0,
            answeredCount: runtimeProgress.answeredCount,
            correctCount: runtimeProgress.correctCount,
            totalQuestions: runtimeProgress.totalQuestions,
          }}
          question={currentQuestion}
          onSubmitAnswer={handleSubmitAnswer}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preparing question delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your exam is active, but question data is not yet available. Please refresh.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
