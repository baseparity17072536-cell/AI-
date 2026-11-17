/**
 * Subscription plans and feature permissions (Step 9).
 *
 * Prices and quotas are deliberately `null`: they must come from the business
 * owner. The UI shows "not announced yet" instead of inventing numbers.
 *
 * ENFORCE_PERMISSIONS stays false until real login + server-verified payments
 * exist (Steps 10–11). Turning it on without them would lock every visitor out
 * of Premium features with no way to upgrade.
 */

export type PlanId = "free" | "premium";
export type BillingCycle = "monthly" | "yearly";

export type Feature =
  | "free-prompts"
  | "premium-prompts"
  | "copy-prompts"
  | "prompt-builder"
  | "save-prompts"
  | "long-video-planner"
  | "premium-tutorials";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  /** THB per cycle. null = not approved by the owner yet → shown as "ยังไม่ประกาศราคา" */
  price: Record<BillingCycle, number | null>;
  features: Feature[];
  /** null = limit not decided yet (treated as unlimited while ENFORCE_PERMISSIONS is false) */
  quotas: { builderGenerationsPerDay: number | null; savedPrompts: number | null };
};

export const ENFORCE_PERMISSIONS = false;

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "เริ่มต้นใช้ Prompt สำเร็จรูปได้ทันที",
    price: { monthly: 0, yearly: 0 },
    features: ["free-prompts", "copy-prompts", "prompt-builder", "save-prompts"],
    quotas: { builderGenerationsPerDay: null, savedPrompts: null },
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "ปลดล็อกทุก Prompt และเครื่องมือระดับมืออาชีพ",
    price: { monthly: null, yearly: null },
    features: [
      "free-prompts",
      "premium-prompts",
      "copy-prompts",
      "prompt-builder",
      "save-prompts",
      "long-video-planner",
      "premium-tutorials",
    ],
    quotas: { builderGenerationsPerDay: null, savedPrompts: null },
  },
};

export const FEATURE_LABELS: Record<Feature, string> = {
  "free-prompts": "เข้าถึง Prompt ฟรี",
  "premium-prompts": "เข้าถึง Premium Prompt",
  "copy-prompts": "คัดลอก Prompt",
  "prompt-builder": "ใช้ Interactive Prompt Builder",
  "save-prompts": "บันทึกและจัดการ Prompt",
  "long-video-planner": "ใช้ Long Video Planner",
  "premium-tutorials": "เข้าถึง Premium Tutorials",
};

/** Is `feature` available on `plan`? Always true while enforcement is off. */
export function can(plan: PlanId, feature: Feature) {
  if (!ENFORCE_PERMISSIONS) return true;
  return PLANS[plan].features.includes(feature);
}

export function formatQuota(n: number | null) {
  return n === null ? "ตามที่กำหนด (รอประกาศ)" : n.toLocaleString("th-TH");
}
