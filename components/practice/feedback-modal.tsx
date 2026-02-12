"use client"

/**
 * Feedback Modal Component
 * Displays comprehensive educational feedback after answer submission
 * Orchestrates flag display, encouragement messages, similar flags, and navigation
 */

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Trophy, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  Info,
} from "lucide-react"

// Sub-components
import { FeedbackFlagDisplay } from "./feedback-flag-display"
import { EncouragementMessage } from "./encouragement-message"
import { SimilarFlagsSection } from "./similar-flags-section"
import { StreakMilestoneCelebration } from "./celebration-animation"

// Types and utilities
import { FeedbackModalProps } from "@/lib/feedback-types"
import { generateEncouragementMessage } from "@/lib/encouragement-utils"
import { getCelebrationForStreak, isStreakMilestone } from "@/lib/streak-utils"
import { FEEDBACK_MODAL_CONFIG } from "@/lib/practice-constants"

export function FeedbackModal({
  open,
  onOpenChange,
  feedback,
  flag,
  similarFlags = [],
  userAnswerLabel,
  correctAnswerLabel,
  onNext,
  onViewResults,
  showSimilarFlags = true,
  showMnemonicTips = true,
  showLearnMoreLink = true,
  onFeedbackViewed,
}: FeedbackModalProps) {
  const [canDismiss, setCanDismiss] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const { isCorrect, isLastQuestion, currentStreak } = feedback

  // Generate encouragement message based on feedback context
  const encouragement = generateEncouragementMessage({
    isCorrect: feedback.isCorrect,
    currentStreak: feedback.currentStreak,
    currentQuestionIndex: feedback.currentQuestionIndex,
    correctCount: feedback.correctCount,
    totalQuestions: feedback.totalQuestions,
    isLastQuestion: feedback.isLastQuestion,
  })

  // Get streak celebration if applicable
  const streakCelebration = getCelebrationForStreak(currentStreak) ?? null
  const shouldShowStreakCelebration = isStreakMilestone(currentStreak) && isCorrect

  // Track display timing and trigger effects
  useEffect(() => {
    if (!open) return

    const startTime = Date.now()
    
    // Enable dismissal after minimum duration
    const dismissTimer = setTimeout(() => {
      setCanDismiss(true)
    }, FEEDBACK_MODAL_CONFIG.MIN_DISPLAY_DURATION)

    // Trigger celebration for streak milestones
    let celebrationTimer: NodeJS.Timeout | undefined
    if (shouldShowStreakCelebration) {
      celebrationTimer = setTimeout(() => {
        setShowCelebration(true)
      }, 100)
    }

    return () => {
      clearTimeout(dismissTimer)
      if (celebrationTimer) clearTimeout(celebrationTimer)
      
      // Track feedback view duration
      if (onFeedbackViewed) {
        const duration = Date.now() - startTime
        onFeedbackViewed(duration)
      }
      
      // Reset state on unmount
      setCanDismiss(false)
      setShowCelebration(false)
    }
  }, [open, shouldShowStreakCelebration, onFeedbackViewed])

  // Handle navigation with dismiss check
  const handleNext = useCallback(() => {
    if (!canDismiss) return
    onNext()
  }, [canDismiss, onNext])

  const handleViewResults = useCallback(() => {
    if (!canDismiss || !onViewResults) return
    onViewResults()
  }, [canDismiss, onViewResults])

  // Keyboard navigation (Enter/Space to proceed)
  useEffect(() => {
    if (!open || !canDismiss) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (isLastQuestion && onViewResults) {
          handleViewResults()
        } else {
          handleNext()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, canDismiss, isLastQuestion, handleNext, handleViewResults, onViewResults])

  return (
    <>
      {/* Streak Milestone Celebration */}
      <StreakMilestoneCelebration
        celebration={streakCelebration}
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-describedby="feedback-description"
        >
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: FEEDBACK_MODAL_CONFIG.ANIMATION_DURATION / 1000 }}
                className="space-y-6"
              >
                {/* Header with Status */}
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    )}
                    <div className="flex-1">
                      <DialogTitle className="text-2xl">
                        {isCorrect ? "Correct!" : "Not Quite"}
                      </DialogTitle>
                      <DialogDescription id="feedback-description">
                        Review the flag details below
                      </DialogDescription>
                    </div>
                    {currentStreak > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="text-sm font-semibold"
                      >
                        {currentStreak} streak
                      </Badge>
                    )}
                  </div>
                </DialogHeader>

                {/* Encouragement Message */}
                <EncouragementMessage
                  message={encouragement}
                  isCorrect={isCorrect}
                />

                {/* Flag Display */}
                <FeedbackFlagDisplay
                  flagImage={flag.imagePath}
                  flagName={flag.name}
                  flagKey={flag.key}
                  isCorrect={isCorrect}
                />

                {/* Answer Comparison */}
                <div className="space-y-3">
                  {!isCorrect && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <p className="text-sm font-medium text-red-900 dark:text-red-100">
                              Your answer
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              {userAnswerLabel}
                            </p>
                          </div>
                          <div className="h-px bg-red-200 dark:bg-red-800 my-2" />
                          <div>
                            <p className="text-sm font-medium text-red-900 dark:text-red-100">
                              Correct answer
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                              {correctAnswerLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Flag Details */}
                <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Meaning
                    </h4>
                    <p className="text-base font-medium">
                      {flag.meaning}
                    </p>
                  </div>

                  {flag.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {flag.description}
                      </p>
                    </div>
                  )}

                  {showMnemonicTips && flag.tips && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Memory Tip
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        {flag.tips}
                      </p>
                    </div>
                  )}

                  {/* Flag Metadata */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {flag.colors.map((color) => (
                      <Badge key={color} variant="outline" className="text-xs">
                        {color}
                      </Badge>
                    ))}
                    {flag.phonetic && (
                      <Badge variant="secondary" className="text-xs font-mono">
                        {flag.phonetic}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Similar Flags Section */}
                {showSimilarFlags && similarFlags.length > 0 && (
                  <>
                    <div className="h-px bg-border my-4" />
                    <SimilarFlagsSection flags={similarFlags} />
                  </>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {showLearnMoreLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="sm:flex-1"
                    >
                      <a
                        href={`/dashboard/reference/flags/${flag.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Learn More
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  {isLastQuestion && onViewResults ? (
                    <Button
                      onClick={handleViewResults}
                      disabled={!canDismiss}
                      size="lg"
                      className="sm:flex-1 flex items-center justify-center gap-2"
                    >
                      <Trophy className="h-5 w-5" />
                      View Results
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!canDismiss}
                      size="lg"
                      className="sm:flex-1 flex items-center justify-center gap-2"
                    >
                      Next Question
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                {/* Keyboard Shortcut Hint */}
                {canDismiss && (
                  <p className="text-xs text-center text-muted-foreground">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Enter</kbd> or{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Space</kbd> to continue
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  )
}
