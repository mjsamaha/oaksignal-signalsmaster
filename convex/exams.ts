import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import {
  getExamAcknowledgementErrors,
} from "./lib/exam_start_validators";
import { generateExamQuestions, applyExamAttemptToQuestions } from "./lib/exam_generation";
import { generateExamSeed } from "./lib/exam_randomization";
import { buildQuestionChecksum } from "./lib/exam_checksum";
import {
  issueExamSessionToken,
  validateExamSessionToken,
} from "./lib/exam_session_token";
import {
  assertAdminUser,
  canAccessResultRecord,
  getAuthenticatedUser,
  getOwnedAttempt,
} from "./exams/services/auth";
import {
  getOfficialExamIdleTimeoutMs,
  getOfficialExamSubmissionRateLimitConfig,
  getOfficialExamTimingAnomalyConfig,
} from "./exams/services/config";
import {
  insertExamAuditLog,
  insertExamResultAccessLog,
  rejectExamSubmission,
} from "./exams/services/audit";
import {
  getCurrentQuestionIndex,
  getQuestionResponseTimeMs,
  roundToTwoDecimals,
} from "./exams/services/time";
import { sha256Hex, stableStringify } from "./exams/services/hash";
import {
  EXAM_START_CONSTANTS,
  buildExamPolicy,
  getAttemptQuestions,
  getExamStartData,
  resolveExamGenerationSettings,
} from "./exams/services/query_helpers";

export { getExamStartContext, getAttemptHistory } from "./exams/handlers/start";
export { getExamGenerationSettings } from "./exams/handlers/settings";
export {
  getAttemptRuntimeProgress,
  getCurrentAttemptQuestion,
  getAttemptPreload,
  getAttemptById,
} from "./exams/handlers/runtime";

function mapOfficialResultRecord(result: Doc<"examResults">) {
  return {
    examResultId: result._id,
    examAttemptId: result.examAttemptId,
    userId: result.userId,
    immutable: result.immutable,
    immutableAt: result.immutableAt,
    certificateNumber: result.certificateNumber,
    resultVersion: result.resultVersion,
    userSnapshot: result.userSnapshot,
    attemptNumber: result.attemptNumber,
    startedAt: result.startedAt,
    completedAt: result.completedAt,
    totalQuestions: result.totalQuestions,
    totalCorrect: result.totalCorrect,
    scorePercent: result.scorePercent,
    passThresholdPercent: result.passThresholdPercent,
    passed: result.passed,
    examModesUsed: result.examModesUsed,
    modeStats: result.modeStats,
    categoryStats: result.categoryStats,
    flagDatabaseSnapshot: result.flagDatabaseSnapshot,
    questionBreakdown: result.questionBreakdown,
    recordChecksum: result.recordChecksum,
    signatureAlgorithm: result.signatureAlgorithm,
    signature: result.signature,
    createdAt: result.createdAt,
  };
}


function buildCanonicalOfficialResultPayload(result: Doc<"examResults">) {
  return {
    examAttemptId: result.examAttemptId,
    userId: result.userId,
    immutable: result.immutable,
    immutableAt: result.immutableAt,
    certificateNumber: result.certificateNumber,
    resultVersion: result.resultVersion,
    userSnapshot: result.userSnapshot,
    attemptNumber: result.attemptNumber,
    startedAt: result.startedAt,
    completedAt: result.completedAt,
    totalQuestions: result.totalQuestions,
    totalCorrect: result.totalCorrect,
    scorePercent: result.scorePercent,
    passThresholdPercent: result.passThresholdPercent,
    passed: result.passed,
    examModesUsed: result.examModesUsed,
    modeStats: result.modeStats,
    categoryStats: result.categoryStats,
    flagDatabaseSnapshot: result.flagDatabaseSnapshot,
    questionBreakdown: result.questionBreakdown,
  };
}

async function buildQuestionBreakdownFromAttempt(
  ctx: MutationCtx,
  input: {
    attempt: Doc<"examAttempts">;
    sortedQuestions: Doc<"examQuestions">[];
  }
): Promise<Array<{
  questionIndex: number;
  flagId: Doc<"flags">["_id"];
  flagKey: string;
  flagName: string;
  flagImagePath: string;
  category: string;
  mode: "learn" | "match";
  options: Array<{
    id: string;
    label: string;
    value: string;
    imagePath?: string;
  }>;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  answeredAt?: number;
  responseTimeMs?: number;
  questionChecksum: string;
}>> {
  const flagSnapshotById = new Map(
    (input.attempt.flagSnapshot ?? []).map((item) => [item.flagId, item])
  );

  const questionBreakdown: Array<{
    questionIndex: number;
    flagId: Doc<"flags">["_id"];
    flagKey: string;
    flagName: string;
    flagImagePath: string;
    category: string;
    mode: "learn" | "match";
    options: Array<{
      id: string;
      label: string;
      value: string;
      imagePath?: string;
    }>;
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    answeredAt?: number;
    responseTimeMs?: number;
    questionChecksum: string;
  }> = [];

  for (let index = 0; index < input.sortedQuestions.length; index += 1) {
    const question = input.sortedQuestions[index];
    const snapshotFlag = flagSnapshotById.get(question.flagId);
    const fallbackFlag = snapshotFlag ? null : await ctx.db.get(question.flagId);

    questionBreakdown.push({
      questionIndex: question.questionIndex,
      flagId: question.flagId,
      flagKey: question.flagKey,
      flagName: snapshotFlag?.name ?? fallbackFlag?.name ?? question.flagKey,
      flagImagePath: snapshotFlag?.imagePath ?? fallbackFlag?.imagePath ?? "",
      category: snapshotFlag?.category ?? fallbackFlag?.category ?? "unknown",
      mode: question.mode,
      options: question.options,
      selectedAnswer: question.userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: question.isCorrect === true,
      answeredAt: question.answeredAt,
      responseTimeMs: getQuestionResponseTimeMs({
        startedAt: input.attempt.startedAt,
        sortedQuestions: input.sortedQuestions,
        index,
      }),
      questionChecksum: question.checksum,
    });
  }

  return questionBreakdown;
}

async function buildPercentileRanking(
  ctx: MutationCtx,
  result: Doc<"examResults">
): Promise<{
  percentile: number;
  cohortSize: number;
  cohortLabel: string;
  method: "score_midrank_global_all_time";
}> {
  const allResults = await ctx.db
    .query("examResults")
    .withIndex("by_completedAt")
    .collect();

  const cohortSize = allResults.length;
  if (cohortSize === 0) {
    return {
      percentile: 0,
      cohortSize: 0,
      cohortLabel: "All official test takers (all-time)",
      method: "score_midrank_global_all_time",
    };
  }

  const score = result.scorePercent;
  const lowerCount = allResults.filter((item) => item.scorePercent < score).length;
  const equalCount = allResults.filter((item) => item.scorePercent === score).length;

  // Midrank percentile: ties share the midpoint of their score band.
  const percentile = roundToTwoDecimals(
    ((lowerCount + 0.5 * equalCount) / cohortSize) * 100
  );

  return {
    percentile,
    cohortSize,
    cohortLabel: "All official test takers (all-time)",
    method: "score_midrank_global_all_time",
  };
}


function buildCertificateNumber(input: {
  completedAt: number;
  attemptNumber: number;
  examAttemptId: string;
}): string {
  const date = new Date(input.completedAt);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const compactAttemptId = input.examAttemptId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `OSM-${yyyy}${mm}${dd}-${String(input.attemptNumber).padStart(3, "0")}-${compactAttemptId}`;
}

function buildCompletedExamStats(
  questions: Doc<"examQuestions">[],
  attempt: Doc<"examAttempts">
): {
  modeStats: {
    learn: { total: number; correct: number; incorrect: number };
    match: { total: number; correct: number; incorrect: number };
  };
  categoryStats: Array<{
    category: string;
    total: number;
    correct: number;
    incorrect: number;
  }>;
} {
  const modeStats = {
    learn: { total: 0, correct: 0, incorrect: 0 },
    match: { total: 0, correct: 0, incorrect: 0 },
  };

  const categoryByFlagId = new Map<string, string>();
  for (const item of attempt.flagSnapshot ?? []) {
    categoryByFlagId.set(item.flagId, item.category);
  }

  const categoryTally = new Map<
    string,
    { total: number; correct: number; incorrect: number }
  >();

  for (const question of questions) {
    const correct = question.isCorrect === true;
    const modeBucket = modeStats[question.mode];
    modeBucket.total += 1;
    if (correct) {
      modeBucket.correct += 1;
    } else {
      modeBucket.incorrect += 1;
    }

    const category = categoryByFlagId.get(question.flagId) ?? "unknown";
    const existing = categoryTally.get(category) ?? {
      total: 0,
      correct: 0,
      incorrect: 0,
    };
    existing.total += 1;
    if (correct) {
      existing.correct += 1;
    } else {
      existing.incorrect += 1;
    }
    categoryTally.set(category, existing);
  }

  const categoryStats = [...categoryTally.entries()]
    .map(([category, tally]) => ({
      category,
      total: tally.total,
      correct: tally.correct,
      incorrect: tally.incorrect,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return {
    modeStats,
    categoryStats,
  };
}


export const setExamGenerationSettings = mutation({
  args: {
    modeStrategy: v.union(v.literal("alternating"), v.literal("single")),
    singleMode: v.optional(v.union(v.literal("learn"), v.literal("match"))),
  },
  handler: async (ctx, args) => {
    const adminUser = await assertAdminUser(ctx);

    if (args.modeStrategy === "single" && !args.singleMode) {
      throw new Error("singleMode is required when modeStrategy is set to single.");
    }

    if (args.modeStrategy === "alternating" && args.singleMode !== undefined) {
      throw new Error("singleMode must not be provided when using alternating mode.");
    }

    const now = Date.now();

    const existing = await ctx.db
      .query("examSettings")
      .withIndex("by_updatedAt")
      .order("desc")
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        modeStrategy: args.modeStrategy,
        singleMode: args.modeStrategy === "single" ? args.singleMode : undefined,
        updatedBy: adminUser._id,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("examSettings", {
        modeStrategy: args.modeStrategy,
        singleMode: args.modeStrategy === "single" ? args.singleMode : undefined,
        updatedBy: adminUser._id,
        updatedAt: now,
        createdAt: now,
      });
    }

    return {
      modeStrategy: args.modeStrategy,
      singleMode: args.modeStrategy === "single" ? args.singleMode : undefined,
      updatedAt: now,
    };
  },
});

export const startOfficialExamAttempt = mutation({
  args: {
    rulesAcknowledged: v.boolean(),
    readinessAcknowledged: v.boolean(),
    rulesViewDurationMs: v.number(),
    stableInternetConfirmed: v.boolean(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    browserFamily: v.optional(v.string()),
    browserVersion: v.optional(v.string()),
    browserSupported: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to start an official exam attempt.");
    }

    const startData = await getExamStartData(ctx, user);
    if (startData.blockers.length > 0) {
      throw new Error(startData.blockers[0]);
    }

    const acknowledgementErrors = getExamAcknowledgementErrors({
      rulesAcknowledged: args.rulesAcknowledged,
      readinessAcknowledged: args.readinessAcknowledged,
      rulesViewDurationMs: args.rulesViewDurationMs,
      minimumRulesViewDurationMs: EXAM_START_CONSTANTS.OFFICIAL_EXAM_MIN_RULES_VIEW_DURATION_MS,
    });

    if (acknowledgementErrors.length > 0) {
      throw new Error(acknowledgementErrors[0]);
    }

    const requestReceivedAt = Date.now();
    const examPolicy = buildExamPolicy(startData.totalQuestions);
    const generationSettings = await resolveExamGenerationSettings(ctx);
    const allFlags = await ctx.db
      .query("flags")
      .withIndex("by_order")
      .collect();

    if (allFlags.length < 4) {
      throw new Error(
        "Exam is unavailable because at least 4 flags are required for multiple-choice questions."
      );
    }

    const attemptNumber = (startData.latestAttempt?.attemptNumber ?? 0) + 1;
    const seed = generateExamSeed({
      now: requestReceivedAt,
      attemptNumber,
      userId: user._id,
    });

    const generationStartedAt = Date.now();
    let generationRetryCount = 0;
    let generated:
      | ReturnType<typeof generateExamQuestions>
      | null = null;
    let lastGenerationError: string | null = null;

    // Retry once with a slightly modified seed if generation fails.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        generated = generateExamQuestions(allFlags, {
          modeStrategy: generationSettings.modeStrategy,
          singleMode: generationSettings.singleMode,
          seed: seed + attempt,
          generationVersion: 1,
        });
        generationRetryCount = attempt;
        break;
      } catch (error) {
        lastGenerationError = error instanceof Error ? error.message : "Unknown generation error";
      }
    }

    if (!generated) {
      throw new Error(lastGenerationError ?? "Failed to generate official exam questions.");
    }

    const generationCompletedAt = Date.now();
    const generationTimeMs = generationCompletedAt - generationStartedAt;
    const examStartedAt = generationCompletedAt;

    const examAttemptId = await ctx.db.insert("examAttempts", {
      userId: user._id,
      status: "started",
      attemptNumber,
      rulesAcknowledgedAt: requestReceivedAt,
      readinessAcknowledgedAt: requestReceivedAt,
      rulesViewDurationMs: args.rulesViewDurationMs,
      policySnapshot: examPolicy,
      prerequisiteSnapshot: {
        minimumPracticeSessionsRequired: EXAM_START_CONSTANTS.OFFICIAL_EXAM_MIN_PRACTICE_SESSIONS,
        userPracticeSessions: startData.totalPracticeSessions,
        userPracticeAveragePercent: startData.practiceAveragePercent,
      },
      systemSnapshot: {
        ipAddress: args.ipAddress,
        userAgent: args.userAgent,
        browserFamily: args.browserFamily,
        browserVersion: args.browserVersion,
        browserSupported: args.browserSupported ?? false,
        stableInternetConfirmed: args.stableInternetConfirmed,
      },
      generationSnapshot: {
        ...generated.generationSnapshot,
        generationStartedAt,
        generationCompletedAt,
        generationTimeMs,
        generationRetryCount,
      },
      flagSnapshot: generated.flagSnapshot,
      startedAt: examStartedAt,
      createdAt: examStartedAt,
      updatedAt: examStartedAt,
    });

    const sessionToken = await issueExamSessionToken({
      examAttemptId: examAttemptId,
      userId: user._id,
      issuedAt: examStartedAt,
    });

    await ctx.db.patch(examAttemptId, {
      sessionTokenHash: sessionToken.tokenHash,
      sessionIssuedAt: sessionToken.issuedAt,
      sessionExpiresAt: sessionToken.expiresAt,
      updatedAt: Date.now(),
    });

    await insertExamAuditLog(ctx, {
      examAttemptId,
      userId: user._id,
      eventType: "generation_started",
      message: "Official exam question generation started.",
      metadata: {
        seed: generated.generationSnapshot.seed,
        attemptNumber,
      },
    });

    const questions = applyExamAttemptToQuestions(generated.questions, examAttemptId, user._id);
    for (const question of questions) {
      await ctx.db.insert("examQuestions", {
        ...question,
        createdAt: examStartedAt,
        updatedAt: examStartedAt,
      });
    }

    await insertExamAuditLog(ctx, {
      examAttemptId,
      userId: user._id,
      eventType: "generation_completed",
      message: "Official exam question generation completed.",
      metadata: {
        generationTimeMs,
        questionCount: questions.length,
        retryCount: generationRetryCount,
        examChecksum: generated.generationSnapshot.examChecksum,
      },
    });

    await insertExamAuditLog(ctx, {
      examAttemptId,
      userId: user._id,
      eventType: "session_token_issued",
      message: "Issued exam session token.",
      metadata: {
        issuedAt: sessionToken.issuedAt,
        expiresAt: sessionToken.expiresAt,
      },
    });

    return {
      examAttemptId,
      startedAt: examStartedAt,
      sessionToken: sessionToken.token,
      sessionExpiresAt: sessionToken.expiresAt,
    };
  },
});

export const submitExamAnswer = mutation({
  args: {
    examAttemptId: v.id("examAttempts"),
    questionIndex: v.number(),
    selectedAnswer: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Must be authenticated to submit official exam answers.");
    }

    const attempt = await getOwnedAttempt(ctx, user._id, args.examAttemptId);
    if (!attempt) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "attempt_not_found_or_access_denied",
        auditMessage: "Rejected submission because exam attempt was not found or access was denied.",
        throwMessage: "Exam attempt not found or access denied.",
      });
    }

    if (attempt.immutableAt !== undefined) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "attempt_immutable",
        eventType: "immutable_write_blocked",
        auditMessage: "Blocked write attempt against immutable exam attempt.",
        throwMessage: "This exam attempt has been finalized and is immutable.",
        metadata: {
          immutableAt: attempt.immutableAt,
          attemptStatus: attempt.status,
        },
      });
    }

    if (attempt.status !== "started") {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "attempt_not_active",
        auditMessage: "Rejected submission because exam attempt is no longer active.",
        throwMessage: "Exam attempt is no longer active.",
        metadata: {
          attemptStatus: attempt.status,
        },
      });
    }

    const idleTimeoutMs = getOfficialExamIdleTimeoutMs();

    if (attempt.sessionTokenHash && attempt.sessionIssuedAt && attempt.sessionExpiresAt) {
      if (!args.sessionToken) {
        return rejectExamSubmission(ctx, {
          examAttemptId: args.examAttemptId,
          userId: user._id,
          questionIndex: args.questionIndex,
          reason: "missing_session_token",
          eventType: "session_token_rejected",
          auditMessage: "Rejected submission because session token was missing.",
          throwMessage: "Session validation failed. Please refresh the exam session.",
        });
      }

      const tokenValidation = await validateExamSessionToken({
        token: args.sessionToken,
        examAttemptId: args.examAttemptId,
        userId: user._id,
        issuedAt: attempt.sessionIssuedAt,
        expiresAt: attempt.sessionExpiresAt,
        expectedHash: attempt.sessionTokenHash,
      });

      if (!tokenValidation.valid) {
        return rejectExamSubmission(ctx, {
          examAttemptId: args.examAttemptId,
          userId: user._id,
          questionIndex: args.questionIndex,
          reason: tokenValidation.reason ?? "unknown",
          eventType: "session_token_rejected",
          auditMessage: "Rejected submission due to invalid session token.",
          throwMessage: "Session validation failed. Please refresh the exam session.",
        });
      }

      await insertExamAuditLog(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        eventType: "session_token_validated",
        message: "Validated session token for submission.",
        metadata: {
          questionIndex: args.questionIndex,
        },
      });
    }

    const questions = await getAttemptQuestions(ctx, args.examAttemptId);
    const requestReceivedAt = Date.now();
    const submissionRateLimit = getOfficialExamSubmissionRateLimitConfig();
    const timingAnomaly = getOfficialExamTimingAnomalyConfig();

    const answeredTimestamps = questions
      .map((question) => question.answeredAt ?? null)
      .filter((answeredAt): answeredAt is number => answeredAt !== null)
      .sort((a, b) => b - a);

    const mostRecentAnsweredAt = answeredTimestamps[0] ?? null;
    const responseWindowStartAt = mostRecentAnsweredAt ?? attempt.startedAt;
    const responseTimeMs = requestReceivedAt - responseWindowStartAt;

    if (responseTimeMs < timingAnomaly.minResponseTimeMs) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "suspicious_timing_too_fast",
        auditMessage: "Rejected submission due to suspiciously fast response timing.",
        throwMessage: "Submission rejected due to suspicious response timing.",
        metadata: {
          responseTimeMs,
          minResponseTimeMs: timingAnomaly.minResponseTimeMs,
          responseWindowStartAt,
        },
      });
    }

    if (responseTimeMs >= timingAnomaly.slowResponseWarningMs) {
      await insertExamAuditLog(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        eventType: "idle_warning_shown",
        message: "Detected unusually slow response timing for exam submission.",
        metadata: {
          questionIndex: args.questionIndex,
          responseTimeMs,
          slowResponseWarningMs: timingAnomaly.slowResponseWarningMs,
          responseWindowStartAt,
        },
      });
    }

    if (mostRecentAnsweredAt !== null) {
      const intervalSinceLastSubmissionMs = requestReceivedAt - mostRecentAnsweredAt;
      if (intervalSinceLastSubmissionMs < submissionRateLimit.minIntervalMs) {
        return rejectExamSubmission(ctx, {
          examAttemptId: args.examAttemptId,
          userId: user._id,
          questionIndex: args.questionIndex,
          reason: "rate_limited_min_interval",
          auditMessage: "Rejected submission due to minimum interval rate limit.",
          throwMessage: "Submitting too quickly. Please wait a moment and try again.",
          metadata: {
            intervalSinceLastSubmissionMs,
            minIntervalMs: submissionRateLimit.minIntervalMs,
            lastAnsweredAt: mostRecentAnsweredAt,
          },
        });
      }
    }

    const recentSubmissionCount = answeredTimestamps.filter(
      (answeredAt) => requestReceivedAt - answeredAt <= submissionRateLimit.windowMs
    ).length;

    if (recentSubmissionCount >= submissionRateLimit.maxPerWindow) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "rate_limited_window",
        auditMessage: "Rejected submission due to rolling-window rate limit.",
        throwMessage: "Too many submissions in a short period. Please wait and try again.",
        metadata: {
          recentSubmissionCount,
          windowMs: submissionRateLimit.windowMs,
          maxPerWindow: submissionRateLimit.maxPerWindow,
        },
      });
    }

    if (idleTimeoutMs !== null) {
      const lastActivityAt = mostRecentAnsweredAt ?? attempt.startedAt;
      const idleDurationMs = requestReceivedAt - lastActivityAt;
      if (idleDurationMs >= idleTimeoutMs) {
        await ctx.db.patch(attempt._id, {
          status: "abandoned",
          completedAt: requestReceivedAt,
          immutableAt: requestReceivedAt,
          updatedAt: requestReceivedAt,
        });

        await insertExamAuditLog(ctx, {
          examAttemptId: args.examAttemptId,
          userId: user._id,
          eventType: "idle_timeout_triggered",
          message: "Exam attempt ended automatically due to inactivity timeout.",
          metadata: {
            idleTimeoutMs,
            idleDurationMs,
            lastActivityAt,
            questionIndex: args.questionIndex,
          },
        });

        throw new Error("Exam attempt ended due to inactivity. Return to Exam Start.");
      }
    }

    await insertExamAuditLog(ctx, {
      examAttemptId: args.examAttemptId,
      userId: user._id,
      eventType: "submission_received",
      message: "Official exam answer submission received.",
      metadata: {
        questionIndex: args.questionIndex,
      },
    });

    const expectedQuestionIndex = getCurrentQuestionIndex(questions);
    if (expectedQuestionIndex === null) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "attempt_already_completed",
        auditMessage: "Rejected submission because exam has already been completed.",
        throwMessage: "Exam has already been completed.",
      });
    }

    if (args.questionIndex !== expectedQuestionIndex) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "out_of_order_submission",
        auditMessage: "Rejected out-of-order question submission.",
        throwMessage: `Question index mismatch. Expected ${expectedQuestionIndex}, got ${args.questionIndex}.`,
        metadata: {
          expectedQuestionIndex,
          receivedQuestionIndex: args.questionIndex,
        },
      });
    }

    const question = await ctx.db
      .query("examQuestions")
      .withIndex("by_attempt_question", (q) =>
        q.eq("examAttemptId", args.examAttemptId).eq("questionIndex", args.questionIndex)
      )
      .first();

    if (!question) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "question_not_found",
        auditMessage: "Rejected submission because exam question was not found.",
        throwMessage: "Exam question not found.",
      });
    }

    if (question.userAnswer !== null) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "duplicate_submission",
        auditMessage: "Rejected duplicate submission for previously answered question.",
        throwMessage: "This question has already been answered.",
      });
    }

    const optionIds = question.options.map((option) => option.id);
    if (!optionIds.includes(args.selectedAnswer)) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "invalid_option_id",
        auditMessage: "Rejected submission with invalid option id.",
        throwMessage: "Invalid answer option submitted.",
        metadata: {
          selectedAnswer: args.selectedAnswer,
          validOptionIds: optionIds,
        },
      });
    }

    const expectedChecksum = buildQuestionChecksum({
      examAttemptId: "pending",
      questionIndex: question.questionIndex,
      flagKey: question.flagKey,
      mode: question.mode,
      options: question.options,
      correctAnswer: question.correctAnswer,
    });

    if (question.checksum !== expectedChecksum) {
      return rejectExamSubmission(ctx, {
        examAttemptId: args.examAttemptId,
        userId: user._id,
        questionIndex: args.questionIndex,
        reason: "question_checksum_mismatch",
        auditMessage: "Rejected submission due to question checksum mismatch.",
        throwMessage: "Exam question integrity check failed.",
        metadata: {
          expectedChecksum,
          receivedChecksum: question.checksum,
        },
      });
    }

    const submittedAt = Date.now();
    const isCorrect = args.selectedAnswer === question.correctAnswer;

    await ctx.db.patch(question._id, {
      userAnswer: args.selectedAnswer,
      answeredAt: submittedAt,
      isCorrect,
      updatedAt: submittedAt,
    });

    const updatedQuestions = await getAttemptQuestions(ctx, args.examAttemptId);
    const totalQuestions = updatedQuestions.length;
    const answeredCount = updatedQuestions.filter((item) => item.userAnswer !== null).length;
    const correctCount = updatedQuestions.filter((item) => item.isCorrect === true).length;
    const nextQuestionIndex = getCurrentQuestionIndex(updatedQuestions);
    const isExamComplete = nextQuestionIndex === null;

    if (isExamComplete) {
      const scorePercent = totalQuestions > 0
        ? roundToTwoDecimals((correctCount / totalQuestions) * 100)
        : 0;
      const passed = scorePercent >= attempt.policySnapshot.passThresholdPercent;
      const { modeStats, categoryStats } = buildCompletedExamStats(updatedQuestions, attempt);

      const sortedQuestions = [...updatedQuestions].sort((a, b) => a.questionIndex - b.questionIndex);
      const flagSnapshotById = new Map(
        (attempt.flagSnapshot ?? []).map((item) => [item.flagId, item])
      );

      const questionBreakdown = [] as Array<{
        questionIndex: number;
        flagId: Doc<"flags">["_id"];
        flagKey: string;
        flagName: string;
        flagImagePath: string;
        category: string;
        mode: "learn" | "match";
        options: Array<{
          id: string;
          label: string;
          value: string;
          imagePath?: string;
        }>;
        selectedAnswer: string | null;
        correctAnswer: string;
        isCorrect: boolean;
        answeredAt?: number;
        responseTimeMs?: number;
        questionChecksum: string;
      }>;

      for (let index = 0; index < sortedQuestions.length; index += 1) {
        const question = sortedQuestions[index];
        const snapshotFlag = flagSnapshotById.get(question.flagId);
        const fallbackFlag = snapshotFlag ? null : await ctx.db.get(question.flagId);

        questionBreakdown.push({
          questionIndex: question.questionIndex,
          flagId: question.flagId,
          flagKey: question.flagKey,
          flagName: snapshotFlag?.name ?? fallbackFlag?.name ?? question.flagKey,
          flagImagePath: snapshotFlag?.imagePath ?? fallbackFlag?.imagePath ?? "",
          category: snapshotFlag?.category ?? fallbackFlag?.category ?? "unknown",
          mode: question.mode,
          options: question.options,
          selectedAnswer: question.userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: question.isCorrect === true,
          answeredAt: question.answeredAt,
          responseTimeMs: getQuestionResponseTimeMs({
            startedAt: attempt.startedAt,
            sortedQuestions,
            index,
          }),
          questionChecksum: question.checksum,
        });
      }

      const examModesUsed = [...new Set(sortedQuestions.map((question) => question.mode))];
      const generationSnapshot = attempt.generationSnapshot;
      const roleAtExam: "cadet" | "admin" = user.role === "admin" ? "admin" : "cadet";
      const certificateNumber = buildCertificateNumber({
        completedAt: submittedAt,
        attemptNumber: attempt.attemptNumber,
        examAttemptId: String(attempt._id),
      });

      const canonicalResultPayload = {
        examAttemptId: attempt._id,
        userId: user._id,
        immutable: true,
        immutableAt: submittedAt,
        certificateNumber,
        resultVersion: 1,
        userSnapshot: {
          userId: user._id,
          fullName: user.name?.trim() || user.email,
          roleAtExam,
        },
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        completedAt: submittedAt,
        totalQuestions,
        totalCorrect: correctCount,
        scorePercent,
        passThresholdPercent: attempt.policySnapshot.passThresholdPercent,
        passed,
        examModesUsed,
        modeStats,
        categoryStats,
        flagDatabaseSnapshot: {
          generationVersion: generationSnapshot?.generationVersion ?? 1,
          examChecksum: generationSnapshot?.examChecksum ?? "unknown",
          questionCount: generationSnapshot?.questionCount ?? totalQuestions,
          modeStrategy: generationSnapshot?.modeStrategy ?? "alternating",
          singleMode: generationSnapshot?.singleMode,
          generationStartedAt: generationSnapshot?.generationStartedAt ?? attempt.startedAt,
          generationCompletedAt: generationSnapshot?.generationCompletedAt ?? attempt.startedAt,
          generationTimeMs: generationSnapshot?.generationTimeMs ?? 0,
          generationRetryCount: generationSnapshot?.generationRetryCount ?? 0,
        },
        questionBreakdown,
      };

      const canonicalJson = stableStringify(canonicalResultPayload);
      const recordChecksum = await sha256Hex(canonicalJson);
      const signatureAlgorithm = "sha256";
      const signature = recordChecksum;

      let examResultId = attempt.examResultId;
      if (examResultId) {
        return rejectExamSubmission(ctx, {
          examAttemptId: args.examAttemptId,
          userId: user._id,
          questionIndex: args.questionIndex,
          reason: "result_record_already_exists",
          eventType: "immutable_write_blocked",
          auditMessage: "Blocked duplicate immutable result creation attempt.",
          throwMessage: "This exam attempt has already been finalized.",
          metadata: {
            examResultId,
          },
        });
      }

      if (!examResultId) {
        examResultId = await ctx.db.insert("examResults", {
          ...canonicalResultPayload,
          recordChecksum,
          signatureAlgorithm,
          signature,
          createdAt: submittedAt,
        });
      }

      await ctx.db.patch(attempt._id, {
        examResultId,
        status: "completed",
        completedAt: submittedAt,
        immutableAt: submittedAt,
        result: {
          totalQuestions,
          correctCount,
          scorePercent,
          passed,
          modeStats,
          categoryStats,
        },
        updatedAt: submittedAt,
      });
    } else {
      await ctx.db.patch(attempt._id, {
        updatedAt: submittedAt,
      });
    }

    await insertExamAuditLog(ctx, {
      examAttemptId: args.examAttemptId,
      userId: user._id,
      eventType: "submission_validated",
      message: "Official exam answer accepted and validated.",
      metadata: {
        questionIndex: args.questionIndex,
        isCorrect,
      },
    });

    return {
      questionIndex: args.questionIndex,
      nextQuestionIndex,
      answeredCount,
      totalQuestions,
      isExamComplete,
    };
  },
});

export const getMyOfficialResult = mutation({
  args: {
    examAttemptId: v.id("examAttempts"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const result = await ctx.db
      .query("examResults")
      .withIndex("by_attempt", (q) => q.eq("examAttemptId", args.examAttemptId))
      .first();

    if (!result) {
      return null;
    }

    if (!canAccessResultRecord(user, result)) {
      await insertExamResultAccessLog(ctx, {
        result,
        actorUser: user,
        accessType: "result_access_denied",
        metadata: {
          endpoint: "getMyOfficialResult",
          reason: "access_denied",
          examAttemptId: args.examAttemptId,
        },
      });
      return null;
    }

    await insertExamResultAccessLog(ctx, {
      result,
      actorUser: user,
      accessType: "result_read",
      metadata: {
        endpoint: "getMyOfficialResult",
        examAttemptId: args.examAttemptId,
      },
    });

    const percentileRanking = await buildPercentileRanking(ctx, result);

    return {
      ...mapOfficialResultRecord(result),
      percentileRanking,
    };
  },
});

export const getMyOfficialResultsHistory = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const limit = args.limit ?? 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("Limit must be an integer between 1 and 100");
    }

    if (user.role === "admin") {
      const results = await ctx.db
        .query("examResults")
        .withIndex("by_completedAt")
        .order("desc")
        .take(limit);

      for (const result of results) {
        await insertExamResultAccessLog(ctx, {
          result,
          actorUser: user,
          accessType: "result_list",
          metadata: {
            endpoint: "getMyOfficialResultsHistory",
            scope: "admin_all",
            requestedLimit: limit,
          },
        });
      }

      return results.map((result) => ({
        examResultId: result._id,
        examAttemptId: result.examAttemptId,
        userId: result.userId,
        fullName: result.userSnapshot.fullName,
        attemptNumber: result.attemptNumber,
        completedAt: result.completedAt,
        scorePercent: result.scorePercent,
        passed: result.passed,
        certificateNumber: result.certificateNumber,
      }));
    }

    const ownResults = await ctx.db
      .query("examResults")
      .withIndex("by_user_completedAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    for (const result of ownResults) {
      await insertExamResultAccessLog(ctx, {
        result,
        actorUser: user,
        accessType: "result_list",
        metadata: {
          endpoint: "getMyOfficialResultsHistory",
          scope: "cadet_own",
          requestedLimit: limit,
        },
      });
    }

    return ownResults.map((result) => ({
      examResultId: result._id,
      examAttemptId: result.examAttemptId,
      userId: result.userId,
      fullName: result.userSnapshot.fullName,
      attemptNumber: result.attemptNumber,
      completedAt: result.completedAt,
      scorePercent: result.scorePercent,
      passed: result.passed,
      certificateNumber: result.certificateNumber,
    }));
  },
});

export const getOfficialResultForAdminReview = mutation({
  args: {
    examResultId: v.id("examResults"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const result = await ctx.db.get(args.examResultId);
    if (!result) {
      return null;
    }

    if (user.role !== "admin") {
      await insertExamResultAccessLog(ctx, {
        result,
        actorUser: user,
        accessType: "result_access_denied",
        metadata: {
          endpoint: "getOfficialResultForAdminReview",
          reason: "admin_required",
          requestedResultId: args.examResultId,
        },
      });
      return null;
    }

    await insertExamResultAccessLog(ctx, {
      result,
      actorUser: user,
      accessType: "result_read",
      metadata: {
        endpoint: "getOfficialResultForAdminReview",
        requestedResultId: args.examResultId,
      },
    });

    const percentileRanking = await buildPercentileRanking(ctx, result);

    return {
      ...mapOfficialResultRecord(result),
      percentileRanking,
    };
  },
});

export const getOfficialResultByCertificate = mutation({
  args: {
    certificateNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const result = await ctx.db
      .query("examResults")
      .withIndex("by_certificate", (q) => q.eq("certificateNumber", args.certificateNumber))
      .first();

    if (!result) {
      return null;
    }

    if (!canAccessResultRecord(user, result)) {
      await insertExamResultAccessLog(ctx, {
        result,
        actorUser: user,
        accessType: "result_access_denied",
        metadata: {
          endpoint: "getOfficialResultByCertificate",
          reason: "access_denied",
          certificateNumber: args.certificateNumber,
        },
      });
      return null;
    }

    await insertExamResultAccessLog(ctx, {
      result,
      actorUser: user,
      accessType: "result_read",
      metadata: {
        endpoint: "getOfficialResultByCertificate",
        certificateNumber: args.certificateNumber,
      },
    });

    const percentileRanking = await buildPercentileRanking(ctx, result);

    return {
      ...mapOfficialResultRecord(result),
      percentileRanking,
    };
  },
});

export const verifyOfficialResultIntegrity = mutation({
  args: {
    examResultId: v.id("examResults"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const result = await ctx.db.get(args.examResultId);
    if (!result) {
      return null;
    }

    if (!canAccessResultRecord(user, result)) {
      await insertExamResultAccessLog(ctx, {
        result,
        actorUser: user,
        accessType: "result_access_denied",
        metadata: {
          endpoint: "verifyOfficialResultIntegrity",
          reason: "access_denied",
          examResultId: args.examResultId,
        },
      });
      return null;
    }

    const canonicalPayload = buildCanonicalOfficialResultPayload(result);
    const canonicalJson = stableStringify(canonicalPayload);
    const recomputedChecksum = await sha256Hex(canonicalJson);
    const checksumMatches = recomputedChecksum === result.recordChecksum;
    const signatureMatches =
      result.signatureAlgorithm === "sha256" && result.signature === recomputedChecksum;
    const isValid = checksumMatches && signatureMatches;

    await insertExamResultAccessLog(ctx, {
      result,
      actorUser: user,
      accessType: "result_verify",
      metadata: {
        endpoint: "verifyOfficialResultIntegrity",
        examResultId: args.examResultId,
        checksumMatches,
        signatureMatches,
        isValid,
      },
    });

    return {
      examResultId: result._id,
      examAttemptId: result.examAttemptId,
      certificateNumber: result.certificateNumber,
      checksumMatches,
      signatureMatches,
      isValid,
      storedChecksum: result.recordChecksum,
      recomputedChecksum,
      signatureAlgorithm: result.signatureAlgorithm,
      verifiedAt: Date.now(),
    };
  },
});

export const backfillImmutableResults = mutation({
  args: {
    limit: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const adminUser = await assertAdminUser(ctx);

    const limit = args.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      throw new Error("Limit must be an integer between 1 and 500");
    }

    const dryRun = args.dryRun ?? false;
    const completedAttempts = await ctx.db
      .query("examAttempts")
      .withIndex("by_status_startedAt", (q) => q.eq("status", "completed"))
      .order("desc")
      .take(limit);

    const summary = {
      scanned: completedAttempts.length,
      created: 0,
      linkedExisting: 0,
      skippedMissingData: 0,
      dryRun,
    };

    for (const attempt of completedAttempts) {
      if (attempt.examResultId) {
        summary.linkedExisting += 1;
        continue;
      }

      const user = await ctx.db.get(attempt.userId);
      if (!user || !attempt.completedAt) {
        summary.skippedMissingData += 1;
        continue;
      }

      const sortedQuestions = (await getAttemptQuestions(ctx, attempt._id))
        .slice()
        .sort((a, b) => a.questionIndex - b.questionIndex);

      if (sortedQuestions.length === 0) {
        summary.skippedMissingData += 1;
        continue;
      }

      const totalQuestions = sortedQuestions.length;
      const totalCorrect = sortedQuestions.filter((item) => item.isCorrect === true).length;
      const scorePercent = totalQuestions > 0
        ? roundToTwoDecimals((totalCorrect / totalQuestions) * 100)
        : 0;
      const passed = scorePercent >= attempt.policySnapshot.passThresholdPercent;
      const { modeStats, categoryStats } = buildCompletedExamStats(sortedQuestions, attempt);
      const examModesUsed = [...new Set(sortedQuestions.map((question) => question.mode))];
      const questionBreakdown = await buildQuestionBreakdownFromAttempt(ctx, {
        attempt,
        sortedQuestions,
      });

      const certificateNumber = buildCertificateNumber({
        completedAt: attempt.completedAt,
        attemptNumber: attempt.attemptNumber,
        examAttemptId: String(attempt._id),
      });

      const roleAtExam: "cadet" | "admin" = user.role === "admin" ? "admin" : "cadet";
      const generationSnapshot = attempt.generationSnapshot;
      const canonicalPayload = {
        examAttemptId: attempt._id,
        userId: user._id,
        immutable: true,
        immutableAt: attempt.immutableAt ?? attempt.completedAt,
        certificateNumber,
        resultVersion: 1,
        userSnapshot: {
          userId: user._id,
          fullName: user.name?.trim() || user.email,
          roleAtExam,
        },
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        totalQuestions,
        totalCorrect,
        scorePercent,
        passThresholdPercent: attempt.policySnapshot.passThresholdPercent,
        passed,
        examModesUsed,
        modeStats,
        categoryStats,
        flagDatabaseSnapshot: {
          generationVersion: generationSnapshot?.generationVersion ?? 1,
          examChecksum: generationSnapshot?.examChecksum ?? "unknown",
          questionCount: generationSnapshot?.questionCount ?? totalQuestions,
          modeStrategy: generationSnapshot?.modeStrategy ?? "alternating",
          singleMode: generationSnapshot?.singleMode,
          generationStartedAt: generationSnapshot?.generationStartedAt ?? attempt.startedAt,
          generationCompletedAt: generationSnapshot?.generationCompletedAt ?? attempt.startedAt,
          generationTimeMs: generationSnapshot?.generationTimeMs ?? 0,
          generationRetryCount: generationSnapshot?.generationRetryCount ?? 0,
        },
        questionBreakdown,
      };

      const canonicalJson = stableStringify(canonicalPayload);
      const recordChecksum = await sha256Hex(canonicalJson);

      if (!dryRun) {
        const examResultId = await ctx.db.insert("examResults", {
          ...canonicalPayload,
          recordChecksum,
          signatureAlgorithm: "sha256",
          signature: recordChecksum,
          createdAt: attempt.completedAt,
        });

        await ctx.db.patch(attempt._id, {
          examResultId,
          immutableAt: attempt.immutableAt ?? attempt.completedAt,
          updatedAt: Date.now(),
        });

        await insertExamAuditLog(ctx, {
          examAttemptId: attempt._id,
          userId: adminUser._id,
          eventType: "result_backfilled",
          message: "Backfilled immutable official result record for completed attempt.",
          metadata: {
            source: "backfillImmutableResults",
            examResultId,
          },
        });
      }

      summary.created += 1;
    }

    return summary;
  },
});

const CLIENT_SECURITY_EVENT_TYPES = [
  "connection_lost",
  "connection_restored",
  "window_blur",
  "window_focus",
  "tab_hidden",
  "tab_visible",
  "fullscreen_entered",
  "fullscreen_exited",
  "back_navigation_blocked",
  "restricted_shortcut_blocked",
  "idle_warning_shown",
  "idle_timeout_triggered",
] as const;

export const logExamClientEvent = mutation({
  args: {
    examAttemptId: v.id("examAttempts"),
    eventType: v.union(
      v.literal("connection_lost"),
      v.literal("connection_restored"),
      v.literal("window_blur"),
      v.literal("window_focus"),
      v.literal("tab_hidden"),
      v.literal("tab_visible"),
      v.literal("fullscreen_entered"),
      v.literal("fullscreen_exited"),
      v.literal("back_navigation_blocked"),
      v.literal("restricted_shortcut_blocked"),
      v.literal("idle_warning_shown"),
      v.literal("idle_timeout_triggered")
    ),
    message: v.string(),
    metadataJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      throw new Error("Authentication is required.");
    }

    const attempt = await getOwnedAttempt(ctx, user._id, args.examAttemptId);
    if (!attempt) {
      throw new Error("Exam attempt not found or access denied.");
    }

    if (attempt.immutableAt !== undefined || attempt.status !== "started") {
      await insertExamAuditLog(ctx, {
        examAttemptId: attempt._id,
        userId: user._id,
        eventType: "immutable_write_blocked",
        message: "Blocked client security mutation against immutable or finalized exam attempt.",
        metadata: {
          requestedEventType: args.eventType,
          attemptStatus: attempt.status,
          immutableAt: attempt.immutableAt,
        },
      });

      throw new Error("This exam attempt has been finalized and cannot be modified.");
    }

    if (!CLIENT_SECURITY_EVENT_TYPES.includes(args.eventType)) {
      throw new Error("Unsupported client security event type.");
    }

    let parsedMetadata: Record<string, unknown> | undefined;
    if (args.metadataJson) {
      if (args.metadataJson.length > 4000) {
        throw new Error("metadataJson exceeds maximum length.");
      }

      try {
        const raw = JSON.parse(args.metadataJson) as unknown;
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
          parsedMetadata = raw as Record<string, unknown>;
        }
      } catch {
        throw new Error("metadataJson must be valid JSON.");
      }
    }

    await insertExamAuditLog(ctx, {
      examAttemptId: attempt._id,
      userId: user._id,
      eventType: args.eventType,
      message: args.message,
      metadata: parsedMetadata,
    });

    return {
      success: true,
      loggedAt: Date.now(),
    };
  },
});

