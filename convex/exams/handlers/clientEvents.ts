import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, getOwnedAttempt } from "../services/auth";
import { insertExamAuditLog } from "../services/audit";

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
