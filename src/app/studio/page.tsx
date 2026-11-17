import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Coins, FilePenLine, Film, FolderOpen, LayoutGrid, Sparkles, Wand2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageGlow, SiteFooter } from "@/components/site-footer";
import { RelatedPrompts } from "@/components/library/related-prompts";
import { sortPrompts } from "@/components/library/types";
import { ToolGrid, ToolGridSkeleton } from "@/components/studio/tool-grid";
import { MyProjectsSummary, RecentCreations } from "@/components/studio/dashboard-widgets";
import { libraryPrompts } from "@/data/library";

export const metadata: Metadata = {
  title: "Create with CRENIX AI — Creative Dashboard",
  description: "Create images, videos, audio and professional content in one creative workspace.",
  alternates: { canonical: "/studio" },
};

/** Tools that work today (no usage statistics exist yet, so this is not a popularity ranking). */
const READY_TOOLS = [
  { icon: FilePenLine, label: "AI Content Studio", desc: "เขียนคอนเทนต์ด้วย AI", href: "/studio/content" },
  { icon: Wand2, label: "Prompt Builder", desc: "สร้าง Prompt ด้วยการคลิกเลือก", href: "/builder" },
  { icon: Film, label: "Long Video Planner", desc: "วางแผนวิดีโอยาวเป็นฉาก", href: "/planner" },
  { icon: LayoutGrid, label: "Prompt Library", desc: "Prompt สำเร็จรูปพร้อมใช้", href: "/prompts" },
];

const GUIDE = [
  { title: "เลือกเครื่องมือ", desc: "เลือก Studio ตามงานที่ต้องการ: ภาพ วิดีโอ เสียง คอนเทนต์ หรือตัดต่อ" },
  { title: "เลือกตัวเลือก", desc: "คลิกเลือกสไตล์ โทน และรายละเอียด หรือเริ่มจาก Prompt Template สำเร็จรูป" },
  { title: "สร้างผลงาน", desc: "กด Generate ระบบจะสร้างด้วย AI บนเซิร์ฟเวอร์ที่ปลอดภัย" },
  { title: "ตรวจและนำไปใช้", desc: "ตรวจข้อเท็จจริง แล้วคัดลอกหรือดาวน์โหลด ผลงานจะอยู่ใน Recent Creations" },
];

export default function StudioPage() {
  const featured = sortPrompts(libraryPrompts, "recommended").slice(0, 3);

  return (
    <div className="relative flex flex-1 flex-col overflow-x-hidden bg-lux-ink text-stone-100">
      <PageGlow />
      <SiteHeader active="studio" />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-12 pb-20 sm:px-6 lg:pt-16">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-3 text-xs tracking-[0.35em] text-lux-gold sm:text-sm">
            <span className="h-px w-8 bg-lux-gold/60" />
            AI CREATIVE STUDIO
            <span className="h-px w-8 bg-lux-gold/60" />
          </p>
          <h1 className="mt-4 bg-linear-to-b from-[#fff3c4] via-lux-bright to-lux-gold bg-clip-text text-4xl leading-tight font-extrabold text-transparent sm:text-6xl">
            CREATE WITH CRENIX AI
          </h1>
          <p className="mt-4 text-lg text-[#f5f0e6] sm:text-xl">
            Create images, videos, audio and professional content in one creative workspace.
          </p>
          <p className="mt-2 text-stone-400">สร้างภาพ วิดีโอ เสียง และคอนเทนต์มืออาชีพ ได้ในที่เดียว</p>
        </header>

        {/* Tools */}
        <section className="mt-12" aria-labelledby="tools-h">
          <h2 id="tools-h" className="sr-only">
            เครื่องมือ AI
          </h2>
          <Suspense fallback={<ToolGridSkeleton />}>
            <ToolGrid />
          </Suspense>
        </section>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Recent creations */}
          <section aria-labelledby="recent-h" className="min-w-0">
            <SectionTitle id="recent-h" icon={Sparkles} title="Recent Creations" sub="ผลงานล่าสุดที่สร้างด้วย AI" />
            <RecentCreations />
          </section>

          <div className="space-y-8">
            {/* Credits */}
            <section aria-labelledby="credits-h">
              <SectionTitle id="credits-h" icon={Coins} title="Available Credits" />
              <div className="rounded-2xl border border-lux-gold/30 bg-linear-to-b from-[#1d1709] to-lux-card p-5">
                <p className="text-lg font-semibold text-white">ระบบเครดิตกำลังเตรียม</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-400">
                  เครดิตจะเปิดใช้พร้อมระบบสมาชิก ใช้สำหรับสร้างภาพ วิดีโอ และเสียง ซึ่งมีต้นทุนตามการใช้งานจริง
                </p>
                <Link href="/pricing" className="mt-4 inline-block text-sm font-semibold text-lux-bright hover:underline">
                  ดูแพ็กเกจ →
                </Link>
              </div>
            </section>

            {/* My projects */}
            <section aria-labelledby="projects-h">
              <SectionTitle id="projects-h" icon={FolderOpen} title="My Projects" />
              <MyProjectsSummary />
            </section>
          </div>
        </div>

        {/* Popular tools (ready now) */}
        <section className="mt-14" aria-labelledby="popular-h">
          <SectionTitle id="popular-h" icon={Wand2} title="Popular Tools" sub="เครื่องมือที่ใช้งานได้แล้วตอนนี้" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {READY_TOOLS.map(({ icon: Icon, label, desc, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl border border-lux-gold/25 bg-lux-card p-4 transition hover:border-lux-bright/60 hover:bg-lux-gold/5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lux-gold/10 text-lux-bright">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-white">{label}</span>
                  <span className="block text-xs text-stone-400">{desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured templates */}
        <section className="mt-14" aria-labelledby="featured-h">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionTitle id="featured-h" icon={LayoutGrid} title="Featured Prompt Templates" sub="Prompt แนะนำจากคลัง" />
            <Link href="/prompts" className="mb-4 text-sm font-semibold text-lux-gold hover:text-lux-bright">
              ดูทั้งหมด →
            </Link>
          </div>
          <RelatedPrompts items={featured} />
        </section>

        {/* Usage guide */}
        <section className="mt-14" aria-labelledby="guide-h">
          <SectionTitle id="guide-h" icon={BookOpen} title="Usage Guide" sub="เริ่มต้นใช้งานใน 4 ขั้นตอน" />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDE.map((g, i) => (
              <li key={g.title} className="rounded-2xl border border-lux-gold/20 bg-lux-card p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-lux-gold font-bold text-black">{i + 1}</span>
                <p className="mt-3 font-semibold text-white">{g.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-400">{g.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-stone-400">
            ดูคู่มือเพิ่มเติมที่{" "}
            <Link href="/tutorials" className="text-lux-gold hover:text-lux-bright hover:underline">
              Tutorials
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function SectionTitle({ id, icon: Icon, title, sub }: { id: string; icon: typeof Sparkles; title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 id={id} className="flex items-center gap-2 text-xl font-bold text-white sm:text-2xl">
        <Icon className="h-5 w-5 text-lux-gold" /> {title}
      </h2>
      {sub && <p className="text-sm text-stone-400">{sub}</p>}
    </div>
  );
}
