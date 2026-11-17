import Link from "next/link";
import { ArrowRight, AudioLines, Clapperboard, FilePenLine, Image as ImageIcon, Video, type LucideIcon } from "lucide-react";
import { STUDIO_TOOLS, type StudioToolId } from "@/data/studio-tools";
import type { ToolStatus } from "@/server/ai/status";
import { getToolStatuses } from "@/server/ai/status";
import { statusHint, StatusBadgeSkeleton, ToolStatusBadge } from "./tool-status";

export const TOOL_ICONS: Record<StudioToolId, LucideIcon> = {
  image: ImageIcon,
  video: Video,
  audio: AudioLines,
  content: FilePenLine,
  editor: Clapperboard,
};

/** Server component: reads real connection status per request. */
export async function ToolGrid() {
  const statuses = await getToolStatuses();
  return <ToolGridView statuses={statuses} />;
}

export function ToolGridSkeleton() {
  return <ToolGridView statuses={null} />;
}

function ToolGridView({ statuses }: { statuses: Record<StudioToolId, ToolStatus> | null }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {STUDIO_TOOLS.map((t, i) => {
        const Icon = TOOL_ICONS[t.id];
        const status = statuses?.[t.id];
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-lux-gold/30 bg-lux-card p-6 transition duration-300 hover:-translate-y-1 hover:border-lux-bright/70 hover:shadow-[0_18px_50px_-14px_rgba(245,199,107,0.4)] ${
              i === 0 ? "lg:col-span-2" : ""
            }`}
          >
            <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-lux-gold/10 blur-3xl transition group-hover:bg-lux-gold/20" />
            <div className="relative flex items-start justify-between gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-lux-gold/40 bg-linear-to-b from-lux-gold/20 to-transparent text-lux-bright">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
              </span>
              {status ? <ToolStatusBadge status={status} /> : <StatusBadgeSkeleton />}
            </div>
            <h3 className="relative mt-5 text-xl font-bold text-white group-hover:text-lux-bright">{t.name}</h3>
            <p className="relative text-sm text-lux-gold">{t.th}</p>
            <p className="relative mt-2 text-sm leading-relaxed text-stone-400">{t.desc}</p>
            <p className="relative mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
              <span className="text-xs text-stone-500">{status ? statusHint(status) : "กำลังตรวจสอบสถานะ..."}</span>
              <span className="flex shrink-0 items-center gap-1 font-semibold text-lux-bright">
                {status === "connected" ? "เริ่มสร้าง" : "ดูรายละเอียด"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </p>
          </Link>
        );
      })}
    </div>
  );
}
