import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";

export async function getFlagLookupByIds(
  ctx: QueryCtx,
  flagIds: Id<"flags">[]
): Promise<Map<string, Doc<"flags">>> {
  const uniqueIds = Array.from(new Set(flagIds));

  const rows = await Promise.all(
    uniqueIds.map(async (flagId) => {
      const flag = await ctx.db.get(flagId);
      return { flagId, flag };
    })
  );

  const lookup = new Map<string, Doc<"flags">>();
  for (const row of rows) {
    if (row.flag) {
      lookup.set(row.flagId.toString(), row.flag);
    }
  }

  return lookup;
}
