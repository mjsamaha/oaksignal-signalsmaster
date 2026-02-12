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
