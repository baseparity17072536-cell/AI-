/**
 * Current-user seam.
 *
 * There is no authentication yet (see docs/backend-plan.md, Step 10), so every
 * visitor is the local "guest" on the Free plan. When Supabase Auth is connected,
 * replace these two functions with the signed-in user's id and their subscription
 * plan from the server. Nothing else needs to change: local data is already keyed
 * by user id and features are checked through `can()` in plans.ts.
 */
import type { PlanId } from "./plans";

export const GUEST_USER_ID = "guest";

export function getCurrentUserId(): string {
  return GUEST_USER_ID;
}

export function getCurrentPlan(): PlanId {
  return "free";
}
