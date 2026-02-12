import { 
  PRACTICE_MODES, 
  SESSION_LENGTHS,
  PracticeMode,
  SessionLength
} from "./practice-constants";
import { ValidationResult, SessionConfig } from "./practice-types";

/**
 * Validates if a practice mode is valid
 */
export function isValidPracticeMode(mode: unknown): mode is PracticeMode {
  return (
    typeof mode === 'string' &&
    Object.values(PRACTICE_MODES).includes(mode as PracticeMode)
  );
}

/**
 * Validates if a session length is valid
 */
export function isValidSessionLength(length: unknown): length is SessionLength {
  if (length === 'all') return true;
  
  return (
    typeof length === 'number' &&
    SESSION_LENGTHS.includes(length as typeof SESSION_LENGTHS[number])
  );
}

/**
 * Validates complete session configuration
 */
export function validateSessionConfig(config: Partial<SessionConfig>): ValidationResult {
  const errors: string[] = [];

  if (!config.mode) {
    errors.push('Practice mode is required');
  } else if (!isValidPracticeMode(config.mode)) {
    errors.push('Invalid practice mode selected');
  }

  if (!config.sessionLength && config.sessionLength !== 0) {
    errors.push('Session length is required');
  } else if (!isValidSessionLength(config.sessionLength)) {
    errors.push('Invalid session length selected');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if user can start a new practice session
 */
export function canStartSession(
  hasActiveSession: boolean,
  config: Partial<SessionConfig>
): { allowed: boolean; reason?: string } {
  if (hasActiveSession) {
    return {
      allowed: false,
      reason: 'You have an incomplete session. Please resume or abandon it first.',
    };
  }

  const validation = validateSessionConfig(config);
  if (!validation.isValid) {
    return {
      allowed: false,
      reason: validation.errors[0],
    };
  }

  return { allowed: true };
}

/**
 * Calculates estimated duration in minutes
 */
export function getEstimatedDuration(sessionLength: SessionLength): number {
  if (sessionLength === 'all') return 20;
  
  // Rough estimate: 30 seconds per flag
  return Math.ceil(sessionLength * 0.5);
}

/**
 * Formats session statistics for display
 */
export function formatStats(stats: {
  totalSessions: number;
  averageScore: number;
  lastPracticed?: number;
}) {
  const { totalSessions, averageScore, lastPracticed } = stats;

  return {
    totalSessionsText: totalSessions === 0 
      ? 'No sessions yet' 
      : `${totalSessions} session${totalSessions === 1 ? '' : 's'}`,
    averageScoreText: totalSessions === 0 
      ? 'N/A' 
      : `${Math.round(averageScore)}%`,
    lastPracticedText: !lastPracticed 
      ? 'Never' 
      : formatRelativeTime(lastPracticed),
  };
}

/**
 * Formats timestamp as relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
