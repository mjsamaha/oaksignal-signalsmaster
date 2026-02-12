// ⚠️ DEPRECATED: This file is no longer used in the dashboard.
// All mock data has been removed in preparation for Convex backend integration.
// This file is kept temporarily as a reference for data structure during backend development.
// TODO: Delete this file completely once Convex queries are implemented and tested.

export interface MockUser {
  id: string;
  name: string;
  rank: string;
  rankTitle: string;
  avatarUrl: string; // Using initials or placeholder in UI
  progress: number; // 0-100
  totalFlagsMastered: number;
  accuracy: number;
  joinDate: string;
}

export interface MockActivity {
  id: string;
  type: "practice" | "exam" | "ranked";
  date: string;
  score?: number;
  totalQuestions: number;
  flagsReviewNeeded?: string[];
}

export const CURRENT_USER: MockUser = {
  id: "mock-user-001",
  name: "Cadet John Doe",
  rank: "Centurion",
  rankTitle: "Signals Centurion",
  avatarUrl: "JD",
  progress: 68,
  totalFlagsMastered: 24,
  accuracy: 87,
  joinDate: "Oct 2023",
};

export const RECENT_ACTIVITY: MockActivity[] = [
  {
    id: "act-001",
    type: "practice",
    date: "2 hours ago",
    score: 9,
    totalQuestions: 10,
    flagsReviewNeeded: ["X-Ray", "Zulu"],
  },
  {
    id: "act-002",
    type: "ranked",
    date: "Yesterday",
    score: 18,
    totalQuestions: 26,
  },
  {
    id: "act-003",
    type: "practice",
    date: "2 days ago",
    score: 15,
    totalQuestions: 15,
  },
];

export const MOCK_STATS = {
  currentStreak: 4,
  bestTime: "1m 42s",
  totalPracticeRuns: 12,
  badgesEarned: 3,
};
