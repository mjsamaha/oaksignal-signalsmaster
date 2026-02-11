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
