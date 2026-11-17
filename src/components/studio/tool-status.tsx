import { CheckCircle2, Clock, KeyRound, PauseCircle } from "lucide-react";
import type { ToolStatus } from "@/server/ai/status";

const MAP: Record<ToolStatus, { label: string; cls: string; icon: typeof Clock; hint: string }> = {
  connected: {
    label: "Connected",
    cls: "border-emerald-400/60 bg-emerald-500/10 text-emerald-300",
    icon: CheckCircle2,
    hint: "พร้อมสร้างผลงานจริง",
  },
  "needs-key": {
    label: "Not Connected",
    cls: "border-amber-400/60 bg-amber-500/10 text-amber-300",
    icon: KeyRound,
    hint: "ระบบพร้อมแล้ว แต่ยังไม่ได้ตั้งค่า API key บน server",
  },
  disabled: {
    label: "Not Available",
    cls: "border-stone-500/60 bg-white/5 text-stone-300",
    icon: PauseCircle,
    hint: "ปิดไว้ชั่วคราวจนกว่าระบบสมาชิกและเครดิตจะพร้อม",
  },
  "coming-soon": {
    label: "Coming Soon",
    cls: "border-lux-gold/50 bg-lux-gold/10 text-lux-bright",
    icon: Clock,
    hint: "กำลังพัฒนา ยังสร้างผลงานไม่ได้",
  },
};

export function ToolStatusBadge({ status }: { status: ToolStatus }) {
  const { label, cls, icon: Icon } = MAP[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

export const statusHint = (s: ToolStatus) => MAP[s].hint;

export function StatusBadgeSkeleton() {
  return <span className="inline-block h-5 w-24 animate-pulse rounded-full bg-white/10" aria-label="กำลังตรวจสอบสถานะ" />;
}
