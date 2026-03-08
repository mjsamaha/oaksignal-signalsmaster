import { query } from "../../_generated/server";
import { v } from "convex/values";
import { Doc } from "../../_generated/dataModel";
import {
  getImmutableResultForAttempt,
  getAttemptQuestions,
  mapImmutableResultToAttemptResult,
  resolveFlagPrompt,
} from "../services/query_helpers";
import {
  getAuthenticatedUser,
  getOwnedAttempt,
} from "../services/auth";
import {
  getCurrentQuestionIndex,
  getLastAnsweredAt,
} from "../services/time";
import {
  deriveExamSessionToken,
  validateExamSessionToken,
} from "../../lib/exam_session_token";

export const getAttemptRuntimeProgress = query({
  args: {
    examAttemptId: v.id("examAttempts"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const attempt = await getOwnedAttempt(ctx, user._id, args.examAttemptId);
    if (!attempt) {
      return null;
    }

    const questions = await getAttemptQuestions(ctx, args.examAttemptId);
    const totalQuestions = questions.length;
    const answeredCount = questions.filter((question) => question.userAnswer !== null).length;
    const currentQuestionIndex = getCurrentQuestionIndex(questions);
    const remainingCount = Math.max(0, totalQuestions - answeredCount);
    const completionPercent =
      totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    const elapsedMs = Math.max(0, (attempt.completedAt ?? Date.now()) - attempt.startedAt);
    const lastAnsweredAt = getLastAnsweredAt(questions);

    return {
      examAttemptId: attempt._id,
      status: attempt.status,
      totalQuestions,
      answeredCount,
      currentQuestionIndex,
      remainingCount,
      completionPercent,
      elapsedMs,
      lastAnsweredAt,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt ?? null,
      generationSnapshot: attempt.generationSnapshot ?? null,
    };
  },
});

export const getCurrentAttemptQuestion = query({
  args: {
    examAttemptId: v.id("examAttempts"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const attempt = await getOwnedAttempt(ctx, user._id, args.examAttemptId);
    if (!attempt || attempt.status !== "started") {
      return null;
    }

    const questions = await getAttemptQuestions(ctx, args.examAttemptId);
    const nextQuestionIndex = getCurrentQuestionIndex(questions);
    if (nextQuestionIndex === null) {
      return null;
    }

    const question = questions.find((item) => item.questionIndex === nextQuestionIndex);
    if (!question) {
      throw new Error("Current exam question was not found.");
    }

    const prompt = await resolveFlagPrompt(ctx, attempt, question);

    return {
      questionIndex: question.questionIndex,
      flagKey: question.flagKey,
      mode: question.mode,
      options: question.options,
      prompt,
    };
  },
});

export const getAttemptPreload = query({
  args: {
    examAttemptId: v.id("examAttempts"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return null;
    }

    const attempt = await getOwnedAttempt(ctx, user._id, args.examAttemptId);
    if (!attempt || attempt.status !== "started") {
      return null;
    }

    const questions = (await getAttemptQuestions(ctx, args.examAttemptId)).sort(
      (a, b) => a.questionIndex - b.questionIndex
    );
    const currentIndex = getCurrentQuestionIndex(questions);
    if (currentIndex === null) {
      return {
        currentQuestionImages: [] as string[],
        nextQuestionImages: [] as string[],
      };
    }

    const currentQuestion = questions.find((question) => question.questionIndex === currentIndex);
    const nextQuestion = questions.find((question) => question.questionIndex === currentIndex + 1);

    const collectImages = async (
      question: Doc<"examQuestions"> | undefined
    ): Promise<string[]> => {
      if (!question) {
        return [];
      }

      const images = new Set<string>();
      if (question.mode === "learn") {
        const prompt = await resolveFlagPrompt(ctx, attempt, question);
        if (prompt.imagePath) {
          images.add(prompt.imagePath);
        }
      }

      for (const option of question.options) {
        if (option.imagePath) {
          images.add(option.imagePath);
        }
      }
      return [...images];
    };

    return {
      currentQuestionImages: await collectImages(currentQuestion),
      nextQuestionImages: await collectImages(nextQuestion),
    };
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

    let sessionToken: string | null = null;
    if (attempt.sessionIssuedAt && attempt.sessionExpiresAt && attempt.sessionTokenHash) {
      try {
        const derivedToken = await deriveExamSessionToken({
          examAttemptId: attempt._id,
          userId: user._id,
          issuedAt: attempt.sessionIssuedAt,
          expiresAt: attempt.sessionExpiresAt,
        });

        const validation = await validateExamSessionToken({
          token: derivedToken,
          examAttemptId: attempt._id,
          userId: user._id,
          issuedAt: attempt.sessionIssuedAt,
          expiresAt: attempt.sessionExpiresAt,
          expectedHash: attempt.sessionTokenHash,
        });

        if (validation.valid) {
          sessionToken = derivedToken;
        }
      } catch {
        sessionToken = null;
      }
    }

    const immutableResult = await getImmutableResultForAttempt(ctx, attempt);
    const effectiveResult = immutableResult
      ? mapImmutableResultToAttemptResult(immutableResult)
      : (attempt.result ?? null);

    return {
      examAttemptId: attempt._id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt ?? null,
      sessionIssuedAt: attempt.sessionIssuedAt ?? null,
      sessionExpiresAt: attempt.sessionExpiresAt ?? null,
      sessionToken,
      rulesAcknowledgedAt: attempt.rulesAcknowledgedAt,
      readinessAcknowledgedAt: attempt.readinessAcknowledgedAt,
      rulesViewDurationMs: attempt.rulesViewDurationMs,
      policySnapshot: attempt.policySnapshot,
      prerequisiteSnapshot: attempt.prerequisiteSnapshot,
      systemSnapshot: attempt.systemSnapshot,
      generationSnapshot: attempt.generationSnapshot ?? null,
      result: effectiveResult,
    };
  },
});
