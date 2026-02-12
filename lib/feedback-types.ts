/**
 * Feedback Modal Types
 * Type definitions for instant feedback modal system after quiz answer submission
 */

import { Id } from "@/convex/_generated/dataModel";

/**
 * Complete flag details for display in feedback modal
 * Extended beyond basic flag data to include educational context
 */
export interface FlagDetails {
  _id: Id<"flags">;
  key: string;
  type: "flag-letter" | "flag-number" | "pennant-number" | "special-pennant" | "substitute";
  category: string;
  name: string;
  meaning: string;
  description: string;
  imagePath: string;
  colors: string[];
  pattern?: string;
  tips?: string;
  phonetic?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  order: number;
}

/**
 * Similar flag data for "confusable flags" section
 * Lightweight representation of flags that share characteristics
 */
export interface SimilarFlagData {
  _id: Id<"flags">;
  key: string;
  name: string;
  imagePath: string;
  matchReason?: string; // e.g., "Same colors", "Similar pattern"
}

/**
 * Encouragement message types
 * Different message categories based on user performance
 */
export type EncouragementType = 
  | "correct"           // Standard correct answer
  | "incorrect"         // Standard incorrect answer
  | "streak"            // Celebrating a streak milestone
  | "first-try"         // First question answered correctly
  | "improvement"       // User improving after mistakes
  | "perfect-session";  // All answers correct

/**
 * Encouragement message structure
 */
export interface EncouragementMessage {
  type: EncouragementType;
  title: string;
  message: string;
  icon?: string; // Lucide icon name
}

/**
 * Answer feedback context
 * Data passed to feedback modal after answer submission
 */
export interface AnswerFeedbackContext {
  isCorrect: boolean;
  userAnswer: string;           // Option ID selected by user
  correctAnswer: string;        // Option ID of correct answer
  currentStreak: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  isLastQuestion: boolean;
}

/**
 * Main feedback modal props
 * Complete interface for rendering educational feedback modal
 */
export interface FeedbackModalProps {
  // Modal visibility
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Answer feedback context
  feedback: AnswerFeedbackContext;

  // Flag details
  flag: FlagDetails;
  
  // Similar/confusable flags (optional)
  similarFlags?: SimilarFlagData[];

  // User action labels
  userAnswerLabel: string;      // Display label for user's choice
  correctAnswerLabel: string;   // Display label for correct answer

  // Navigation callbacks
  onNext: () => void;           // Advance to next question
  onViewResults?: () => void;   // View final results (last question only)
  
  // Optional features
  showSimilarFlags?: boolean;
  showMnemonicTips?: boolean;
  showLearnMoreLink?: boolean;
  
  // Engagement tracking (optional)
  onFeedbackViewed?: (duration: number) => void;
}

/**
 * Feedback modal state
 * Internal state management for modal behavior
 */
export interface FeedbackModalState {
  isVisible: boolean;
  displayStartTime: number | null;
  hasMinimumDisplayElapsed: boolean;
  isNavigating: boolean;
}

/**
 * Statistics for social proof (future enhancement)
 */
export interface AnswerStatistics {
  flagId: Id<"flags">;
  totalAttempts: number;
  correctAttempts: number;
  percentageCorrect: number;
}

/**
 * Report issue payload (future enhancement)
 */
export interface FlagIssueReport {
  flagId: Id<"flags">;
  userId: Id<"users">;
  issueType: "incorrect-image" | "incorrect-meaning" | "incorrect-name" | "other";
  description: string;
  reportedAt: number;
}

/**
 * Study set item (future enhancement)
 * For "Add to Study Set" feature
 */
export interface StudySetItem {
  flagId: Id<"flags">;
  userId: Id<"users">;
  addedAt: number;
  lastReviewed?: number;
  masteryLevel?: number; // 0-100
  notes?: string;
}
