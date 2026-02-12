/**
 * Practice Mode Constants
 * Centralized configuration for practice sessions
 */

export const PRACTICE_MODES = {
  LEARN: 'learn',
  MATCH: 'match',
} as const;

export type PracticeMode = typeof PRACTICE_MODES[keyof typeof PRACTICE_MODES];

export const PRACTICE_MODE_CONFIG = {
  [PRACTICE_MODES.LEARN]: {
    label: 'Learn the Flag',
    description: 'Study mode with detailed information and no pressure',
    longDescription: 'Focus on memorization. Each flag is presented with its name, meaning, and visual details. Take your time to learn at your own pace.',
    icon: 'BookOpen',
  },
  [PRACTICE_MODES.MATCH]: {
    label: 'Match Meaning to Flag',
    description: 'Test your knowledge by matching flags to their meanings',
    longDescription: 'Quiz-style practice where you identify the correct meaning or name for each flag. Perfect for testing recall and reinforcing memory.',
    icon: 'Brain',
  },
} as const;

export const SESSION_LENGTHS = [5, 10, 15, 30] as const;

export type SessionLength = typeof SESSION_LENGTHS[number] | 'all';

export const SESSION_LENGTH_CONFIG = {
  5: { label: '5 Flags', estimatedMinutes: 3 },
  10: { label: '10 Flags', estimatedMinutes: 5 },
  15: { label: '15 Flags', estimatedMinutes: 8 },
  30: { label: '30 Flags', estimatedMinutes: 15 },
  all: { label: 'All Flags', estimatedMinutes: 20 },
} as const;

export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

export const DEFAULT_SESSION_CONFIG = {
  mode: PRACTICE_MODES.LEARN,
  sessionLength: 10,
} as const;

export const MIN_SESSION_LENGTH = 5;
export const MAX_SESSION_LENGTH = 30;

/**
 * Quiz Keyboard Shortcuts
 * Key mappings for quiz interface interactions
 */
export const KEYBOARD_SHORTCUTS = {
  OPTION_1: '1',
  OPTION_2: '2',
  OPTION_3: '3',
  OPTION_4: '4',
  SUBMIT: 'Enter',
  HELP: '?',
  ESCAPE: 'Escape',
} as const;

export type KeyboardShortcut = typeof KEYBOARD_SHORTCUTS[keyof typeof KEYBOARD_SHORTCUTS];

/**
 * Quiz UI Configuration
 */
export const QUIZ_CONFIG = {
  FEEDBACK_DISPLAY_DURATION: 2000,      // ms to show answer feedback before next question
  CELEBRATION_STREAK_THRESHOLD: 3,      // Show celebration after this many correct in a row
  SUBMIT_DEBOUNCE_DELAY: 300,           // ms to debounce submit button clicks
  LOADING_TIMEOUT: 10000,               // ms before showing connection error
  MIN_TOUCH_TARGET_SIZE: 44,            // pixels - WCAG minimum touch target
} as const;

/**
 * Celebration Trigger Thresholds
 */
export const CELEBRATION_THRESHOLDS = {
  STREAK_TRIGGER: 3,                    // Celebrate every 3rd consecutive correct
  ACCURACY_TRIGGER: 90,                 // Celebrate if accuracy >= 90%
  PERFECT_SESSION_BONUS: true,          // Extra celebration for 100% accuracy
} as const;
/**
 * Feedback Modal Configuration
 * Timing and animation constants for instant feedback modals
 */
export const FEEDBACK_MODAL_CONFIG = {
  ANIMATION_DURATION: 300,              // ms for modal fade-in/fade-out animation
  MIN_DISPLAY_DURATION: 1500,           // ms minimum time to display feedback (prevent accidental skips)
  AUTO_ADVANCE_DURATION: 0,             // ms to auto-advance (0 = disabled, requires user action)
  SIMILAR_FLAGS_LIMIT: 3,               // Number of similar flags to show
  KEYBOARD_SHORTCUTS: {
    NEXT: ['Enter', 'Space'],           // Keys to advance to next question
    CLOSE: ['Escape'],                  // Keys to close modal (if dismissible)
  },
} as const;

/**
 * Streak Milestone Thresholds
 * Define when to show special celebrations for consecutive correct answers
 */
export const STREAK_MILESTONES = [5, 10, 15, 20] as const;

export type StreakMilestone = typeof STREAK_MILESTONES[number];