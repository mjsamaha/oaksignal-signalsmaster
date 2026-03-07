import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import {
  buildExamPolicySnapshot,
  estimateExamDurationMinutes,
  OFFICIAL_EXAM_MIN_RULES_VIEW_DURATION_MS,
  OFFICIAL_EXAM_MIN_PRACTICE_SESSIONS,
  SUPPORTED_BROWSERS,
} from "./lib/exam_policy";
import {
  getExamAcknowledgementErrors,
  getExamStartBlockers,
} from "./lib/exam_start_validators";
import { generateExamQuestions, applyExamAttemptToQuestions } from "./lib/exam-generation";
import { generateExamSeed } from "./lib/exam-randomization";
import { ExamModeStrategy, ExamQuestionMode } from "./lib/exam-types";

type AuthenticatedCtx = QueryCtx | MutationCtx;

interface ExamStartData {
  totalQuestions: number;
  expectedDurationMinutes: number;
  totalPracticeSessions: number;
  practiceAveragePercent: number;
  latestAttempt: Doc<"examAttempts"> | null;
  hasOfficialAttempt: boolean;
  blockers: string[];
}

interface ExamGenerationSettings {
  modeStrategy: ExamModeStrategy;
  singleMode?: ExamQuestionMode;
}

async function resolveExamGenerationSettings(ctx: AuthenticatedCtx): Promise<ExamGenerationSettings> {
  const settings = await ctx.db
    .query("examSettings")
    .withIndex("by_updatedAt")
    .order("desc")
    .first();

  if (!settings) {
    return {
      modeStrategy: "alternating",
    };
  }

  return {
    modeStrategy: settings.modeStrategy,
    singleMode: settings.modeStrategy === "single" ? settings.singleMode : undefined,
  };
}

async function insertExamAuditLog(
  ctx: MutationCtx,
  input: {
    examAttemptId: Doc<"examAttempts">["_id"];
    userId: Doc<"users">["_id"];
    eventType:
      | "generation_started"
      | "generation_completed"
      | "generation_failed"
      | "submission_received"
      | "submission_validated"
      | "submission_rejected";
    message: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await ctx.db.insert("examAuditLogs", {
    examAttemptId: input.examAttemptId,
    userId: input.userId,
    eventType: input.eventType,
    message: input.message,
    metadataJson: input.metadata ? JSON.stringify(input.metadata) : undefined,
    createdAt: Date.now(),
  });
}

async function getAuthenticatedUser(ctx: AuthenticatedCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

async function getExamStartData(
  ctx: AuthenticatedCtx,
  user: Doc<"users">
): Promise<ExamStartData> {
  const allFlags = await ctx.db
    .query("flags")
    .withIndex("by_order")
    .collect();

  const totalQuestions = allFlags.length;
  const expectedDurationMinutes = estimateExamDurationMinutes(totalQuestions);

  const completedPracticeSessions = await ctx.db
    .query("practiceSessions")
    .withIndex("by_user_status", (q) =>
      q.eq("userId", user._id).eq("status", "completed")
    )
    .collect();

  const totalPracticeSessions = completedPracticeSessions.length;
  const practiceAveragePercent =
    totalPracticeSessions > 0
      ? Math.round(
          completedPracticeSessions.reduce((sum, session) => sum + session.score, 0) /
            totalPracticeSessions
        )
      : 0;

  const latestAttempt = await ctx.db
    .query("examAttempts")
    .withIndex("by_user_startedAt", (q) => q.eq("userId", user._id))
    .order("desc")
    .first();

  const hasOfficialAttempt = Boolean(latestAttempt);

  const blockers = getExamStartBlockers({
    userRole: user.role,
    totalQuestions,
    userPracticeSessions: totalPracticeSessions,
    hasOfficialAttempt,
  });

  return {
    totalQuestions,
    expectedDurationMinutes,
    totalPracticeSessions,
    practiceAveragePercent,
    latestAttempt,
    hasOfficialAttempt,
    blockers,
  };
}

export const getExamStartContext = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const startData = await getExamStartData(ctx, user);
    const examPolicy = buildExamPolicySnapshot(startData.totalQuestions);

    return {
      examPolicy,
      expectedDurationMinutes: startData.expectedDurationMinutes,
      minimumRulesViewDurationMs: OFFICIAL_EXAM_MIN_RULES_VIEW_DURATION_MS,
      prerequisite: {
        minimumPracticeSessions: OFFICIAL_EXAM_MIN_PRACTICE_SESSIONS,
        userPracticeSessions: startData.totalPracticeSessions,
        userPracticeAveragePercent: startData.practiceAveragePercent,
        met: startData.totalPracticeSessions >= OFFICIAL_EXAM_MIN_PRACTICE_SESSIONS,
      },
      eligibility: {
        canStart: startData.blockers.length === 0,
        blockers: startData.blockers,
      },
      systemRequirements: {
        stableInternetRequired: true,
        recommendedBrowsers: [...SUPPORTED_BROWSERS],
      },
      proctorInfo: null,
      motivationalMessage: "You've prepared well, good luck!",
      attemptSummary: {
        hasOfficialAttempt: startData.hasOfficialAttempt,
        latestAttemptStatus: startData.latestAttempt?.status ?? null,
        latestStartedAt: startData.latestAttempt?.startedAt ?? null,
      },
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
      minimumRulesViewDurationMs: OFFICIAL_EXAM_MIN_RULES_VIEW_DURATION_MS,
    });

    if (acknowledgementErrors.length > 0) {
      throw new Error(acknowledgementErrors[0]);
    }

    const now = Date.now();
    const examPolicy = buildExamPolicySnapshot(startData.totalQuestions);
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
      now,
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

    const examAttemptId = await ctx.db.insert("examAttempts", {
      userId: user._id,
      status: "started",
      attemptNumber,
      rulesAcknowledgedAt: now,
      readinessAcknowledgedAt: now,
      rulesViewDurationMs: args.rulesViewDurationMs,
      policySnapshot: examPolicy,
      prerequisiteSnapshot: {
        minimumPracticeSessionsRequired: OFFICIAL_EXAM_MIN_PRACTICE_SESSIONS,
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
      startedAt: now,
      createdAt: now,
      updatedAt: now,
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
        createdAt: now,
        updatedAt: now,
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

    return {
      examAttemptId,
      startedAt: now,
    };
  },
});

export const getAttemptHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const limit = args.limit ?? 5;
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      throw new Error("Limit must be an integer between 1 and 20");
    }

    const attempts = await ctx.db
      .query("examAttempts")
      .withIndex("by_user_startedAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return attempts.map((attempt) => ({
      examAttemptId: attempt._id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt ?? null,
      scorePercent: attempt.result?.scorePercent ?? null,
      passed: attempt.result?.passed ?? null,
    }));
  },
});

export const getAttemptById = query({
  args: {
    examAttemptId: v.id("examAttempts"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const attempt = await ctx.db.get(args.examAttemptId);
    if (!attempt || attempt.userId !== user._id) {
      return null;
    }

    return {
      examAttemptId: attempt._id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt ?? null,
      rulesAcknowledgedAt: attempt.rulesAcknowledgedAt,
      readinessAcknowledgedAt: attempt.readinessAcknowledgedAt,
      rulesViewDurationMs: attempt.rulesViewDurationMs,
      policySnapshot: attempt.policySnapshot,
      prerequisiteSnapshot: attempt.prerequisiteSnapshot,
      systemSnapshot: attempt.systemSnapshot,
    };
  },
});
