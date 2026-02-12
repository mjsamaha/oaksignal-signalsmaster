import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("cadet"), v.literal("admin"), v.literal("instructor")),
    rank: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"]),

  // New Flags Table
  flags: defineTable({
    // Unique identifier (e.g., 'alpha', 'one')
    key: v.string(),
    
    // Categorization
    type: v.union(
      v.literal("flag-letter"),
      v.literal("flag-number"),
      v.literal("pennant-number"),
      v.literal("special-pennant"),
      v.literal("substitute")
    ),
    category: v.string(), // e.g., 'letters', 'numbers' - helpful for broad grouping
    
    // Core Data
    name: v.string(),     // e.g., 'Alpha'
    meaning: v.string(),  // e.g., 'Diver Down'
    description: v.string(), // Expanded description 
    
    // Visuals & Identification
    imagePath: v.string(), // e.g., '/signals/flags/flag-letters/alpha.svg'
    colors: v.array(v.string()), // ['white', 'blue']
    pattern: v.optional(v.string()), // 'vertical-split', etc.
    tips: v.optional(v.string()), // 'Vertical white and blue halves'
    
    // Metadata
    phonetic: v.optional(v.string()), // 'Alfa'
    difficulty: v.optional(v.union(
      v.literal("beginner"), 
      v.literal("intermediate"), 
      v.literal("advanced")
    )),
    
    // Ordering for lists
    order: v.number(), 
  })
  .index("by_key", ["key"])           // Fast lookup by ID
  .index("by_type", ["type"])         // Filter by specific type
  .index("by_category", ["category"]) // Filter by broad category
  .index("by_order", ["order"]),      // Get flags in correct sequence

  // Practice Sessions Table
  practiceSessions: defineTable({
    userId: v.id("users"),
    mode: v.union(v.literal("learn"), v.literal("match")),
    sessionLength: v.number(),
    flagIds: v.array(v.id("flags")),
    currentIndex: v.number(),
    score: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
  .index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"])
  .index("by_status", ["status"]),
});
