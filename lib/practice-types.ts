import { Id } from "@/convex/_generated/dataModel";
import { PracticeMode, SessionLength, SessionStatus } from "./practice-constants";

/**
 * Practice Session Configuration
 * Parameters chosen by user before starting practice
 */
export interface SessionConfig {
  mode: PracticeMode;
  sessionLength: SessionLength;
}

/**
 * Practice Session (mirrors Convex schema)
 */
export interface PracticeSession {
  _id: Id<"practiceSessions">;
  _creationTime: number;
  userId: Id<"users">;
  mode: PracticeMode;
  sessionLength: number;
  flagIds: Id<"flags">[];
  currentIndex: number;
  score: number;
  status: SessionStatus;
  startedAt: number;
  completedAt?: number;
}

/**
 * User Practice Statistics
 * Aggregated data from completed sessions
 */
export interface PracticeStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  lastPracticed?: number;
  totalFlagsPracticed: number;
  favoriteMode?: PracticeMode;
}

/**
 * Session Creation Input
 */
export interface CreateSessionInput {
  mode: PracticeMode;
  sessionLength: number;
  flagIds: Id<"flags">[];
}

/**
 * Session Selection State (UI)
 */
export interface SessionSelectionState {
  selectedMode: PracticeMode | null;
  selectedLength: SessionLength | null;
  isValid: boolean;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
