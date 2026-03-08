import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";

export async function getCompletedSessions(
  ctx: QueryCtx,
  userId: Id<"users">,
  order: "asc" | "desc" = "desc",
  limit?: number
): Promise<Doc<"practiceSessions">[]> {
  const query = ctx.db
    .query("practiceSessions")
    .withIndex("by_user_status", (q) =>
      q.eq("userId", userId).eq("status", "completed")
    )
    .order(order);

  if (typeof limit === "number") {
    return query.take(limit);
  }

  return query.collect();
}
