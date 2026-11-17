/**
 * Subscription model (Step 9 prep, used by Step 11).
 *
 * The source of truth will be the `user_subscriptions` table, written ONLY by the
 * server after a payment provider webhook is verified — never from the browser.
 * This module turns a subscription record into the plan the user gets right now,
 * including expiry, cancellation at period end, and grace for failed renewals.
 */
import type { BillingCycle, PlanId } from "./plans";

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "expired";

export type Subscription = {
  userId: string;
  plan: PlanId;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  /** ISO date the paid period ends */
  currentPeriodEnd: string;
  /** User asked to cancel: keeps access until currentPeriodEnd, then drops to Free */
  cancelAtPeriodEnd: boolean;
};

/** Days of access kept after a failed renewal while the provider retries the charge */
export const PAST_DUE_GRACE_DAYS = 3;

export function effectivePlan(sub: Subscription | null, now = new Date()): PlanId {
  if (!sub || sub.plan === "free") return "free";
  const end = new Date(sub.currentPeriodEnd).getTime();
  const t = now.getTime();
  switch (sub.status) {
    case "active":
    case "trialing":
      return t <= end ? sub.plan : "free";
    case "canceled":
      // Canceled subscriptions keep access until the period they paid for ends
      return t <= end ? sub.plan : "free";
    case "past_due":
      return t <= end + PAST_DUE_GRACE_DAYS * 86_400_000 ? sub.plan : "free";
    case "expired":
      return "free";
  }
}
