import { Doc } from "../../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../../_generated/server";

export type AuthenticatedCtx = QueryCtx | MutationCtx;

export async function getAuthenticatedUser(
  ctx: AuthenticatedCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export async function assertAdminUser(
  ctx: MutationCtx
): Promise<Doc<"users">> {
  const user = await getAuthenticatedUser(ctx);
  if (!user) {
    throw new Error("Authentication is required.");
  }
  if (user.role !== "admin") {
    throw new Error("Only administrators can change official exam settings.");
  }
  return user;
}

export async function getOwnedAttempt(
  ctx: AuthenticatedCtx,
  userId: Doc<"users">["_id"],
  examAttemptId: Doc<"examAttempts">["_id"]
): Promise<Doc<"examAttempts"> | null> {
  const attempt = await ctx.db.get(examAttemptId);
  if (!attempt || attempt.userId !== userId) {
    return null;
  }
  return attempt;
}

export function canAccessResultRecord(
  user: Doc<"users">,
  result: Doc<"examResults">
): boolean {
  if (user.role === "admin") {
    return true;
  }
  return result.userId === user._id;
}
