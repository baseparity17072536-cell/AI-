/**
 * Prompt engine for the Interactive Prompt Builder.
 * Pure functions (no React, no storage) so it can move to a server/API later.
 *
 * Guarantees:
 *  - Only selected options appear in the output.
 *  - Duplicates are dropped (e.g. Cinematic type + Cinematic style).
 *  - Known conflicts are reported as warnings instead of producing contradictory text.
 *  - Platform limits come from capability profiles; unknown limits are never assumed.
 */
import type { CategorySlug } from "@/data/prompts";
import { BUILDER_FIELDS, MAX_SINGLE_CLIP_OPTION, type Field, type Option } from "@/data/builder/fields";
import {
  clipLimit,
  SAFE_CLIP_SECONDS,
  STATUS_LABEL,
  supportedRatios,
  type CapStatus,
  type PlatformProfile,
} from "@/data/builder/platforms";

export const CUSTOM = "__custom";

export type Selections = {
  /** field id → option id (or CUSTOM) for choice fields, or free text for text fields */
  values: Record<string, string>;
  /** field id → text typed for the Custom chip */
  custom: Record<string, string>;
};

export const emptySelections = (): Selections => ({ values: {}, custom: {} });

export type BasePrompt = { en: string; th: string; fills: string[] };

export type Warning = { level: "info" | "warn"; text: string };
export type CompatRow = { label: string; status: CapStatus | "ok" | "issue"; detail: string };

export type BuildResult = {
  en: string;
  th: string;
  summary: { label: string; value: string }[];
  warnings: Warning[];
  compatibility: CompatRow[];
  /** Separate voice-over script when the platform can't be trusted to speak it */
  voiceScript?: { language: string; character?: string; text: string };
  /** Set when the requested length needs several clips */
  planner?: { totalSeconds: number; clipSeconds: number; clips: number };
};

type Picked = { en: string; th: string; label: string; id: string; seconds?: number };

const THAI = /[฀-๿]/;

/* ---------------- helpers ---------------- */

function fieldOf(category: CategorySlug, id: string): Field | undefined {
  return BUILDER_FIELDS[category].find((f) => f.id === id);
}

function pick(category: CategorySlug, sel: Selections, id: string): Picked | null {
  const field = fieldOf(category, id);
  const raw = sel.values[id]?.trim();
  if (!field || !raw) return null;
  if (field.kind !== "choice") return { en: raw, th: raw, label: raw, id: raw };
  if (raw === CUSTOM) {
    const text = sel.custom[id]?.trim();
    if (!text) return null;
    if (field.id === "duration") {
      const s = Number(text);
      if (!Number.isFinite(s) || s <= 0) return null;
      return { en: `${s}-second`, th: `${s} วินาที`, label: `${s} sec`, id: CUSTOM, seconds: Math.round(s) };
    }
    return { en: text, th: text, label: text, id: CUSTOM };
  }
  const opt: Option | undefined = field.options?.find((x) => x.id === raw);
  return opt ? { en: opt.en, th: opt.th, label: opt.label, id: opt.id, seconds: opt.seconds } : null;
}

/** Is the field visible given other selections (showWhen)? */
export function isShown(field: Field, sel: Selections) {
  return !field.showWhen || field.showWhen.in.includes(sel.values[field.showWhen.field] ?? "");
}

const article = (phrase: string) => (/^[aeiou]/i.test(phrase) ? `an ${phrase}` : `a ${phrase}`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const sentence = (s: string) => {
  const t = s.trim();
  return t ? (/[.!?"]$/.test(t) ? t : `${t}.`) : "";
};
const join = (parts: (string | false | null | undefined)[], sep = " ") => parts.filter(Boolean).join(sep);

export function fillPlaceholders(text: string, fills: string[]) {
  let i = 0;
  return text.replace(/\[[^\]]+\]/g, (m) => {
    const v = fills[i++]?.trim();
    return v ? v : m;
  });
}

export function placeholdersOf(text: string) {
  return [...text.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
}

function fmtSeconds(s: number) {
  if (s < 60) return `${s} วินาที`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m} นาที ${r} วินาที` : `${m} นาที`;
}

/* ---------------- main ---------------- */

export function buildPrompt(
  category: CategorySlug,
  sel: Selections,
  platform: PlatformProfile,
  variant = 0,
  base?: BasePrompt,
): BuildResult {
  const warnings: Warning[] = [];
  const summary: BuildResult["summary"] = [];
  const g = (id: string) => {
    const field = fieldOf(category, id);
    if (field && !isShown(field, sel)) return null;
    const p = pick(category, sel, id);
    if (p && field) summary.push({ label: field.labelTh, value: field.kind === "choice" ? p.label : p.en });
    return p;
  };

  // Collect all values once (summary keeps field order)
  const v: Record<string, Picked | null> = {};
  for (const f of BUILDER_FIELDS[category]) v[f.id] = g(f.id);

  for (const id of ["subjectDetail", "additional", "avoid"]) {
    if ((category === "video" || category === "image") && v[id] && THAI.test(v[id]!.en)) {
      warnings.push({
        level: "info",
        text: "มีข้อความภาษาไทยในช่องที่พิมพ์เอง AI สร้างภาพ/วิดีโอส่วนใหญ่เข้าใจภาษาอังกฤษแม่นกว่า แนะนำให้พิมพ์เป็นภาษาอังกฤษ",
      });
      break;
    }
  }

  let out: { en: string[]; th: string[]; extra?: Partial<BuildResult> };
  switch (category) {
    case "video":
      out = videoPrompt(v, platform, variant, warnings);
      break;
    case "image":
      out = imagePrompt(v, platform, variant, warnings);
      break;
    case "video-editing":
      out = editingPrompt(v, variant);
      break;
    case "content":
      out = contentPrompt(v, variant);
      break;
  }

  let en = out.en.filter(Boolean).join(" ");
  let th = out.th.filter(Boolean).join(" ");

  if (base) {
    // Customizing a library prompt: keep its wording, fill the [blanks], then add the selected settings as direction.
    const baseEn = fillPlaceholders(base.en, base.fills);
    const thCount = placeholdersOf(base.th).length;
    const sameShape = thCount === placeholdersOf(base.en).length;
    const baseTh = sameShape ? fillPlaceholders(base.th, base.fills) : base.th;
    if (!sameShape && base.fills.some(Boolean)) {
      warnings.push({ level: "info", text: "คำแปลภาษาไทยมีช่อง [ ] ไม่ตรงกับต้นฉบับ จึงยังไม่ได้เติมคำให้ในภาษาไทย" });
    }
    const directionEn = summary.length ? directionLines(category, v, "en") : "";
    const directionTh = summary.length ? directionLines(category, v, "th") : "";
    en = join([baseEn, directionEn && `\n\nAdditional direction: ${directionEn}`], "");
    th = join([baseTh, directionTh && `\n\nรายละเอียดเพิ่มเติม: ${directionTh}`], "");
  }

  return {
    en: en.trim(),
    th: th.trim(),
    summary,
    warnings,
    compatibility: compatibilityRows(category, platform, v, out.extra?.planner),
    ...out.extra,
  };
}

/** Used when customizing a library prompt: selected settings as compact "label: value" direction. */
function directionLines(category: CategorySlug, v: Record<string, Picked | null>, lang: "en" | "th") {
  return BUILDER_FIELDS[category]
    .filter((f) => v[f.id])
    .map((f) => `${lang === "en" ? f.label : f.labelTh}: ${v[f.id]![lang]}`)
    .join("; ")
    .concat(".");
}

/* ---------------- video ---------------- */

function videoPrompt(v: Record<string, Picked | null>, p: PlatformProfile, variant: number, warnings: Warning[]) {
  const { videoType, subject, subjectDetail, background, style, lighting, camera, duration, aspect, audio } = v;
  const extra: Partial<BuildResult> = {};

  // Dedupe: "Cinematic" type already says cinematic
  const styleEn = style && !(videoType?.id === "cinematic" && style.id === "cinematic") ? style.en : "";
  const styleTh = style && !(videoType?.id === "cinematic" && style.id === "cinematic") ? style.th : "";
  if (style && !styleEn) warnings.push({ level: "info", text: "ประเภทและสไตล์เป็น Cinematic เหมือนกัน จึงใส่ใน Prompt เพียงครั้งเดียว" });

  // Dedupe: subject "Nature" + background "Nature"
  let bg = background;
  if (subject?.id === "nature" && background?.id === "nature") {
    bg = null;
    warnings.push({ level: "info", text: "ตัวแบบและฉากหลังเป็นธรรมชาติเหมือนกัน จึงไม่ใส่ฉากหลังซ้ำ" });
  }
  conflictChecks(v, warnings);

  const noun = videoType?.en ?? "video clip";
  const opener = ["", "Create ", "Generate "][variant % 3];
  const head = join([styleEn, noun]);
  const subj = subject && subjectDetail ? `${subject.en} (${subjectDetail.en})` : (subjectDetail?.en ?? subject?.en);

  const en: string[] = [
    sentence(
      join([
        opener ? `${opener}${article(head)}` : cap(article(head)),
        subj && `featuring ${subj}`,
        bg?.en,
      ]),
    ),
  ];
  const th: string[] = [
    join(["สร้าง", videoType ? `วิดีโอ${videoType.th}` : "คลิปวิดีโอ", styleTh, subj && `ที่มี${subjectTh(subject, subjectDetail)}`, bg?.th], " "),
  ];

  if (lighting) {
    en.push(sentence(cap(lighting.en)));
    th.push(`ใช้${lighting.th}`);
  }
  if (camera) {
    en.push(sentence(`Camera: ${camera.en}`));
    th.push(`กล้อง: ${camera.th}`);
  }

  // Duration: single clip vs project length, checked against the platform limit
  const limit = clipLimit(p);
  const limitKnown = p.clipSeconds.status !== "unknown";
  if (duration?.seconds) {
    const total = duration.seconds;
    const isProject = total > MAX_SINGLE_CLIP_OPTION;
    const over = total > limit;
    let clip = total;
    if (isProject || over) {
      clip = limit;
      const clips = Math.ceil(total / limit);
      extra.planner = { totalSeconds: total, clipSeconds: limit, clips };
      warnings.push({
        level: "warn",
        text: isProject
          ? `${fmtSeconds(total)} คือความยาวทั้งโปรเจกต์ AI สร้างวิดีโอได้ทีละคลิปสั้น ๆ — Prompt นี้เขียนสำหรับคลิปละ ${limit} วินาที ใช้ Long Video Planner แบ่งเป็นประมาณ ${clips} ฉาก`
          : limitKnown
            ? `${p.name} สร้างได้ไม่เกิน ${limit} วินาทีต่อคลิป (${STATUS_LABEL[p.clipSeconds.status]}) — Prompt นี้ปรับเป็น ${limit} วินาที ถ้าต้องการ ${fmtSeconds(total)} ให้ใช้ Long Video Planner แบ่ง ${clips} คลิป`
            : `ไม่ทราบขีดจำกัดความยาวของ AI ที่ใช้ จึงวางแผนคลิปละ ${SAFE_CLIP_SECONDS} วินาทีเพื่อความปลอดภัย แนะนำใช้ Long Video Planner แบ่ง ${clips} คลิป`,
      });
    } else if (p.clipSeconds.value?.options && !p.clipSeconds.value.options.includes(total)) {
      warnings.push({
        level: "info",
        text: `${p.name} มีตัวเลือกความยาว ${p.clipSeconds.value.options.join(" / ")} วินาที — ให้เลือกค่าที่ใกล้ที่สุดในแอป`,
      });
    }
    en.push(sentence(`Duration: ${clip} seconds`));
    th.push(`ความยาว ${clip} วินาที`);
  }

  if (aspect) {
    const ratios = supportedRatios(p);
    if (ratios && !ratios.includes(aspect.id)) {
      warnings.push({ level: "warn", text: `${p.name} ไม่มีสัดส่วน ${aspect.id} ในเอกสาร จึงไม่ใส่ใน Prompt — เลือกสัดส่วนอื่น` });
    } else {
      en.push(sentence(`Aspect ratio ${aspect.en}`));
      th.push(`สัดส่วนภาพ${aspect.th}`);
    }
  }

  // Audio & voice
  if (audio) {
    const audioOk = p.audio.value === true;
    if (audio.id === "none") {
      en.push("No audio.");
      th.push("ไม่มีเสียง");
    } else if (audio.id === "voice-over" || audio.id === "dialogue") {
      const lang = v.voiceLanguage;
      const character = v.voiceCharacter;
      const script = v.script?.en;
      const speaks = audioOk && p.voice.value === true;
      const langVerified = !!lang && p.languages.status === "verified" && !!p.languages.value?.includes(lang.en);
      if (speaks) {
        en.push(
          sentence(
            join([
              cap(audio.id === "dialogue" ? "spoken dialogue" : article(join([character?.en, "voice-over"]))),
              lang && `in ${lang.en}`,
              script && `saying: "${script}"`,
            ]),
          ),
        );
        th.push(join([audio.id === "dialogue" ? "มีบทสนทนา" : `เสียงบรรยาย${character ? character.th : ""}`, lang?.th, script && `พูดว่า "${script}"`]));
        if (lang && !langVerified) {
          warnings.push({
            level: "warn",
            text: `ยังไม่ยืนยันว่า ${p.name} พูด${lang.th}ได้ถูกต้อง หากเสียงพูดผิด ให้สร้างเสียงแยกด้วย Text-to-Speech หรืออัดเสียงเอง แล้วใส่ตอนตัดต่อ`,
          });
        }
      } else {
        en.push("No spoken voice in the clip; leave room for a voice-over added in editing.");
        th.push("ไม่มีเสียงพูดในคลิป เว้นจังหวะไว้ใส่เสียงบรรยายตอนตัดต่อ");
        if (script || lang) {
          extra.voiceScript = { language: lang?.th ?? "ไม่ระบุ", character: character?.th, text: script ?? "" };
        }
        warnings.push({
          level: "warn",
          text: `ยังไม่ยืนยันว่า ${p.name} สร้างเสียงพูด${lang ? lang.th : ""}ได้ — แยกสร้างเสียงด้วยเครื่องมือ Text-to-Speech หรืออัดเสียงเอง แล้วนำมาใส่ตอนตัดต่อ`,
        });
      }
    } else {
      en.push(sentence(`Audio: ${audio.en}`));
      th.push(`เสียง: ${audio.th}`);
      if (!audioOk) {
        warnings.push({
          level: "info",
          text: `${p.name}: การสร้างเสียง ${STATUS_LABEL[p.audio.status]} — เตรียมเพิ่ม${audio.th}ตอนตัดต่อ`,
        });
      }
    }
  } else if (v.script) {
    warnings.push({ level: "info", text: "ยังไม่ได้เลือก Voice Over หรือ Dialogue จึงไม่ใส่บทพูด" });
  }

  pushTail(v, en, th);
  return { en, th, extra };
}

function subjectTh(subject: Picked | null, detail: Picked | null) {
  return subject && detail ? `${subject.th} (${detail.th})` : (detail?.th ?? subject?.th ?? "");
}

function conflictChecks(v: Record<string, Picked | null>, warnings: Warning[]) {
  const { background, lighting, style, videoType, audio, script } = v;
  if (background?.id === "studio" && lighting?.id === "golden-hour") {
    warnings.push({ level: "warn", text: "ฉากสตูดิโอกับแสงโกลเด้นอาวร์อาจขัดกัน ลองเลือก Studio Light หรือ Soft Light" });
  }
  if (background?.id === "space" && (lighting?.id === "golden-hour" || lighting?.id === "natural")) {
    warnings.push({ level: "warn", text: "ฉากอวกาศกับแสงธรรมชาติ/โกลเด้นอาวร์อาจขัดกัน ลองเลือก Dramatic หรือ Neon" });
  }
  if (style?.id === "realistic" && videoType?.id === "animation") {
    warnings.push({ level: "warn", text: "สไตล์ Realistic กับประเภท Animation อาจขัดกัน ลองเลือกสไตล์ 3D หรือ Anime" });
  }
  if (audio?.id === "none" && script) {
    warnings.push({ level: "info", text: "เลือก No Audio ไว้ บทพูดจะไม่ถูกใส่ใน Prompt" });
  }
}

function pushTail(v: Record<string, Picked | null>, en: string[], th: string[]) {
  if (v.avoid) {
    en.push(sentence(`Avoid: ${v.avoid.en}`));
    th.push(`หลีกเลี่ยง: ${v.avoid.th}`);
  }
  if (v.additional) {
    en.push(sentence(`Additional details: ${v.additional.en}`));
    th.push(`รายละเอียดเพิ่มเติม: ${v.additional.th}`);
  }
}

/* ---------------- image ---------------- */

function imagePrompt(v: Record<string, Picked | null>, p: PlatformProfile, variant: number, warnings: Warning[]) {
  const { imageType, subject, subjectDetail, background, style, lighting, shot, aspect } = v;
  let bg = background;
  if (subject?.id === "nature" && background?.id === "nature") {
    bg = null;
    warnings.push({ level: "info", text: "ตัวแบบและฉากหลังเป็นธรรมชาติเหมือนกัน จึงไม่ใส่ฉากหลังซ้ำ" });
  }
  conflictChecks(v, warnings);
  const head = join([style?.en, imageType?.en ?? "image"]);
  const subj = subject && subjectDetail ? `${subject.en} (${subjectDetail.en})` : (subjectDetail?.en ?? subject?.en);
  const opener = ["", "Create ", "Generate "][variant % 3];

  const en = [
    sentence(join([opener ? `${opener}${article(head)}` : cap(article(head)), subj && `of ${subj}`, bg?.en])),
    shot && sentence(cap(shot.en)),
    lighting && sentence(cap(lighting.en)),
    aspect && sentence(`Aspect ratio ${aspect.en}`),
  ].filter(Boolean) as string[];
  const th = [
    join(["สร้าง", imageType ? imageType.th : "ภาพ", style?.th, subj && `ของ${subjectTh(subject, subjectDetail)}`, bg?.th]),
    shot?.th,
    lighting && `ใช้${lighting.th}`,
    aspect && `สัดส่วนภาพ${aspect.th}`,
  ].filter(Boolean) as string[];
  if (aspect && p.id !== "general") {
    warnings.push({ level: "info", text: `ยังไม่ได้ตรวจสอบสัดส่วนภาพนิ่งที่ ${p.name} รองรับ — ตรวจสอบตัวเลือกในแอปอีกครั้ง` });
  }
  pushTail(v, en, th);
  return { en, th };
}

/* ---------------- video editing (for chat AIs) ---------------- */

function editingPrompt(v: Record<string, Picked | null>, variant: number) {
  const { editType, footage, software, style, pacing, platform, duration, music } = v;
  const role = ["Act as a professional video editor.", "You are an experienced video editor.", "Act as a senior post-production editor."][
    variant % 3
  ];
  const en = [
    role,
    sentence(join([`Create ${editType?.en ?? "a step-by-step editing plan"}`, footage && `for my footage: ${footage.en}`])),
    software && sentence(`I edit in ${software.en}, so give exact settings and menu names for it`),
    (duration || platform) &&
      sentence(join(["The final video is", duration ? article(`${duration.en} ${platform?.en ?? ""}`.trim()) : `for ${platform!.en}`, "video"])),
    (style || pacing) && sentence(join(["Aim for", join([style && `a ${style.en} mood`, pacing?.en], " with ")])),
    music && sentence(`Include ${music.en}`),
    "Give the plan as numbered steps with timestamps.",
  ].filter(Boolean) as string[];
  const th = [
    "ทำหน้าที่เป็นนักตัดต่อวิดีโอมืออาชีพ",
    join([`ช่วยทำ${editType?.th ?? "แผนตัดต่อทีละขั้นตอน"}`, footage && `สำหรับฟุตเทจของฉัน: ${footage.th}`]),
    software && `ฉันใช้ ${software.th} ขอค่าที่แน่นอนและชื่อเมนูในโปรแกรมนี้`,
    (duration || platform) && join(["วิดีโอที่ตัดเสร็จ", duration && `ยาว ${duration.th}`, platform && `สำหรับ ${platform.th}`]),
    (style || pacing) && join(["ต้องการ", style && `อารมณ์${style.th}`, pacing?.th]),
    music && `ใส่${music.th}`,
    "ตอบเป็นขั้นตอนพร้อมเวลา (timestamp)",
  ].filter(Boolean) as string[];
  pushTail(v, en, th);
  return { en, th };
}

/* ---------------- content (for chat AIs) ---------------- */

function contentPrompt(v: Record<string, Picked | null>, variant: number) {
  const { contentType, productDetail, audience, tone, language, platform, length, cta } = v;
  const role = ["Act as an expert copywriter.", "You are a senior marketing copywriter.", "Act as a professional content strategist."][
    variant % 3
  ];
  const en = [
    role,
    sentence(join([`Write ${contentType?.en ?? "marketing content"}`, platform && `for ${platform.en}`, productDetail && `about: ${productDetail.en}`])),
    audience && sentence(`Target audience: ${audience.en}`),
    tone && sentence(`Tone: ${tone.en}`),
    length && sentence(`Length: ${length.en}`),
    language && sentence(`Write in ${language.en}`),
    cta && sentence(`End with this call to action: ${cta.en}`),
  ].filter(Boolean) as string[];
  const th = [
    "ทำหน้าที่เป็นนักเขียนคอนเทนต์มืออาชีพ",
    join([`เขียน${contentType?.th ?? "คอนเทนต์การตลาด"}`, platform && `สำหรับ ${platform.th}`, productDetail && `เกี่ยวกับ: ${productDetail.th}`]),
    audience && `กลุ่มเป้าหมาย: ${audience.th}`,
    tone && `โทน: ${tone.th}`,
    length && `ความยาว: ${length.th}`,
    language && `เขียนเป็น${language.th}`,
    cta && `ปิดท้ายด้วย CTA: ${cta.th}`,
  ].filter(Boolean) as string[];
  pushTail(v, en, th);
  return { en, th };
}

/* ---------------- compatibility ---------------- */

function compatibilityRows(
  category: CategorySlug,
  p: PlatformProfile,
  v: Record<string, Picked | null>,
  planner?: BuildResult["planner"],
): CompatRow[] {
  if (category === "video-editing" || category === "content") {
    return [{ label: "AI ที่ใช้ได้", status: "ok", detail: "AI แชตทั่วไป เช่น ChatGPT, Claude, Gemini" }];
  }
  if (category === "image") {
    return [
      { label: "แพลตฟอร์ม", status: p.id === "general" ? "unknown" : "not-verified", detail: `${p.name} — ความสามารถด้านภาพนิ่งยังไม่ได้ตรวจสอบ` },
    ];
  }
  const c = p.clipSeconds.value;
  const rows: CompatRow[] = [
    {
      label: "ความยาวต่อคลิป",
      status: planner ? "issue" : p.clipSeconds.status,
      detail: c ? (c.min === c.max ? `${c.max} วินาที` : `${c.min}–${c.max} วินาที`) + (p.clipSeconds.note ? ` · ${p.clipSeconds.note}` : "") : (p.clipSeconds.note ?? "ไม่ทราบ"),
    },
    {
      label: "สัดส่วนภาพ",
      status: v.aspect && p.aspectRatios.value && !p.aspectRatios.value.includes(v.aspect.id) ? "issue" : p.aspectRatios.status,
      detail: p.aspectRatios.value?.join(", ") ?? "ไม่ทราบ",
    },
    { label: "เสียง", status: p.audio.status, detail: capText(p.audio.value, p.audio.note) },
    { label: "เสียงพูด", status: p.voice.status, detail: capText(p.voice.value, p.voice.note) },
    { label: "ภาษาเสียงพูด", status: p.languages.status, detail: p.languages.value?.join(", ") ?? p.languages.note ?? "ไม่ทราบ" },
    { label: "Text-to-Video", status: p.textToVideo.status, detail: capText(p.textToVideo.value, p.textToVideo.note) },
    { label: "Image-to-Video", status: p.imageToVideo.status, detail: capText(p.imageToVideo.value, p.imageToVideo.note) },
  ];
  return rows;
}

function capText(value: boolean | undefined, note?: string) {
  const base = value === true ? "รองรับ" : value === false ? "ไม่รองรับ" : "ไม่ทราบ";
  return note ? `${base} · ${note}` : base;
}
