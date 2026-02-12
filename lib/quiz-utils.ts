/**
 * Quiz Utility Functions
 * Helper functions for quiz interface logic
 */

import { Question, PracticeSession, CurrentQuestionData } from "./practice-types"
import { CELEBRATION_THRESHOLDS } from "./practice-constants"

/**
 * Calculate current streak from questions array
 * Counts consecutive correct answers from most recent backwards
 */
export function calculateStreak(questions: Question[]): number {
  let streak = 0

  // Iterate backwards from most recent answered question
  for (let i = questions.length - 1; i >= 0; i--) {
    const question = questions[i]
    
    // Skip unanswered questions
    if (question.userAnswer === null) {
      continue
    }

    // Check if answer is correct
    if (question.userAnswer === question.correctAnswer) {
      streak++
    } else {
      // Streak breaks on first incorrect answer
      break
    }
  }

  return streak
}

/**
 * Calculate accuracy percentage from questions array
 */
export function calculateAccuracy(questions: Question[]): number {
  const answeredQuestions = questions.filter(q => q.userAnswer !== null)
  
  if (answeredQuestions.length === 0) {
    return 0
  }

  const correctCount = answeredQuestions.filter(
    q => q.userAnswer === q.correctAnswer
  ).length

  return Math.round((correctCount / answeredQuestions.length) * 100)
}

/**
 * Determine if celebration should be triggered
 * Based on streak and accuracy thresholds
 */
export function shouldCelebrate(
  isCorrect: boolean,
  streak: number,
  accuracy: number
): boolean {
  if (!isCorrect) {
    return false
  }

  // Trigger on streak threshold
  if (streak > 0 && streak % CELEBRATION_THRESHOLDS.STREAK_TRIGGER === 0) {
    return true
  }

  // Trigger on high accuracy
  if (accuracy >= CELEBRATION_THRESHOLDS.ACCURACY_TRIGGER) {
    return true
  }

  return false
}

/**
 * Format milliseconds to readable time string
 */
export function formatQuizTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${seconds}s`
}

/**
 * Get option letter from index (0 -> A, 1 -> B, etc.)
 */
export function getOptionLetter(index: number): string {
  return String.fromCharCode(65 + index) // 65 is 'A'
}

/**
 * Validate that all required quiz data is present
 */
export function hasValidQuizData(
  session: PracticeSession | null | undefined,
  questionData: CurrentQuestionData | null | undefined
): boolean {
  return !!(
    session && 
    session.questions && 
    session.questions.length > 0 &&
    questionData &&
    questionData.question &&
    questionData.question.options &&
    questionData.question.options.length === 4 &&
    questionData.flag
  )
}
