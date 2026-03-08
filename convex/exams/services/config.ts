const MIN_OFFICIAL_EXAM_IDLE_TIMEOUT_MS = 60_000;
const DEFAULT_OFFICIAL_EXAM_SUBMISSION_MIN_INTERVAL_MS = 750;
const DEFAULT_OFFICIAL_EXAM_SUBMISSION_WINDOW_MS = 60_000;
const DEFAULT_OFFICIAL_EXAM_SUBMISSION_MAX_PER_WINDOW = 30;
const DEFAULT_OFFICIAL_EXAM_MIN_RESPONSE_TIME_MS = 1_500;
const DEFAULT_OFFICIAL_EXAM_SLOW_RESPONSE_WARNING_MS = 120_000;

export interface ExamSubmissionRateLimitConfig {
  minIntervalMs: number;
  windowMs: number;
  maxPerWindow: number;
}

export interface ExamTimingAnomalyConfig {
  minResponseTimeMs: number;
  slowResponseWarningMs: number;
}

function getPositiveIntegerEnv(
  envKey: string,
  fallback: number,
  minimum: number
): number {
  const raw = process.env[envKey]?.trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    throw new Error(`${envKey} must be an integer.`);
  }

  if (parsed < minimum) {
    throw new Error(`${envKey} must be at least ${minimum}.`);
  }

  return parsed;
}

export function getOfficialExamSubmissionRateLimitConfig(): ExamSubmissionRateLimitConfig {
  return {
    minIntervalMs: getPositiveIntegerEnv(
      "OFFICIAL_EXAM_SUBMISSION_MIN_INTERVAL_MS",
      DEFAULT_OFFICIAL_EXAM_SUBMISSION_MIN_INTERVAL_MS,
      100
    ),
    windowMs: getPositiveIntegerEnv(
      "OFFICIAL_EXAM_SUBMISSION_WINDOW_MS",
      DEFAULT_OFFICIAL_EXAM_SUBMISSION_WINDOW_MS,
      1_000
    ),
    maxPerWindow: getPositiveIntegerEnv(
      "OFFICIAL_EXAM_SUBMISSION_MAX_PER_WINDOW",
      DEFAULT_OFFICIAL_EXAM_SUBMISSION_MAX_PER_WINDOW,
      1
    ),
  };
}

export function getOfficialExamTimingAnomalyConfig(): ExamTimingAnomalyConfig {
  return {
    minResponseTimeMs: getPositiveIntegerEnv(
      "OFFICIAL_EXAM_MIN_RESPONSE_TIME_MS",
      DEFAULT_OFFICIAL_EXAM_MIN_RESPONSE_TIME_MS,
      100
    ),
    slowResponseWarningMs: getPositiveIntegerEnv(
      "OFFICIAL_EXAM_SLOW_RESPONSE_WARNING_MS",
      DEFAULT_OFFICIAL_EXAM_SLOW_RESPONSE_WARNING_MS,
      5_000
    ),
  };
}

export function getOfficialExamIdleTimeoutMs(): number | null {
  const raw = process.env.OFFICIAL_EXAM_IDLE_TIMEOUT_MS?.trim();
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    throw new Error("OFFICIAL_EXAM_IDLE_TIMEOUT_MS must be an integer number of milliseconds.");
  }

  if (parsed < MIN_OFFICIAL_EXAM_IDLE_TIMEOUT_MS) {
    throw new Error(
      `OFFICIAL_EXAM_IDLE_TIMEOUT_MS must be at least ${MIN_OFFICIAL_EXAM_IDLE_TIMEOUT_MS}.`
    );
  }

  return parsed;
}
