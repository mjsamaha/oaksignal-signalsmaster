/**
 * Encouragement Message Utilities
 * Generates contextual motivational messages based on user performance
 */

import { EncouragementMessage, EncouragementType } from "./feedback-types";

/**
 * Encouragement message pools organized by type
 * Messages are randomly selected to keep feedback fresh and engaging
 */
const ENCOURAGEMENT_MESSAGES: Record<EncouragementType, EncouragementMessage[]> = {
  correct: [
    {
      type: "correct",
      title: "Correct!",
      message: "Well done! You identified the flag correctly.",
      icon: "CheckCircle",
    },
    {
      type: "correct",
      title: "Excellent!",
      message: "Great job! You're mastering these signals.",
      icon: "ThumbsUp",
    },
    {
      type: "correct",
      title: "That's Right!",
      message: "Perfect identification! Keep up the good work.",
      icon: "Star",
    },
    {
      type: "correct",
      title: "Well Done!",
      message: "You've got it! Your flag knowledge is improving.",
      icon: "Award",
    },
    {
      type: "correct",
      title: "Outstanding!",
      message: "Excellent work! You're becoming a signaling expert.",
      icon: "Sparkles",
    },
  ],
  incorrect: [
    {
      type: "incorrect",
      title: "Not Quite",
      message: "Keep learning! Every mistake is a step toward mastery.",
      icon: "Info",
    },
    {
      type: "incorrect",
      title: "Keep Trying!",
      message: "Don't worry, you'll get it next time. Review the flag details below.",
      icon: "BookOpen",
    },
    {
      type: "incorrect",
      title: "Almost There!",
      message: "You're making progress. Study the flag carefully and try again later.",
      icon: "Target",
    },
    {
      type: "incorrect",
      title: "Learning Moment",
      message: "Great effort! Use this as an opportunity to reinforce your knowledge.",
      icon: "Lightbulb",
    },
    {
      type: "incorrect",
      title: "Stay Focused",
      message: "You're on the right track. Pay attention to the details below.",
      icon: "Eye",
    },
  ],
  streak: [
    {
      type: "streak",
      title: "Streak Achievement!",
      message: "You're on fire! Multiple correct answers in a row.",
      icon: "Flame",
    },
    {
      type: "streak",
      title: "Unstoppable!",
      message: "Amazing consistency! You're really mastering these signals.",
      icon: "Zap",
    },
    {
      type: "streak",
      title: "On a Roll!",
      message: "Fantastic streak! Your knowledge is really showing.",
      icon: "TrendingUp",
    },
    {
      type: "streak",
      title: "Incredible!",
      message: "What a streak! You're demonstrating excellent recall.",
      icon: "Trophy",
    },
    {
      type: "streak",
      title: "Master Navigator!",
      message: "Outstanding performance! These consecutive correct answers show true expertise.",
      icon: "Compass",
    },
  ],
  "first-try": [
    {
      type: "first-try",
      title: "Great Start!",
      message: "You've begun your practice session perfectly!",
      icon: "Rocket",
    },
    {
      type: "first-try",
      title: "Off to a Good Start!",
      message: "Excellent! Starting strong with a correct answer.",
      icon: "Flag",
    },
    {
      type: "first-try",
      title: "Perfect Beginning!",
      message: "Well done! Let's keep this momentum going.",
      icon: "CheckCircle",
    },
  ],
  improvement: [
    {
      type: "improvement",
      title: "Bouncing Back!",
      message: "Great recovery! You're learning from your mistakes.",
      icon: "TrendingUp",
    },
    {
      type: "improvement",
      title: "Nice Recovery!",
      message: "That's the spirit! Persistence pays off.",
      icon: "Heart",
    },
    {
      type: "improvement",
      title: "Back on Track!",
      message: "Excellent! You're showing real improvement.",
      icon: "ArrowUp",
    },
  ],
  "perfect-session": [
    {
      type: "perfect-session",
      title: "Perfect Session!",
      message: "Incredible! You answered every question correctly!",
      icon: "Crown",
    },
    {
      type: "perfect-session",
      title: "Flawless Victory!",
      message: "Outstanding! 100% accuracy - you're a true master!",
      icon: "Trophy",
    },
    {
      type: "perfect-session",
      title: "Mastery Achieved!",
      message: "Perfect score! Your signal flag knowledge is exceptional!",
      icon: "Medal",
    },
  ],
};

/**
 * Select a random message from a specific encouragement type pool
 */
function getRandomMessage(type: EncouragementType): EncouragementMessage {
  const messages = ENCOURAGEMENT_MESSAGES[type];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * Generate encouragement message based on answer feedback context
 * Uses performance metrics to select the most appropriate message type
 */
export function generateEncouragementMessage(context: {
  isCorrect: boolean;
  currentStreak: number;
  currentQuestionIndex: number;
  correctCount: number;
  totalQuestions: number;
  isLastQuestion: boolean;
}): EncouragementMessage {
  const {
    isCorrect,
    currentStreak,
    currentQuestionIndex,
    correctCount,
    totalQuestions,
    isLastQuestion,
  } = context;

  // Check for perfect session (last question, all correct)
  if (isLastQuestion && isCorrect && correctCount === totalQuestions) {
    return getRandomMessage("perfect-session");
  }

  // Check for streak milestone (5, 10, 15, 20, etc.)
  if (isCorrect && currentStreak >= 5) {
    return getRandomMessage("streak");
  }

  // First question correct
  if (isCorrect && currentQuestionIndex === 0) {
    return getRandomMessage("first-try");
  }

  // Improvement after mistake (correct answer following an incorrect one)
  if (isCorrect && currentStreak === 1 && currentQuestionIndex > 0) {
    const previousWasIncorrect = correctCount - 1 < currentQuestionIndex;
    if (previousWasIncorrect) {
      return getRandomMessage("improvement");
    }
  }

  // Standard messages
  if (isCorrect) {
    return getRandomMessage("correct");
  } else {
    return getRandomMessage("incorrect");
  }
}

/**
 * Get all available encouragement types
 * Useful for testing or UI previews
 */
export function getAvailableEncouragementTypes(): EncouragementType[] {
  return Object.keys(ENCOURAGEMENT_MESSAGES) as EncouragementType[];
}

/**
 * Get message count for a specific type
 * Useful for analytics or testing message pool coverage
 */
export function getMessageCount(type: EncouragementType): number {
  return ENCOURAGEMENT_MESSAGES[type].length;
}

/**
 * Preview all messages of a specific type
 * Useful for content review or testing
 */
export function previewMessages(type: EncouragementType): EncouragementMessage[] {
  return ENCOURAGEMENT_MESSAGES[type];
}
