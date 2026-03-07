export interface ExamPolicySnapshot {
  passThresholdPercent: number
  totalQuestions: number
  isUntimed: boolean
  timeLimitMinutes?: number
  singleAttemptOnly: boolean
  noPauseResume: boolean
  noBacktracking: boolean
  requiresAllAnswers: boolean
}

export interface ExamStartContext {
  examPolicy: ExamPolicySnapshot
  expectedDurationMinutes: number
  minimumRulesViewDurationMs: number
  prerequisite: {
    minimumPracticeSessions: number
    userPracticeSessions: number
    userPracticeAveragePercent: number
    met: boolean
  }
  eligibility: {
    canStart: boolean
    blockers: string[]
  }
  systemRequirements: {
    stableInternetRequired: boolean
    recommendedBrowsers: string[]
  }
  proctorInfo: {
    instructorName: string
    scheduledStartAt: number
    instructions?: string
  } | null
  motivationalMessage: string
  attemptSummary: {
    hasOfficialAttempt: boolean
    latestAttemptStatus: "started" | "completed" | "abandoned" | null
    latestStartedAt: number | null
  }
}

export interface ExamAttemptHistoryItem {
  examAttemptId: string
  attemptNumber: number
  status: "started" | "completed" | "abandoned"
  startedAt: number
  completedAt: number | null
  scorePercent: number | null
  passed: boolean | null
}

export interface ExamAttemptDetail {
  examAttemptId: string
  attemptNumber: number
  status: "started" | "completed" | "abandoned"
  startedAt: number
  completedAt: number | null
  rulesAcknowledgedAt: number
  readinessAcknowledgedAt: number
  rulesViewDurationMs: number
  policySnapshot: ExamPolicySnapshot
  prerequisiteSnapshot: {
    minimumPracticeSessionsRequired: number
    userPracticeSessions: number
    userPracticeAveragePercent: number
  }
  systemSnapshot: {
    ipAddress?: string
    userAgent?: string
    browserFamily?: string
    browserVersion?: string
    browserSupported: boolean
    stableInternetConfirmed: boolean
  }
}

export interface StartExamApiSuccess {
  success: true
  data: {
    examAttemptId: string
    startedAt: number
  }
}

export interface StartExamApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

export type StartExamApiResponse = StartExamApiSuccess | StartExamApiError

export type ExamQuestionMode = "learn" | "match"
export type ExamModeStrategy = "alternating" | "single"

export interface ExamQuestionOption {
  id: string
  label: string
  value: string
  imagePath?: string
}

export interface ExamQuestionPublic {
  questionIndex: number
  flagKey: string
  mode: ExamQuestionMode
  options: ExamQuestionOption[]
  prompt: {
    imagePath?: string
    meaning?: string
  }
}

export interface ExamQuestionSubmissionInput {
  examAttemptId: string
  questionIndex: number
  selectedAnswer: string
}

export interface ExamQuestionSubmissionResult {
  isCorrect: boolean
  questionIndex: number
  nextQuestionIndex: number | null
  correctCount: number
  answeredCount: number
  totalQuestions: number
  isExamComplete: boolean
}

export interface ExamAttemptRuntimeProgress {
  currentQuestionIndex: number
  answeredCount: number
  correctCount: number
  totalQuestions: number
}

export interface ExamGenerationSnapshot {
  seed: number
  questionCount: number
  modeStrategy: ExamModeStrategy
  singleMode?: ExamQuestionMode
  generationStartedAt: number
  generationCompletedAt: number
  generationTimeMs: number
  generationRetryCount: number
  examChecksum: string
  generationVersion: number
}
