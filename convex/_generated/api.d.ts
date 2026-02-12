/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as flags from "../flags.js";
import type * as seed_letters from "../seed/letters.js";
import type * as seed_numbers from "../seed/numbers.js";
import type * as seed_reset from "../seed/reset.js";
import type * as seed_special from "../seed/special.js";
import type * as seed_flags from "../seed_flags.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  flags: typeof flags;
  "seed/letters": typeof seed_letters;
  "seed/numbers": typeof seed_numbers;
  "seed/reset": typeof seed_reset;
  "seed/special": typeof seed_special;
  seed_flags: typeof seed_flags;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
