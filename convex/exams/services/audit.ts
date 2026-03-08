import { Doc } from "../../_generated/dataModel";
import { MutationCtx } from "../../_generated/server";
import { ExamAuditEventType, ResultAccessType } from "../../lib/exam_types";

export async function insertExamAuditLog(
  ctx: MutationCtx,
  input: {
    examAttemptId: Doc<"examAttempts">["_id"];
    userId: Doc<"users">["_id"];
    eventType: ExamAuditEventType;
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

export async function insertExamResultAccessLog(
  ctx: MutationCtx,
  input: {
    result: Doc<"examResults">;
    actorUser: Doc<"users">;
    accessType: ResultAccessType;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await ctx.db.insert("examResultAccessLogs", {
    examResultId: input.result._id,
    examAttemptId: input.result.examAttemptId,
    targetUserId: input.result.userId,
    actorUserId: input.actorUser._id,
    actorRole: input.actorUser.role,
    accessType: input.accessType,
    metadataJson: input.metadata ? JSON.stringify(input.metadata) : undefined,
    createdAt: Date.now(),
  });
}

export async function rejectExamSubmission(
  ctx: MutationCtx,
  input: {
    examAttemptId: Doc<"examAttempts">["_id"];
    userId: Doc<"users">["_id"];
    questionIndex: number;
    reason: string;
    auditMessage: string;
    throwMessage?: string;
    eventType?: Extract<
      ExamAuditEventType,
      "submission_rejected" | "session_token_rejected" | "immutable_write_blocked"
    >;
    metadata?: Record<string, unknown>;
  }
): Promise<never> {
  await insertExamAuditLog(ctx, {
    examAttemptId: input.examAttemptId,
    userId: input.userId,
    eventType: input.eventType ?? "submission_rejected",
    message: input.auditMessage,
    metadata: {
      questionIndex: input.questionIndex,
      reason: input.reason,
      ...input.metadata,
    },
  });

  throw new Error(input.throwMessage ?? input.auditMessage);
}
