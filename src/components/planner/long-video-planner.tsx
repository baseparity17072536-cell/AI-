"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Clapperboard,
  FolderOpen,
  Info,
  Plus,
  Save,
  Scale,
  Trash2,
  Wand2,
} from "lucide-react";
import { CopyPromptButton } from "@/components/library/prompt-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusPill } from "@/components/builder/result-panel";
import { clipLimit, getPlatform, platformsFor, STATUS_LABEL, supportedRatios, type PlatformId } from "@/data/builder/platforms";
import type { Option } from "@/data/builder/fields";
import {
  ASPECTS,
  clipsFor,
  formatDuration,
  generateScenes,
  MAX_TOTAL_SECONDS,
  MUSIC,
  projectText,
  rebalance,
  scenePrompt,
  STYLES,
  sumSeconds,
  timecode,
  TONES,
  TOTAL_PRESETS_MIN,
  VIDEO_TYPES,
  VOICE_CHARACTERS,
  VOICE_LANGUAGES,
  type Project,
  type Scene,
} from "@/lib/planner/engine";
import { deleteProject, draftStore, newProject, projectsStore, saveProject, sceneId } from "@/lib/planner/store";

const input =
  "w-full rounded-xl border border-lux-gold/35 bg-lux-ink px-3.5 py-2.5 text-white placeholder:text-stone-500 focus:border-lux-bright focus:ring-2 focus:ring-lux-bright/30 focus:outline-none";
const chipOn = "border-lux-bright bg-linear-to-b from-lux-bright to-lux-gold font-semibold text-black";
const chipOff = "border-lux-gold/35 text-stone-200 hover:border-lux-bright hover:bg-lux-gold/10";
const VIDEO_PLATFORMS = platformsFor("video");

export function LongVideoPlanner() {
  const params = useSearchParams();
  const router = useRouter();
  const draft = draftStore.use();
  const saved = projectsStore.use();
  const [confirm, setConfirm] = useState<{ title: string; message: string; label: string; run: () => void } | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Prefill from the Prompt Builder (?total=&platform=&topic=&type=&style=), then clean the URL
  useEffect(() => {
    const total = Number(params.get("total"));
    if (!total) return;
    const pid = params.get("platform") as PlatformId | null;
    draftStore.set(
      newProject({
        totalSeconds: Math.min(MAX_TOTAL_SECONDS, Math.max(1, Math.round(total))),
        platformId: pid && VIDEO_PLATFORMS.some((p) => p.id === pid) ? pid : "runway",
        topic: params.get("topic") ?? "",
        videoType: params.get("type") ?? "",
        style: params.get("style") ?? "",
      }),
    );
    router.replace("/planner", { scroll: false });
  }, [params, router]);

  const p = draft ?? newProject();
  const update = (patch: Partial<Project>) => {
    setSavedAt(null);
    draftStore.set({ ...p, ...patch, updatedAt: new Date().toISOString() });
  };
  const setScenes = (scenes: Scene[]) => update({ scenes });

  const platform = getPlatform(p.platformId);
  const limit = clipLimit(platform);
  const total = sumSeconds(p.scenes);
  const diff = total - p.totalSeconds;
  const balanced = p.scenes.length > 0 && diff === 0;
  const ratios = supportedRatios(platform);
  const aspectOptions = ratios ? ASPECTS.filter((a) => ratios.includes(a.id)) : ASPECTS;

  function setTotal(seconds: number) {
    const t = Math.min(MAX_TOTAL_SECONDS, Math.max(1, Math.round(seconds)));
    // Keep scenes consistent with the new total automatically
    update({ totalSeconds: t, scenes: p.scenes.length ? rebalance(p.scenes, t) : p.scenes });
  }

  function changePlatform(id: PlatformId) {
    const r = supportedRatios(getPlatform(id));
    update({ platformId: id, aspect: r && p.aspect && !r.includes(p.aspect) ? "" : p.aspect });
  }

  function generate() {
    const run = () => setScenes(generateScenes(p.totalSeconds, p.topic, sceneId));
    if (p.scenes.length) {
      setConfirm({ title: "สร้างแผนฉากใหม่?", message: "ฉากที่แก้ไขไว้ทั้งหมดจะถูกแทนที่ด้วยแผนใหม่", label: "สร้างใหม่", run });
    } else run();
  }

  const patchScene = (id: string, patch: Partial<Scene>) => setScenes(p.scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...p.scenes];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setScenes(next);
  };
  const addScene = () =>
    setScenes([
      ...p.scenes,
      { id: sceneId(), title: `Scene ${p.scenes.length + 1}`, seconds: limit, visualEn: "", visualTh: "", camera: "", voice: "", sfx: "" },
    ]);

  // Start time of each scene (prefix sums)
  const starts = p.scenes.map((_, i) => sumSeconds(p.scenes.slice(0, i)));

  return (
    <div className="mx-auto max-w-6xl">
      <header className="text-center">
        <p className="text-xs tracking-[0.35em] text-lux-gold sm:text-sm">CRENIX</p>
        <h1 className="mt-3 bg-linear-to-b from-[#fff3c4] via-lux-bright to-lux-gold bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
          Long Video Planner
        </h1>
        <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-stone-300">
          วางแผนวิดีโอยาว 1–20 นาที โดยแบ่งเป็นฉาก และแต่ละฉากเป็นคลิปสั้นตามที่ AI สร้างได้จริง แล้วนำไปตัดต่อรวมกัน
        </p>
      </header>

      <p className="mx-auto mt-6 flex max-w-3xl items-start gap-2 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        AI สร้างวิดีโอยังสร้างวิดีโอหลายนาทีในครั้งเดียวไม่ได้ ต้องสร้างทีละคลิปสั้น ๆ แล้วตัดต่อรวม — Planner นี้คำนวณจำนวนคลิปให้ตามขีดจำกัดของแพลตฟอร์ม
      </p>

      {/* Setup */}
      <section className="mt-8 grid gap-6 rounded-3xl border border-lux-gold/30 bg-lux-card p-5 sm:p-7 lg:grid-cols-2" aria-label="ตั้งค่าโปรเจกต์">
        <label className="block lg:col-span-2">
          <span className="text-sm font-semibold text-white">ชื่อโปรเจกต์</span>
          <input className={`${input} mt-2`} value={p.title} onChange={(e) => update({ title: e.target.value })} />
        </label>

        <div className="lg:col-span-2">
          <p className="text-sm font-semibold text-white">ความยาวรวม</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {TOTAL_PRESETS_MIN.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={p.totalSeconds === m * 60}
                onClick={() => setTotal(m * 60)}
                className={`rounded-full border px-4 py-2 text-sm transition ${p.totalSeconds === m * 60 ? chipOn : chipOff}`}
              >
                {m} นาที
              </button>
            ))}
            <label className="flex items-center gap-2 text-sm text-stone-400">
              กำหนดเอง
              <input
                type="number"
                min={0.1}
                max={60}
                step={0.5}
                value={+(p.totalSeconds / 60).toFixed(2)}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  if (m > 0) setTotal(m * 60);
                }}
                className={`${input} w-24`}
                aria-label="ความยาวรวม (นาที)"
              />
              นาที
            </label>
          </div>
          <p className="mt-2 text-xs text-stone-500">= {formatDuration(p.totalSeconds)} · สูงสุด 60 นาที</p>
        </div>

        <TextInput label="หัวข้อวิดีโอ" hint="แนะนำภาษาอังกฤษ เช่น a luxury watch brand" value={p.topic} onChange={(topic) => update({ topic })} />
        <TextInput label="กลุ่มเป้าหมาย" value={p.audience} onChange={(audience) => update({ audience })} placeholder="เช่น นักเดินทางวัย 25–40" />
        <Chips label="ประเภทวิดีโอ" options={VIDEO_TYPES} value={p.videoType} onChange={(videoType) => update({ videoType })} />
        <Chips label="โทน" options={TONES} value={p.tone} onChange={(tone) => update({ tone })} />
        <label className="block lg:col-span-2">
          <span className="text-sm font-semibold text-white">เรื่องราว / โครงเรื่อง</span>
          <textarea
            rows={3}
            className={`${input} mt-2 resize-y`}
            value={p.story}
            onChange={(e) => update({ story: e.target.value })}
            placeholder="เล่าสั้น ๆ ว่าวิดีโอเริ่ม-กลาง-จบอย่างไร"
          />
        </label>
        <Chips label="สไตล์ภาพ" options={STYLES} value={p.style} onChange={(style) => update({ style })} />
        <div>
          <p className="text-sm font-semibold text-white">AI Platform</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VIDEO_PLATFORMS.map((pf) => (
              <button
                key={pf.id}
                type="button"
                aria-pressed={p.platformId === pf.id}
                onClick={() => changePlatform(pf.id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${p.platformId === pf.id ? chipOn : chipOff}`}
              >
                {pf.name}
              </button>
            ))}
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-400">
            ความยาวต่อคลิป: {platform.clipSeconds.value ? `สูงสุด ${limit} วินาที` : `ไม่ทราบ — วางแผนคลิปละ ${limit} วินาทีเพื่อความปลอดภัย`}
            <StatusPill status={platform.clipSeconds.status} />
          </p>
        </div>
        <Chips label="สัดส่วนภาพ" options={aspectOptions} value={p.aspect} onChange={(aspect) => update({ aspect })} />
        <Chips label="ดนตรี" options={MUSIC} value={p.music} onChange={(music) => update({ music })} />
        <Chips label="ภาษาเสียงพูด" options={VOICE_LANGUAGES} value={p.voiceLanguage} onChange={(voiceLanguage) => update({ voiceLanguage })} />
        <Chips label="ลักษณะเสียง" options={VOICE_CHARACTERS} value={p.voiceCharacter} onChange={(voiceCharacter) => update({ voiceCharacter })} />
        {p.voiceLanguage && platform.languages.status !== "verified" && (
          <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-stone-300 lg:col-span-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-lux-gold" />
            ยังไม่ยืนยันว่า {platform.name} สร้างเสียงพูดภาษาที่เลือกได้ ({STATUS_LABEL[platform.languages.status]}) —
            แนะนำสร้างเสียงพูดแยกด้วย Text-to-Speech หรืออัดเสียงเอง แล้วใส่ตอนตัดต่อ บทพูดของแต่ละฉากจะแยกไว้ให้คัดลอก
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
          <button
            type="button"
            onClick={generate}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-6 py-3 font-semibold text-black shadow-[0_0_20px_rgba(245,199,107,0.3)] transition hover:brightness-110"
          >
            <Wand2 className="h-5 w-5" /> {p.scenes.length ? "สร้างแผนฉากใหม่" : "สร้างแผนฉาก"}
          </button>
          <button
            type="button"
            onClick={() =>
              setConfirm({
                title: "เริ่มโปรเจกต์ใหม่?",
                message: "ข้อมูลที่ยังไม่ได้กด Save Project จะหายไป",
                label: "เริ่มใหม่",
                run: () => draftStore.set(newProject()),
              })
            }
            className="rounded-full border border-lux-gold/50 px-5 py-3 text-sm text-stone-200 hover:bg-lux-gold/10"
          >
            โปรเจกต์ใหม่
          </button>
        </div>
      </section>

      {/* Timeline */}
      {p.scenes.length > 0 && (
        <section className="mt-10" aria-labelledby="scenes-h">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="scenes-h" className="text-2xl font-bold text-white">
                Scenes <span className="text-lux-gold">({p.scenes.length})</span>
              </h2>
              <p className="text-sm text-stone-400">
                รวม {formatDuration(total)} จากเป้าหมาย {formatDuration(p.totalSeconds)} · ทั้งหมด{" "}
                {p.scenes.reduce((a, s) => a + clipsFor(s.seconds, limit), 0)} คลิป
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyPromptButton text={projectText(p, "en")} label="Copy ทั้งโปรเจกต์ (EN)" variant="subtle" className={balanced ? "" : "pointer-events-none opacity-40"} />
              <CopyPromptButton text={projectText(p, "th")} label="Copy ทั้งโปรเจกต์ (TH)" variant="subtle" className={balanced ? "" : "pointer-events-none opacity-40"} />
            </div>
          </div>

          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            {p.scenes.map((s, i) => (
              <div
                key={s.id}
                style={{ width: `${(s.seconds / Math.max(total, p.totalSeconds)) * 100}%` }}
                className={i % 2 ? "bg-lux-gold" : "bg-lux-bright"}
                title={s.title}
              />
            ))}
          </div>

          {diff !== 0 ? (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-rose-400/50 bg-rose-500/10 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <p className="flex items-start gap-2 text-sm text-rose-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                เวลารวมของฉาก{diff > 0 ? "เกิน" : "ขาด"}เป้าหมาย {formatDuration(Math.abs(diff))} — ต้องปรับให้เท่ากันก่อน Copy ทั้งโปรเจกต์หรือบันทึก
              </p>
              <button
                type="button"
                onClick={() => setScenes(rebalance(p.scenes, p.totalSeconds))}
                className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-lux-gold px-4 py-2 text-sm font-semibold text-black"
              >
                <Scale className="h-4 w-4" /> ปรับเวลาให้พอดีอัตโนมัติ
              </button>
            </div>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-300">
              <Check className="h-4 w-4" /> เวลารวมตรงกับเป้าหมายแล้ว
            </p>
          )}

          <ol className="mt-6 space-y-5">
            {p.scenes.map((s, i) => {
              const start = starts[i];
              const sp = scenePrompt(p, s, i);
              return (
                <li key={s.id} className="rounded-2xl border border-lux-gold/25 bg-lux-card p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lux-gold font-bold text-black">{i + 1}</span>
                    <input
                      value={s.title}
                      onChange={(e) => patchScene(s.id, { title: e.target.value })}
                      aria-label={`ชื่อฉากที่ ${i + 1}`}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-semibold text-white hover:border-lux-gold/30 focus:border-lux-bright focus:outline-none"
                    />
                    <span className="font-mono text-xs text-stone-400">
                      {timecode(start)}–{timecode(start + s.seconds)}
                    </span>
                    <label className="flex items-center gap-1.5 text-sm text-stone-400">
                      <input
                        type="number"
                        min={1}
                        value={s.seconds}
                        onChange={(e) => patchScene(s.id, { seconds: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
                        className={`${input} w-20 py-1.5`}
                        aria-label={`ความยาวฉากที่ ${i + 1} (วินาที)`}
                      />
                      วินาที
                    </label>
                    <div className="flex gap-1">
                      <IconBtn label="เลื่อนขึ้น" onClick={() => move(i, -1)} disabled={i === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn label="เลื่อนลง" onClick={() => move(i, 1)} disabled={i === p.scenes.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        label="ลบฉาก"
                        danger
                        onClick={() =>
                          setConfirm({
                            title: `ลบฉาก "${s.title}"?`,
                            message: "ลบแล้วเวลารวมจะลดลง สามารถกดปรับเวลาให้พอดีได้ภายหลัง",
                            label: "ลบฉาก",
                            run: () => setScenes(p.scenes.filter((x) => x.id !== s.id)),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">
                    {sp.clips} คลิป × ~{sp.perClip} วินาที (ขีดจำกัด {platform.name} {limit} วินาที/คลิป)
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Area label="ภาพในฉาก (English → ใช้ใน Prompt)" value={s.visualEn} onChange={(visualEn) => patchScene(s.id, { visualEn })} />
                    <Area label="ภาพในฉาก (ภาษาไทย → ใช้ในคำแปล)" value={s.visualTh} onChange={(visualTh) => patchScene(s.id, { visualTh })} />
                    <TextInput label="การเคลื่อนกล้อง" value={s.camera} onChange={(camera) => patchScene(s.id, { camera })} placeholder="เช่น slow push-in" />
                    <TextInput label="เสียงประกอบ / SFX" value={s.sfx} onChange={(sfx) => patchScene(s.id, { sfx })} placeholder="เช่น ocean waves, soft wind" />
                    <div className="md:col-span-2">
                      <Area label="เสียงพูด / บทสนทนา" value={s.voice} onChange={(voice) => patchScene(s.id, { voice })} rows={2} />
                    </div>
                  </div>

                  <details className="group mt-4 rounded-xl border border-white/10 bg-lux-ink">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-lux-bright">ดู Prompt ของฉากนี้</summary>
                    <div className="space-y-3 px-4 pb-4 text-sm leading-relaxed">
                      <p className="text-stone-100">{sp.en}</p>
                      <p className="text-stone-400">{sp.th}</p>
                      {sp.voice && <p className="text-stone-300">🎙 {sp.voice}</p>}
                    </div>
                  </details>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CopyPromptButton text={sp.en} label="Copy EN" variant="subtle" />
                    <CopyPromptButton text={sp.th} label="Copy TH" variant="subtle" />
                    {sp.voice && <CopyPromptButton text={s.voice} label="Copy บทพูด" variant="subtle" />}
                  </div>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={addScene}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-lux-gold/50 py-4 text-lux-bright transition hover:bg-lux-gold/10"
          >
            <Plus className="h-5 w-5" /> เพิ่มฉาก
          </button>

          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              disabled={!balanced}
              onClick={() => {
                const s = saveProject(p);
                draftStore.set(s);
                setSavedAt(s.updatedAt);
              }}
              className="flex items-center gap-2 rounded-full bg-linear-to-b from-lux-bright to-lux-gold px-8 py-3 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savedAt ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />} {savedAt ? "บันทึกแล้ว" : "Save Project"}
            </button>
            {!balanced && <p className="text-xs text-stone-500">ปรับเวลารวมให้ตรงก่อนบันทึก</p>}
          </div>
        </section>
      )}

      {/* Editing guide */}
      <section className="mt-12 rounded-3xl border border-lux-gold/25 bg-lux-card p-6" aria-labelledby="guide-h">
        <h2 id="guide-h" className="flex items-center gap-2 text-lg font-bold text-white">
          <Clapperboard className="h-5 w-5 text-lux-gold" /> วิธีนำคลิปไปตัดต่อรวมกัน
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-300">
          <li>สร้างคลิปทีละฉากตามลำดับ ใช้ Prompt ของแต่ละฉาก และสร้างตามจำนวนคลิปที่ระบุ</li>
          <li>ตั้งชื่อไฟล์ตามเลขฉากและเลขคลิป เช่น S01_C01.mp4 เพื่อเรียงง่าย</li>
          <li>ใช้สไตล์ แสง และสัดส่วนภาพเดียวกันทุกฉาก ถ้าแพลตฟอร์มรองรับ Image-to-Video ให้ใช้เฟรมสุดท้ายของคลิปก่อนหน้าเป็นภาพเริ่มต้น เพื่อให้ต่อเนื่อง</li>
          <li>นำคลิปทั้งหมดเข้าโปรแกรมตัดต่อ (CapCut, Premiere Pro, DaVinci Resolve) เรียงตาม Timecode ในแผน</li>
          <li>ใส่เสียงพูดที่สร้างแยก (Text-to-Speech หรืออัดเอง) และดนตรีประกอบเป็นแทร็กยาวแทร็กเดียว ให้เสียงต่อเนื่องทั้งเรื่อง</li>
          <li>ใส่ทรานซิชันสั้น ๆ ระหว่างฉาก ปรับสีให้เข้ากัน แล้ว Export ตามสัดส่วนที่เลือก</li>
        </ol>
      </section>

      {/* Saved projects */}
      <section className="mt-12" aria-labelledby="saved-h">
        <h2 id="saved-h" className="flex items-center gap-2 text-xl font-bold text-white">
          <FolderOpen className="h-5 w-5 text-lux-gold" /> โปรเจกต์ที่บันทึกไว้ ({saved.length})
        </h2>
        {saved.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-lux-gold/30 bg-lux-card p-6 text-center text-sm text-stone-400">
            ยังไม่มีโปรเจกต์ที่บันทึกไว้ — สร้างแผนฉากแล้วกด Save Project
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {saved.map((sp) => (
              <li key={sp.id} className="flex items-center justify-between gap-3 rounded-2xl border border-lux-gold/25 bg-lux-card p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{sp.title}</p>
                  <p className="text-xs text-stone-400">
                    {formatDuration(sp.totalSeconds)} · {sp.scenes.length} ฉาก · {getPlatform(sp.platformId).name} ·{" "}
                    {new Date(sp.updatedAt).toLocaleDateString("th-TH", { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      draftStore.set(sp);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-full border border-lux-gold/50 px-3 py-1.5 text-sm text-stone-200 hover:bg-lux-gold/10"
                  >
                    เปิด
                  </button>
                  <IconBtn
                    label={`ลบ ${sp.title}`}
                    danger
                    onClick={() =>
                      setConfirm({
                        title: `ลบโปรเจกต์ "${sp.title}"?`,
                        message: "ลบแล้วกู้คืนไม่ได้",
                        label: "ลบโปรเจกต์",
                        run: () => deleteProject(sp.id),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-center text-sm text-stone-400">
          ต้องการ Prompt คลิปเดียว?{" "}
          <Link href="/builder?category=video" className="text-lux-gold hover:text-lux-bright hover:underline">
            ไปที่ Interactive Prompt Builder
          </Link>
        </p>
      </section>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmLabel={confirm?.label}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.run();
          setConfirm(null);
        }}
      />
    </div>
  );
}

function Chips({ label, options, value, onChange }: { label: string; options: Option[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            onClick={() => onChange(value === o.id ? "" : o.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${value === o.id ? chipOn : chipOff}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white">{label}</span>
      <input className={`${input} mt-2`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-400">{label}</span>
      <textarea rows={rows} className={`${input} mt-1 resize-y text-sm`} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function IconBtn({ label, onClick, children, disabled, danger }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-full border border-white/10 text-stone-300 transition disabled:opacity-30 ${
        danger ? "hover:border-rose-400 hover:text-rose-300" : "hover:border-lux-bright hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
