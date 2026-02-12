import { internalMutation } from "../_generated/server";

export const resetFlags = internalMutation({
  args: {},
  handler: async (ctx) => {
    const flags = await ctx.db.query("flags").collect();
    let deleted = 0;
    
    for (const flag of flags) {
      await ctx.db.delete(flag._id);
      deleted++;
    }

    return {
      success: true,
      message: `Deleted ${deleted} flags. Please run seed_flags:seedFlags to repopulate.`,
    };
  },
});
