import { v } from "convex/values";
import { query } from "./_generated/server";

export const getAllFlags = query({
  args: {},
  handler: async (ctx) => {
    const flags = await ctx.db
      .query("flags")
      .withIndex("by_order") // Assumes global order is useful
      .collect();
    // Ensure they are sorted by order if the index doesn't strictly guarantee it (it should for full scan)
    return flags.sort((a, b) => a.order - b.order);
  },
});

export const getFlagByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const flag = await ctx.db
      .query("flags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return flag;
  },
});

export const getFlagsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const flags = await ctx.db
      .query("flags")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    return flags.sort((a, b) => a.order - b.order);
  },
});

export const getFlagsByType = query({
  args: { 
    type: v.union(
      v.literal("flag-letter"),
      v.literal("flag-number"),
      v.literal("pennant-number"),
      v.literal("special-pennant"),
      v.literal("substitute")
    )
  },
  handler: async (ctx, args) => {
    const flags = await ctx.db
      .query("flags")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
    return flags.sort((a, b) => a.order - b.order);
  },
});
export const getFlagById = query({
  args: { flagId: v.id("flags") },
  handler: async (ctx, args) => {
    const flag = await ctx.db.get(args.flagId);
    return flag;
  },
});

export const getSimilarFlags = query({
  args: { 
    flagId: v.id("flags"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the target flag to compare against
    const targetFlag = await ctx.db.get(args.flagId);
    
    if (!targetFlag) {
      return [];
    }

    // Get all flags for comparison
    const allFlags = await ctx.db
      .query("flags")
      .withIndex("by_order")
      .collect();

    // Filter out the target flag itself
    const otherFlags = allFlags.filter(f => f._id !== args.flagId);

    // Calculate similarity scores based on shared attributes
    const flagsWithScores = otherFlags.map(flag => {
      let similarityScore = 0;

      // Same type flags are more likely to be confused (e.g., all letters, all numbers)
      if (flag.type === targetFlag.type) {
        similarityScore += 3;
      }

      // Same category is another strong similarity indicator
      if (flag.category === targetFlag.category) {
        similarityScore += 2;
      }

      // Count shared colors (flags with similar color patterns are confusable)
      const sharedColors = flag.colors.filter(color => 
        targetFlag.colors.includes(color)
      ).length;
      similarityScore += sharedColors * 2;

      // Same pattern is highly confusable
      if (flag.pattern && targetFlag.pattern && flag.pattern === targetFlag.pattern) {
        similarityScore += 4;
      }

      // Similar difficulty level
      if (flag.difficulty === targetFlag.difficulty) {
        similarityScore += 1;
      }

      return {
        flag,
        similarityScore,
      };
    });

    // Sort by similarity score (highest first) and take top N
    const limit = args.limit || 4;
    const sortedFlags = flagsWithScores
      .filter(item => item.similarityScore > 0) // Only return flags with some similarity
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)
      .map(item => item.flag);

    return sortedFlags;
  },
});