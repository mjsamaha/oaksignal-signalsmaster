import { internalMutation } from "./_generated/server";
import { ALPHABET_FLAGS } from "./seed/letters";
import { NUMBER_FLAGS, PENNANT_NUMBERS } from "./seed/numbers";
import { SPECIAL_PENNANTS, SUBSTITUTES } from "./seed/special";
import { Doc } from "./_generated/dataModel";

type FlagType = Doc<"flags">["type"];
type FlagDifficulty = Doc<"flags">["difficulty"];

const allFlags = [
  ...ALPHABET_FLAGS,
  ...NUMBER_FLAGS,
  ...PENNANT_NUMBERS,
  ...SPECIAL_PENNANTS,
  ...SUBSTITUTES,
];

export const seedFlags = internalMutation({
  args: {},
  handler: async (ctx) => {
    let created = 0;
    let updated = 0;

    for (const flagData of allFlags) {
      // Check if flag already exists by key
      const existing = await ctx.db
        .query("flags")
        .withIndex("by_key", (q) => q.eq("key", flagData.key))
        .first();

      if (existing) {
        // Update existing flag
        await ctx.db.patch(existing._id, {
          ...flagData,
          type: flagData.type as FlagType,
          difficulty: flagData.difficulty as FlagDifficulty,
        });
        updated++;
      } else {
        // Create new flag
        await ctx.db.insert("flags", {
          ...flagData,
          type: flagData.type as FlagType,
          difficulty: flagData.difficulty as FlagDifficulty,
        });
        created++;
      }
    }

    return {
      success: true,
      message: `Database seeded successfully. Created: ${created}, Updated: ${updated}`,
    };
  },
});
