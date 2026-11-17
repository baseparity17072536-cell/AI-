# CRENIX — แผน Backend, Authentication และ Payment (Step 10–11)

> สถานะ: **ข้อเสนอ รอเจ้าของโปรเจกต์อนุมัติ** — ยังไม่ได้สมัครบริการ ติดตั้งแพ็กเกจ หรือเชื่อมระบบภายนอกใด ๆ
> ข้อมูลราคาตรวจสอบจากเว็บไซต์ทางการเมื่อ 17 พ.ย. 2026 — ราคาอาจเปลี่ยน ตรวจสอบอีกครั้งก่อนสมัคร

## 1. ตรวจสอบระบบปัจจุบัน

| ส่วน | สถานะตอนนี้ |
|---|---|
| Framework | Next.js 16.4.6 (App Router, `cacheComponents`), React 19.3, TypeScript, Tailwind 4 |
| Backend / API | **ไม่มี** — ไม่มี API route, Server Action หรือฐานข้อมูล |
| Authentication | **ไม่มี** — ปุ่ม Log In / Sign Up ใน Header ยังเป็นลิงก์ `#` |
| ข้อมูล Prompt / Tutorials | ไฟล์ในโปรเจกต์ (`public/data/prompts.json`, `src/data/tutorials.ts`) |
| ข้อมูลผู้ใช้ | `localStorage` ผ่าน `src/lib/local-store.ts` แยกตามผู้ใช้ด้วย key `crenix:<userId>:<name>` (ตอนนี้ userId = `guest`) |
| สิทธิ์สมาชิก | `src/lib/plans.ts` (`can()`), `src/lib/subscription.ts` (`effectivePlan()`) — ปิดการบังคับใช้ไว้ (`ENFORCE_PERMISSIONS = false`) |

จุดเชื่อมที่เตรียมไว้แล้ว (เปลี่ยนจุดเดียว ส่วนอื่นไม่ต้องแก้):
- `src/lib/account.ts` → `getCurrentUserId()` / `getCurrentPlan()` เปลี่ยนเป็นค่าจาก session จริง
- `src/lib/my-prompts.ts`, `src/lib/planner/store.ts`, `src/lib/favorites.ts`, `src/lib/tutorial-progress.ts` → รูปแบบข้อมูลตรงกับตารางใน `supabase/migrations/0001_crenix_schema.sql`

## 2. ข้อเสนอ Authentication: Supabase Auth

เหตุผล: มี Auth + Postgres + Row Level Security ในที่เดียว, รองรับ Email verification, Reset password, Session ผ่าน cookie กับ Next.js (`@supabase/ssr`), ไม่ต้องเก็บรหัสผ่านเอง (Supabase เก็บเป็น hash)

หน้าที่จะสร้างหลังอนุมัติ: `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/account` (Profile, Settings, My Subscription), เชื่อม `/my-prompts` กับบัญชี

การทำงาน:
1. สมัครด้วยอีเมล + รหัสผ่าน → Supabase ส่งอีเมลยืนยัน → ยืนยันแล้วจึงเข้าใช้ได้
2. Session เก็บใน HTTP-only cookie, รีเฟรชด้วย `proxy.ts` (Next 16 เปลี่ยนชื่อจาก middleware)
3. ทุกการอ่าน/เขียนข้อมูลผู้ใช้ผ่าน RLS (`owner_id = auth.uid()`) → ผู้ใช้เข้าถึงข้อมูลคนอื่นไม่ได้แม้เรียก API ตรง
4. Logout ลบ session ทั้งฝั่ง cookie และ Supabase

แพ็กเกจที่ต้องติดตั้ง (หลังอนุมัติ): `@supabase/supabase-js`, `@supabase/ssr`

## 3. Database

ไฟล์: `supabase/migrations/0001_crenix_schema.sql` (ยังไม่ได้รันที่ไหน)

ตาราง: `profiles`, `prompt_categories`, `library_prompts` + `library_prompt_bodies`, `tutorials`, `model_capability_profiles`, `subscription_plans`, `user_subscriptions`, `payment_records`, `user_saved_prompts`, `favorites`, `recent_activity`, `planner_projects`, `tutorial_progress`

ความปลอดภัย:
- เปิด RLS ทุกตาราง
- ข้อความ Prompt แบบ Premium แยกตาราง อ่านได้เฉพาะผู้มี Premium ที่ยังไม่หมดอายุ (`has_active_premium()`)
- ตาราง `user_subscriptions`, `payment_records` **ไม่มี policy ให้ client เขียน** — เขียนได้เฉพาะ server (service role) หลังตรวจ Webhook
- ตรวจ Input ด้วย constraint (ความยาวชื่อ ≤ 120, Prompt ≤ 20,000 ตัวอักษร, tags ≤ 20) และตรวจซ้ำฝั่ง server ก่อนบันทึก

## 4. Payment

### ผู้ให้บริการที่รองรับประเทศไทย (ราคาจากหน้าเว็บทางการ)

| | Stripe (Thailand) | Opn Payments (Omise) |
|---|---|---|
| บัตรในประเทศ | 3.65% + ฿10 / รายการ | 3.65% / รายการ (+VAT 7%) |
| บัตรต่างประเทศ | 4.75% + ฿10 (+2% ถ้าแปลงสกุลเงิน) | ตามตารางในหน้าราคา |
| PromptPay | 1.65% / รายการ | 1.65% / รายการ (+VAT 7%) |
| ค่าแรกเข้า/รายเดือน | ไม่มี (pay-as-you-go) | ตรวจสอบในหน้าราคา |
| ระบบสมาชิกรายเดือน | Stripe Billing (มี upgrade/downgrade/cancel/retry ในตัว) — **ค่าธรรมเนียม Billing ยังไม่ได้ตรวจสอบ** | Charge Schedules (ตัดบัตรตามรอบ) — ต้องเขียน logic upgrade/downgrade เอง |
| อื่น ๆ | — | โอนเงินเข้าบัญชี ฿20/ครั้ง (≤ 2 ล้านบาท); PromptPay คืนเงินผ่านระบบไม่ได้ |

แหล่งอ้างอิง: [Stripe Thailand pricing](https://stripe.com/en-th/pricing), [Stripe local payment methods](https://stripe.com/en-th/pricing/local-payment-methods), [Omise Pricing Thailand](https://www.omise.co/en/pricing/thailand), [Omise PromptPay docs](https://docs.omise.co/promptpay/thailand)

ข้อสังเกต: PromptPay เป็นการโอนที่ลูกค้ากดจ่ายเอง จึง**ตัดเงินอัตโนมัติรายเดือนไม่ได้** — ใช้ได้กับแบบจ่ายล่วงหน้า (เช่น รายปี) ส่วนต่ออายุอัตโนมัติต้องใช้บัตร

**คำแนะนำ:** Stripe — เพราะ Billing จัดการ Upgrade / Downgrade / Cancellation / ตัดเงินซ้ำเมื่อบัตรไม่ผ่าน ให้ในตัว ลดโค้ดที่ต้องดูแลเอง (ต้องตรวจค่าธรรมเนียม Billing ก่อนตัดสินใจ) ถ้าต้องการผู้ให้บริการไทยและซัพพอร์ตภาษาไทย เลือก Opn ได้ โครงสร้างฐานข้อมูลรองรับทั้งสองแบบ

### Flow ที่ปลอดภัย
1. ผู้ใช้กดสมัคร → Server สร้าง Checkout Session (ใช้ secret key ฝั่ง server เท่านั้น) → redirect ไปหน้าจ่ายเงินของผู้ให้บริการ
2. ผู้ให้บริการเรียก Webhook `/api/webhooks/<provider>` → **ตรวจลายเซ็น** (`STRIPE_WEBHOOK_SECRET`) → บันทึก `payment_records` (กันซ้ำด้วย `provider_event_id` unique) → อัปเดต `user_subscriptions`
3. หน้าเว็บ**ไม่เชื่อ**ผลจาก redirect หรือข้อมูลฝั่ง client — อ่านสถานะจาก `user_subscriptions` เท่านั้น
4. หมดอายุ: `effectivePlan()` / `has_active_premium()` คืน Free เมื่อเลย `current_period_end` (past_due มีเวลาผ่อนผัน 3 วัน)
5. Cancel: ตั้ง `cancel_at_period_end` → ใช้ได้ถึงสิ้นรอบที่จ่ายแล้ว / Upgrade-Downgrade: ทำผ่าน API ผู้ให้บริการ แล้วอัปเดตจาก Webhook
6. เปิด `ENFORCE_PERMISSIONS = true` ใน `src/lib/plans.ts` **หลัง**ระบบทั้งหมดทำงานใน Sandbox แล้วเท่านั้น

ทดสอบด้วย Test mode / Sandbox และบัตรทดสอบของผู้ให้บริการเท่านั้น — ห้ามใช้บัตรจริง

## 5. Secrets
- เก็บใน Environment Variables เท่านั้น (ดู `.env.example`) — `.env*` ถูก gitignore แล้ว
- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPN_SECRET_KEY` เป็นของฝั่ง server ห้ามขึ้นต้นด้วย `NEXT_PUBLIC_` และห้าม import ใน Client Component
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` เปิดเผยได้ (ป้องกันด้วย RLS)

## 6. แผน Migration (ไม่ลบข้อมูลเดิม)
1. สร้าง Supabase project (Sandbox) → รัน migration → seed ข้อมูลจาก `prompts.json` และ `tutorials.ts` ด้วยสคริปต์
2. เพิ่ม Auth แต่ยังอ่าน Prompt Library จากไฟล์เดิมไปก่อน
3. เมื่อผู้ใช้ Login ครั้งแรก: อ่านข้อมูล `crenix:guest:*` ใน localStorage → ส่งขึ้น server ผ่าน API ที่ตรวจ session → ยืนยันว่าบันทึกสำเร็จ → จึงเปลี่ยนไปใช้ข้อมูลจาก server (**ไม่ลบข้อมูลในเครื่องจนกว่า server ยืนยัน**)
4. ย้าย Prompt Library ไปอ่านจากฐานข้อมูล
5. เชื่อม Payment ใน Sandbox → ทดสอบครบ → ขออนุมัติก่อนสลับเป็น Live keys

## 7. ค่าใช้จ่ายโดยประมาณ (ตรวจสอบ 17 พ.ย. 2026)

| บริการ | แผน | ค่าใช้จ่าย | หมายเหตุ |
|---|---|---|---|
| Supabase | Free | $0 | 500 MB DB, 50,000 MAU, **หยุดชั่วคราวเมื่อไม่มีการใช้งาน 1 สัปดาห์** — เหมาะกับทดสอบ |
| Supabase | Pro | เริ่ม $25/เดือน | รวม compute credit $10, 100,000 MAU, 8 GB disk; ไม่ถูกหยุดชั่วคราว ([pricing](https://supabase.com/pricing)) |
| Vercel (Hosting) | Hobby | $0 | มีเพดานการใช้งาน; ข้อกำหนดเรื่องการใช้เชิงพาณิชย์ **ยังไม่ได้ตรวจสอบ** — ตรวจก่อนใช้ |
| Vercel (Hosting) | Pro | $20/ผู้พัฒนา/เดือน | รวม usage credit $20 ([pricing](https://vercel.com/pricing)) |
| Payment | Stripe / Opn | ตามรายการ (ดูตารางข้อ 4) | ไม่มีค่ารายเดือนสำหรับแบบมาตรฐาน |
| อีเมล (SMTP) | — | ยังไม่ได้ตรวจสอบ | อีเมลของ Supabase ค่าเริ่มต้นมีข้อจำกัด แนะนำใช้ SMTP ของตัวเองใน production (ตรวจสอบเงื่อนไขก่อน) |
| โดเมน | — | ตามผู้ให้บริการโดเมน | ยังไม่ได้ตรวจสอบ |

## 8. สิ่งที่เจ้าของโปรเจกต์ต้องทำ / อนุมัติ
1. อนุมัติใช้ Supabase (และแผน Free สำหรับทดสอบ / Pro สำหรับใช้งานจริง)
2. เลือกผู้ให้บริการชำระเงิน (Stripe หรือ Opn) และเปิดบัญชีร้านค้า (ต้องใช้เอกสารธุรกิจ)
3. **กำหนดราคา Premium รายเดือน/รายปี และโควตา Free** — ใส่ใน `src/lib/plans.ts` และตาราง `subscription_plans` (ตอนนี้เป็น `null`)
4. สมัคร Supabase → สร้าง project → ส่ง URL และ anon key (service role key ใส่เองใน Hosting เท่านั้น ห้ามส่งในแชต)
5. ตั้งค่า Email templates / SMTP, Site URL และ Redirect URLs ใน Supabase Auth
6. เลือก Hosting และโดเมน
