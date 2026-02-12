import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Helper: Randomly select N flags from all available flags
 */
async function selectRandomFlags(
  ctx: QueryCtx,
  count: number | "all"
): Promise<Id<"flags">[]> {
  const allFlags = await ctx.db
    .query("flags")
    .withIndex("by_order")
    .collect();

  if (allFlags.length === 0) {
    throw new Error("No flags available in database");
  }

  // If 'all', return all flag IDs
  if (count === "all") {
    return allFlags.map((flag: Doc<"flags">) => flag._id);
  }

  // Ensure we don't try to select more flags than available
  const actualCount = Math.min(count, allFlags.length);

  // Fisher-Yates shuffle and take first N
  const shuffled = [...allFlags];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, actualCount).map((flag: Doc<"flags">) => flag._id);
}

/**
 * Query: Get incomplete practice session for current user
 * Returns the most recent active session, or null if none exists
 */
export const getIncompleteSession = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Find most recent active session
    const activeSession = await ctx.db
      .query("practiceSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .order("desc")
      .first();

    return activeSession;
  },
});

/**
 * Query: Get practice statistics for current user
 * Calculates total sessions, average score, last practiced date
 */
export const getUserPracticeStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Get all sessions for this user
    const allSessions = await ctx.db
      .query("practiceSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const completedSessions = allSessions.filter(
      (s) => s.status === "completed"
    );

    const totalSessions = allSessions.length;
    const completedCount = completedSessions.length;

    // Calculate average score from completed sessions
    let averageScore = 0;
    if (completedCount > 0) {
      const totalScore = completedSessions.reduce((sum, s) => sum + s.score, 0);
      averageScore = totalScore / completedCount;
    }

    // Find last practiced date
    const lastPracticed =
      allSessions.length > 0
        ? Math.max(...allSessions.map((s) => s.startedAt))
        : undefined;

    // Calculate total flags practiced
    const totalFlagsPracticed = completedSessions.reduce(
      (sum, s) => sum + s.flagIds.length,
      0
    );

    // Determine favorite mode
    const modeCount = completedSessions.reduce(
      (acc, s) => {
        acc[s.mode] = (acc[s.mode] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const favoriteMode =
      completedCount > 0
        ? (Object.keys(modeCount).sort(
            (a, b) => modeCount[b] - modeCount[a]
          )[0] as "learn" | "match")
        : undefined;

    return {
      totalSessions,
      completedSessions: completedCount,
      averageScore,
      lastPracticed,
      totalFlagsPracticed,
      favoriteMode,
    };
  },
});

/**
 * Query: Get specific practice session by ID
 * Only returns session if it belongs to the current user
 */
export const getSessionById = query({
  args: { sessionId: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const session = await ctx.db.get(args.sessionId);

    // Security: Only return session if it belongs to this user
    if (!session || session.userId !== user._id) {
      return null;
    }

    return session;
  },
});

/**
 * Mutation: Create new practice session
 * Validates no active session exists, selects random flags, creates session
 */
export const createPracticeSession = mutation({
  args: {
    mode: v.union(v.literal("learn"), v.literal("match")),
    sessionLength: v.union(
      v.literal(5),
      v.literal(10),
      v.literal(15),
      v.literal(30),
      v.literal("all")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to create practice session");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check for existing active session
    const existingActiveSession = await ctx.db
      .query("practiceSessions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .first();

    if (existingActiveSession) {
      throw new Error(
        "You already have an active practice session. Please complete or abandon it first."
      );
    }

    // Select random flags
    const flagIds = await selectRandomFlags(ctx, args.sessionLength);

    if (flagIds.length === 0) {
      throw new Error("No flags available for practice");
    }

    // Create new session
    const sessionId = await ctx.db.insert("practiceSessions", {
      userId: user._id,
      mode: args.mode,
      sessionLength: args.sessionLength === "all" ? flagIds.length : args.sessionLength,
      flagIds,
      currentIndex: 0,
      score: 0,
      status: "active",
      startedAt: Date.now(),
    });

    return sessionId;
  },
});

/**
 * Mutation: Abandon incomplete practice session
 * Marks session as abandoned so user can start a new one
 */
export const abandonSession = mutation({
  args: { sessionId: v.id("practiceSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to abandon session");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    // Security: Only allow user to abandon their own session
    if (session.userId !== user._id) {
      throw new Error("You can only abandon your own sessions");
    }

    // Only active sessions can be abandoned
    if (session.status !== "active") {
      throw new Error("Only active sessions can be abandoned");
    }

    // Mark as abandoned
    await ctx.db.patch(args.sessionId, {
      status: "abandoned",
      completedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Mutation: Update session progress (for future use in actual practice interface)
 * Updates current index and score as user progresses through session
 */
export const updateSessionProgress = mutation({
  args: {
    sessionId: v.id("practiceSessions"),
    currentIndex: v.number(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to update session");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    // Security: Only allow user to update their own session
    if (session.userId !== user._id) {
      throw new Error("You can only update your own sessions");
    }

    if (session.status !== "active") {
      throw new Error("Can only update active sessions");
    }

    await ctx.db.patch(args.sessionId, {
      currentIndex: args.currentIndex,
      score: args.score,
    });

    return { success: true };
  },
});

/**
 * Mutation: Complete practice session (for future use in actual practice interface)
 * Marks session as completed with final score
 */
export const completeSession = mutation({
  args: {
    sessionId: v.id("practiceSessions"),
    finalScore: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to complete session");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    // Security: Only allow user to complete their own session
    if (session.userId !== user._id) {
      throw new Error("You can only complete your own sessions");
    }

    if (session.status !== "active") {
      throw new Error("Can only complete active sessions");
    }

    await ctx.db.patch(args.sessionId, {
      status: "completed",
      score: args.finalScore,
      currentIndex: session.flagIds.length, // Mark as fully completed
      completedAt: Date.now(),
    });

    return { success: true };
  },
});
