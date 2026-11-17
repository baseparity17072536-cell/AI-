"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Clock, Crown, Minus, Sparkles } from "lucide-react";
import { FEATURE_LABELS, formatQuota, PLANS, type BillingCycle, type Feature, type Plan } from "@/lib/plans";
import { getCurrentPlan } from "@/lib/account";

const ALL_FEATURES = Object.keys(FEATURE_LABELS) as Feature[];
/** Toggle is shown only when the owner has approved at least one paid price */
const HAS_PRICES = Object.values(PLANS).some((p) => p.id !== "free" && (p.price.monthly !== null || p.price.yearly !== null));

export function PricingCards() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const current = getCurrentPlan();

  return (
    <div>
      {HAS_PRICES && (
        <div className="flex justify-center">
          <div className="flex rounded-full border border-lux-gold/40 p-1" role="radiogroup" aria-label="รอบการชำระเงิน">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={cycle === c}
                onClick={() => setCycle(c)}
                className={`rounded-full px-5 py-2 text-sm transition ${cycle === c ? "bg-lux-gold font-semibold text-black" : "text-stone-300 hover:text-white"}`}
              >
                {c === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {Object.values(PLANS).map((plan) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} isCurrent={plan.id === current} />
        ))}
      </div>

      {/* Comparison */}
      <section className="mx-auto mt-16 max-w-4xl" aria-labelledby="compare">
        <h2 id="compare" className="text-center text-2xl font-bold text-white">
          เปรียบเทียบสิทธิ์
        </h2>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-lux-gold/25">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="bg-lux-card text-left">
                <th scope="col" className="px-5 py-4 font-semibold text-stone-300">
                  สิทธิ์การใช้งาน
                </th>
                {Object.values(PLANS).map((p) => (
                  <th key={p.id} scope="col" className={`px-5 py-4 text-center font-bold ${p.id === "premium" ? "text-lux-bright" : "text-white"}`}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map((f) => (
                <tr key={f} className="border-t border-white/5">
                  <th scope="row" className="px-5 py-3.5 text-left font-normal text-stone-300">
                    {FEATURE_LABELS[f]}
                  </th>
                  {Object.values(PLANS).map((p) => (
                    <td key={p.id} className="px-5 py-3.5 text-center">
                      {p.features.includes(f) ? (
                        <Check className="mx-auto h-5 w-5 text-lux-bright" aria-label="มี" />
                      ) : (
                        <Minus className="mx-auto h-5 w-5 text-stone-600" aria-label="ไม่มี" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-white/5">
                <th scope="row" className="px-5 py-3.5 text-left font-normal text-stone-300">
                  จำนวนครั้งใช้ Prompt Builder ต่อวัน
                </th>
                {Object.values(PLANS).map((p) => (
                  <td key={p.id} className="px-5 py-3.5 text-center text-stone-400">
                    {formatQuota(p.quotas.builderGenerationsPerDay)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-white/5">
                <th scope="row" className="px-5 py-3.5 text-left font-normal text-stone-300">
                  จำนวน Prompt ที่บันทึกได้
                </th>
                {Object.values(PLANS).map((p) => (
                  <td key={p.id} className="px-5 py-3.5 text-center text-stone-400">
                    {formatQuota(p.quotas.savedPrompts)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PlanCard({ plan, cycle, isCurrent }: { plan: Plan; cycle: BillingCycle; isCurrent: boolean }) {
  const premium = plan.id === "premium";
  const price = plan.price[cycle];

  return (
    <article
      className={`relative flex flex-col rounded-3xl border p-7 ${
        premium
          ? "border-lux-bright/70 bg-linear-to-b from-[#1d1709] to-lux-card shadow-[0_0_60px_-10px_rgba(245,199,107,0.35)]"
          : "border-lux-gold/30 bg-lux-card"
      }`}
    >
      {premium && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-3 py-1 text-xs font-semibold text-black">
          <Crown className="h-3.5 w-3.5" /> แนะนำ
        </span>
      )}
      <h3 className={`text-2xl font-extrabold ${premium ? "text-lux-bright" : "text-white"}`}>{plan.name}</h3>
      <p className="mt-1 text-sm text-stone-400">{plan.tagline}</p>

      <div className="mt-6 min-h-16">
        {price === 0 ? (
          <p className="text-4xl font-extrabold text-white">
            ฟรี
          </p>
        ) : price === null ? (
          <>
            <p className="flex items-center gap-2 text-xl font-bold text-white">
              <Clock className="h-5 w-5 text-lux-gold" /> ยังไม่ประกาศราคา
            </p>
            <p className="mt-1 text-xs text-stone-500">ราคาจะแสดงเมื่อได้รับการอนุมัติ</p>
          </>
        ) : (
          <p className="text-4xl font-extrabold text-white">
            ฿{price.toLocaleString("th-TH")}
            <span className="text-base font-normal text-stone-400"> / {cycle === "monthly" ? "เดือน" : "ปี"}</span>
          </p>
        )}
      </div>

      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-stone-200">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${premium ? "text-lux-bright" : "text-lux-gold"}`} />
            {FEATURE_LABELS[f]}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {isCurrent ? (
          <p className="flex items-center justify-center gap-2 rounded-full border border-emerald-400/50 px-5 py-3 text-sm font-semibold text-emerald-300">
            <Check className="h-4 w-4" /> แพ็กเกจปัจจุบันของคุณ
          </p>
        ) : premium ? (
          // No real sign-up or payment exists yet: show the true status, never a fake checkout
          <>
            <button
              type="button"
              disabled
              aria-describedby="premium-status"
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-5 py-3 font-semibold text-black opacity-60"
            >
              <Sparkles className="h-5 w-5" /> สมัคร Premium
            </button>
            <p id="premium-status" className="mt-2 text-center text-xs text-stone-400">
              ระบบสมาชิกและการชำระเงินกำลังเตรียมเปิดให้บริการ
            </p>
          </>
        ) : (
          <Link
            href="/prompts"
            className="flex w-full items-center justify-center rounded-full border border-lux-gold/60 px-5 py-3 font-semibold text-stone-200 transition hover:bg-lux-gold/10"
          >
            เริ่มใช้งานฟรี
          </Link>
        )}
        {isCurrent && !premium && (
          <Link href="/prompts" className="mt-2 block text-center text-sm text-lux-gold hover:text-lux-bright hover:underline">
            ไปที่ Prompt Library
          </Link>
        )}
      </div>
    </article>
  );
}
