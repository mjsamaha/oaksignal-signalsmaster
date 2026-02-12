/**
 * Practice Components Index
 * Centralized exports for practice-related components
 */

// Quiz Components
export { QuizInterface } from "./quiz-interface"
export { QuizContainer } from "./quiz-container"
export { QuizProgressBar } from "./quiz-progress-bar"
export { QuestionCounter } from "./question-counter"
export { StreakIndicator } from "./streak-indicator"
export { FlagDisplay } from "./flag-display"
export { MultipleChoiceOptions } from "./multiple-choice-options"
export { SubmitButton } from "./submit-button"
export { AnswerFeedback } from "./answer-feedback"

// Feedback Modal Components (New)
export { FeedbackModal } from "./feedback-modal"
export { FeedbackFlagDisplay } from "./feedback-flag-display"
export { EncouragementMessage } from "./encouragement-message"
export { SimilarFlagsSection } from "./similar-flags-section"

// Celebration Components
export { 
  CelebrationAnimation, 
  PerfectScoreCelebration,
  StreakMilestoneCelebration,
} from "./celebration-animation"

// Loading & Error States
export { QuizLoadingState } from "./quiz-loading-state"
export { QuizErrorBoundary } from "./quiz-error-boundary"

// Session Management
export { ModeSelectionCard } from "./mode-selection-card"
export { SessionLengthSelector } from "./session-length-selector"
export { ResumeSessionCard } from "./resume-session-card"
export { PracticeStats } from "./practice-stats"
