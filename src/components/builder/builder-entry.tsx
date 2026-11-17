"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, Wand2, X } from "lucide-react";
import { categories, type CategorySlug } from "@/data/prompts";
import { getLibraryPrompt } from "@/data/library";
import { BUILDER_CATEGORIES, BUILDER_FIELDS, MODES, visibleIn, type Mode } from "@/data/builder/fields";
import { getPlatform, platformsFor, supportedRatios, type PlatformId } from "@/data/builder/platforms";
import {
  buildPrompt,
  emptySelections,
  isShown,
  placeholdersOf,
  type BuildResult,
  type Selections,
} from "@/lib/builder/engine";
import { createStore } from "@/lib/local-store";
import { getCurrentPlan } from "@/lib/account";
import { can } from "@/lib/plans";
import { savePrompt, trackRecent } from "@/lib/my-prompts";
import { HighlightedPrompt } from "@/components/prompt-card";
import { categoryLabel, detailHref } from "@/components/library/types";
import { FieldControl } from "./field-controls";
import { ResultPanel } from "./result-panel";

const isMode = (x: unknown): x is Mode => x === "beginner" || x === "professional" || x === "advanced";
const modeStore = createStore<Mode>("builder-mode", "beginner", (x) => (isMode(x) ? x : "beginner"));
const CATEGORY_SLUGS = BUILDER_CATEGORIES.map((c) => c.slug);

/**
 * Interactive Prompt Builder (Step 5).
 * URL params: ?prompt=<library id> to customize a library prompt, or ?category=<slug> to start a category.
 */
export function BuilderEntry() {
  const params = useSearchParams();
  const router = useRouter();
  const promptId = params.get("prompt");
  const libraryItem = promptId ? getLibraryPrompt(promptId) : undefined;
  const paramCategory = params.get("category") as CategorySlug | null;
  const category: CategorySlug | null =
    libraryItem?.category ?? (paramCategory && CATEGORY_SLUGS.includes(paramCategory) ? paramCategory : null);

  if (!can(getCurrentPlan(), "prompt-builder")) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-lux-gold/40 bg-lux-card p-8 text-center">
        <Lock className="mx-auto h-10 w-10 text-lux-gold" />
        <p className="mt-4 text-lg font-semibold text-white">แพ็กเกจปัจจุบันยังใช้ Prompt Builder ไม่ได้</p>
        <Link href="/pricing" className="mt-6 inline-block rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black">
          ดูแพ็กเกจ
        </Link>
      </div>
    );
  }

  if (promptId && !libraryItem) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-lux-gold/30 bg-lux-card p-8 text-center">
        <p className="text-lg font-semibold text-white">ไม่พบ Prompt ที่เลือก</p>
        <p className="mt-1 text-sm text-stone-400">ลิงก์อาจไม่ถูกต้อง เลือกประเภทงานเพื่อสร้าง Prompt ใหม่ หรือกลับไปเลือกจากคลัง</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/builder" className="rounded-full bg-lux-gold px-6 py-2.5 font-semibold text-black">
            เริ่มสร้าง Prompt ใหม่
          </Link>
          <Link href="/prompts" className="rounded-full border border-lux-gold/60 px-6 py-2.5 text-stone-200">
            ไปที่ Prompt Library
          </Link>
        </div>
      </div>
    );
  }

  return category ? (
    // key resets all builder state when switching category or source prompt
    <Builder key={`${category}:${promptId ?? ""}`} category={category} libraryId={libraryItem?.id} onChangeCategory={() => router.push("/builder")} />
  ) : (
    <CategoryPicker />
  );
}

function BuilderHeading({ sub }: { sub: string }) {
  return (
    <div className="text-center">
      <p className="text-xs tracking-[0.35em] text-lux-gold sm:text-sm">CRENIX</p>
      <h1 className="mt-3 bg-linear-to-b from-[#fff3c4] via-lux-bright to-lux-gold bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
        Interactive Prompt Builder
      </h1>
      <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-stone-300">{sub}</p>
    </div>
  );
}

function ModeSwitch() {
  const mode = modeStore.use();
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex rounded-full border border-lux-gold/40 p-1" role="radiogroup" aria-label="โหมดการใช้งาน">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => modeStore.set(m.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition sm:px-4 ${
              mode === m.id ? "bg-lux-gold font-semibold text-black" : "text-stone-300 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500">{MODES.find((m) => m.id === mode)?.desc}</p>
    </div>
  );
}

function CategoryPicker() {
  return (
    <div className="mx-auto max-w-5xl">
      <BuilderHeading sub="เลือกประเภทงาน แล้วคลิกเลือกตัวเลือกที่ต้องการ ระบบจะเขียน Prompt ภาษาอังกฤษพร้อมคำแปลไทยให้ ไม่ต้องเขียนเอง" />
      <div className="mt-8">
        <ModeSwitch />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {BUILDER_CATEGORIES.map((c) => {
          const Icon = categories.find((x) => x.slug === c.slug)!.icon;
          return (
            <Link
              key={c.slug}
              href={`/builder?category=${c.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-lux-gold/30 bg-lux-card p-5 transition hover:-translate-y-0.5 hover:border-lux-bright/70 hover:shadow-[0_14px_40px_-12px_rgba(245,199,107,0.35)]"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-lux-gold/10 text-lux-bright">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold text-white group-hover:text-lux-bright">{c.label}</span>
                <span className="block text-sm text-lux-gold">{c.th}</span>
                <span className="mt-0.5 block text-sm text-stone-400">{c.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>
      <p className="mt-8 text-center text-sm text-stone-400">
        หรือเริ่มจาก Prompt สำเร็จรูป —{" "}
        <Link href="/prompts" className="text-lux-gold hover:text-lux-bright hover:underline">
          เลือกจาก Prompt Library แล้วกด Customize This Prompt
        </Link>
      </p>
    </div>
  );
}

function Builder({ category, libraryId, onChangeCategory }: { category: CategorySlug; libraryId?: string; onChangeCategory: () => void }) {
  const mode = modeStore.use();
  const item = libraryId ? getLibraryPrompt(libraryId) : undefined;
  const platforms = platformsFor(category);
  const [platformId, setPlatformId] = useState<PlatformId>(platforms[0].id);
  const platform = getPlatform(platformId);

  const [sel, setSel] = useState<Selections>(emptySelections);
  const [fills, setFills] = useState<string[]>([]);
  const [variant, setVariant] = useState(0);
  const [result, setResult] = useState<BuildResult | null>(null);
  const [en, setEn] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [savedTitle, setSavedTitle] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const blanks = useMemo(() => (item ? placeholdersOf(item.promptEn) : []), [item]);
  const base = item ? { en: item.promptEn, th: item.promptTh, fills } : undefined;
  const inputKey = JSON.stringify([sel, fills, platformId, mode]);
  const stale = result !== null && inputKey !== generatedKey;

  // Aspect ratios: show only what the platform documents (all, when unknown)
  const ratios = supportedRatios(platform);
  const fields = BUILDER_FIELDS[category].filter((f) => visibleIn(f.level, mode) && isShown(f, sel));

  // Values for fields hidden by the current mode must not leak into the prompt
  function visibleSelections(): Selections {
    const allowed = new Set(BUILDER_FIELDS[category].filter((f) => visibleIn(f.level, mode)).map((f) => f.id));
    const pickAllowed = (r: Record<string, string>) => Object.fromEntries(Object.entries(r).filter(([k]) => allowed.has(k)));
    return { values: pickAllowed(sel.values), custom: pickAllowed(sel.custom) };
  }

  function generate(nextVariant = variant) {
    const r = buildPrompt(category, visibleSelections(), platform, nextVariant, base);
    setResult(r);
    setEn(r.en);
    setGeneratedKey(inputKey);
    setSavedTitle(null);
    if (item) trackRecent("library", item.id, "customize");
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function changePlatform(id: PlatformId) {
    setPlatformId(id);
    const nextRatios = supportedRatios(getPlatform(id));
    const aspect = sel.values.aspect;
    if (category === "video" && aspect && nextRatios && !nextRatios.includes(aspect)) {
      setSel((s) => ({ ...s, values: { ...s.values, aspect: "" } }));
      setNotice(`${getPlatform(id).name} ไม่มีสัดส่วน ${aspect} ในเอกสาร จึงล้างตัวเลือกสัดส่วนภาพ — กรุณาเลือกใหม่`);
    } else setNotice(null);
  }

  function reset() {
    setSel(emptySelections());
    setFills([]);
    setResult(null);
    setEn("");
    setVariant(0);
    setSavedTitle(null);
    setNotice(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function save(title: string) {
    if (!result) return;
    const saved = savePrompt({
      title: title || defaultTitle,
      category,
      promptEn: en,
      promptTh: result.th,
      source: { type: "builder", libraryId: item?.id, builder: { sel: visibleSelections(), platformId, mode, fills } },
      tags: [platform.name, mode],
    });
    setSavedTitle(saved.title);
  }

  const catInfo = BUILDER_CATEGORIES.find((c) => c.slug === category)!;
  const defaultTitle = item ? `${item.title} (Custom)` : `${catInfo.label} Prompt`;
  const plannerHref = result?.planner
    ? `/planner?${new URLSearchParams({
        total: String(result.planner.totalSeconds),
        platform: platformId,
        topic: sel.values.subjectDetail || sel.custom.subject || "",
        type: sel.values.videoType && sel.values.videoType !== "__custom" ? sel.values.videoType : "",
        style: sel.values.style ?? "",
      }).toString()}`
    : undefined;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onChangeCategory} className="flex items-center gap-2 text-sm text-lux-gold hover:text-lux-bright">
          <ArrowLeft className="h-4 w-4" /> เปลี่ยนประเภทงาน
        </button>
        <ModeSwitch />
      </div>

      <h1 className="mt-6 text-3xl font-extrabold text-white sm:text-4xl">
        {catInfo.label} <span className="text-lux-gold">Prompt Builder</span>
      </h1>
      <p className="mt-1 text-stone-400">{catInfo.th} · คลิกเลือกเฉพาะที่ต้องการ ตัวเลือกที่ไม่เลือกจะไม่ถูกใส่ใน Prompt</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        {/* Form */}
        <div ref={formRef} className="min-w-0 scroll-mt-24 space-y-6">
          {item && (
            <section className="rounded-2xl border border-lux-bright/50 bg-lux-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-lux-gold">กำลังปรับแต่งจาก Prompt Library · {categoryLabel(item.category)}</p>
                  <h2 className="text-lg font-bold text-white">{item.title}</h2>
                </div>
                <Link href={detailHref(item)} className="text-sm text-stone-400 hover:text-lux-bright">
                  ดูรายละเอียด
                </Link>
              </div>
              <div className="mt-3 rounded-xl bg-lux-ink p-4 text-sm leading-relaxed text-stone-300">
                <HighlightedPrompt text={item.promptEn} />
              </div>
              {blanks.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-semibold text-white">เติมคำในช่อง [ ] (แนะนำภาษาอังกฤษ)</p>
                  {blanks.map((b, i) => (
                    <label key={i} className="block">
                      <span className="text-xs text-stone-400">[{b}]</span>
                      <input
                        value={fills[i] ?? ""}
                        onChange={(e) =>
                          setFills((f) => {
                            const next = [...f];
                            next[i] = e.target.value;
                            return next;
                          })
                        }
                        placeholder={b.split(/,\s*e\.g\.\s*/)[1] ?? b}
                        className="mt-1 w-full rounded-xl border border-lux-gold/35 bg-lux-ink px-4 py-2 text-white placeholder:text-stone-600 focus:border-lux-bright focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-stone-500">ตัวเลือกด้านล่างเป็นตัวเลือกเสริม จะถูกเพิ่มเป็น “Additional direction” ต่อท้าย Prompt</p>
            </section>
          )}

          {/* Platform */}
          <fieldset>
            <legend className="mb-2.5 text-sm">
              <span className="font-semibold text-white">AI Platform</span> <span className="text-stone-400">แพลตฟอร์มที่จะใช้</span>
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="AI Platform">
              {platforms.map((pf) => (
                <button
                  key={pf.id}
                  type="button"
                  role="radio"
                  aria-checked={platformId === pf.id}
                  onClick={() => changePlatform(pf.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    platformId === pf.id
                      ? "border-lux-bright bg-lux-gold/20 font-semibold text-lux-bright"
                      : "border-lux-gold/35 text-stone-200 hover:border-lux-bright"
                  }`}
                >
                  {pf.name}
                </button>
              ))}
            </div>
            {platforms.length === 1 && <p className="mt-2 text-xs text-stone-500">Prompt ประเภทนี้ใช้กับ AI แชตทั่วไปได้ เช่น ChatGPT, Claude, Gemini</p>}
            {notice && (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200" role="status">
                <span className="flex-1">{notice}</span>
                <button type="button" onClick={() => setNotice(null)} aria-label="ปิดข้อความ">
                  <X className="h-4 w-4" />
                </button>
              </p>
            )}
          </fieldset>

          {fields.map((f) => (
            <FieldControl
              key={f.id}
              field={f}
              sel={sel}
              onValue={(id, value) => setSel((s) => ({ ...s, values: { ...s.values, [id]: value } }))}
              onCustom={(id, value) => setSel((s) => ({ ...s, custom: { ...s.custom, [id]: value } }))}
              options={f.id === "aspect" && category === "video" && ratios ? f.options?.filter((o) => ratios.includes(o.id)) : undefined}
              note={
                f.id === "aspect" && category === "video"
                  ? ratios
                    ? `แสดงเฉพาะสัดส่วนที่ ${platform.name} ระบุในเอกสาร (${platform.aspectRatios.status === "verified" ? "Verified" : "Not Verified"})`
                    : "ไม่ทราบสัดส่วนที่รองรับ จึงแสดงทุกตัวเลือก — ตรวจสอบในแอปที่ใช้อีกครั้ง"
                  : undefined
              }
            />
          ))}

          <div className="sticky bottom-3 z-20 flex gap-3 rounded-full border border-lux-gold/30 bg-lux-ink/90 p-2 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
            <button
              type="button"
              onClick={() => generate()}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-6 py-3 font-semibold text-black shadow-[0_0_20px_rgba(245,199,107,0.3)] transition hover:brightness-110"
            >
              <Wand2 className="h-5 w-5" /> {result ? "Update Prompt" : "Generate Prompt"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-lux-gold/50 px-5 py-3 text-sm text-stone-200 transition hover:border-rose-400 hover:text-rose-200"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Result */}
        <div ref={resultRef} className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          {result ? (
            <ResultPanel
              result={result}
              platform={platform}
              stale={stale}
              editable={mode === "advanced"}
              en={en}
              onEnChange={setEn}
              onSave={save}
              savedTitle={savedTitle}
              defaultTitle={defaultTitle}
              onEdit={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              onGenerateAgain={() => {
                const next = variant + 1;
                setVariant(next);
                generate(next);
              }}
              onReset={reset}
              plannerHref={plannerHref}
              aiKind={category === "content" || category === "video-editing" ? category : undefined}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-lux-gold/30 bg-lux-card p-8 text-center">
              <Wand2 className="mx-auto h-10 w-10 text-lux-gold" />
              <p className="mt-4 font-semibold text-white">Prompt ของคุณจะแสดงที่นี่</p>
              <p className="mt-1 text-sm text-stone-400">เลือกตัวเลือกทางซ้าย แล้วกด Generate Prompt</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
