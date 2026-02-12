"use client"

/**
 * Quiz State Management Hook
 * Centralized state management for quiz interface
 * Handles answer selection, submission, feedback display, and transitions
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { QuizState } from "@/lib/practice-types"
import { QUIZ_CONFIG } from "@/lib/practice-constants"

interface UseQuizStateOptions {
  totalQuestions: number
  currentQuestionIndex: number
  onAnswerSubmit?: (selectedAnswer: string) => void
}

interface UseQuizStateReturn extends QuizState {
  selectAnswer: (answerId: string) => void
  submitAnswer: () => void
  setSubmitting: (isSubmitting: boolean) => void
  setAnswerResult: (isCorrect: boolean, correctAnswer: string, streak: number) => void
  hideFeedback: () => void
  resetForNextQuestion: () => void
}

export function useQuizState({
  currentQuestionIndex,
  onAnswerSubmit,
}: UseQuizStateOptions): UseQuizStateReturn {
  // Core state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [streak, setStreak] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  // Refs for managing timers and tracking question changes
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastQuestionIndexRef = useRef<number>(currentQuestionIndex)

  // Select an answer option
  const selectAnswer = useCallback((answerId: string) => {
    if (isAnswered || isSubmitting) {
      return // Don't allow selection after submission
    }
    setSelectedAnswer(answerId)
  }, [isAnswered, isSubmitting])

  // Submit the selected answer
  const submitAnswer = useCallback(() => {
    if (!selectedAnswer || isSubmitting || isAnswered) {
      return
    }

    setIsSubmitting(true)
    onAnswerSubmit?.(selectedAnswer)
  }, [selectedAnswer, isSubmitting, isAnswered, onAnswerSubmit])

  // Set answer result after submission
  const setAnswerResult = useCallback(
    (correct: boolean, correctAnswer: string, currentStreak: number) => {
      setIsAnswered(true)
      setIsCorrect(correct)
      setStreak(currentStreak)
      setShowFeedback(true)
      setIsSubmitting(false)

      // Auto-hide feedback after delay
      feedbackTimerRef.current = setTimeout(() => {
        setShowFeedback(false)
      }, QUIZ_CONFIG.FEEDBACK_DISPLAY_DURATION)
    },
    []
  )

  // Manually hide feedback
  const hideFeedback = useCallback(() => {
    setShowFeedback(false)
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = null
    }
  }, [])

  // Reset state for next question
  const resetForNextQuestion = useCallback(() => {
    setSelectedAnswer(null)
    setIsSubmitting(false)
    setIsAnswered(false)
    setIsCorrect(null)
    setShowFeedback(false)
    
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = null
    }
  }, [])

  // Reset state when question index changes
  useEffect(() => {
    if (lastQuestionIndexRef.current !== currentQuestionIndex) {
      lastQuestionIndexRef.current = currentQuestionIndex
      // Question changed - reset for next question
      // We do cleanup in batch
      const timer = setTimeout(() => {
        setSelectedAnswer(null)
        setIsSubmitting(false)
        setIsAnswered(false)
        setIsCorrect(null)
        setShowFeedback(false)
      }, 0)
      
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
        feedbackTimerRef.current = null
      }
      
      return () => clearTimeout(timer)
    }
  }, [currentQuestionIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current)
      }
    }
  }, [])

  return {
    // State
    currentQuestionIndex,
    selectedAnswer,
    isSubmitting,
    isAnswered,
    isCorrect,
    streak,
    showFeedback,

    // Actions
    selectAnswer,
    submitAnswer,
    setSubmitting: setIsSubmitting,
    setAnswerResult,
    hideFeedback,
    resetForNextQuestion,
  }
}
