/**
 * Streak Celebration Utilities
 * Logic for detecting and celebrating consecutive correct answer milestones
 */

import { STREAK_MILESTONES, StreakMilestone } from "./practice-constants";

/**
 * Streak celebration configuration
 * Defines visual and behavioral aspects of celebrations
 */
export interface StreakCelebration {
  milestone: StreakMilestone;
  title: string;
  message: string;
  celebrationType: "confetti" | "fireworks" | "sparkles" | "mega";
  color: string;
  duration: number; // ms
  particleCount?: number;
}

/**
 * Celebration configurations for each milestone
 * Progressively more impressive celebrations for higher streaks
 */
const CELEBRATION_CONFIG: Record<StreakMilestone, StreakCelebration> = {
  5: {
    milestone: 5,
    title: "5 in a Row!",
    message: "Great start! You're building momentum.",
    celebrationType: "confetti",
    color: "#10b981", // green-500
    duration: 2000,
    particleCount: 50,
  },
  10: {
    milestone: 10,
    title: "10 Streak!",
    message: "Impressive! You're showing real mastery.",
    celebrationType: "confetti",
    color: "#3b82f6", // blue-500
    duration: 2500,
    particleCount: 100,
  },
  15: {
    milestone: 15,
    title: "15 Streak!",
    message: "Outstanding! You're on fire!",
    celebrationType: "fireworks",
    color: "#a855f7", // purple-500
    duration: 3000,
    particleCount: 150,
  },
  20: {
    milestone: 20,
    title: "20 Streak!",
    message: "Legendary! Absolute mastery of signals!",
    celebrationType: "mega",
    color: "#f59e0b", // amber-500
    duration: 3500,
    particleCount: 200,
  },
};

/**
 * Check if current streak is a milestone
 */
export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak as StreakMilestone);
}

/**
 * Get celebration config for a streak value
 * Returns undefined if not a milestone
 */
export function getCelebrationForStreak(
  streak: number
): StreakCelebration | undefined {
  if (!isStreakMilestone(streak)) {
    return undefined;
  }
  return CELEBRATION_CONFIG[streak as StreakMilestone];
}

/**
 * Get the next milestone after current streak
 * Returns undefined if streak exceeds all milestones
 */
export function getNextMilestone(currentStreak: number): StreakMilestone | undefined {
  for (const milestone of STREAK_MILESTONES) {
    if (milestone > currentStreak) {
      return milestone;
    }
  }
  return undefined;
}

/**
 * Calculate progress to next milestone (0-100)
 */
export function getProgressToNextMilestone(currentStreak: number): {
  current: number;
  next: StreakMilestone | undefined;
  percentage: number;
} {
  const nextMilestone = getNextMilestone(currentStreak);
  
  if (!nextMilestone) {
    // Already exceeded all milestones
    return {
      current: currentStreak,
      next: undefined,
      percentage: 100,
    };
  }

  // Find the previous milestone (or 0 if before first milestone)
  let previousMilestone = 0;
  for (const milestone of STREAK_MILESTONES) {
    if (milestone < currentStreak) {
      previousMilestone = milestone;
    } else {
      break;
    }
  }

  const range = nextMilestone - previousMilestone;
  const progress = currentStreak - previousMilestone;
  const percentage = Math.round((progress / range) * 100);

  return {
    current: currentStreak,
    next: nextMilestone,
    percentage: Math.min(percentage, 100),
  };
}

/**
 * Check if streak should trigger any celebration
 * More lenient than milestone - celebrates every 3rd correct
 */
export function shouldCelebrateStreak(streak: number): boolean {
  return streak > 0 && streak % 3 === 0;
}

/**
 * Get all milestone thresholds
 * Useful for UI displays or progress indicators
 */
export function getAllMilestones(): readonly StreakMilestone[] {
  return STREAK_MILESTONES;
}

/**
 * Get celebration title and message for display
 */
export function getCelebrationMessage(
  streak: number
): { title: string; message: string } | undefined {
  const celebration = getCelebrationForStreak(streak);
  if (!celebration) {
    return undefined;
  }
  return {
    title: celebration.title,
    message: celebration.message,
  };
}

/**
 * Format streak for display
 * e.g., "5 in a row", "10 consecutive correct"
 */
export function formatStreakDisplay(streak: number): string {
  if (streak === 0) {
    return "No streak";
  }
  if (streak === 1) {
    return "1 correct";
  }
  return `${streak} in a row`;
}

/**
 * Get streak description for sharing
 * e.g., "I just got 15 flags correct in a row!"
 */
export function getShareableStreakMessage(streak: number): string {
  if (streak < 5) {
    return `I'm practicing naval signal flags and getting better!`;
  }
  if (streak < 10) {
    return `I just got ${streak} signal flags correct in a row!`;
  }
  if (streak < 20) {
    return `Amazing! ${streak} consecutive correct answers on signal flags! 🎯`;
  }
  return `Incredible! I just achieved a ${streak} flag streak! Master of signals! 🏆⚓`;
}
