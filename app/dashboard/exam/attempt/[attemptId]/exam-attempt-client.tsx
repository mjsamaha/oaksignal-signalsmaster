"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useMutation, useQuery } from "convex/react"
import { formatDistanceToNow } from "date-fns"

import { Id } from "@/convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import {
  ExamClientSecurityEventInput,
  ExamAttemptDetail,
  ExamAttemptRuntimeProgress,
  ExamQuestionPublic,
  ExamQuestionSubmissionResult,
} from "@/lib/exam-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ExamInProgressHeader,
  ExamQuestionInterface,
  ExamSecurityBanner,
} from "@/components/exam"
import { useExamImagePreload } from "@/hooks/use-exam-image-preload"
import { useExamSecurityMonitor } from "@/hooks/use-exam-security-monitor"
import { useExamKeyboardLockdown } from "@/hooks/use-exam-keyboard-lockdown"

interface ExamAttemptClientProps {
  attemptId: Id<"examAttempts">
}

function formatScorePercent(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toFixed(2)}%`
    : "N/A"
}

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function ExamAttemptClient({ attemptId }: ExamAttemptClientProps) {
  const router = useRouter()
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
  const logExamClientEvent = useMutation(api.exams.logExamClientEvent)

  const isExamActive = runtimeProgress?.status === "started"

  const logClientSecurityEvent = useCallback(
    (input: ExamClientSecurityEventInput) => {
      let metadataJson: string | undefined
      if (input.metadata) {
        try {
          metadataJson = JSON.stringify(input.metadata)
        } catch {
          metadataJson = undefined
        }
      }

      void logExamClientEvent({
        examAttemptId: attemptId,
        eventType: input.eventType,
        message: input.message,
        metadataJson,
      }).catch(() => undefined)
    },
    [attemptId, logExamClientEvent]
  )

  const securityMonitor = useExamSecurityMonitor({
    enabled: isExamActive,
    onClientEvent: logClientSecurityEvent,
    fullscreenRecommendation: true,
    backNavigationGuard: true,
  })

  const keyboardLockdown = useExamKeyboardLockdown({
    enabled: isExamActive,
    onRestrictedShortcutBlocked: (details) => {
      logClientSecurityEvent({
        eventType: "restricted_shortcut_blocked",
        message: "Blocked restricted keyboard shortcut during active exam.",
        metadata: { ...details },
      })
    },
  })

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
    if (!attempt.sessionToken) {
      throw new Error("Session validation is not ready. Please refresh the exam page.")
    }

    return submitExamAnswer({
      examAttemptId: attemptId,
      questionIndex: input.questionIndex,
      selectedAnswer: input.selectedAnswer,
      sessionToken: attempt.sessionToken,
    }) as Promise<ExamQuestionSubmissionResult>
  }

  const result = attempt.result
  const hasModeStats = Boolean(result?.modeStats)
  const hasCategoryStats = Boolean(result?.categoryStats && result.categoryStats.length > 0)

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6">
      {runtimeProgress.status === "completed" ? (
        <div className="space-y-2">
          <Badge variant="destructive" className="uppercase tracking-wide">
            Official Examination
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Attempt #{attempt.attemptNumber}</h1>
          <p className="text-muted-foreground">
            Exam attempt initialized {formatDistanceToNow(attempt.startedAt, { addSuffix: true })}.
          </p>
        </div>
      ) : (
        <ExamInProgressHeader attemptNumber={attempt.attemptNumber} />
      )}

      {runtimeProgress.status === "started" && (
        <ExamSecurityBanner
          isOffline={securityMonitor.isOffline}
          isWindowFocused={securityMonitor.isWindowFocused}
          isTabVisible={securityMonitor.isTabVisible}
          isFullscreenRecommended={securityMonitor.isFullscreenRecommended}
          backNavigationBlockedCount={securityMonitor.backNavigationBlockedCount}
          restrictedShortcutBlockedCount={keyboardLockdown.blockedShortcutCount}
          onRequestFullscreen={() => {
            void securityMonitor.requestFullscreen()
          }}
        />
      )}

      {runtimeProgress.status !== "completed" && !attempt.sessionToken ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session validation required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A secure exam session token is required before you can continue.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={() => router.refresh()}>
                Refresh Session
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/exam">Return to Exam Start</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : runtimeProgress.status === "completed" ? (
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
            {result && (
              <div className="rounded-md border bg-muted/40 p-4 text-sm">
                <p>Score: <span className="font-semibold">{formatScorePercent(result.scorePercent)}</span></p>
                <p>
                  Correct answers: <span className="font-semibold">
                    {isValidNumber(result.correctCount) ? result.correctCount : "N/A"}/
                    {isValidNumber(result.totalQuestions) ? result.totalQuestions : "N/A"}
                  </span>
                </p>
                <p>Status: <span className="font-semibold">{result.passed ? "Passed" : "Not Passed"}</span></p>

                {hasModeStats && result.modeStats && (
                  <div className="mt-3 border-t pt-3">
                    <p className="mb-2 font-medium">Mode Breakdown</p>
                    <p>
                      Learn: {result.modeStats.learn.correct}/{result.modeStats.learn.total} correct
                    </p>
                    <p>
                      Match: {result.modeStats.match.correct}/{result.modeStats.match.total} correct
                    </p>
                  </div>
                )}

                {hasCategoryStats && result.categoryStats && (
                  <div className="mt-3 border-t pt-3">
                    <p className="mb-2 font-medium">Category Breakdown</p>
                    <div className="space-y-1">
                      {result.categoryStats.map((item) => (
                        <p key={item.category}>
                          {item.category}: {item.correct}/{item.total} correct
                        </p>
                      ))}
                    </div>
                  </div>
                )}
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
            answeredCount: runtimeProgress.answeredCount,
            remainingCount: runtimeProgress.remainingCount ?? (
              runtimeProgress.totalQuestions - runtimeProgress.answeredCount
            ),
            totalQuestions: runtimeProgress.totalQuestions,
            completionPercent: runtimeProgress.completionPercent ?? 0,
            elapsedMs: runtimeProgress.elapsedMs ?? 0,
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
